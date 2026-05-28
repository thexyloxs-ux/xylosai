import { redirect } from '@sveltejs/kit';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { RequestHandler } from './$types';

const OTP_TYPES = new Set<EmailOtpType>(['signup', 'recovery', 'invite', 'magiclink', 'email_change', 'email']);

export const GET: RequestHandler = async ({ url, locals }) => {
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/';
	const normalizedNext = next.startsWith('/') ? next : '/';

	if (!tokenHash || !type || !OTP_TYPES.has(type)) {
		throw redirect(303, '/auth/login?error=invalid_link');
	}

	const { error } = await locals.supabase.auth.verifyOtp({
		token_hash: tokenHash,
		type
	});

	if (error) {
		if (type === 'recovery') {
			throw redirect(303, '/auth/forgot-password?error=invalid_reset_link');
		}

		throw redirect(303, '/auth/login?error=invalid_link');
	}

	if (type === 'recovery') {
		throw redirect(303, normalizedNext === '/' ? '/auth/reset-password' : normalizedNext);
	}

	if (normalizedNext === '/auth/login' || normalizedNext.startsWith('/auth/login?')) {
		await locals.supabase.auth.signOut();
		throw redirect(303, normalizedNext);
	}

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (user) {
		const profile = await ensureProfileForUser(createSupabaseAdminClient(), user);

		if (profile?.onboarded) {
			throw redirect(303, profile.role === 'school_admin' ? '/dashboard' : '/chat');
		}
	}

	throw redirect(303, normalizedNext || '/onboarding');
};
