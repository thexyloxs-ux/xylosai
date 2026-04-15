import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) redirect(302, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (!profile || profile.role !== 'school_admin') redirect(302, '/chat');

	if (!profile.org_id) {
		return { profile, org: null, students: [] };
	}

	// Fetch the organisation
	const { data: org } = await locals.supabase
		.from('organizations')
		.select('*')
		.eq('id', profile.org_id)
		.single();

	// Fetch students in this org (exclude the admin)
	const { data: rawStudents } = await locals.supabase
		.from('profiles')
		.select('id, full_name, level, curriculum, messages_today, messages_today_reset_at')
		.eq('org_id', profile.org_id)
		.neq('role', 'school_admin');

	// Normalise messages_today — zero out if the counter is from a previous day
	const todayStr = new Date().toDateString();
	const students = (rawStudents ?? []).map((s) => ({
		...s,
		messages_today:
			new Date(s.messages_today_reset_at).toDateString() === todayStr
				? (s.messages_today ?? 0)
				: 0
	}));

	return { profile, org, students };
};
