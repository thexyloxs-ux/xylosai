import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const email = url.searchParams.get('email')?.trim().toLowerCase() ?? '';

	if (!email) return { success: false, email: '' };

	const admin = createSupabaseAdminClient();

	// Resolve the user by email and mark marketing_emails = false
	const { data: userId, error: rpcErr } = await admin.rpc('get_user_id_by_email', {
		p_email: email
	});

	if (rpcErr) {
		logger.error({ err: rpcErr, email }, 'Unsubscribe: failed to resolve user');
		return { success: false, email };
	}

	if (userId) {
		const { error: updateErr } = await admin
			.from('profiles')
			.update({ marketing_emails: false })
			.eq('id', userId);

		if (updateErr) {
			logger.error({ err: updateErr, email }, 'Unsubscribe: failed to update profile');
			return { success: false, email };
		}
	}

	// Return success even if user not found — don't leak whether an email exists
	return { success: true, email };
};
