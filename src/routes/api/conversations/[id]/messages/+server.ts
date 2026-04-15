import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { id } = params;
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	// Fetch messages for this conversation, ensuring the user owns it
	const { data: messages, error: msgErr } = await locals.supabase
		.from('messages')
		.select('role, content, created_at')
		.eq('conversation_id', id)
		.order('created_at', { ascending: true });

	if (msgErr) {
		console.error('Fetch messages error:', msgErr);
		throw error(500, 'Could not fetch history');
	}

	// Double check ownership via a separate query if RLS isn't fully trusted
	// But our RLS policies are already set up to handle this.
	
	return json({ messages });
};
