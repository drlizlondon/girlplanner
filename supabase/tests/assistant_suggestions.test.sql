\set ON_ERROR_STOP 1
insert into auth.users values ('11111111-1111-1111-1111-111111111111') on conflict do nothing;
insert into tasks (user_id, title) values ('11111111-1111-1111-1111-111111111111', 'Email Priya about the grant');
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
set role authenticated;
insert into assistant_keys (user_id, name, key_hash, key_hint) values
 ('11111111-1111-1111-1111-111111111111','Queen Mode', encode(extensions.digest('gpk_SUGGEST_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','sha256'),'hex'),'aaaa');
reset role;
select set_config('request.jwt.claim.sub','', false);
set role anon;
do $$ begin perform assistant_add_suggestions('gpk_SUGGEST_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','sms:e1','Sam, 23 Oct','[{"title":"x","origin":"gemini"}]');
  raise exception 'FAIL suggested without permission';
exception when insufficient_privilege then raise notice 'PASS a key cannot suggest until she switches it on'; end $$;
reset role;

select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
set role authenticated;
update assistant_keys set can_suggest = true;
reset role;
select set_config('request.jwt.claim.sub','', false);
set role anon;

do $$ declare r jsonb; k text := 'gpk_SUGGEST_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; begin
  -- Gemini's pass
  r := assistant_add_suggestions(k, 'sms:aaaaaaaa-0000-0000-0000-000000000001', 'Meeting with Sam, 23 Oct', '[
    {"title":"Send Sam the budget figures","description":"Sam asked for them by Friday","priority":"high","type":"priority_action","origin":"gemini"},
    {"title":"Email Priya about the grant!","origin":"gemini"},
    {"title":"","origin":"gemini"},
    {"title":"Book room","priority":"urgent","origin":"gemini"}]');
  if r <> '{"added": 1, "skipped": 3}'::jsonb then raise exception 'FAIL gemini add %', r; end if;
  raise notice 'PASS gemini: 1 added; open-task duplicate, blank and bad priority skipped';

  -- Retry of the same call
  r := assistant_add_suggestions(k, 'sms:aaaaaaaa-0000-0000-0000-000000000001', 'Meeting with Sam, 23 Oct',
    '[{"title":"Send Sam the budget figures","origin":"gemini"}]');
  if (r->>'added')::int <> 0 then raise exception 'FAIL retry doubled %', r; end if;
  raise notice 'PASS a retry adds nothing';

  -- Claude's second look: one repeat (different case/punctuation), one genuinely missed
  r := assistant_existing_items(k, 'sms:aaaaaaaa-0000-0000-0000-000000000001');
  if jsonb_array_length(r->'from_this_source') <> 1 or not (r->'open_tasks')::text ~ 'Priya' then raise exception 'FAIL existing items %', r; end if;
  raise notice 'PASS Claude can see what was already suggested from this summary';
  r := assistant_add_suggestions(k, 'sms:aaaaaaaa-0000-0000-0000-000000000001', 'Meeting with Sam, 23 Oct', '[
    {"title":"send sam the BUDGET figures.","origin":"claude"},
    {"title":"Get in touch with Dr Okafor, as Sam suggested","origin":"claude"}]');
  if r <> '{"added": 1, "skipped": 1}'::jsonb then raise exception 'FAIL claude add %', r; end if;
  raise notice 'PASS Claude adds only what Gemini missed';
end $$;

do $$ begin perform assistant_add_suggestions('gpk_SUGGEST_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','tasks; drop table tasks','x','[]');
  raise exception 'FAIL odd source accepted';
exception when invalid_parameter_value then raise notice 'PASS source must be sms:<id>'; end $$;
reset role;

do $$ begin
  if exists (select 1 from briefing_suggestions where source_section like 'sms:%' and status <> 'pending') then raise exception 'FAIL not pending'; end if;
  if exists (select 1 from tasks where title ~* 'budget figures|Okafor') then raise exception 'FAIL a suggestion became a task'; end if;
  if (select description from briefing_suggestions where title like 'Get in touch%') not like 'Claude spotted.%' then raise exception 'FAIL claude label'; end if;
  if exists (select 1 from daily_briefings where raw_text ~ 'budget|Sam asked') then raise exception 'FAIL meeting text copied into briefing'; end if;
  if (select count(*) from daily_briefings where raw_text like 'From Save My Summary:%') <> 2 then raise exception 'FAIL briefings'; end if;
  raise notice 'PASS all pending, no tasks created, Claude labelled, briefing holds only the label';
end $$;
