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

	if (!profile || profile.role !== 'school_admin') throw redirect(302, '/chat');

	if (!profile.org_id) {
		return { profile, org: null, students: [] };
	}

	const { data: org } = await locals.supabase
		.from('organizations')
		.select('*')
		.eq('id', profile.org_id)
		.single();

	// Fetch students in this org (exclude the admin)
	const { data: rawStudents } = await locals.supabase
		.from('profiles')
		.select('id, full_name, email, level, curriculum, messages_today, messages_today_reset_at')
		.eq('org_id', profile.org_id)
		.neq('role', 'school_admin');

	// Fetch last 7 days of activity for this org
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
	const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

	const { data: weeklyActivity } = await locals.supabase
		.from('student_activity')
		.select('user_id, date, message_count')
		.eq('org_id', profile.org_id)
		.gte('date', cutoff);

	// Build per-student weekly summary
	const activityByStudent = new Map<string, { totalMessages: number; lastActive: string | null }>();
	for (const row of weeklyActivity ?? []) {
		const existing = activityByStudent.get(row.user_id) ?? { totalMessages: 0, lastActive: null };
		existing.totalMessages += row.message_count;
		if (!existing.lastActive || row.date > existing.lastActive) {
			existing.lastActive = row.date;
		}
		activityByStudent.set(row.user_id, existing);
	}

	const todayStr = new Date().toDateString();

	const students = (rawStudents ?? []).map((s) => {
		const todayMessages =
			new Date(s.messages_today_reset_at).toDateString() === todayStr
				? (s.messages_today ?? 0)
				: 0;

		const weekly = activityByStudent.get(s.id);

		return {
			id: s.id,
			full_name: s.full_name,
			email: s.email,
			level: s.level,
			curriculum: s.curriculum,
			messages_today: todayMessages,
			messages_this_week: weekly?.totalMessages ?? 0,
			last_active: weekly?.lastActive ?? null,
		};
	});

	return { profile, org, students };
};
