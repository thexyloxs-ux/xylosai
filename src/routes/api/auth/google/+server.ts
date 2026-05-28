import { randomBytes } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID } from '$env/static/private';
import { getAuthAvailability } from '$lib/server/runtime-config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const source = url.searchParams.get('source') === 'signup' ? 'signup' : 'login';
	const next = url.searchParams.get('next') ?? '';
	const redirectUri = `${url.origin}/auth/google/callback`;

	if (!getAuthAvailability().google) {
		const joinParam = next.startsWith('/join/') ? `?join=${encodeURIComponent(next.slice('/join/'.length))}` : '';
		throw redirect(302, `/auth/${source}${joinParam}${joinParam ? '&' : '?'}error=google_unavailable`);
	}

	const state = randomBytes(16).toString('hex');

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
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		access_type: 'online',
		prompt: 'select_account'
	});

	throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};
