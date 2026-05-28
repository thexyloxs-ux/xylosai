import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { sendConfirmationEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { getCanonicalAppOrigin } from '$lib/app-origin';
import type { RequestHandler } from './$types';

const resendSchema = z.object({
	email: z.string().trim().email(),
	joinCode: z.string().trim().max(64).optional().nullable()
});

function buildConfirmationRedirect(joinCode?: string | null) {
	const params = new URLSearchParams({ confirmed: '1' });
	if (joinCode) params.set('join', joinCode);
	return `${getCanonicalAppOrigin()}/auth/login?${params.toString()}`;
}

function buildConfirmationActionUrl(tokenHash: string, joinCode?: string | null) {
	return `${getCanonicalAppOrigin()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent(`/auth/login?${new URLSearchParams({ confirmed: '1', ...(joinCode ? { join: joinCode } : {}) }).toString()}`)}`;
}

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = resendSchema.safeParse(payload);
	if (!parsed.success) {
		return json({ ok: true });
	}

	const { email, joinCode } = parsed.data;
	const admin = createSupabaseAdminClient();
	const redirectTo = buildConfirmationRedirect(joinCode);
	const { data, error } = await admin.auth.admin.generateLink({
		type: 'magiclink',
		email,
		options: {
			redirectTo
		}
	});

	if (error || !data.properties.action_link) {
		logger.warn({ err: error, email }, 'Custom confirmation resend generation failed');
		return json({ ok: true });
	}

	try {
		await sendConfirmationEmail(
			email,
			null,
			buildConfirmationActionUrl(data.properties.hashed_token, joinCode)
		);
	} catch (mailError) {
		logger.error({ err: mailError, email }, 'Custom confirmation resend delivery failed');
	}

	return json({ ok: true });
};
