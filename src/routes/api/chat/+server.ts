import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { enforceRateLimit, streamChatResponse, RateLimitError } from '$lib/server/services/chat';
import type { RequestHandler } from './$types';

const chatSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1).max(20000)
			})
		)
		.min(1)
		.max(100),
	conversationId: z.string().uuid().optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) throw error(401, 'Unauthorized');

	const raw = await request.json().catch(() => null);
	const parsed = chatSchema.safeParse(raw);
	if (!parsed.success) throw error(400, 'Invalid request body');
	const body = parsed.data;

	const admin = createSupabaseAdminClient();

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (!profile) throw error(403, 'Profile not found');

	try {
		enforceRateLimit(profile);
	} catch (e) {
		if (e instanceof RateLimitError) throw error(403, e.message);
		throw e;
	}

	let org = null;
	if (profile.org_id) {
		const { data } = await locals.supabase
			.from('organizations')
			.select('*')
			.eq('id', profile.org_id)
			.single();
		org = data;
	}

	try {
		const { stream, conversationId } = await streamChatResponse(
			{ userId: user.id, profile, org, admin },
			body
		);

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Transfer-Encoding': 'chunked',
				'X-Conversation-Id': conversationId,
			},
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'AI processing failed';
		logger.error({ err, userId: user.id }, 'Chat stream failed');
		throw error(500, msg);
	}
};
