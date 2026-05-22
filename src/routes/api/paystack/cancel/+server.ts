import { error, redirect } from '@sveltejs/kit';
import { disableSubscription } from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { markSubscriptionCancelled } from '$lib/server/services/subscription';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) throw redirect(302, '/auth/login?next=/settings');

	const admin = createSupabaseAdminClient();
	const { data: billing, error: billingErr } = await admin
		.from('billing_subscriptions')
		.select('subscription_code, email_token, status')
		.eq('user_id', user.id)
		.single();

	if (billingErr || !billing?.subscription_code || !billing.email_token) {
		throw error(400, 'No cancellable Paystack subscription is available for this account yet. Contact billing for help.');
	}

	if (billing.status !== 'active') {
		throw error(400, 'This subscription is not active.');
	}

	await disableSubscription(billing.subscription_code, billing.email_token);
	await markSubscriptionCancelled(admin, user.id, 'canceled');
	// Cancellation email is sent by the Paystack subscription.disable webhook to avoid a double send

	throw redirect(303, '/settings?canceled=true');
};
