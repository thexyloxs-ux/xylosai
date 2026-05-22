import { GEMINI_API_KEY } from '$env/static/private';
import { GEMINI_QUALITY_MODEL } from '$lib/server/groq';
import type { ChatProvider, ProviderRequest } from '../types';

type GeminiGenerateResponse = {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text?: string;
			}>;
		};
	}>;
};

function chunkText(text: string, size = 160): string[] {
	if (!text) return [];
	const chunks: string[] = [];
	for (let i = 0; i < text.length; i += size) {
		chunks.push(text.slice(i, i + size));
	}
	return chunks;
}

export function createGeminiProvider(): ChatProvider {
	return {
		name: 'gemini',
		async stream(req: ProviderRequest) {
			const contents = req.messages.map((message) => ({
				role: message.role === 'assistant' ? 'model' : 'user',
				parts: [{ text: message.content }]
			}));

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_QUALITY_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						systemInstruction: {
							parts: [{ text: req.systemPrompt }]
						},
						contents,
						generationConfig: {
							temperature: 0.7,
							maxOutputTokens: 2048
						}
					})
				}
			);

			if (!response.ok) {
				const body = await response.text();
				throw new Error(`Gemini request failed: ${response.status} ${body}`);
			}

			const payload = (await response.json()) as GeminiGenerateResponse;
			const text =
				payload.candidates?.[0]?.content?.parts
					?.map((part) => part.text ?? '')
					.join('') ?? '';

			async function* tokens() {
				for (const chunk of chunkText(text)) {
					yield chunk;
				}
			}

			return tokens();
		}
	};
}
