import type { ChatMessage, ProviderSelection, StudyIntent } from './types';

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsPhrase(text: string, phrase: string): boolean {
	const pattern = new RegExp(`(^|\\b)${escapeRegExp(phrase)}(\\b|$)`);
	return pattern.test(text);
}

function includesAny(text: string, needles: string[]): boolean {
	return needles.some((needle) => containsPhrase(text, needle));
}

function detectIntent(content: string): StudyIntent {
	const text = content.trim().toLowerCase();

	if (
		includesAny(text, [
			'quiz me',
			'give me a quiz',
			'test me',
			'ask me questions',
			'mock test'
		])
	) {
		return 'quiz';
	}

	if (
		includesAny(text, [
			'study plan',
			'reading plan',
			'timetable',
			'schedule for me',
			'plan my study'
		])
	) {
		return 'study_plan';
	}

	if (
		includesAny(text, [
			'exam',
			'waec',
			'jamb',
			'kcse',
			'bece',
			'past questions',
			'prepare me'
		])
	) {
		return 'exam_prep';
	}

	if (
		includesAny(text, [
			'step by step',
			'explain in detail',
			'break it down',
			'i do not understand',
			'i’m overwhelmed',
			"i'm overwhelmed",
			'i am confused'
		]) ||
		text.length > 280
	) {
		return 'deep_explain';
	}

	return 'quick_tutor';
}

export function classifyTurn(messages: ChatMessage[]): ProviderSelection {
	const lastUser = [...messages].reverse().find((m) => m.role === 'user');
	const content = lastUser?.content ?? '';
	const intent = detectIntent(content);

	if (intent === 'quick_tutor' || intent === 'quiz') {
		return {
			intent,
			primary: 'groq',
			fallback: 'gemini',
			reason: `low-latency path for ${intent}`
		};
	}

	return {
		intent,
		primary: 'gemini',
		fallback: 'groq',
		reason: `quality path for ${intent}`
	};
}
