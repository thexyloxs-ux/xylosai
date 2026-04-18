import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next');

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	// Check if the user has completed onboarding
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (user) {
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('onboarded, role')
			.eq('id', user.id)
			.single();

		if (profile?.onboarded) {
			throw redirect(302, profile.role === 'school_admin' ? '/dashboard' : '/chat');
		}
	}

	// New user or not onboarded yet
	throw redirect(302, next ?? '/onboarding');
};
