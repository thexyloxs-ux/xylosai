import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { PaystackPlanType } from '$lib/server/paystack';

type AdminClient = SupabaseClient<Database>;

export interface BillingDetails {
	planCode?: string | null;
	customerCode?: string | null;
	customerEmail?: string | null;
	subscriptionCode?: string | null;
	emailToken?: string | null;
	reference?: string | null;
}

export interface SubscriptionContact {
	userId: string;
	email: string | null;
	fullName: string | null;
	planType: PaystackPlanType;
}

async function setOrganizationAccess(
	admin: AdminClient,
	orgId: string,
	state: { plan: 'org'; plan_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' }
		| { plan: 'free'; plan_status: 'active' }
): Promise<void> {
	const { error } = await admin
		.from('profiles')
		.update(state)
		.eq('org_id', orgId);

	if (error) {
		throw new Error(`Failed to sync organization member access: ${error.message}`);
	}
}

export async function activatePlan(
	admin: AdminClient,
	userId: string,
	planType: PaystackPlanType,
	billing: BillingDetails = {}
): Promise<SubscriptionContact> {
	const { data: profile, error: fetchErr } = await admin
		.from('profiles')
		.select('email, full_name, org_id')
		.eq('id', userId)
		.single();

	if (fetchErr) throw new Error(`Failed to fetch profile for activation: ${fetchErr.message}`);

	const { error: profileErr } = await admin
		.from('profiles')
		.update({ plan: planType, plan_status: 'active' })
		.eq('id', userId);

	if (profileErr) throw new Error(`Failed to activate plan on profile: ${profileErr.message}`);

	if (planType === 'org' && profile?.org_id) {
		const { error: orgErr } = await admin
			.from('organizations')
			.update({ plan: 'org', plan_status: 'active' })
			.eq('id', profile.org_id);

		if (orgErr) throw new Error(`Failed to activate org plan: ${orgErr.message}`);

		await setOrganizationAccess(admin, profile.org_id, { plan: 'org', plan_status: 'active' });
	}

	const { error: billingErr } = await admin
		.from('billing_subscriptions')
		.upsert({
			user_id: userId,
			org_id: profile?.org_id ?? null,
			plan_type: planType,
			plan_code: billing.planCode ?? null,
			customer_code: billing.customerCode ?? null,
			customer_email: billing.customerEmail ?? profile?.email ?? null,
			subscription_code: billing.subscriptionCode ?? null,
			email_token: billing.emailToken ?? null,
			last_reference: billing.reference ?? null,
			status: 'active',
			updated_at: new Date().toISOString()
		}, { onConflict: 'user_id' });

	if (billingErr) throw new Error(`Failed to record billing subscription: ${billingErr.message}`);

	return {
		userId,
		email: profile?.email ?? billing.customerEmail ?? null,
		fullName: profile?.full_name ?? null,
		planType
	};
}

export async function markSubscriptionCancelled(
	admin: AdminClient,
	userId: string,
	status = 'canceled'
): Promise<SubscriptionContact | null> {
	const { data: profile, error: fetchErr } = await admin
		.from('profiles')
		.select('email, full_name, plan, org_id')
		.eq('id', userId)
		.single();

	if (fetchErr) throw new Error(`Failed to fetch profile for cancellation: ${fetchErr.message}`);

	const planType = profile?.plan === 'plus' || profile?.plan === 'pro' || profile?.plan === 'org'
		? profile.plan
		: null;

	const nextProfileState =
		profile?.plan === 'org'
			? { plan: 'free', plan_status: 'active' as const }
			: { plan: 'free', plan_status: 'active' as const };

	const { error: profileErr } = await admin
		.from('profiles')
		.update(nextProfileState)
		.eq('id', userId);

	if (profileErr) throw new Error(`Failed to update subscription status: ${profileErr.message}`);

	const { error: billingErr } = await admin
		.from('billing_subscriptions')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('user_id', userId);

	if (billingErr) throw new Error(`Failed to update billing subscription: ${billingErr.message}`);

	if (profile?.org_id && profile.plan === 'org') {
		const { error: orgErr } = await admin
			.from('organizations')
			.update({ plan_status: status })
			.eq('id', profile.org_id);

		if (orgErr) throw new Error(`Failed to update organization subscription: ${orgErr.message}`);

		await setOrganizationAccess(admin, profile.org_id, { plan: 'free', plan_status: 'active' });
	}

	if (!planType) return null;
	return {
		userId,
		email: profile?.email ?? null,
		fullName: profile?.full_name ?? null,
		planType
	};
}

export async function cancelSubscription(admin: AdminClient, email: string): Promise<SubscriptionContact | null> {
	const { data: userId, error: rpcErr } = await admin.rpc('get_user_id_by_email', {
		p_email: email
	});

	if (rpcErr) throw new Error(`Failed to resolve user by email: ${rpcErr.message}`);
	if (!userId) return null;

	return markSubscriptionCancelled(admin, userId, 'expired');
}
