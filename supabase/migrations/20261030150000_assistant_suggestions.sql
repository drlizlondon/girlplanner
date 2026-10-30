-- Assistant keys, part 2: let Queen Mode ADD SUGGESTIONS to the review list
-- (Processing Inbox), never tasks. Founder 2026-10-30 (Queen Mode QM-2 piece 3:
-- Gemini first pass + Claude second look over Save My Summary).
-- Additive and idempotent; needs 20261030090000_assistant_keys.sql first.
--
--  * A key can suggest only if its owner switches can_suggest on (default off).
--  * Suggestions land as status 'pending' in briefing_suggestions, under one
--    daily_briefings row per call whose text is a short label, never the
--    meeting text.
--  * Duplicates are skipped in the database: same normalised title as an open
--    task, a pending suggestion, or anything already suggested from the same
--    source. So Claude can't re-add what Gemini found, and a retry can't double.

alter table public.assistant_keys add column if not exists can_suggest boolean not null default false;

create or replace function public._assistant_suggest_owner(p_key text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid; v_user uuid; v_can boolean;
begin
  if p_key is null or length(p_key) < 32 then
    raise exception 'invalid assistant key' using errcode = '28000';
  end if;
  select id, user_id, can_suggest into v_id, v_user, v_can
    from public.assistant_keys
   where key_hash = encode(extensions.digest(p_key, 'sha256'), 'hex') and revoked_at is null;
  if v_user is null then
    raise exception 'invalid assistant key' using errcode = '28000';
  end if;
  if not v_can then
    raise exception 'this key may not add suggestions' using errcode = '42501';
  end if;
  update public.assistant_keys set last_used_at = now() where id = v_id;
  return v_user;
end;
$$;
revoke all on function public._assistant_suggest_owner(text) from public, anon, authenticated;

create or replace function public._norm_title(t text)
returns text language sql immutable as
$$ select trim(regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', ' ', 'g')) $$;

-- What's already there, so a reader can avoid suggesting it: open task titles,
-- pending suggestion titles, and everything already suggested from p_source.
create or replace function public.assistant_existing_items(p_key text, p_source text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := public._assistant_suggest_owner(p_key);
begin
  return jsonb_build_object(
    'open_tasks', coalesce((select jsonb_agg(t.title order by t.created_at desc) from (
        select title, created_at from public.tasks
         where user_id = v_user and completed = false and coalesce(status, '') not in ('archived', 'completed')
         order by created_at desc limit 300) t), '[]'::jsonb),
    'pending_suggestions', coalesce((select jsonb_agg(s.title order by s.created_at desc) from (
        select title, created_at from public.briefing_suggestions
         where user_id = v_user and status = 'pending' order by created_at desc limit 300) s), '[]'::jsonb),
    'from_this_source', coalesce((select jsonb_agg(jsonb_build_object('title', title, 'description', description, 'status', status) order by created_at)
        from public.briefing_suggestions
       where user_id = v_user and p_source is not null and source_section = p_source), '[]'::jsonb)
  );
end;
$$;

-- Add up to 20 suggestions from one source. Items:
--   { title (1-200), description? (<=2000), priority? low|medium|high,
--     type? priority_action|follow_up, origin gemini|claude }
-- Returns { added, skipped }.
create or replace function public.assistant_add_suggestions(p_key text, p_source text, p_label text, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := public._assistant_suggest_owner(p_key);
  v_briefing uuid;
  v_item jsonb;
  v_title text; v_desc text; v_prio text; v_type text; v_origin text;
  v_added int := 0; v_skipped int := 0; v_pos int := 0;
begin
  if p_source is null or p_source !~ '^sms:[A-Za-z0-9-]{1,64}$' then
    raise exception 'source must look like sms:<entry id>' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 20 then
    raise exception 'items must be an array of at most 20' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_title  := left(trim(coalesce(v_item->>'title', '')), 200);
    v_desc   := left(coalesce(v_item->>'description', ''), 2000);
    v_prio   := coalesce(nullif(v_item->>'priority', ''), 'medium');
    v_type   := coalesce(nullif(v_item->>'type', ''), 'follow_up');
    v_origin := v_item->>'origin';
    if v_title = '' or v_prio not in ('low', 'medium', 'high')
       or v_type not in ('priority_action', 'follow_up') or v_origin not in ('gemini', 'claude') then
      v_skipped := v_skipped + 1; continue;
    end if;
    if exists (select 1 from public.tasks where user_id = v_user and completed = false
                 and coalesce(status, '') not in ('archived', 'completed') and public._norm_title(title) = public._norm_title(v_title))
       or exists (select 1 from public.briefing_suggestions where user_id = v_user
                 and (status = 'pending' or source_section = p_source) and public._norm_title(title) = public._norm_title(v_title)) then
      v_skipped := v_skipped + 1; continue;
    end if;
    if v_briefing is null then
      insert into public.daily_briefings (user_id, raw_text)
      values (v_user, 'From Save My Summary: ' || left(coalesce(nullif(trim(p_label), ''), 'a summary'), 200))
      returning id into v_briefing;
    end if;
    insert into public.briefing_suggestions (user_id, briefing_id, type, title, description, priority, source_section, status, position)
    values (v_user, v_briefing, v_type, v_title,
            case when v_origin = 'claude' then 'Claude spotted. ' else '' end || v_desc,
            v_prio, p_source, 'pending', v_pos);
    v_pos := v_pos + 1;
    v_added := v_added + 1;
  end loop;
  return jsonb_build_object('added', v_added, 'skipped', v_skipped);
end;
$$;

revoke all on function public.assistant_existing_items(text, text) from public;
revoke all on function public.assistant_add_suggestions(text, text, text, jsonb) from public;
grant execute on function public.assistant_existing_items(text, text) to anon, authenticated;
grant execute on function public.assistant_add_suggestions(text, text, text, jsonb) to anon, authenticated;
