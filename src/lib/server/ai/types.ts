export type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
};

export type StudyIntent =
	| 'quick_tutor'
	| 'deep_explain'
	| 'quiz'
	| 'study_plan'
	| 'exam_prep';

export type ProviderName = 'groq' | 'gemini';

export type ProviderSelection = {
	intent: StudyIntent;
	primary: ProviderName;
	fallback: ProviderName;
	reason: string;
};

export type ProviderRequest = {
	systemPrompt: string;
	messages: ChatMessage[];
};

export interface ChatProvider {
	name: ProviderName;
	stream(req: ProviderRequest): Promise<AsyncIterable<string>>;
}
