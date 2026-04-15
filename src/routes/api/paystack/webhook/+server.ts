import { error, json } from '@sveltejs/kit';
import { verifyWebhookSignature } from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('x-paystack-signature') || '';

	if (!verifyWebhookSignature(body, signature)) {
		throw error(400, 'Invalid signature');
	}

	const event = JSON.parse(body);
	const admin = createSupabaseAdminClient();

	switch (event.event) {
		case 'charge.success': {
			// Fires when a subscription payment succeeds (including the first payment)
			const { metadata } = event.data;
			const userId = metadata?.userId;
			const planType = metadata?.planType;

			if (userId) {
				await admin
					.from('profiles')
					.update({ plan: planType || 'pro', plan_status: 'active' })
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
			break;
		}

		case 'subscription.disable': {
			// Fires when a subscription is cancelled
			const email = event.data?.customer?.email;

			if (email) {
				const { data: profiles } = await admin
					.from('profiles')
					.select('id')
					.eq('email', email);

				if (profiles?.length) {
					await admin
						.from('profiles')
						.update({ plan_status: 'expired' })
						.eq('id', profiles[0].id);
				}
			}
			break;
		}
	}

	return json({ received: true });
};
