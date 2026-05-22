import { describe, expect, it } from 'vitest';

describe('paystack confirm callback contract', () => {
	it('expects a reference query string when returning from checkout', () => {
		const params = new URLSearchParams('reference=abc123&trxref=abc123');
		expect(params.get('reference') ?? params.get('trxref')).toBe('abc123');
	});
});
