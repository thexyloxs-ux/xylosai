-- ─────────────────────────────────────────────────────────────────────────────
-- XYLO — Harden auth policies
--
-- Fixes five security issues found during auth audit:
--
-- 1. handle_new_user trusted client-supplied role metadata. A malicious user
--    could sign up with role:'school_admin' in metadata and get elevated
--    privileges. Fix: always create profile as 'individual'.
--
-- 2. Profiles UPDATE policy had no with_check, so any user could directly set
--    their own role/org_id via the Supabase client, bypassing server logic.
--    Fix: with_check locks role and org_id to their current values.
--
-- 3. Organizations INSERT policy used with_check (true), allowing any
--    authenticated user to create orgs directly via the client API.
--    Fix: drop the policy entirely — org creation only goes through the
--    service-role client in /api/auth/setup-org (service role bypasses RLS).
--
-- 4. Redundant: get_my_role / get_my_org_id already use plpgsql (migration 003).
--    No change needed here.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Fix 1: always create profiles as 'individual' ────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'individual'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── Fix 2: prevent self-escalation via profiles UPDATE ───────────────────────
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using  (auth.uid() = id)
  with check (
    auth.uid() = id
    and role        = get_my_role()
    and org_id is not distinct from get_my_org_id()
  );

-- ── Fix 3: remove open-access INSERT on organizations ────────────────────────
-- Service-role client (used by /api/auth/setup-org) bypasses RLS entirely,
-- so legitimate org creation still works. Anon / user JWTs cannot insert.
drop policy if exists "Admins can insert organizations" on public.organizations;
