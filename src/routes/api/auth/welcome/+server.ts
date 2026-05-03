import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { sendWelcomeEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

const welcomeSchema = z.object({
	name: z.string().min(1).max(200),
	email: z.string().email().optional(),
});

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user?.email) throw error(401, 'Unauthorized');

	const raw = await request.json().catch(() => null);
	const parsed = welcomeSchema.safeParse(raw);
	if (!parsed.success) throw error(400, 'Invalid request body');
	const { name, email } = parsed.data;

	if (email && email !== user.email) throw error(403, 'Forbidden');

	try {
		await sendWelcomeEmail(user.email, name);
		return json({ ok: true });
	} catch (err) {
		logger.error({ err, userId: user.id }, 'Welcome email delivery failed');
		return json({ ok: false, error: 'Email delivery failed' }, { status: 500 });
	}
};
