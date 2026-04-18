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
	await admin
		.from('profiles')
		.update({ plan: planType, plan_status: 'active' })
		.eq('id', userId);

	if (planType === 'school') {
		const { data: profile } = await admin
			.from('profiles')
			.select('org_id')
			.eq('id', userId)
			.single();

		if (profile?.org_id) {
			await admin
				.from('organizations')
				.update({ plan: 'school', plan_status: 'active' })
				.eq('id', profile.org_id);
		}
	}
}

/**
 * Mark a subscription as expired when Paystack fires a cancellation event.
 * Looks up the profile by email since the webhook payload provides the customer email.
 */
export async function cancelSubscription(admin: AdminClient, email: string): Promise<void> {
	const { data: profiles } = await admin
		.from('profiles')
		.select('id')
		.eq('email', email)
		.limit(1);

	if (profiles?.length) {
		await admin
			.from('profiles')
			.update({ plan_status: 'expired' })
			.eq('id', profiles[0].id);
	}
}
