-- Minimal stand-in for the Supabase pieces the migration relies on.
create schema if not exists extensions;
create schema if not exists auth;
create table auth.users (id uuid primary key);
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create table public.tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null,
  completed boolean not null default false, status text not null default 'active', created_at timestamptz not null default now());
create table public.daily_briefings (id uuid primary key default gen_random_uuid(), user_id uuid not null,
  briefing_date date not null default current_date, raw_text text not null, created_at timestamptz not null default now());
create table public.briefing_suggestions (id uuid primary key default gen_random_uuid(), user_id uuid not null,
  briefing_id uuid references public.daily_briefings(id) on delete cascade,
  type text not null default 'follow_up' check (type in ('priority_action','follow_up','insight','question','idea')),
  title text not null, description text default '', project text, priority text default 'medium', source_section text,
  status text not null default 'pending', position int default 0, created_at timestamptz not null default now());
grant usage on schema public, auth, extensions to anon, authenticated;
-- As Supabase does: new tables in public are granted to anon + authenticated; RLS is the guard.
alter table public.tasks enable row level security;
alter table public.briefing_suggestions enable row level security;
alter table public.daily_briefings enable row level security;
create policy b_own on public.daily_briefings for all using (auth.uid() = user_id);
create policy t_own on public.tasks for all using (auth.uid() = user_id);
create policy s_own on public.briefing_suggestions for all using (auth.uid() = user_id);
grant all on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
