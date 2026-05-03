import { error, json } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import {
	verifyTransaction,
	verifyWebhookSignature,
	type PaystackPlanType,
	type PaystackTransaction,
} from '$lib/server/paystack';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import {
	PAYSTACK_PLUS_PLAN_CODE,
	PAYSTACK_PRO_PLAN_CODE,
	PAYSTACK_SCHOOL_PLAN_CODE,
} from '$env/static/private';
import { activatePlan, cancelSubscription } from '$lib/server/services/subscription';
import type { RequestHandler } from './$types';

function normalizePlanType(value: unknown): PaystackPlanType | null {
	return value === 'plus' || value === 'pro' || value === 'school' ? value : null;
}

function transactionPlanCode(transaction: PaystackTransaction): string | null {
	if (typeof transaction.plan === 'string') return transaction.plan;
	if (transaction.plan && typeof transaction.plan === 'object') {
		return transaction.plan.plan_code ?? null;
	}
	return null;
}

function expectedPlanCode(planType: PaystackPlanType): string {
	if (planType === 'school') return PAYSTACK_SCHOOL_PLAN_CODE;
	if (planType === 'pro') return PAYSTACK_PRO_PLAN_CODE;
	return PAYSTACK_PLUS_PLAN_CODE;
}

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
				const reference = event.data?.reference;
				if (typeof reference !== 'string' || reference.length === 0) {
					throw error(400, 'Missing transaction reference');
				}

				const transaction = await verifyTransaction(reference);
				if (transaction.reference !== reference) {
					throw error(400, 'Transaction reference mismatch');
				}
				if (transaction.status !== 'success') {
					throw error(400, 'Transaction not successful');
				}

				const metadata = transaction.metadata ?? {};
				const planType = normalizePlanType(metadata.planType);
				const userId = typeof metadata.userId === 'string' ? metadata.userId : null;
				if (!userId || !planType) {
					throw error(400, 'Invalid transaction metadata');
				}

				const planCode = transactionPlanCode(transaction);
				if (planCode && planCode !== expectedPlanCode(planType)) {
					throw error(400, 'Plan mismatch');
				}

				await activatePlan(admin, userId, planType);
				logger.info({ userId, planType, reference }, 'Plan activated');
				break;
			}
			case 'subscription.disable': {
				const email = event.data?.customer?.email;
				if (typeof email === 'string' && email.length > 0) {
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
		throw error(500, 'Webhook processing failed');
	}

	return json({ received: true });
};
