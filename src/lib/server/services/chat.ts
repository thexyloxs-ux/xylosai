import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Profile, Organization } from '$lib/types/database';
import { groq, buildSystemPrompt, GROQ_MODEL } from '$lib/server/groq';
import { getOrCreateConversation, saveMessage } from '$lib/server/repositories/conversation';
import { incrementStudentActivity } from '$lib/server/repositories/activity';

type AdminClient = SupabaseClient<Database>;

// ── Domain error ─────────────────────────────────────────────────────────────

export class RateLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RateLimitError';
	}
}

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Business rules ────────────────────────────────────────────────────────────

/**
 * Throws RateLimitError if the user has exhausted their free daily quota.
 * School-linked students and paid users are always allowed through.
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

// ── Side effects (fire-and-forget) ───────────────────────────────────────────

function incrementMessageCounter(ctx: ChatContext): void {
	const todayStr = new Date().toDateString();
	const resetStr = new Date(ctx.profile.messages_today_reset_at).toDateString();
	const update =
		resetStr !== todayStr
			? { messages_today: 1, messages_today_reset_at: new Date().toISOString() }
			: { messages_today: (ctx.profile.messages_today ?? 0) + 1 };

	// Intentionally not awaited — runs after the stream closes
	ctx.admin.from('profiles').update(update).eq('id', ctx.userId);
}

// ── Use case ──────────────────────────────────────────────────────────────────

export async function streamChatResponse(
	ctx: ChatContext,
	req: ChatRequest
): Promise<{ stream: ReadableStream; conversationId: string }> {
	const conversationId = await getOrCreateConversation(ctx.admin, ctx.userId, {
		conversationId: req.conversationId,
	});

	// Persist the user's message before streaming starts
	const lastUserMsg = [...req.messages].reverse().find((m) => m.role === 'user');
	if (lastUserMsg) {
		await saveMessage(ctx.admin, conversationId, 'user', lastUserMsg.content);
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

			// After stream closes: persist reply and update counters (fire-and-forget)
			if (assistantText) {
				saveMessage(ctx.admin, conversationId, 'assistant', assistantText);
			}
			incrementMessageCounter(ctx);
			if (ctx.profile.org_id) {
				incrementStudentActivity(ctx.admin, ctx.userId, ctx.profile.org_id);
			}
		},
	});

	return { stream, conversationId };
}
