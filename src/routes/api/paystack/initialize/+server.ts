import { error, redirect } from '@sveltejs/kit';
import { initializeTransaction } from '$lib/server/paystack';
import { PAYSTACK_PRO_PLAN_CODE, PAYSTACK_SCHOOL_PLAN_CODE } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(302, '/auth/login?next=/pricing');
	}

	const plan = url.searchParams.get('plan');
	const planCode = plan === 'school' ? PAYSTACK_SCHOOL_PLAN_CODE : PAYSTACK_PRO_PLAN_CODE;

	if (!planCode) {
		throw error(400, 'Plan not configured');
	}

	try {
		const { authorization_url } = await initializeTransaction({
			email: user.email!,
			planCode,
			metadata: {
				userId: user.id,
				planType: plan || 'pro'
			},
			callbackUrl: `${PUBLIC_APP_URL}/settings?success=true`
		});

		throw redirect(303, authorization_url);
	} catch (err: unknown) {
		// Re-throw SvelteKit redirects
		if (typeof err === 'object' && err !== null && 'status' in err) throw err;
		const msg = err instanceof Error ? err.message : 'Internal Server Error';
		throw error(500, msg);
	}
};
