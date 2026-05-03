import { error, redirect } from '@sveltejs/kit';
import { disableSubscription } from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { markSubscriptionCancelled } from '$lib/server/services/subscription';
import { sendSubscriptionCancelledEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';
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
	const contact = await markSubscriptionCancelled(admin, user.id, 'canceled');

	if (contact?.email) {
		sendSubscriptionCancelledEmail(contact.email, contact.fullName, contact.planType).catch((err) => {
			logger.error({ err, userId: user.id }, 'Failed to send cancellation email');
		});
	}

	throw redirect(303, '/settings?canceled=true');
};
