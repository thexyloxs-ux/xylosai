import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Profile, Organization } from '$lib/types/database';
import { groq, buildSystemPrompt, GROQ_MODEL } from '$lib/server/groq';
import { getOrCreateConversation, saveMessage } from '$lib/server/repositories/conversation';
import { incrementStudentActivity } from '$lib/server/repositories/activity';

type AdminClient = SupabaseClient<Database>;

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

/**
 * Legacy preflight guard kept for callers that only need to fail fast before
 * the atomic quota reservation runs.
 */
export function enforceRateLimit(profile: Profile): void {
	if (profile.plan !== 'free' || profile.org_id) return;

	const todayStr = new Date().toDateString();
	const resetStr = new Date(profile.messages_today_reset_at).toDateString();
	if (resetStr === todayStr && (profile.messages_today ?? 0) >= 20) {
		throw new RateLimitError(
			'Daily free limit reached (20 messages). Join a school or upgrade to Pro for unlimited access.'
		);
	}
}

export async function reserveMessageQuota(ctx: ChatContext): Promise<void> {
	if (ctx.profile.plan !== 'free' || ctx.profile.org_id) return;

	const { data, error } = await ctx.admin.rpc('reserve_free_message_quota', {
		p_user_id: ctx.userId,
		p_limit: 20,
	});

	if (error) {
		throw new Error(`Failed to reserve message quota: ${error.message}`);
	}

	if (!data) {
		throw new RateLimitError(
			'Daily free limit reached (20 messages). Join a school or upgrade to Pro for unlimited access.'
		);
	}
}

export async function streamChatResponse(
	ctx: ChatContext,
	req: ChatRequest
): Promise<{ stream: ReadableStream; conversationId: string }> {
	await reserveMessageQuota(ctx);

	const conversationId = await getOrCreateConversation(ctx.admin, ctx.userId, {
		conversationId: req.conversationId,
	});

	const lastUserMsg = [...req.messages].reverse().find((m) => m.role === 'user');
	if (lastUserMsg) {
		await saveMessage(ctx.admin, conversationId, ctx.userId, 'user', lastUserMsg.content);
	}

	const systemPrompt = buildSystemPrompt(ctx.profile, ctx.org);

	const groqStream = await groq.chat.completions.create({
		model: GROQ_MODEL,
		messages: [
			{ role: 'system', content: systemPrompt },
			...req.messages.map((m) => ({
				role: m.role as 'user' | 'assistant' | 'system',
				content: m.content,
			})),
		],
		stream: true,
		temperature: 0.7,
		max_tokens: 2048,
	});

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			let assistantText = '';

			try {
				for await (const chunk of groqStream) {
					const token = chunk.choices[0]?.delta?.content ?? '';
					if (token) {
						assistantText += token;
						controller.enqueue(encoder.encode(token));
					}
				}
			} finally {
				controller.close();
			}

			if (assistantText) {
				saveMessage(ctx.admin, conversationId, ctx.userId, 'assistant', assistantText);
			}
			if (ctx.profile.org_id) {
				incrementStudentActivity(ctx.admin, ctx.userId, ctx.profile.org_id);
			}
		},
	});

	return { stream, conversationId };
}
