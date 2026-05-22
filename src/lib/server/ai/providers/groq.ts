import { groq, GROQ_FAST_MODEL, GROQ_QUALITY_MODEL } from '$lib/server/groq';
import type { ChatProvider, ProviderRequest, StudyIntent } from '../types';

function modelForIntent(intent: StudyIntent): string {
	return intent === 'quick_tutor' || intent === 'quiz' ? GROQ_FAST_MODEL : GROQ_QUALITY_MODEL;
}

export function createGroqProvider(intent: StudyIntent): ChatProvider {
	const model = modelForIntent(intent);

	return {
		name: 'groq',
		async stream(req: ProviderRequest) {
			const stream = await groq.chat.completions.create({
				model,
				messages: [
					{ role: 'system', content: req.systemPrompt },
					...req.messages
				],
				stream: true,
				temperature: 0.7,
				max_tokens: 2048
			});

			async function* tokens() {
				for await (const chunk of stream) {
					const token = chunk.choices[0]?.delta?.content ?? '';
					if (token) yield token;
				}
			}

			return tokens();
		}
	};
}
