import { error, redirect } from '@sveltejs/kit';
import { initializeTransaction } from '$lib/server/paystack';
import {
	PAYSTACK_PLUS_PLAN_CODE,
	PAYSTACK_PRO_PLAN_CODE,
	PAYSTACK_SCHOOL_PLAN_CODE,
} from '$env/static/private';
import type { RequestHandler } from './$types';

function isConfiguredPlanCode(value: string | undefined): value is string {
	if (!value) return false;

	const normalized = value.trim().toLowerCase();
	return (
		normalized.length > 0 &&
		!normalized.includes('placeholder') &&
		!normalized.includes('your_') &&
		!normalized.includes('_here')
	);
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(302, '/auth/login?next=/pricing');
	}

	const plan = url.searchParams.get('plan');
	const planType =
		plan === 'school'
			? 'school'
			: plan === 'pro'
				? 'pro'
				: plan === 'plus' || !plan
					? 'plus'
					: null;

	if (!planType) {
		throw error(400, 'Invalid plan');
	}

	if (!user.email) {
		throw error(400, 'User email is required');
	}

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('role, org_id')
		.eq('id', user.id)
		.single();

	if (!profile) {
		throw error(403, 'Profile not found');
	}

	if (planType === 'school' && (profile.role !== 'school_admin' || !profile.org_id)) {
		throw error(403, 'Only school admins can activate school billing.');
	}

	const planCode =
		planType === 'school'
			? PAYSTACK_SCHOOL_PLAN_CODE
			: planType === 'pro'
				? PAYSTACK_PRO_PLAN_CODE
				: PAYSTACK_PLUS_PLAN_CODE;

	if (!isConfiguredPlanCode(planCode)) {
		throw error(400, `Paystack ${planType} plan is not configured yet.`);
	}

	try {
		const { authorization_url } = await initializeTransaction({
			email: user.email,
			planCode,
			metadata: {
				userId: user.id,
				planType
			},
			callbackUrl: `${url.origin}/api/paystack/confirm`
		});

		throw redirect(303, authorization_url);
	} catch (err: unknown) {
		// Re-throw SvelteKit redirects
		if (typeof err === 'object' && err !== null && 'status' in err) throw err;
		const msg = err instanceof Error ? err.message : 'Internal Server Error';
		throw error(500, msg);
	}
};
