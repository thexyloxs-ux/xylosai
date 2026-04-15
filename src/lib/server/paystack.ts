import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { createHmac } from 'crypto';

const BASE = 'https://api.paystack.co';

async function paystackFetch(path: string, options: RequestInit = {}) {
	const res = await fetch(`${BASE}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
			...options.headers
		}
	});
	return res.json();
}

export async function initializeTransaction(params: {
	email: string;
	planCode: string;
	metadata: Record<string, string>;
	callbackUrl: string;
}): Promise<{ authorization_url: string; reference: string }> {
	const body = JSON.stringify({
		email: params.email,
		amount: 100, // ignored when a plan is set, but required by the API
		plan: params.planCode,
		metadata: params.metadata,
		callback_url: params.callbackUrl
	});

	const data = await paystackFetch('/transaction/initialize', { method: 'POST', body });
	if (!data.status) throw new Error(data.message || 'Paystack initialization failed');
	return data.data;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
	const hash = createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex');
	return hash === signature;
}
