import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, store } from '../rate-limit';

beforeEach(() => {
	store.clear();
	vi.useRealTimers();
});

describe('checkRateLimit', () => {
	it('allows the first request', () => {
		expect(checkRateLimit('test:1.2.3.4', 5, 60_000)).toBe(true);
	});

	it('counts up to the limit', () => {
		for (let i = 0; i < 5; i++) {
			expect(checkRateLimit('test:1.2.3.4', 5, 60_000)).toBe(true);
		}
	});

	it('blocks the request that exceeds the limit', () => {
		for (let i = 0; i < 5; i++) checkRateLimit('test:1.2.3.4', 5, 60_000);
		expect(checkRateLimit('test:1.2.3.4', 5, 60_000)).toBe(false);
	});

	it('isolates different keys', () => {
		for (let i = 0; i < 5; i++) checkRateLimit('a:1.2.3.4', 5, 60_000);
		expect(checkRateLimit('b:1.2.3.4', 5, 60_000)).toBe(true);
	});

	it('resets count after the window expires', () => {
		vi.useFakeTimers();
		for (let i = 0; i < 5; i++) checkRateLimit('test:1.2.3.4', 5, 60_000);
		expect(checkRateLimit('test:1.2.3.4', 5, 60_000)).toBe(false);

		vi.advanceTimersByTime(60_001);
		expect(checkRateLimit('test:1.2.3.4', 5, 60_000)).toBe(true);
	});

	it('allows requests from different IPs independently', () => {
		for (let i = 0; i < 5; i++) checkRateLimit('test:1.2.3.4', 5, 60_000);
		expect(checkRateLimit('test:5.6.7.8', 5, 60_000)).toBe(true);
	});
});
