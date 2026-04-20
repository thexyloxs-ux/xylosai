-- ─────────────────────────────────────────────────────────────────────────────
-- XYLO — Fix infinite recursion in "Admins can view org profiles" policy
--
-- Root cause: the original policy used a correlated subquery against `profiles`
-- inside a policy on `profiles` itself. PostgreSQL evaluates RLS policies for
-- every row access, so the subquery re-enters the same policies → recursion.
--
-- Fix: replace the self-referential subquery with calls to get_my_role() and
-- get_my_org_id(), which are security-definer plpgsql functions that bypass
-- RLS internally (see migration 003).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;

CREATE POLICY "Admins can view org profiles"
ON public.profiles
FOR SELECT
USING (
  get_my_role() = 'school_admin'
  AND get_my_org_id() = org_id
);
