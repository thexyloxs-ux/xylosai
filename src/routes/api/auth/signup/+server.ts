import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { sendConfirmationEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { getCanonicalAppOrigin } from '$lib/app-origin';
import type { RequestHandler } from './$types';

const signupSchema = z.object({
	fullName: z.string().trim().min(1).max(200),
	email: z.string().trim().email(),
	password: z.string().min(8).max(200),
	isOrganization: z.boolean().default(false),
	orgName: z.string().trim().max(200).optional().default(''),
	country: z.string().trim().max(120).optional().default(''),
	joinCode: z.string().trim().max(64).optional().nullable()
});

function buildConfirmationRedirect(joinCode?: string | null) {
	const params = new URLSearchParams({ confirmed: '1' });
	if (joinCode) params.set('join', joinCode);
	return `${getCanonicalAppOrigin()}/auth/login?${params.toString()}`;
}

function buildConfirmationActionUrl(tokenHash: string, joinCode?: string | null) {
	return `${getCanonicalAppOrigin()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=signup&next=${encodeURIComponent(`/auth/login?${new URLSearchParams({ confirmed: '1', ...(joinCode ? { join: joinCode } : {}) }).toString()}`)}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = signupSchema.safeParse(payload);
	if (!parsed.success) throw error(400, 'Invalid request body');

	const { fullName, email, password, isOrganization, orgName, country, joinCode } = parsed.data;
	const admin = createSupabaseAdminClient();
	const metadata: Record<string, string> = {
		full_name: fullName,
		role: isOrganization ? 'org_admin' : 'individual'
	};

	if (isOrganization) {
		metadata.org_name = orgName;
		metadata.country = country;
	}

	if (joinCode) {
		metadata.role = 'member';
		metadata.join_code = joinCode;
	}

	const redirectTo = buildConfirmationRedirect(joinCode);
	const { data, error: generateError } = await admin.auth.admin.generateLink({
		type: 'signup',
		email,
		password,
		options: {
			data: metadata,
			redirectTo
		}
	});

	if (generateError || !data.properties.action_link) {
		logger.warn({ err: generateError, email }, 'Custom signup link generation failed');
		throw error(400, generateError?.message || 'Unable to create account');
	}

	try {
		await sendConfirmationEmail(
			email,
			fullName,
			buildConfirmationActionUrl(data.properties.hashed_token, joinCode)
		);
	} catch (mailError) {
		logger.error({ err: mailError, email }, 'Custom signup email delivery failed');
		throw error(500, 'We could not send your confirmation email right now.');
	}

	return json({ ok: true, requiresConfirmation: true });
};
