import { beforeEach, describe, expect, it, vi } from 'vitest';

const config = vi.hoisted(() => ({
	configuredProviders: vi.fn(() => ['groq', 'gemini']),
	isProviderConfigured: vi.fn(() => true)
}));

vi.mock('../ai/config', () => config);

const providers = vi.hoisted(() => ({
	groqStream: vi.fn().mockResolvedValue(
		(async function* () {
			yield 'groq';
		})()
	),
	geminiStream: vi.fn().mockResolvedValue(
		(async function* () {
			yield 'gemini';
		})()
	)
}));

vi.mock('../ai/providers/groq', () => ({
	createGroqProvider: vi.fn(() => ({
		name: 'groq',
		stream: providers.groqStream
	}))
}));

vi.mock('../ai/providers/gemini', () => ({
	createGeminiProvider: vi.fn(() => ({
		name: 'gemini',
		stream: providers.geminiStream
	}))
}));

import { orchestrateChatStream, streamWithFallback } from '../ai/orchestrator';

beforeEach(() => {
	config.configuredProviders.mockReturnValue(['groq', 'gemini']);
	config.isProviderConfigured.mockReturnValue(true);
	providers.groqStream.mockClear();
	providers.geminiStream.mockClear();
	providers.groqStream.mockResolvedValue(
		(async function* () {
			yield 'groq';
		})()
	);
	providers.geminiStream.mockResolvedValue(
		(async function* () {
			yield 'gemini';
		})()
	);
});

describe('streamWithFallback', () => {
	it('falls back before stream starts', async () => {
		const primary = {
			name: 'groq',
			stream: vi.fn().mockRejectedValue(new Error('boom'))
		};
		const fallback = {
			name: 'gemini',
			stream: vi.fn().mockResolvedValue(
				(async function* () {
					yield 'hi';
				})()
			)
		};

		const result = await streamWithFallback(
			primary as never,
			fallback as never,
			{ systemPrompt: 'x', messages: [] },
			{ intent: 'deep_explain', primary: 'gemini', fallback: 'groq', reason: 'test' }
		);

		expect(result.provider).toBe('gemini');
		expect(result.usedFallback).toBe(true);
	});

	it('uses primary provider when it succeeds', async () => {
		const primary = {
			name: 'groq',
			stream: vi.fn().mockResolvedValue(
				(async function* () {
					yield 'fast';
				})()
			)
		};
		const fallback = {
			name: 'gemini',
			stream: vi.fn()
		};

		const result = await streamWithFallback(
			primary as never,
			fallback as never,
			{ systemPrompt: 'x', messages: [] },
			{ intent: 'quick_tutor', primary: 'groq', fallback: 'gemini', reason: 'test' }
		);

		expect(result.provider).toBe('groq');
		expect(result.usedFallback).toBe(false);
		expect(fallback.stream).not.toHaveBeenCalled();
	});

	it('skips unconfigured providers and uses the available one', async () => {
		config.configuredProviders.mockReturnValue(['groq']);
		config.isProviderConfigured.mockImplementation(((provider: string) => provider === 'groq') as never);

		const result = await orchestrateChatStream(
			[{ role: 'user', content: 'Explain this topic in detail for me' }],
			'System prompt'
		);

		expect(result.provider).toBe('groq');
		expect(result.usedFallback).toBe(false);
		expect(providers.groqStream).toHaveBeenCalledOnce();
		expect(providers.geminiStream).not.toHaveBeenCalled();
	});
});
