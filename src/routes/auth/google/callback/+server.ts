import { redirect, error } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { logger } from '$lib/server/logger';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');
	const next = cookies.get('oauth_next') ?? '';
	const redirectUri = `${url.origin}/auth/google/callback`;

	cookies.delete('oauth_state', { path: '/' });
	cookies.delete('oauth_next', { path: '/' });

	if (!code || !state || state !== storedState) {
		logger.warn({ hasCode: !!code, stateMatch: state === storedState }, 'Google OAuth state mismatch');
		throw error(400, 'Invalid or expired sign-in attempt. Please try again.');
	}

	// Exchange authorization code for tokens
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});

	if (!tokenRes.ok) {
		const body = await tokenRes.text();
		logger.error({ status: tokenRes.status, body }, 'Google token exchange failed');
		throw redirect(302, '/auth/login?error=google_failed');
	}

	const { id_token } = await tokenRes.json() as { id_token: string };

	if (!id_token) {
		logger.error('Google token exchange returned no id_token');
		throw redirect(302, '/auth/login?error=google_failed');
	}

	// Sign in / register with Supabase using the Google ID token
	const { error: signInErr } = await locals.supabase.auth.signInWithIdToken({
		provider: 'google',
		token: id_token
	});

	if (signInErr) {
		logger.error({ err: signInErr }, 'Supabase signInWithIdToken failed');
		throw redirect(302, `/auth/login?error=${encodeURIComponent(signInErr.message)}`);
	}

	const { data: { user } } = await locals.supabase.auth.getUser();

	if (user) {
		const profile = await ensureProfileForUser(createSupabaseAdminClient(), user);

		if (profile?.onboarded) {
			throw redirect(302, profile.role === 'org_admin' ? '/dashboard' : '/chat');
		}
	}

	throw redirect(302, next || '/onboarding');
};
