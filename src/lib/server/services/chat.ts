import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Profile, Organization } from '$lib/types/database';
import { buildSystemPrompt } from '$lib/server/groq';
import { getOrCreateConversation, saveMessage } from '$lib/server/repositories/conversation';
import { incrementMemberActivity } from '$lib/server/repositories/activity';
import { logger } from '$lib/server/logger';
import { orchestrateChatStream } from '$lib/server/ai/orchestrator';
import { classifyTurn } from '$lib/server/ai/router';

type AdminClient = SupabaseClient<Database>;
const FREE_DAILY_MESSAGE_LIMIT = 5;

export class RateLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RateLimitError';
	}
}

export interface ChatRequest {
	messages: { role: 'user' | 'assistant'; content: string }[];
	conversationId?: string;
}

export interface ChatContext {
	userId: string;
	profile: Profile;
	org: Organization | null;
	admin: AdminClient;
}

function hasOrgAccess(profile: Profile, org: Organization | null): boolean {
	if (!profile.org_id || !org) return false;
	return org.plan_status === 'active' || org.plan_status === 'trialing';
}

function hasPaidIndividualAccess(profile: Profile): boolean {
	return (profile.plan === 'plus' || profile.plan === 'pro') && profile.plan_status === 'active';
}

function hasUnlimitedAccess(profile: Profile, org: Organization | null): boolean {
	return hasPaidIndividualAccess(profile) || hasOrgAccess(profile, org);
}

/**
 * Legacy preflight guard kept for callers that only need to fail fast before
 * the atomic quota reservation runs.
 */
export function enforceRateLimit(profile: Profile, org: Organization | null): void {
	if (hasUnlimitedAccess(profile, org)) return;

	const todayStr = new Date().toDateString();
	const resetStr = new Date(profile.messages_today_reset_at).toDateString();
	if (resetStr === todayStr && (profile.messages_today ?? 0) >= FREE_DAILY_MESSAGE_LIMIT) {
		throw new RateLimitError(
			`Daily free limit reached (${FREE_DAILY_MESSAGE_LIMIT} messages). Join an organization or upgrade to Pro for unlimited access.`
		);
	}
}

export async function reserveMessageQuota(ctx: ChatContext): Promise<void> {
	if (hasUnlimitedAccess(ctx.profile, ctx.org)) return;

	const { data, error } = await ctx.admin.rpc('reserve_free_message_quota', {
		p_user_id: ctx.userId,
		p_limit: FREE_DAILY_MESSAGE_LIMIT,
	});

	if (error) {
		throw new Error(`Failed to reserve message quota: ${error.message}`);
	}

	if (!data) {
		throw new RateLimitError(
			`Daily free limit reached (${FREE_DAILY_MESSAGE_LIMIT} messages). Join an organization or upgrade to Pro for unlimited access.`
		);
	}
}

export async function streamChatResponse(
	ctx: ChatContext,
	req: ChatRequest
): Promise<{ stream: ReadableStream; conversationId: string }> {
	await reserveMessageQuota(ctx);

	const firstUserMessage = req.messages.find((message) => message.role === 'user')?.content;
	const conversationId = await getOrCreateConversation(ctx.admin, ctx.userId, {
		conversationId: req.conversationId,
		initialUserMessage: firstUserMessage,
	});

	const lastUserMsg = [...req.messages].reverse().find((m) => m.role === 'user');
	if (lastUserMsg) {
		await saveMessage(ctx.admin, conversationId, ctx.userId, 'user', lastUserMsg.content);
	}

	const selection = classifyTurn(req.messages);
	const systemPrompt = buildSystemPrompt(ctx.profile, ctx.org, selection.intent);
	const orchestration = await orchestrateChatStream(req.messages, systemPrompt);

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			let assistantText = '';

			try {
				logger.info(
					{
						userId: ctx.userId,
						intent: orchestration.selection.intent,
						provider: orchestration.provider,
						usedFallback: orchestration.usedFallback,
						reason: orchestration.selection.reason
					},
					'Streaming chat response'
				);

				for await (const token of orchestration.stream) {
					assistantText += token;
					controller.enqueue(encoder.encode(token));
				}

				if (assistantText) {
					await saveMessage(ctx.admin, conversationId, ctx.userId, 'assistant', assistantText);
				}
				if (ctx.profile.org_id) {
					await incrementMemberActivity(ctx.admin, ctx.userId, ctx.profile.org_id);
				}

				controller.close();
			} catch (err) {
				logger.error(
					{ err, userId: ctx.userId, conversationId },
					'Failed during chat stream delivery'
				);
				controller.error(err instanceof Error ? err : new Error('Chat stream failed'));
			}
		},
	});

	return { stream, conversationId };
}
