-- Store Paystack subscription management tokens outside client-readable profiles.
create table if not exists public.billing_subscriptions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	org_id uuid references public.organizations(id) on delete set null,
	plan_type text not null check (plan_type in ('plus', 'pro', 'school')),
	plan_code text,
	customer_code text,
	customer_email text,
	subscription_code text,
	email_token text,
	last_reference text,
	status text not null default 'active',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id)
);

alter table public.billing_subscriptions enable row level security;

drop policy if exists "service role can manage billing subscriptions" on public.billing_subscriptions;
create policy "service role can manage billing subscriptions"
	on public.billing_subscriptions
	for all
	using (auth.role() = 'service_role')
	with check (auth.role() = 'service_role');

create index if not exists billing_subscriptions_user_id_idx
	on public.billing_subscriptions(user_id);

create index if not exists billing_subscriptions_subscription_code_idx
	on public.billing_subscriptions(subscription_code);
