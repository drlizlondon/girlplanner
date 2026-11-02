\set ON_ERROR_STOP 1
-- Fixtures are made up. Users A=1111..., B=2222...
insert into auth.users values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
insert into tasks (user_id, title) values ('11111111-1111-1111-1111-111111111111','Open A');
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
set role authenticated;
insert into assistant_keys (user_id, name, key_hash, key_hint) values
 ('11111111-1111-1111-1111-111111111111','Queen Mode', encode(extensions.digest('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','sha256'),'hex'),'aaaa');
reset role;
insert into assistant_keys (user_id, name, key_hash, key_hint) values
 ('22222222-2222-2222-2222-222222222222','Queen Mode', encode(extensions.digest('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','sha256'),'hex'),'bbbb');

-- Two opens the same day = one row (A), and the first time is kept.
set role authenticated;
select record_app_open((now() at time zone 'utc')::date);
reset role;
create temp table first_open as select first_opened_at from app_opens;
select pg_sleep(0.05);
set role authenticated;
select record_app_open((now() at time zone 'utc')::date);
do $$ begin
  if (select count(*) from app_opens) <> 1 then raise exception 'FAIL two opens same day gave % rows', (select count(*) from app_opens); end if;
  raise notice 'PASS two opens same day = one row';
end $$;
reset role;
do $$ begin
  if (select first_opened_at from app_opens) <> (select first_opened_at from first_open) then raise exception 'FAIL first_opened_at changed'; end if;
  raise notice 'PASS first_opened_at kept';
  if (select last_opened_at from app_opens) <= (select first_opened_at from first_open) then raise exception 'FAIL last_opened_at not moved on by the second open'; end if;
  raise notice 'PASS last_opened_at moves to the latest open';
end $$;

-- Junk dates refused (more than 1 day from now UTC).
set role authenticated;
do $$ begin perform record_app_open((now() at time zone 'utc')::date + 3); raise exception 'FAIL future date accepted';
exception when invalid_parameter_value then raise notice 'PASS date 3 days ahead refused'; end $$;
do $$ begin perform record_app_open((now() at time zone 'utc')::date - 3); raise exception 'FAIL old date accepted';
exception when invalid_parameter_value then raise notice 'PASS date 3 days back refused'; end $$;
do $$ begin perform record_app_open(null); raise exception 'FAIL null date accepted';
exception when invalid_parameter_value then raise notice 'PASS null date refused'; end $$;
reset role;

-- B opens too (yesterday UTC is within range), as B.
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
set role authenticated;
select record_app_open((now() at time zone 'utc')::date - 1);
-- B cannot read A's row.
do $$ begin
  if (select count(*) from app_opens where user_id = '11111111-1111-1111-1111-111111111111') <> 0 then
    raise exception 'FAIL B read A rows'; end if;
  if (select count(*) from app_opens) <> 1 then raise exception 'FAIL B sees % rows', (select count(*) from app_opens); end if;
  raise notice 'PASS user B cannot read user A rows';
end $$;
-- B cannot insert a row for A.
do $$ begin
  insert into app_opens (user_id, open_date) values ('11111111-1111-1111-1111-111111111111', (now() at time zone 'utc')::date - 1);
  raise exception 'FAIL B inserted a row for A';
exception when insufficient_privilege then raise notice 'PASS user B cannot insert for A'; end $$;
-- B cannot move A's latest open.
update app_opens set last_opened_at = now() + interval '1 hour' where user_id = '11111111-1111-1111-1111-111111111111';
reset role;
do $$ begin
  if (select last_opened_at from app_opens where user_id = '11111111-1111-1111-1111-111111111111') > now() + interval '30 minutes' then raise exception 'FAIL B updated A row'; end if;
  raise notice 'PASS user B cannot update A rows';
end $$;

-- anon: cannot call record_app_open, cannot read app_opens.
select set_config('request.jwt.claim.sub','', false);
set role anon;
do $$ begin perform record_app_open((now() at time zone 'utc')::date); raise exception 'FAIL anon called record_app_open';
exception when insufficient_privilege then raise notice 'PASS anon cannot call record_app_open'; end $$;
do $$ begin perform count(*) from app_opens; raise exception 'FAIL anon read app_opens';
exception when insufficient_privilege then raise notice 'PASS anon cannot read app_opens'; end $$;

-- assistant_summary: A's key returns A's opens only; old fields unchanged.
do $$ declare r jsonb; rb jsonb; begin
  r := assistant_summary('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  if (r->>'open_tasks')::int <> 1 then raise exception 'FAIL open_tasks %', r; end if;
  if (r->>'pending_suggestions')::int <> 0 then raise exception 'FAIL pending %', r; end if;
  if not (r ? 'checked_at') then raise exception 'FAIL checked_at missing'; end if;
  if jsonb_array_length(r->'opens') <> 1 then raise exception 'FAIL A opens %', r->'opens'; end if;
  if (r->'opens'->0->>'date')::date <> (now() at time zone 'utc')::date then raise exception 'FAIL A open date'; end if;
  if (r->'opens'->0 ? 'first_opened_at') is not true then raise exception 'FAIL first_opened_at'; end if;
  if (r->'opens'->0 ? 'last_opened_at') is not true then raise exception 'FAIL last_opened_at'; end if;
  if (select count(*) from jsonb_object_keys(r)) <> 4 then raise exception 'FAIL fields %', r; end if;
  rb := assistant_summary('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  if jsonb_array_length(rb->'opens') <> 1
     or (rb->'opens'->0->>'date')::date <> (now() at time zone 'utc')::date - 1 then raise exception 'FAIL B opens %', rb->'opens'; end if;
  raise notice 'PASS summary returns opens for key owner only, old fields unchanged';
end $$;
reset role;

-- Opens older than 35 days are not returned.
insert into app_opens (user_id, open_date) values ('11111111-1111-1111-1111-111111111111', (now() at time zone 'Europe/London')::date - 60);
set role anon;
do $$ begin
  if jsonb_array_length(assistant_summary('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')->'opens') <> 1 then
    raise exception 'FAIL 60-day-old open returned'; end if;
  raise notice 'PASS opens limited to last 35 days';
end $$;
reset role;
