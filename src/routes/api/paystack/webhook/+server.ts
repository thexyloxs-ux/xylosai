import { error, json } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
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

	try {
		switch (event.event) {
			case 'charge.success': {
				const { metadata } = event.data;
				if (metadata?.userId) {
					await activatePlan(admin, metadata.userId, metadata.planType ?? 'pro');
					logger.info({ userId: metadata.userId, planType: metadata.planType }, 'Plan activated');
				}
				break;
			}
			case 'subscription.disable': {
				const email = event.data?.customer?.email;
				if (email) {
					await cancelSubscription(admin, email);
					logger.info({ email }, 'Subscription cancelled');
				}
				break;
			}
			default:
				logger.info({ eventType: event.event }, 'Unhandled Paystack event');
		}
	} catch (err) {
		logger.error({ err, eventType: event.event }, 'Paystack webhook processing failed');
		// Return 500 so Paystack retries the event
		throw error(500, 'Webhook processing failed');
	}

	return json({ received: true });
};
