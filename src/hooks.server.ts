import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';
import { checkRateLimit } from '$lib/server/rate-limit';

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory sliding-window limiter. Works for single-instance deployments.
// For multi-instance production scale, replace `checkRateLimit` with
// @upstash/ratelimit backed by Upstash Redis.

// Rules applied in order — first match wins
const RATE_RULES: Array<{ test: (path: string) => boolean; limit: number; windowMs: number; key: string }> = [
	// Chat: 30 messages per minute per IP
	{
		test: (p) => p === '/api/chat',
		limit: 30,
		windowMs: 60_000,
		key: 'chat'
	},
	// Auth actions: 5 per 15 minutes per IP (login, signup, welcome, setup-org)
	{
		test: (p) => p.startsWith('/api/auth/'),
		limit: 5,
		windowMs: 15 * 60_000,
		key: 'auth'
	},
	// Paystack: 20 per 15 minutes per IP
	{
		test: (p) => p.startsWith('/api/paystack/'),
		limit: 20,
		windowMs: 15 * 60_000,
		key: 'paystack'
	},
	// General API: 120 per minute per IP
	{
		test: (p) => p.startsWith('/api/'),
		limit: 120,
		windowMs: 60_000,
		key: 'api'
	}
];

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const rule = RATE_RULES.find((r) => r.test(path));

	if (rule) {
		const ip =
			event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
			event.getClientAddress();

		if (!checkRateLimit(`${rule.key}:${ip}`, rule.limit, rule.windowMs)) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: { 'Content-Type': 'text/plain' }
			});
		}
	}

	return resolve(event);
};

// ── Supabase ──────────────────────────────────────────────────────────────────

const supabaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) return { session: null, user: null };

		// Validate the JWT server-side — do not trust client-supplied session
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

// ── Security headers ──────────────────────────────────────────────────────────

const securityHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Only set on HTML responses — skip API/asset responses where headers add noise
	const ct = response.headers.get('content-type') ?? '';
	if (ct.includes('text/html')) {
		response.headers.set(
			'Content-Security-Policy',
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'", // unsafe-inline needed for SvelteKit hydration
				"style-src 'self' 'unsafe-inline'",
				"img-src 'self' data: https:",
				"font-src 'self' data:",
				"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com",
				"frame-ancestors 'none'"
			].join('; ')
		);
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
		// HSTS — only meaningful over HTTPS; Vercel serves all traffic over HTTPS
		response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
	}

	return response;
};

// ── Auth locals ───────────────────────────────────────────────────────────────

const authHandle: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};

export const handle = sequence(rateLimitHandle, supabaseHandle, authHandle, securityHandle);
