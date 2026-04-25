import { randomBytes } from 'node:crypto';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

const setupOrgSchema = z.object({
	schoolName: z.string().min(1).max(200),
	country: z.string().min(1).max(100).optional(),
	curriculum: z.string().max(100).optional(),
	seatLimit: z.number().int().min(1).max(10000).optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	const raw = await request.json().catch(() => null);
	const parsed = setupOrgSchema.safeParse(raw);
	if (!parsed.success) throw error(400, 'Invalid request body');
	const { schoolName, country, curriculum, seatLimit } = parsed.data;

	const admin = createSupabaseAdminClient();

	// Idempotency guard — reject if this user already has an org
	const { data: existing } = await admin
		.from('profiles')
		.select('org_id')
		.eq('id', user.id)
		.single();

	if (existing?.org_id) {
		throw error(409, 'Organization already set up for this account');
	}

	// 1. Create the Organization
	const inviteCode = randomBytes(4).toString('hex').toUpperCase();

	const { data: org, error: orgErr } = await admin
		.from('organizations')
		.insert({
			name: schoolName,
			country,
			curriculum,
			invite_code: inviteCode,
			seat_limit: seatLimit ?? 30,
			plan: 'school',
			plan_status: 'trialing'
		})
		.select()
		.single();

	if (orgErr) {
		console.error('Org creation error:', orgErr);
		throw error(500, 'Could not create organization');
	}

	// 2. Link the Admin Profile (service role bypasses RLS — safe to set org_id and role)
	const { error: profileErr } = await admin
		.from('profiles')
		.update({
			org_id: org.id,
			role: 'school_admin',
			onboarded: true
		})
		.eq('id', user.id);

	if (profileErr) {
		console.error('Profile link error:', profileErr);
		throw error(500, 'Could not link admin profile');
	}

	return json({ success: true, orgId: org.id, inviteCode });
};
