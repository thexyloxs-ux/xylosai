import { randomBytes } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const state = randomBytes(16).toString('hex');
	const next = url.searchParams.get('next') ?? '';

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 600
	});

	if (next) {
		cookies.set('oauth_next', next, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 600
		});
	}

	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: `${PUBLIC_APP_URL}/auth/google/callback`,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		access_type: 'online',
		prompt: 'select_account'
	});

	throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};
