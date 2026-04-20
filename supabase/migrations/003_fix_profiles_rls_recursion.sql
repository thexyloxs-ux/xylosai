-- ─────────────────────────────────────────────────────────────────────────────
-- XYLO — Fix infinite recursion in profiles RLS
--
-- Root cause: get_my_role() and get_my_org_id() are declared as `language sql`.
-- The PostgreSQL query planner can inline SQL functions, stripping the
-- security-definer context. The inlined body then runs under the calling
-- user's RLS context, which triggers the profiles policies again → recursion.
--
-- Fix: rewrite both as `language plpgsql`. PL/pgSQL functions are NEVER
-- inlined, so security definer is preserved and the internal SELECT on
-- profiles bypasses RLS exactly as intended.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_my_role()
returns text
language plpgsql security definer stable
set search_path = public
as $$
begin
  return (select role from public.profiles where id = auth.uid());
end;
$$;

create or replace function public.get_my_org_id()
returns uuid
language plpgsql security definer stable
set search_path = public
as $$
begin
  return (select org_id from public.profiles where id = auth.uid());
end;
$$;
