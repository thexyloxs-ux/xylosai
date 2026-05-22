import { describe, expect, it, vi } from 'vitest';
import { getOrCreateConversation, titleFromMessage } from '../repositories/conversation';

describe('titleFromMessage', () => {
	it('uses the first message as the conversation title', () => {
		expect(titleFromMessage('Explain photosynthesis in simple terms')).toBe(
			'Explain photosynthesis in simple terms'
		);
	});

	it('truncates long first messages to 40 characters plus ellipsis', () => {
		expect(
			titleFromMessage('Create a two week WAEC chemistry revision timetable with daily drills')
		).toBe('Create a two week WAEC chemistry revisio...');
	});

	it('falls back to a safe default for blank titles', () => {
		expect(titleFromMessage('   ')).toBe('New conversation');
	});
});

describe('getOrCreateConversation', () => {
	it('creates new conversations with a first-message title', async () => {
		const single = vi.fn().mockResolvedValue({ data: { id: 'conv_1' }, error: null });
		const select = vi.fn(() => ({ single }));
		const insert = vi.fn(() => ({ select }));
		const from = vi.fn(() => ({ insert }));

		const id = await getOrCreateConversation(
			{ from } as never,
			'user_1',
			{ initialUserMessage: 'Quiz me on algebraic fractions' }
		);

		expect(id).toBe('conv_1');
		expect(insert).toHaveBeenCalledWith({
			user_id: 'user_1',
			title: 'Quiz me on algebraic fractions'
		});
	});
});
