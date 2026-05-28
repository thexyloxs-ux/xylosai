import { error, redirect } from '@sveltejs/kit';
import {
	verifyTransaction,
	type PaystackPlanType,
	type PaystackTransaction
} from '$lib/server/paystack';
import {
	PAYSTACK_PLUS_PLAN_CODE,
	PAYSTACK_PRO_PLAN_CODE,
	PAYSTACK_ORG_PLAN_CODE
} from '$env/static/private';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { activatePlan } from '$lib/server/services/subscription';
import type { RequestHandler } from './$types';

function normalizePlanType(value: unknown): PaystackPlanType | null {
	return value === 'plus' || value === 'pro' || value === 'org' ? value : null;
}

function transactionPlanCode(transaction: PaystackTransaction): string | null {
	if (typeof transaction.plan === 'string') return transaction.plan;
	if (transaction.plan && typeof transaction.plan === 'object') {
		return transaction.plan.plan_code ?? null;
	}
	return null;
}

function transactionSubscription(transaction: PaystackTransaction) {
	if (typeof transaction.subscription === 'string') {
		return { subscriptionCode: transaction.subscription, emailToken: null };
	}
	if (transaction.subscription && typeof transaction.subscription === 'object') {
		return {
			subscriptionCode: transaction.subscription.subscription_code ?? null,
			emailToken: transaction.subscription.email_token ?? null
		};
	}
	return { subscriptionCode: null, emailToken: null };
}

function expectedPlanCode(planType: PaystackPlanType): string {
	if (planType === 'org') return PAYSTACK_ORG_PLAN_CODE;
	if (planType === 'pro') return PAYSTACK_PRO_PLAN_CODE;
	return PAYSTACK_PLUS_PLAN_CODE;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(302, '/auth/login?next=/settings');
	}

	const reference =
		url.searchParams.get('reference') ?? url.searchParams.get('trxref') ?? '';

	if (!reference) {
		throw redirect(302, '/settings?billing=missing_reference');
	}

	const transaction = await verifyTransaction(reference);
	if (transaction.reference !== reference || transaction.status !== 'success') {
		throw redirect(302, '/settings?billing=verification_failed');
	}

	const metadata = transaction.metadata ?? {};
	const planType = normalizePlanType(metadata.planType);
	const paidUserId = typeof metadata.userId === 'string' ? metadata.userId : null;

	if (!planType || !paidUserId || paidUserId !== user.id) {
		throw error(403, 'Payment metadata does not match the signed-in user.');
	}

	const planCode = transactionPlanCode(transaction);
	if (planCode && planCode !== expectedPlanCode(planType)) {
		throw error(400, 'Plan mismatch');
	}

	const subscription = transactionSubscription(transaction);
	const admin = createSupabaseAdminClient();
	await activatePlan(admin, user.id, planType, {
		planCode,
		customerCode: transaction.customer?.customer_code ?? null,
		customerEmail: transaction.customer?.email ?? null,
		subscriptionCode: subscription.subscriptionCode,
		emailToken: subscription.emailToken,
		reference
	});

	throw redirect(302, '/settings?billing=success');
};
