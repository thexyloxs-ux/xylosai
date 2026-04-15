import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Redirects to Paystack equivalent
export const GET: RequestHandler = async ({ url }) => {
	const plan = url.searchParams.get('plan');
	redirect(302, `/api/paystack/initialize?plan=${plan || 'pro'}`);
};
