import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (dev && url.searchParams.get('preview') === '1') {
		const now = new Date().toISOString();

		return {
			previewMode: true,
			profile: {
				id: 'preview-user',
				full_name: 'Preview Student',
				email: 'preview@xylo.local',
				role: 'individual',
				org_id: null,
				level: 'Senior Secondary',
				curriculum: 'WAEC',
				subjects: ['Biology', 'Chemistry', 'English'],
				study_challenge: 'understanding',
				plan: 'free',
				plan_status: 'active',
				messages_today: 0,
				messages_today_reset_at: now,
				onboarded: true,
				marketing_emails: false,
				created_at: now
			},
			organization: null,
			conversations: [
				{
					id: 'preview-conv-1',
					user_id: 'preview-user',
					title: 'Quiz me on respiration',
					subject: 'Biology',
					session_type: 'quiz',
					created_at: now,
					last_message_at: now
				}
			]
		};
	}

	const { session, user } = await locals.safeGetSession();

	if (!session || !user) throw redirect(302, '/auth/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();

	if (!profile?.onboarded) throw redirect(302, '/onboarding');

	let organization = null;
	if (profile.org_id) {
		const { data } = await locals.supabase
			.from('organizations')
			.select('*')
			.eq('id', profile.org_id)
			.single();
		organization = data;
	}

	const { data: conversations } = await locals.supabase
		.from('conversations')
		.select('*')
		.eq('user_id', user.id)
		.order('last_message_at', { ascending: false })
		.limit(10);

	return { previewMode: false, profile, organization, conversations: conversations || [] };
};
