import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type AdminClient = SupabaseClient<Database>;

/**
 * Activate a plan after a successful payment.
 * For school plans, also activates the linked organization.
 */
export async function activatePlan(
	admin: AdminClient,
	userId: string,
	planType: string
): Promise<void> {
	const { error: profileErr } = await admin
		.from('profiles')
		.update({ plan: planType, plan_status: 'active' })
		.eq('id', userId);

	if (profileErr) throw new Error(`Failed to activate plan on profile: ${profileErr.message}`);

	if (planType === 'school') {
		const { data: profile, error: fetchErr } = await admin
			.from('profiles')
			.select('org_id')
			.eq('id', userId)
			.single();

		if (fetchErr) throw new Error(`Failed to fetch profile for org activation: ${fetchErr.message}`);

		if (profile?.org_id) {
			const { error: orgErr } = await admin
				.from('organizations')
				.update({ plan: 'school', plan_status: 'active' })
				.eq('id', profile.org_id);

			if (orgErr) throw new Error(`Failed to activate org plan: ${orgErr.message}`);
		}
	}
}

/**
 * Mark a subscription as expired when Paystack fires a cancellation event.
 * Resolves the user via auth.users (authoritative) rather than profiles.email,
 * so it stays correct even if the user has changed their email since subscribing.
 */
export async function cancelSubscription(admin: AdminClient, email: string): Promise<void> {
	// Use an RPC that queries auth.users directly — profiles.email can drift
	const { data: userId, error: rpcErr } = await admin.rpc('get_user_id_by_email', {
		p_email: email,
	});

	if (rpcErr) throw new Error(`Failed to resolve user by email: ${rpcErr.message}`);
	if (!userId) return; // no account found — nothing to cancel

	const { error: updateErr } = await admin
		.from('profiles')
		.update({ plan_status: 'expired' })
		.eq('id', userId);

	if (updateErr) throw new Error(`Failed to expire subscription: ${updateErr.message}`);
}
