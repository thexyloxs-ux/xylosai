import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Fetch profile if user is logged in
	let profile = null;
	if (user) {
		const { data } = await locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();
		profile = data;
	}

	return { session, user, profile };
};
