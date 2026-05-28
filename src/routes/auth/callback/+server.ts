import { redirect } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import { ensureProfileForUser } from '$lib/server/profile';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next');
	const normalizedNext = next?.startsWith('/') ? next : null;

	if (code) {
		await locals.supabase.auth.exchangeCodeForSession(code);
	}

	if (normalizedNext === '/auth/login' || normalizedNext?.startsWith('/auth/login?')) {
		await locals.supabase.auth.signOut();
		throw redirect(302, normalizedNext);
	}

	// Check if the user has completed onboarding
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (user) {
		const profile = await ensureProfileForUser(createSupabaseAdminClient(), user);

		if (profile?.onboarded) {
			throw redirect(302, profile.role === 'org_admin' ? '/dashboard' : '/chat');
		}
	}

	// New user or not onboarded yet
	throw redirect(302, normalizedNext ?? '/onboarding');
};
