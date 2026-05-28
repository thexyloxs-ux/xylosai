import { redirect } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) throw redirect(302, '/auth/login');

	const profile = await ensureProfileForUser(createSupabaseAdminClient(), user);

	if (profile?.onboarded) {
		if (profile.role === 'org_admin') throw redirect(302, '/dashboard');
		else throw redirect(302, '/chat');
	}

	const requestedRole = user.user_metadata?.role;
	const onboardingRole =
		profile?.role === 'org_admin' || (profile?.role === 'individual' && requestedRole === 'org_admin')
			? 'org_admin'
			: profile?.role ?? 'individual';

	return { onboardingRole };
};
