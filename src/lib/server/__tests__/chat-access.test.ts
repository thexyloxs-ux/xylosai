import { describe, expect, it } from 'vitest';
import { enforceRateLimit, RateLimitError } from '../services/chat';

const freeProfile = {
	plan: 'free',
	plan_status: 'active',
	org_id: null,
	messages_today: 20,
	messages_today_reset_at: new Date().toISOString()
} as const;

describe('enforceRateLimit', () => {
	it('blocks free users who hit the limit', () => {
		expect(() => enforceRateLimit(freeProfile as never, null)).toThrow(RateLimitError);
	});

	it('allows org users while the organization is active', () => {
		expect(() =>
			enforceRateLimit(
				{ ...freeProfile, org_id: 'org-1' } as never,
				{ plan_status: 'active' } as never
			)
		).not.toThrow();
	});

	it('falls back to free limits when the org plan is canceled', () => {
		expect(() =>
			enforceRateLimit(
				{ ...freeProfile, org_id: 'org-1' } as never,
				{ plan_status: 'canceled' } as never
			)
		).toThrow(RateLimitError);
	});
});
