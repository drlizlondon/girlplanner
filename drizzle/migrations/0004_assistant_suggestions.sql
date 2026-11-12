-- QM-3a part 2: let a reader the owner trusts (Queen Mode, via a Save My
-- Summary entry) ADD SUGGESTIONS to the Processing Inbox review list.
-- Additive and idempotent. Nothing existing is altered except one new
-- nullable column on briefing_suggestions.
--
-- Trust model (same as assistant_summary, 20261030090000_assistant_keys.sql):
--  * The owner is resolved FROM THE KEY (SHA-256 hash lookup, not revoked);
--    a caller-supplied user id is never accepted.
--  * The function writes ONLY to briefing_suggestions (status 'pending') and,
--    if needed, one daily_briefings container row for today. It NEVER writes
--    to public.tasks: every suggestion still waits for the owner's tick.

create extension if not exists pgcrypto with schema extensions;

-- Which kind of reader/finding made the suggestion: shown as small muted text
-- in the review card. Null for every pre-existing suggestion.
alter table public.briefing_suggestions
  add column if not exists assistant_kind text;
alter table public.briefing_suggestions
  drop constraint if exists briefing_suggestions_assistant_kind_check;
alter table public.briefing_suggestions
  add constraint briefing_suggestions_assistant_kind_check
  check (assistant_kind is null or assistant_kind in ('explicit','inferred','claude'));

-- Private key-to-owner lookup (the same lookup assistant_summary does inline).
-- Not callable by API roles.
create or replace function public._assistant_owner(p_key text)
returns uuid
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
  return v_user;
end;
$$;
revoke all on function public._assistant_owner(text) from public, anon, authenticated;

create or replace function public.assistant_add_suggestion(
  p_key text, p_title text, p_detail text, p_source text, p_kind text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user     uuid := public._assistant_owner(p_key);
  v_title    text := left(btrim(coalesce(p_title, '')), 200);
  v_detail   text := left(coalesce(p_detail, ''), 1000);
  v_norm     text;
  v_briefing uuid;
  v_id       uuid;
begin
  if v_title = '' then
    raise exception 'title required' using errcode = '22023';
  end if;
  if p_kind is null or p_kind not in ('explicit','inferred','claude') then
    raise exception 'invalid kind' using errcode = '22023';
  end if;
  if p_source is null or p_source !~ '^sms:[0-9a-fA-F-]{36}$' then
    raise exception 'invalid source' using errcode = '22023';
  end if;

  v_norm := lower(regexp_replace(v_title, '\s+', ' ', 'g'));

  -- Idempotent: same source + same normalised title, still pending or accepted.
  select id into v_id from public.briefing_suggestions
   where user_id = v_user and source_section = p_source
     and status in ('pending','accepted')
     and lower(regexp_replace(btrim(title), '\s+', ' ', 'g')) = v_norm
   limit 1;
  if v_id is not null then
    return jsonb_build_object('added', false, 'id', v_id);
  end if;

  -- briefing_id is NOT NULL: reuse one container per owner per day.
  select id into v_briefing from public.daily_briefings
   where user_id = v_user and briefing_date = current_date
     and overview = 'Queen suggestions'
   order by created_at limit 1;
  if v_briefing is null then
    insert into public.daily_briefings (user_id, raw_text, overview)
    values (v_user, 'Suggestions added by an assistant you connected.', 'Queen suggestions')
    returning id into v_briefing;
  end if;

  insert into public.briefing_suggestions
    (user_id, briefing_id, type, title, description, source, source_section,
     assistant_kind, status, priority)
  values
    (v_user, v_briefing, 'priority_action', v_title, v_detail, 'assistant', p_source,
     p_kind, 'pending', 'medium')
  returning id into v_id;

  return jsonb_build_object('added', true, 'id', v_id);
end;
$$;

revoke all on function public.assistant_add_suggestion(text, text, text, text, text) from public;
grant execute on function public.assistant_add_suggestion(text, text, text, text, text) to anon, authenticated;
