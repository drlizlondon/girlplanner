-- Completed per day: assistant_summary() gains `completed_by_date`, the count of the
-- key owner's tasks completed on each of the last 7 local days (Europe/London),
-- from tasks.completed_at. Queen's evening message (QM-5) reads it back.
-- Founder request 2026-11-09: Queen should say how many tasks were finished today.
--
-- Additive and idempotent. Run in the Supabase SQL editor (or ask Lovable to
-- apply it, then Publish). Every existing field is unchanged.
--
-- Trust model (unchanged): the owner is resolved FROM THE KEY, never from input.
-- Counts only: no task titles or text leave the database.

-- Counting helper, split out so the date logic can be tested on any date (the
-- test suite cannot change now()). Takes a user id, so it is NOT callable by
-- anon or signed-in users: only assistant_summary() (security definer, owner
-- resolved from the key) calls it.
create or replace function public.assistant_completed_by_date(p_user uuid, p_today date)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  -- One entry for each of the last 7 local days (Europe/London), p_today included,
  -- zero days too, so "none finished" is never confused with "not available".
  select jsonb_agg(jsonb_build_object(
           'date', d.day,
           'count', (select count(*) from public.tasks t
                      where t.user_id = p_user
                        and t.completed_at is not null
                        and (t.completed_at at time zone 'Europe/London')::date = d.day))
         order by d.day)
    from (select (p_today - g) as day from generate_series(0, 6) as g) d
$$;

revoke all on function public.assistant_completed_by_date(uuid, date) from public;
revoke all on function public.assistant_completed_by_date(uuid, date) from anon, authenticated;

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
    -- Dates and first/latest open times only, for the key owner's last 35 days.
    'opens', coalesce((select jsonb_agg(jsonb_build_object(
                                 'date', o.open_date,
                                 'first_opened_at', o.first_opened_at,
                                 'last_opened_at', o.last_opened_at) order by o.open_date)
                         from public.app_opens o
                        where o.user_id = v_user
                          and o.open_date >= (now() at time zone 'Europe/London')::date - 35),
                      '[]'::jsonb),
    'completed_by_date', public.assistant_completed_by_date(v_user, (now() at time zone 'Europe/London')::date)
  );
end;
$$;

revoke all on function public.assistant_summary(text) from public;
grant execute on function public.assistant_summary(text) to anon, authenticated;
