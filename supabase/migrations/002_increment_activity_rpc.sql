-- ─────────────────────────────────────────────────────────────────────────────
-- XYLO — RPC: increment_student_activity
--
-- Atomically upserts a student_activity row for today and increments the
-- message_count in a single round-trip, eliminating the race condition that
-- existed when three separate queries (upsert → select → update) were used.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.increment_student_activity(
  p_user_id uuid,
  p_org_id  uuid,
  p_date    date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_activity (user_id, org_id, date, message_count)
  values (p_user_id, p_org_id, p_date, 1)
  on conflict (user_id, date)
  do update set message_count = student_activity.message_count + 1;
end;
$$;

-- Grant execute to the authenticated role so the Supabase JS client can call it
grant execute on function public.increment_student_activity(uuid, uuid, date) to authenticated;
grant execute on function public.increment_student_activity(uuid, uuid, date) to service_role;
