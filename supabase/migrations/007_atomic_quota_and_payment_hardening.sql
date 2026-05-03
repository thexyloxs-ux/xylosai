-- XYLO - Atomic free message quota reservation
--
-- Reserves one free-plan message in the database before the LLM stream starts.
-- This prevents concurrent requests from all passing the 20/day preflight check.

create or replace function public.reserve_free_message_quota(
  p_user_id uuid,
  p_limit   integer default 20
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  update public.profiles
  set
    messages_today = case
      when messages_today_reset_at::date = current_date then messages_today
      else 0
    end,
    messages_today_reset_at = case
      when messages_today_reset_at::date = current_date then messages_today_reset_at
      else now()
    end
  where id = p_user_id;

  select messages_today
    into current_count
  from public.profiles
  where id = p_user_id
  for update;

  if current_count is null then
    return false;
  end if;

  if current_count >= p_limit then
    return false;
  end if;

  update public.profiles
  set messages_today = messages_today + 1
  where id = p_user_id;

  return true;
end;
$$;

revoke all on function public.reserve_free_message_quota(uuid, integer) from public;
grant execute on function public.reserve_free_message_quota(uuid, integer) to service_role;
