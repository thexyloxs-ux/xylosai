import { randomBytes } from 'node:crypto';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

const setupOrgSchema = z.object({
	schoolName: z.string().min(1).max(200),
	country: z.string().min(1).max(100).optional(),
	curriculum: z.string().max(100).optional(),
	seatLimit: z.number().int().min(1).max(10000).optional(),
	completeOnboarding: z.boolean().optional(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw error(401, 'Unauthorized');
	}

	const raw = await request.json().catch(() => null);
	const parsed = setupOrgSchema.safeParse(raw);
	if (!parsed.success) throw error(400, 'Invalid request body');
	const { schoolName, country, curriculum, seatLimit, completeOnboarding = true } = parsed.data;

	const admin = createSupabaseAdminClient();

	const { data: existing } = await admin
		.from('profiles')
		.select('org_id, role')
		.eq('id', user.id)
		.single();

	if (existing?.role === 'student') {
		throw error(403, 'Student accounts cannot create organizations');
	}

	if (existing?.org_id) {
		if (existing.role !== 'school_admin') {
			throw error(409, 'Organization already set up for this account');
		}

		const { error: orgUpdateErr } = await admin
			.from('organizations')
			.update({
				name: schoolName,
				country,
				curriculum,
				seat_limit: seatLimit ?? 30,
			})
			.eq('id', existing.org_id);

		if (orgUpdateErr) {
			logger.error({ err: orgUpdateErr, userId: user.id, orgId: existing.org_id }, 'Org update failed');
			throw error(500, 'Could not update organization');
		}

		if (completeOnboarding) {
			const { error: profileUpdateErr } = await admin
				.from('profiles')
				.update({ onboarded: true })
				.eq('id', user.id);

			if (profileUpdateErr) {
				logger.error({ err: profileUpdateErr, userId: user.id }, 'Profile onboarding update failed');
				throw error(500, 'Could not finish onboarding');
			}
		}

		return json({ success: true, orgId: existing.org_id });
	}

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
		logger.error({ err: orgErr, userId: user.id }, 'Org creation failed');
		throw error(500, 'Could not create organization');
	}

	const { error: profileErr } = await admin
		.from('profiles')
		.update({
			org_id: org.id,
			role: 'school_admin',
			onboarded: completeOnboarding,
		})
		.eq('id', user.id);

	if (profileErr) {
		await admin.from('organizations').delete().eq('id', org.id);
		logger.error({ err: profileErr, userId: user.id, orgId: org.id }, 'Profile link failed; org rolled back');
		throw error(500, 'Could not link admin profile');
	}

	return json({ success: true, orgId: org.id, inviteCode });
};
