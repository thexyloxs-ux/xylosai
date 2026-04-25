import { json } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import { sendWelcomeEmail } from '$lib/server/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { name, email } = await request.json();
	
	try {
		await sendWelcomeEmail(email, name);
		return json({ ok: true });
	} catch (err) {
		logger.error({ err, email }, 'Welcome email delivery failed');
		return json({ ok: false, error: 'Email delivery failed' }, { status: 500 });
	}
};
