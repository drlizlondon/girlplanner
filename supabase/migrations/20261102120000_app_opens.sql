-- App opens: one row per signed-in day on which the owner opened Girl Planner.
-- Founder request 2026-11-02 (QM-4): Queen Mode's one success metric is
-- "Girl Planner opened". Queen reads it back through assistant_summary().
--
-- Additive and idempotent. Run in the Supabase SQL editor (or ask Lovable to
-- apply it). Nothing existing is altered except assistant_summary(), which
-- keeps every old field unchanged and gains one more: opens.
--
-- Trust model:
--  * app_opens is reachable only by the signed-in owner (RLS); anon has no grant.
--  * record_app_open runs as the caller (SECURITY INVOKER), so RLS applies and
--    the row is always the caller's own: a user id is never accepted as input.
--  * assistant_summary still resolves the owner FROM THE KEY.

create table if not exists public.app_opens (
  user_id         uuid not null references auth.users(id) on delete cascade,
  open_date       date not null,
  first_opened_at timestamptz not null default now(),
  primary key (user_id, open_date)
);

alter table public.app_opens enable row level security;
revoke all on public.app_opens from anon;

drop policy if exists "Owners read their app opens" on public.app_opens;
create policy "Owners read their app opens" on public.app_opens
  for select using (auth.uid() = user_id);

drop policy if exists "Owners add their app opens" on public.app_opens;
create policy "Owners add their app opens" on public.app_opens
  for insert with check (auth.uid() = user_id);

create or replace function public.record_app_open(p_open_date date)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = '28000';
  end if;
  if p_open_date is null
     or abs(p_open_date - (now() at time zone 'utc')::date) > 1 then
    raise exception 'open date out of range' using errcode = '22023';
  end if;
  insert into public.app_opens (user_id, open_date)
  values (auth.uid(), p_open_date)
  on conflict (user_id, open_date) do nothing;
end;
$$;

revoke all on function public.record_app_open(date) from public;
revoke all on function public.record_app_open(date) from anon;
grant execute on function public.record_app_open(date) to authenticated;

-- Same body as 20261030090000_assistant_keys.sql plus the `opens` field.
create or replace function public.assistant_summary(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key_id uuid;
  v_user   uuid;
begin
  if p_key is null or length(p_key) < 32 then
    raise exception 'invalid assistant key' using errcode = '28000';
  end if;

  select id, user_id into v_key_id, v_user
    from public.assistant_keys
   where key_hash = encode(extensions.digest(p_key, 'sha256'), 'hex')
     and revoked_at is null;

  if v_user is null then
    raise exception 'invalid assistant key' using errcode = '28000';
  end if;

  update public.assistant_keys set last_used_at = now() where id = v_key_id;

  return jsonb_build_object(
    -- Same rule as the to-do list itself (src/lib/dataService.ts getTasks).
    'open_tasks', (select count(*) from public.tasks
                    where user_id = v_user and completed = false
                      and coalesce(status, '') not in ('archived', 'completed')),
    'pending_suggestions', (select count(*) from public.briefing_suggestions
                             where user_id = v_user and status = 'pending'),
    'checked_at', now(),
    -- Dates and first-open times only, for the key owner's last 35 days.
    'opens', coalesce((select jsonb_agg(jsonb_build_object(
                                 'date', o.open_date,
                                 'first_opened_at', o.first_opened_at) order by o.open_date)
                         from public.app_opens o
                        where o.user_id = v_user
                          and o.open_date >= (now() at time zone 'Europe/London')::date - 35),
                      '[]'::jsonb)
  );
end;
$$;

revoke all on function public.assistant_summary(text) from public;
grant execute on function public.assistant_summary(text) to anon, authenticated;
