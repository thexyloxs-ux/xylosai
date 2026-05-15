import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifyHmac } from '../paystack';

const SECRET = 'test_secret_key';

function sign(body: string): string {
	return createHmac('sha512', SECRET).update(body).digest('hex');
}

describe('verifyHmac', () => {
	it('returns true for a valid signature', () => {
		const body = JSON.stringify({ event: 'charge.success' });
		expect(verifyHmac(body, sign(body), SECRET)).toBe(true);
	});

	it('returns false for a wrong signature', () => {
		const body = JSON.stringify({ event: 'charge.success' });
		expect(verifyHmac(body, 'deadbeef', SECRET)).toBe(false);
	});

	it('returns false when body is tampered', () => {
		const original = JSON.stringify({ event: 'charge.success', amount: 100 });
		const tampered = JSON.stringify({ event: 'charge.success', amount: 999 });
		expect(verifyHmac(tampered, sign(original), SECRET)).toBe(false);
	});

	it('returns false with empty body and non-matching signature', () => {
		expect(verifyHmac('', 'abc123', SECRET)).toBe(false);
	});

	it('returns true for empty body with correct signature', () => {
		expect(verifyHmac('', sign(''), SECRET)).toBe(true);
	});

	it('returns false with a different secret', () => {
		const body = 'hello';
		const sigForWrongSecret = createHmac('sha512', 'wrong_secret').update(body).digest('hex');
		expect(verifyHmac(body, sigForWrongSecret, SECRET)).toBe(false);
	});
});
