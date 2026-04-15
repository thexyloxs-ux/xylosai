import { json, error } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	const { schoolName, country } = await request.json();

	if (!schoolName) {
		throw error(400, 'School name is required');
	}

	const admin = createSupabaseAdminClient();

	// 1. Create the Organization
	const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
	
	const { data: org, error: orgErr } = await admin
		.from('organizations')
		.insert({
			name: schoolName,
			country,
			invite_code: inviteCode,
			plan: 'school',
			plan_status: 'trialing'
		})
		.select()
		.single();

	if (orgErr) {
		console.error('Org creation error:', orgErr);
		throw error(500, 'Could not create organization');
	}

	// 2. Link the Admin Profile
	const { error: profileErr } = await admin
		.from('profiles')
		.update({
			org_id: org.id,
			role: 'school_admin'
		})
		.eq('id', user.id);

	if (profileErr) {
		console.error('Profile link error:', profileErr);
		throw error(500, 'Could not link admin profile');
	}

	return json({ success: true, orgId: org.id });
};
