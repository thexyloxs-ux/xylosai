import { configuredProviders, isProviderConfigured } from './config';
import { createGeminiProvider } from './providers/gemini';
import { createGroqProvider } from './providers/groq';
import { classifyTurn } from './router';
import type { ChatMessage, ChatProvider, ProviderName, ProviderRequest, ProviderSelection } from './types';

export type OrchestratedStream = {
	provider: ProviderName;
	stream: AsyncIterable<string>;
	usedFallback: boolean;
	selection: ProviderSelection;
};

function providerFor(name: ProviderName, selection: ProviderSelection): ChatProvider {
	return name === 'groq' ? createGroqProvider(selection.intent) : createGeminiProvider();
}

function resolveProviderOrder(selection: ProviderSelection): [ProviderName, ProviderName | null] {
	const available = configuredProviders();

	if (available.length === 0) {
		throw new Error(
			'No AI providers configured. Add a valid GROQ_API_KEY or GEMINI_API_KEY to the server environment.'
		);
	}

	const preferred = [selection.primary, selection.fallback];
	const ordered = preferred.filter((name, index) => {
		return preferred.indexOf(name) === index && isProviderConfigured(name);
	});

	if (ordered.length > 0) {
		return [ordered[0], ordered[1] ?? null];
	}

	return [available[0], available[1] ?? null];
}

export async function streamWithFallback(
	primary: ChatProvider,
	fallback: ChatProvider | null,
	req: ProviderRequest,
	selection: ProviderSelection
): Promise<OrchestratedStream> {
	try {
		const stream = await primary.stream(req);
		return {
			provider: primary.name,
			stream,
			usedFallback: false,
			selection
		};
	} catch (primaryError) {
		if (!fallback) {
			throw primaryError;
		}

		const stream = await fallback.stream(req);
		return {
			provider: fallback.name,
			stream,
			usedFallback: true,
			selection
		};
	}
}

export async function orchestrateChatStream(
	messages: ChatMessage[],
	systemPrompt: string
): Promise<OrchestratedStream> {
	const selection = classifyTurn(messages);
	const [primaryName, fallbackName] = resolveProviderOrder(selection);
	const primary = providerFor(primaryName, selection);
	const fallback = fallbackName ? providerFor(fallbackName, selection) : null;

	return streamWithFallback(primary, fallback, { messages, systemPrompt }, selection);
}
