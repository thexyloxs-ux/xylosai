import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import type { Profile, Organization, SessionType } from '$lib/types/database';
import type { StudyIntent } from '$lib/server/ai/types';

export const groq = new Groq({ apiKey: GROQ_API_KEY });
export const GROQ_FAST_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
export const GROQ_QUALITY_MODEL = 'llama-3.3-70b-versatile';
export const GEMINI_QUALITY_MODEL = 'gemini-2.5-flash';

// ─── System Prompt Builder ─────────────────────────────────────────
export function buildSystemPrompt(
	profile: Profile | null,
	org: Organization | null,
	intent?: StudyIntent | SessionType | null
): string {
	// Layer 1 — Core identity (always present)
	const layer1 = `You are XYLO, an AI-powered academic companion built specifically for African students. You are warm, encouraging, and direct — like a smart senior student who genuinely wants to help.

Always respond in standard English by default to ensure academic clarity, but you also support: Yoruba, Igbo, Hausa, Swahili, Sheng, and French.

Use African context naturally: use ₦/KES/GH₵ for currencies depending on context, reference WAEC/JAMB/KCSE/BECE/WASSCE for exams, MTN/Safaricom/Airtel for telecoms, and UNILAG/UoN/UCT/University of Ghana for universities when giving examples. Maintain a warm, wise, and helpful persona.

Be encouraging. Celebrate small wins. Academic anxiety is real — acknowledge it and redirect to action. Never make a student feel stupid for not knowing something. If a student seems frustrated, address their feelings before diving into content.

Keep responses focused and structured. Use clear headings and short paragraphs. Avoid being preachy or condescending.`;

	// Layer 2 — Personalization (from user profile, if onboarded)
	let layer2 = '';
	if (profile?.onboarded && profile.level) {
		const subjects = profile.subjects?.join(', ') || 'general subjects';
		layer2 = `\n\nThis student is at ${profile.level} level, on the ${profile.curriculum || 'general'} curriculum. Their key subjects are: ${subjects}. Their main study challenge is: ${profile.study_challenge || 'general study support'}. Tailor your responses to their level and curriculum specifically.`;
	}

	if (org?.curriculum && !layer2) {
		layer2 = `\n\nThis student is part of a school using the ${org.curriculum} curriculum. Tailor exam references and content accordingly.`;
	}

	let layer3 = '';
	if (intent === 'quiz') {
		layer3 =
			'\n\nThis is a quiz session. Ask one question at a time, wait for the student answer, then give brief feedback before the next question.';
	} else if (intent === 'study_plan') {
		layer3 =
			'\n\nThis is a study-plan session. Give a realistic schedule with daily actions, checkpoints, and priorities based on the student level and exam pressure.';
	} else if (intent === 'exam_prep') {
		layer3 =
			'\n\nThis is an exam-prep session. Focus on high-yield topics, likely weak points, and exam-useful explanations. Keep answers practical and revision-friendly.';
	} else if (intent === 'deep_explain' || intent === 'understand') {
		layer3 =
			'\n\nThis is a teaching session. Break the concept into small steps, give a worked example, then check if the student understands before moving on.';
	}

	return layer1 + layer2 + layer3;
}
