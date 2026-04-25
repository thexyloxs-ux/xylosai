import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { code } = params;
	const { session, user } = await locals.safeGetSession();

	// 1. Resolve the invite code to an organization
	const { data: org, error: orgErr } = await locals.supabase
		.from('organizations')
		.select('id, name')
		.eq('invite_code', code)
		.single();

	if (orgErr || !org) {
		// Invalid code: back to login with error
		throw redirect(302, '/auth/login?error=invalid_invite');
	}

	// 2. Handle based on auth status
	if (user) {
		// Use admin client so RLS doesn't block updating role/org_id
		const admin = createSupabaseAdminClient();
		const { error: updateErr } = await admin
			.from('profiles')
			.update({
				org_id: org.id,
				role: 'student',
				onboarded: true
			})
			.eq('id', user.id);

		if (updateErr) {
			logger.error({ err: updateErr, userId: user.id, orgId: org.id }, 'Join failed');
			throw redirect(302, `/chat?error=join_failed`);
		}

		// Success: go to chat
		throw redirect(302, '/chat?joined=' + encodeURIComponent(org.name));
	} else {
		// User is NOT logged in: redirect to signup with the code passed through
		throw redirect(302, `/auth/signup?join=${code}`);
	}
};
