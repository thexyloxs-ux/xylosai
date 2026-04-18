import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type AdminClient = SupabaseClient<Database>;

export async function getOrCreateConversation(
	admin: AdminClient,
	userId: string,
	opts: { conversationId?: string; subject?: string; sessionType?: string }
): Promise<string> {
	if (opts.conversationId) return opts.conversationId;

	const title = opts.subject
		? `${opts.subject} — ${new Date().toLocaleDateString()}`
		: `Chat — ${new Date().toLocaleDateString()}`;

	const { data, error } = await admin
		.from('conversations')
		.insert({
			user_id: userId,
			title,
			subject: opts.subject ?? null,
			session_type: opts.sessionType ?? null,
		})
		.select('id')
		.single();

	if (error) throw new Error(`Failed to create conversation: ${error.message}`);
	return data.id;
}

export async function saveMessage(
	admin: AdminClient,
	conversationId: string,
	role: 'user' | 'assistant',
	content: string
): Promise<void> {
	await Promise.all([
		admin.from('messages').insert({ conversation_id: conversationId, role, content }),
		admin
			.from('conversations')
			.update({ last_message_at: new Date().toISOString() })
			.eq('id', conversationId),
	]);
}
