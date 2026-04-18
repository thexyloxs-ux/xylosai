import { error, json } from '@sveltejs/kit';
import { verifyWebhookSignature } from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { activatePlan, cancelSubscription } from '$lib/server/services/subscription';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('x-paystack-signature') ?? '';

	if (!verifyWebhookSignature(body, signature)) {
		throw error(400, 'Invalid signature');
	}

	const event = JSON.parse(body);
	const admin = createSupabaseAdminClient();

	switch (event.event) {
		case 'charge.success': {
			const { metadata } = event.data;
			if (metadata?.userId) {
				await activatePlan(admin, metadata.userId, metadata.planType ?? 'pro');
			}
			break;
		}
		case 'subscription.disable': {
			const email = event.data?.customer?.email;
			if (email) {
				await cancelSubscription(admin, email);
			}
			break;
		}
	}

	return json({ received: true });
};
