import { describe, expect, it } from 'vitest';
import { classifyTurn } from '../ai/router';

describe('classifyTurn', () => {
	it('routes quiz prompts to groq', () => {
		const result = classifyTurn([{ role: 'user', content: 'Quiz me on algebra' }]);
		expect(result.intent).toBe('quiz');
		expect(result.primary).toBe('groq');
		expect(result.fallback).toBe('gemini');
	});

	it('routes study plans to gemini', () => {
		const result = classifyTurn([
			{ role: 'user', content: 'Create a study plan for WAEC chemistry in 3 weeks' }
		]);
		expect(result.intent).toBe('study_plan');
		expect(result.primary).toBe('gemini');
		expect(result.fallback).toBe('groq');
	});

	it('routes long step-by-step asks to gemini', () => {
		const result = classifyTurn([
			{
				role: 'user',
				content:
					'Please explain this step by step and break it down carefully because I am confused about electrolysis and how the ions move in solution'
			}
		]);
		expect(result.intent).toBe('deep_explain');
		expect(result.primary).toBe('gemini');
	});

	it('does not confuse example with exam keywords', () => {
		const result = classifyTurn([
			{
				role: 'user',
				content:
					'Explain electrolysis step by step for a senior secondary org member and include one simple worked example.'
			}
		]);

		expect(result.intent).toBe('deep_explain');
		expect(result.primary).toBe('gemini');
	});
});
