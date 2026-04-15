import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Replaced by /api/paystack/webhook
export const POST: RequestHandler = async () => {
	return json({ received: false, message: 'Stripe webhooks no longer active' }, { status: 410 });
};
