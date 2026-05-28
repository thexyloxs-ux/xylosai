import { PUBLIC_APP_URL } from '$env/static/public';

const FALLBACK_APP_URL = 'https://xyloss.tech';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function normalizeOrigin(origin: string) {
	return origin.replace(/\/+$/, '');
}

export function getCanonicalAppOrigin() {
	try {
		return normalizeOrigin(new URL(PUBLIC_APP_URL || FALLBACK_APP_URL).origin);
	} catch {
		return FALLBACK_APP_URL;
	}
}

export function isLocalOrigin(origin: string) {
	try {
		return LOCAL_HOSTS.has(new URL(origin).hostname);
	} catch {
		return false;
	}
}

export function getAuthRedirectOrigin(currentOrigin?: string) {
	if (currentOrigin && isLocalOrigin(currentOrigin)) {
		return normalizeOrigin(currentOrigin);
	}

	return getCanonicalAppOrigin();
}

export function shouldRedirectToCanonicalOrigin(url: URL) {
	const canonical = new URL(getCanonicalAppOrigin());

	if (LOCAL_HOSTS.has(url.hostname) || url.protocol === 'file:') {
		return false;
	}

	return url.origin !== canonical.origin;
}

export function rewriteSupabaseActionLink(actionLink: string, redirectTo: string) {
	try {
		const url = new URL(actionLink);
		url.searchParams.set('redirect_to', redirectTo);
		return url.toString();
	} catch {
		return actionLink;
	}
}
