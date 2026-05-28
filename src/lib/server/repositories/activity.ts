import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type AdminClient = SupabaseClient<Database>;

/**
 * Atomically increment message_count for a member's daily activity row.
 * Uses a Postgres RPC to avoid the select-then-update race condition.
 * See: supabase/migrations/002_increment_activity_rpc.sql
 */
export async function incrementMemberActivity(
	admin: AdminClient,
	userId: string,
	orgId: string
): Promise<void> {
	const today = new Date().toISOString().split('T')[0];
	await admin.rpc('increment_member_activity', {
		p_user_id: userId,
		p_org_id: orgId,
		p_date: today,
	});
}
