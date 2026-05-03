-- XYLO - Lock sensitive RPC execution to service role
--
-- Supabase/Postgres can preserve broad function privileges from earlier
-- definitions. Revoke from PUBLIC plus anon/authenticated explicitly after
-- all RPCs exist so caller-controlled security-definer functions cannot be
-- invoked from client JWTs.

revoke all on function public.get_user_id_by_email(text) from public;
revoke execute on function public.get_user_id_by_email(text) from anon;
revoke execute on function public.get_user_id_by_email(text) from authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;

revoke all on function public.reserve_free_message_quota(uuid, integer) from public;
revoke execute on function public.reserve_free_message_quota(uuid, integer) from anon;
revoke execute on function public.reserve_free_message_quota(uuid, integer) from authenticated;
grant execute on function public.reserve_free_message_quota(uuid, integer) to service_role;

revoke all on function public.increment_student_activity(uuid, uuid, date) from public;
revoke execute on function public.increment_student_activity(uuid, uuid, date) from anon;
revoke execute on function public.increment_student_activity(uuid, uuid, date) from authenticated;
grant execute on function public.increment_student_activity(uuid, uuid, date) to service_role;
