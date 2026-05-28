import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { code } = params;
	const { session, user } = await locals.safeGetSession();
	const admin = createSupabaseAdminClient();

	// 1. Resolve the invite code to an organization
	const { data: org, error: orgErr } = await admin
		.from('organizations')
		.select('id, name, plan_status, seat_limit')
		.eq('invite_code', code)
		.single();

	if (orgErr || !org || (org.plan_status !== 'active' && org.plan_status !== 'trialing')) {
		// Invalid code: back to login with error
		throw redirect(302, '/auth/login?error=invalid_invite');
	}

	// 2. Handle based on auth status
	if (user) {
		const profile = await ensureProfileForUser(admin, user);
		const alreadyLinked = profile.org_id === org.id && profile.role === 'member';

		const { count: memberCount } = await admin
			.from('profiles')
			.select('id', { count: 'exact', head: true })
			.eq('org_id', org.id)
			.eq('role', 'member');

		if (!alreadyLinked && (memberCount ?? 0) >= org.seat_limit) {
			throw redirect(302, '/chat?error=invite_full');
		}

		const { error: updateErr } = await admin
			.from('profiles')
			.update({
				org_id: org.id,
				role: 'member',
			})
			.eq('id', user.id);

		if (updateErr) {
			logger.error({ err: updateErr, userId: user.id, orgId: org.id }, 'Join failed');
			throw redirect(302, `/chat?error=join_failed`);
		}

		if (profile.onboarded) {
			throw redirect(302, '/chat?joined=' + encodeURIComponent(org.name));
		}

		throw redirect(302, '/onboarding?joined=' + encodeURIComponent(org.name));
	} else {
		const { count: memberCount } = await admin
			.from('profiles')
			.select('id', { count: 'exact', head: true })
			.eq('org_id', org.id)
			.eq('role', 'member');

		if ((memberCount ?? 0) >= org.seat_limit) {
			throw redirect(302, '/auth/signup?error=invite_full');
		}

		// User is NOT logged in: redirect to signup with the code passed through
		throw redirect(302, `/auth/signup?join=${code}`);
	}
};
