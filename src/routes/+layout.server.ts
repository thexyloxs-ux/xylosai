import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Fetch profile if user is logged in
	let profile = null;
	if (user) {
		profile = await ensureProfileForUser(createSupabaseAdminClient(), user);
	}

	return { session, user, profile };
};
