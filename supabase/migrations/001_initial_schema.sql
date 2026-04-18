-- ─────────────────────────────────────────────────────────────────────────────
-- XYLO — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  country          text,
  curriculum       text,
  invite_code      text unique,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan             text not null default 'school',
  plan_status      text not null default 'trialing',
  seat_limit       int  not null default 30,
  created_at       timestamptz not null default now()
);

create table if not exists public.profiles (
  id                       uuid primary key references auth.users on delete cascade,
  full_name                text,
  role                     text not null default 'individual',
  org_id                   uuid references public.organizations(id) on delete set null,
  level                    text,
  curriculum               text,
  subjects                 text[],
  study_challenge          text,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  plan                     text not null default 'free',
  plan_status              text not null default 'inactive',
  messages_today           int  not null default 0,
  messages_today_reset_at  timestamptz not null default now(),
  onboarded                boolean not null default false,
  created_at               timestamptz not null default now()
);

create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null default 'New conversation',
  subject         text,
  session_type    text,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create table if not exists public.student_activity (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  org_id           uuid not null references public.organizations(id) on delete cascade,
  date             date not null default current_date,
  message_count    int  not null default 0,
  session_count    int  not null default 0,
  subjects_studied text[],
  unique (user_id, date)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists student_activity_org_date_idx on public.student_activity(org_id, date);
create index if not exists profiles_org_id_idx on public.profiles(org_id);

-- ── Trigger: auto-create profile on sign-up ───────────────────────────────────
-- Runs as security definer so it can insert into profiles even before the user
-- has a session (the JWT hasn't been issued yet at the moment of sign-up).

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
    coalesce(new.raw_user_meta_data->>'role', 'individual')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.organizations   enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.student_activity enable row level security;

-- profiles: users read/write their own row; school admins can read their students
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Security definer functions to prevent infinite recursion
create or replace function public.get_my_role()
returns text
language sql security definer set search_path = public stable
as $$ select role from public.profiles where id = auth.uid(); $$;

create or replace function public.get_my_org_id()
returns uuid
language sql security definer set search_path = public stable
as $$ select org_id from public.profiles where id = auth.uid(); $$;

-- School admins can read profiles of students in their org
create policy "Admins can view org profiles"
  on public.profiles for select
  using (
    public.get_my_role() = 'school_admin'
    and public.get_my_org_id() = org_id
  );

-- organizations: admins read/write their own org; students can read their org
create policy "Org members can view organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.org_id = organizations.id
    )
  );

create policy "Admins can insert organizations"
  on public.organizations for insert
  with check (true); -- restricted to school_admin in app layer

create policy "Admins can update own organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'school_admin'
        and profiles.org_id = organizations.id
    )
  );

-- conversations: users own their own
create policy "Users can manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id);

-- messages: accessible through conversation ownership
create policy "Users can manage messages in own conversations"
  on public.messages for all
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.user_id = auth.uid()
    )
  );

-- student_activity: students write their own; admins read their org's
create policy "Students can manage own activity"
  on public.student_activity for all
  using (auth.uid() = user_id);

create policy "Admins can view org activity"
  on public.student_activity for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'school_admin'
        and profiles.org_id = student_activity.org_id
    )
  );
