import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { sendPasswordResetEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { getCanonicalAppOrigin } from '$lib/app-origin';
import type { RequestHandler } from './$types';

const requestResetSchema = z.object({
	email: z.string().trim().email()
});

function buildRecoveryActionUrl(tokenHash: string) {
	return `${getCanonicalAppOrigin()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${encodeURIComponent('/auth/reset-password')}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = requestResetSchema.safeParse(payload);
	if (!parsed.success) {
		return json({ ok: true });
	}

	const { email } = parsed.data;
	const admin = createSupabaseAdminClient();
	const redirectTo = `${getCanonicalAppOrigin()}/auth/reset-password`;
	const { data, error } = await admin.auth.admin.generateLink({
		type: 'recovery',
		email,
		options: {
			redirectTo
		}
	});

	if (error || !data.properties.action_link) {
		logger.warn({ err: error, email }, 'Password reset link generation failed');
		return json({ ok: true });
	}

	try {
		await sendPasswordResetEmail(email, buildRecoveryActionUrl(data.properties.hashed_token));
	} catch (mailError) {
		logger.error({ err: mailError, email }, 'Password reset email delivery failed');
	}

	return json({ ok: true });
};
