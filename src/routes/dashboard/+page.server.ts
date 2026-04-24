import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { sendInviteEmail } from '$lib/server/email';

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

	const { data: rawStudents } = await locals.supabase
		.from('profiles')
		.select('id, full_name, email, level, curriculum, messages_today, messages_today_reset_at')
		.eq('org_id', profile.org_id)
		.neq('role', 'school_admin');

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
	const cutoff = sevenDaysAgo.toISOString().slice(0, 10);

	const { data: weeklyActivity } = await locals.supabase
		.from('student_activity')
		.select('user_id, date, message_count')
		.eq('org_id', profile.org_id)
		.gte('date', cutoff);

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

export const actions: Actions = {
	removeStudent: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) return fail(401, { message: 'Unauthorized' });

		const { data: adminProfile } = await locals.supabase
			.from('profiles')
			.select('role, org_id')
			.eq('id', user.id)
			.single();

		if (adminProfile?.role !== 'school_admin' || !adminProfile.org_id) {
			return fail(403, { message: 'Forbidden' });
		}

		const formData = await request.formData();
		const studentId = formData.get('studentId') as string;
		if (!studentId) return fail(400, { message: 'Missing studentId' });

		// Verify the student actually belongs to this admin's org before removing
		const { data: student } = await locals.supabase
			.from('profiles')
			.select('id, org_id')
			.eq('id', studentId)
			.eq('org_id', adminProfile.org_id)
			.single();

		if (!student) return fail(404, { message: 'Student not found in your organisation' });

		const admin = createSupabaseAdminClient();
		const { error } = await admin
			.from('profiles')
			.update({ org_id: null, role: 'individual' })
			.eq('id', studentId);

		if (error) return fail(500, { message: error.message });

		return { success: true, removedId: studentId };
	},

	inviteStudents: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) return fail(401, { message: 'Unauthorized' });

		const { data: adminProfile } = await locals.supabase
			.from('profiles')
			.select('role, org_id')
			.eq('id', user.id)
			.single();

		if (adminProfile?.role !== 'school_admin' || !adminProfile.org_id) {
			return fail(403, { message: 'Forbidden' });
		}

		const { data: org } = await locals.supabase
			.from('organizations')
			.select('name, invite_code')
			.eq('id', adminProfile.org_id)
			.single();

		const inviteCode = org?.invite_code;
		if (!inviteCode) return fail(400, { message: 'No invite code found' });

		const formData = await request.formData();
		const raw = (formData.get('emails') as string) ?? '';

		const emails = raw
			.split(/[\n,]+/)
			.map((e) => e.trim().toLowerCase())
			.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

		if (emails.length === 0) return fail(400, { message: 'No valid email addresses found' });
		if (emails.length > 100) return fail(400, { message: 'Maximum 100 emails per batch' });

		const results = await Promise.allSettled(
			emails.map((email) => sendInviteEmail(email, org.name, inviteCode))
		);

		const sent = results.filter((r) => r.status === 'fulfilled').length;
		const failed = results.length - sent;

		return {
			success: true,
			sent,
			failed,
			message: failed > 0
				? `Sent ${sent} invite${sent !== 1 ? 's' : ''}. ${failed} failed.`
				: `Sent ${sent} invite${sent !== 1 ? 's' : ''} successfully.`
		};
	}
};
