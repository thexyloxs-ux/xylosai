import { error, redirect } from '@sveltejs/kit';
import { createSubscriptionManageLink } from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) throw redirect(302, '/auth/login?next=/settings');

	const admin = createSupabaseAdminClient();
	const { data: billing, error: billingErr } = await admin
		.from('billing_subscriptions')
		.select('subscription_code, status')
		.eq('user_id', user.id)
		.single();

	if (billingErr || !billing?.subscription_code) {
		throw error(400, 'No Paystack subscription is available for this account yet. Contact billing for help.');
	}

	if (billing.status !== 'active') {
		throw error(400, 'This subscription is not active.');
	}

	const link = await createSubscriptionManageLink(billing.subscription_code);
	throw redirect(303, link);
};
