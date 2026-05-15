import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import { createHmac } from 'crypto';

const BASE = 'https://api.paystack.co';

export type PaystackPlanType = 'plus' | 'pro' | 'school';

export interface PaystackTransaction {
	reference: string;
	status: string;
	plan?: string | { plan_code?: string } | null;
	customer?: { email?: string | null; customer_code?: string | null } | null;
	subscription?: string | {
		subscription_code?: string | null;
		email_token?: string | null;
	} | null;
	metadata?: {
		userId?: string;
		planType?: string;
		[key: string]: unknown;
	} | null;
}

async function paystackFetch(path: string, options: RequestInit = {}) {
	const res = await fetch(`${BASE}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json',
			...options.headers
		}
	});
	if (!res.ok) {
		throw new Error(`Paystack ${options.method ?? 'GET'} ${path} failed: ${res.status}`);
	}
	return res.json();
}

export async function initializeTransaction(params: {
	email: string;
	planCode: string;
	metadata: { userId: string; planType: PaystackPlanType };
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

export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
	const data = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
	if (!data.status || !data.data) {
		throw new Error(data.message || 'Paystack transaction verification failed');
	}
	return data.data;
}

export async function disableSubscription(code: string, token: string): Promise<void> {
	const body = JSON.stringify({ code, token });
	const data = await paystackFetch('/subscription/disable', { method: 'POST', body });
	if (!data.status) throw new Error(data.message || 'Paystack subscription cancellation failed');
}

export async function createSubscriptionManageLink(code: string): Promise<string> {
	const data = await paystackFetch(`/subscription/${encodeURIComponent(code)}/manage/link`);
	if (!data.status || !data.data?.link) {
		throw new Error(data.message || 'Paystack manage link creation failed');
	}
	return data.data.link;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
	const hash = createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex');
	return hash === signature;
}
