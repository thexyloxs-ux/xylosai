-- XYLO - Sync profile email from auth.users and harden email lookup RPC
--
-- The app reads profiles.email in settings and the school dashboard, but the
-- initial schema did not create that column. Keep it as a denormalized display
-- field sourced from auth.users, while subscription cancellation continues to
-- resolve users from auth.users directly.

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is distinct from u.email;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'individual'
  )
  on conflict (id) do update
    set email = excluded.email
    where public.profiles.email is distinct from excluded.email;
  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id
    and email is distinct from new.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute procedure public.sync_profile_email();

create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
stable
set search_path = auth, public
as $$
  select id from auth.users where email = p_email limit 1;
$$;

revoke all on function public.get_user_id_by_email(text) from public;
grant execute on function public.get_user_id_by_email(text) to service_role;

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
  do update set
    org_id = excluded.org_id,
    message_count = student_activity.message_count + 1;
end;
$$;

revoke all on function public.increment_student_activity(uuid, uuid, date) from public;
revoke execute on function public.increment_student_activity(uuid, uuid, date) from authenticated;
grant execute on function public.increment_student_activity(uuid, uuid, date) to service_role;
