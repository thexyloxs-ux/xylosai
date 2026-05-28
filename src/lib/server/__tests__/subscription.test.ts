import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activatePlan, markSubscriptionCancelled } from '../services/subscription';
import type { SupabaseClient } from '@supabase/supabase-js';

function makeAdmin(overrides: Record<string, Record<string, unknown>> = {}) {
	const selectChain = { eq: vi.fn().mockReturnThis(), single: vi.fn() };
	const updateChain = { eq: vi.fn().mockReturnThis() };
	const upsertChain = {};

	return {
		from: vi.fn((table: string) => ({
			select: vi.fn(() => selectChain),
			update: vi.fn(() => updateChain),
			upsert: vi.fn(() => upsertChain),
			...(overrides[table] ?? {})
		}))
	} as unknown as SupabaseClient;
}

const PROFILE = { email: 'member@org.com', full_name: 'Test User', org_id: null };

describe('activatePlan', () => {
	beforeEach(() => vi.clearAllMocks());

	it('activates a plus plan and returns contact info', async () => {
		const admin = makeAdmin();
		const from = admin.from as ReturnType<typeof vi.fn>;

		// profiles.select → profile row
		from.mockImplementationOnce(() => ({
			select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: PROFILE, error: null }) }) })
		}));
		// profiles.update → success
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
		}));
		// billing_subscriptions.upsert → success
		from.mockImplementationOnce(() => ({
			upsert: vi.fn().mockResolvedValue({ error: null })
		}));

		const result = await activatePlan(admin, 'user-123', 'plus', {
			subscriptionCode: 'SUB_abc',
			customerCode: 'CUS_abc'
		});

		expect(result).toEqual({
			userId: 'user-123',
			email: 'member@org.com',
			fullName: 'Test User',
			planType: 'plus'
		});
	});

	it('also updates the org when plan is org', async () => {
		const admin = makeAdmin();
		const from = admin.from as ReturnType<typeof vi.fn>;
		const profileWithOrg = { ...PROFILE, org_id: 'org-456' };

		from.mockImplementationOnce(() => ({
			select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: profileWithOrg, error: null }) }) })
		}));
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
		}));
		const orgUpdate = vi.fn().mockResolvedValue({ error: null });
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: orgUpdate })
		}));
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
		}));
		from.mockImplementationOnce(() => ({
			upsert: vi.fn().mockResolvedValue({ error: null })
		}));

		const result = await activatePlan(admin, 'user-123', 'org');

		expect(orgUpdate).toHaveBeenCalled();
		expect(result.planType).toBe('org');
	});

	it('downgrades org members to free when a org subscription is canceled', async () => {
		const admin = makeAdmin();
		const from = admin.from as ReturnType<typeof vi.fn>;
		const orgProfile = {
			email: 'admin@org.com',
			full_name: 'Organization admin',
			org_id: 'org-456',
			plan: 'org'
		};

		from.mockImplementationOnce(() => ({
			select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: orgProfile, error: null }) }) })
		}));
		const profileUpdate = vi.fn().mockResolvedValue({ error: null });
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: profileUpdate })
		}));
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
		}));
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) })
		}));

		const result = await markSubscriptionCancelled(admin, 'user-123', 'canceled');

		expect(profileUpdate).toHaveBeenCalled();
		expect(result?.planType).toBe('org');
	});

	it('throws if the profile fetch fails', async () => {
		const admin = makeAdmin();
		const from = admin.from as ReturnType<typeof vi.fn>;

		from.mockImplementationOnce(() => ({
			select: () => ({
				eq: () => ({
					single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
				})
			})
		}));

		await expect(activatePlan(admin, 'bad-user', 'plus')).rejects.toThrow('Failed to fetch profile');
	});

	it('throws if the profile plan update fails', async () => {
		const admin = makeAdmin();
		const from = admin.from as ReturnType<typeof vi.fn>;

		from.mockImplementationOnce(() => ({
			select: () => ({ eq: () => ({ single: vi.fn().mockResolvedValue({ data: PROFILE, error: null }) }) })
		}));
		from.mockImplementationOnce(() => ({
			update: () => ({ eq: vi.fn().mockResolvedValue({ error: { message: 'db error' } }) })
		}));

		await expect(activatePlan(admin, 'user-123', 'plus')).rejects.toThrow('Failed to activate plan');
	});
});
