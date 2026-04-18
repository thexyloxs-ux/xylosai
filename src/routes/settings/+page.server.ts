import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) throw redirect(302, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (!profile) throw redirect(302, '/auth/login');

	let organization = null;
	if (profile.org_id) {
		const { data } = await locals.supabase
			.from('organizations')
			.select('*')
			.eq('id', profile.org_id)
			.single();
		organization = data;
	}

	return { profile, organization };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) return fail(401);

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const level = formData.get('level') as string;
		const curriculum = formData.get('curriculum') as string;
		const subjects = formData.getAll('subjects') as string[];

		const { error } = await locals.supabase
			.from('profiles')
			.update({
				full_name: fullName,
				level,
				curriculum,
				subjects
			})
			.eq('id', user.id);

		if (error) return fail(500, { message: error.message });

		return { success: true, message: 'Profile updated successfully' };
	},

	updateOrg: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) return fail(401);

		// Check if user is an admin
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role, org_id')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'school_admin' || !profile.org_id) {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const country = formData.get('country') as string;
		const curriculum = formData.get('curriculum') as string;

		const { error } = await locals.supabase
			.from('organizations')
			.update({ name, country, curriculum })
			.eq('id', profile.org_id);

		if (error) return fail(500, { message: error.message });

		return { success: true, message: 'Organization updated successfully' };
	}
};
