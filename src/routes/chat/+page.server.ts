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

	return { profile, organization, conversations: conversations || [] };
};
