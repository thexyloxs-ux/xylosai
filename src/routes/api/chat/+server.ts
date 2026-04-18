import { error } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { enforceRateLimit, streamChatResponse, RateLimitError } from '$lib/server/services/chat';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) throw error(401, 'Unauthorized');

	const body = await request.json();
	if (!body.messages || !Array.isArray(body.messages)) throw error(400, 'Invalid messages');

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
		console.error('Chat error:', err);
		throw error(500, msg);
	}
};
