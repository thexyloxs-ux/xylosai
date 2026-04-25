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
 * Looks up the profile by email since the webhook payload provides the customer email.
 */
export async function cancelSubscription(admin: AdminClient, email: string): Promise<void> {
	const { data: profiles, error: fetchErr } = await admin
		.from('profiles')
		.select('id')
		.eq('email', email)
		.limit(1);

	if (fetchErr) throw new Error(`Failed to look up profile for cancellation: ${fetchErr.message}`);

	if (!profiles?.length) return; // no account found — nothing to cancel

	const { error: updateErr } = await admin
		.from('profiles')
		.update({ plan_status: 'expired' })
		.eq('id', profiles[0].id);

	if (updateErr) throw new Error(`Failed to expire subscription: ${updateErr.message}`);
}
