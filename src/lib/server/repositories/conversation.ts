import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type AdminClient = SupabaseClient<Database>;

export async function getOrCreateConversation(
	admin: AdminClient,
	userId: string,
	opts: { conversationId?: string }
): Promise<string> {
	if (opts.conversationId) {
		const { data, error } = await admin
			.from('conversations')
			.select('id')
			.eq('id', opts.conversationId)
			.eq('user_id', userId)
			.single();

		if (error || !data) throw new Error('Conversation not found or access denied');
		return data.id;
	}

	const { data, error } = await admin
		.from('conversations')
		.insert({
			user_id: userId,
			title: `Chat - ${new Date().toLocaleDateString()}`,
		})
		.select('id')
		.single();

	if (error) throw new Error(`Failed to create conversation: ${error.message}`);
	return data.id;
}

export async function saveMessage(
	admin: AdminClient,
	conversationId: string,
	userId: string,
	role: 'user' | 'assistant',
	content: string
): Promise<void> {
	await Promise.all([
		admin.from('messages').insert({ conversation_id: conversationId, role, content }),
		admin
			.from('conversations')
			.update({ last_message_at: new Date().toISOString() })
			.eq('id', conversationId)
			.eq('user_id', userId),
	]);
}
