import { GEMINI_API_KEY, GROQ_API_KEY } from '$env/static/private';
import type { ProviderName } from './types';

function isMissing(value: string | undefined): boolean {
	if (!value) return true;

	const normalized = value.trim().toLowerCase();
	return (
		normalized.length === 0 ||
		normalized.includes('placeholder') ||
		normalized.includes('your_') ||
		normalized.includes('_here')
	);
}

export function isProviderConfigured(provider: ProviderName): boolean {
	if (provider === 'groq') {
		return !isMissing(GROQ_API_KEY);
	}

	return !isMissing(GEMINI_API_KEY);
}

export function configuredProviders(): ProviderName[] {
	return (['groq', 'gemini'] as const).filter((provider) => isProviderConfigured(provider));
}
