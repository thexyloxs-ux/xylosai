import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) throw redirect(302, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (profile?.onboarded) {
		if (profile.role === 'school_admin') throw redirect(302, '/dashboard');
		else throw redirect(302, '/chat');
	}

	const requestedRole = user.user_metadata?.role;
	const onboardingRole =
		profile?.role === 'school_admin' || (profile?.role === 'individual' && requestedRole === 'school_admin')
			? 'school_admin'
			: profile?.role ?? 'individual';

	return { onboardingRole };
};
