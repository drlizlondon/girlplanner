\set ON_ERROR_STOP 1
-- Run order: assistant_suggestions.stub.sql, ../migrations/20261030090000_assistant_keys.sql,
-- ../migrations/20261102100000_assistant_suggestions.sql, then this file.
-- All data below is made up.
insert into auth.users values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
insert into tasks (user_id, title) values ('11111111-1111-1111-1111-111111111111','Made-up task A'),
  ('22222222-2222-2222-2222-222222222222','Made-up task B');
insert into assistant_keys (user_id, name, key_hash, key_hint) values
 ('11111111-1111-1111-1111-111111111111','Queen', encode(extensions.digest('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','sha256'),'hex'),'aaaa'),
 ('22222222-2222-2222-2222-222222222222','Queen', encode(extensions.digest('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','sha256'),'hex'),'bbbb');
create temp table tcount as select count(*) n from public.tasks;
grant all on tcount to anon;

select set_config('request.jwt.claim.sub','', false);
set role anon;
\set KA 'gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
\set KB 'gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
\set S1 'sms:aaaaaaaa-0000-0000-0000-000000000001'

-- Happy path
do $$ declare r jsonb; begin
  r := assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Book the made-up venue','Detail text','sms:aaaaaaaa-0000-0000-0000-000000000001','inferred');
  if (r->>'added')::bool is not true then raise exception 'FAIL first add %', r; end if;
  raise notice 'PASS add returns added=true';
end $$;

-- A4 must-fail: same source + title (differing case/spacing) twice -> one row
do $$ declare r jsonb; begin
  r := assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','  book  the MADE-UP venue ','x','sms:aaaaaaaa-0000-0000-0000-000000000001','inferred');
  if (r->>'added')::bool is not false then raise exception 'FAIL duplicate added %', r; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from briefing_suggestions where user_id='11111111-1111-1111-1111-111111111111') <> 1 then raise exception 'FAIL A4 duplicate rows'; end if;
  if (select count(*) from daily_briefings where user_id='11111111-1111-1111-1111-111111111111') <> 1 then raise exception 'FAIL one container per day'; end if;
  raise notice 'PASS A4 same source+title twice = one row, one container';
end $$;
-- Same title, DIFFERENT source is allowed.
set role anon;
do $$ declare r jsonb; begin
  r := assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Book the made-up venue','','sms:aaaaaaaa-0000-0000-0000-000000000002','claude');
  if (r->>'added')::bool is not true then raise exception 'FAIL different source blocked'; end if;
  raise notice 'PASS different source allowed';
end $$;
-- A rejected (archived) suggestion may be re-suggested (only pending/accepted block).
reset role;
update briefing_suggestions set status='archived' where source_section='sms:aaaaaaaa-0000-0000-0000-000000000002';
set role anon;
do $$ declare r jsonb; begin
  r := assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Book the made-up venue','','sms:aaaaaaaa-0000-0000-0000-000000000002','claude');
  if (r->>'added')::bool is not true then raise exception 'FAIL archived blocks re-suggest'; end if;
  raise notice 'PASS archived does not block';
end $$;

-- Row shape, caps, kind label, status
reset role;
do $$ declare t text := repeat('t',500); d text := repeat('d',3000); r jsonb; row_ record; begin
  set role anon;
  r := assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', t, d, 'sms:aaaaaaaa-0000-0000-0000-000000000003','explicit');
  reset role;
  select * into row_ from briefing_suggestions where id=(r->>'id')::uuid;
  if length(row_.title)<>200 or length(row_.description)<>1000 then raise exception 'FAIL caps % %', length(row_.title), length(row_.description); end if;
  if row_.status<>'pending' or row_.assistant_kind<>'explicit' or row_.source_section<>'sms:aaaaaaaa-0000-0000-0000-000000000003' then raise exception 'FAIL shape %', row_; end if;
  raise notice 'PASS caps 200/1000, pending, kind label, source_section';
end $$;

-- Validation (G1: blank input stays blank / refused, nothing invented)
set role anon;
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','   ','x','sms:aaaaaaaa-0000-0000-0000-000000000004','explicit'); raise exception 'FAIL blank title accepted';
exception when sqlstate '22023' then raise notice 'PASS G1 blank title refused'; end $$;
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','t','x','sms:aaaaaaaa-0000-0000-0000-000000000004','bogus'); raise exception 'FAIL bad kind';
exception when sqlstate '22023' then raise notice 'PASS bad kind refused'; end $$;
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','t','x','not-a-source','explicit'); raise exception 'FAIL bad source';
exception when sqlstate '22023' then raise notice 'PASS bad source refused'; end $$;
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','t',null,null,'explicit'); raise exception 'FAIL null source';
exception when sqlstate '22023' then raise notice 'PASS null source refused'; end $$;
-- Keys: wrong, short, null
do $$ begin perform assistant_add_suggestion('gpk_WRONGKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','t','x','sms:aaaaaaaa-0000-0000-0000-000000000004','explicit'); raise exception 'FAIL wrong key';
exception when invalid_authorization_specification then raise notice 'PASS wrong key refused'; end $$;
do $$ begin perform assistant_add_suggestion('short','t','x','sms:aaaaaaaa-0000-0000-0000-000000000004','explicit'); raise exception 'FAIL short key';
exception when invalid_authorization_specification then raise notice 'PASS short key refused'; end $$;
do $$ begin perform assistant_add_suggestion(null,'t','x','sms:aaaaaaaa-0000-0000-0000-000000000004','explicit'); raise exception 'FAIL null key';
exception when invalid_authorization_specification then raise notice 'PASS null key refused'; end $$;
-- anon cannot touch tables or the private helper
do $$ begin perform count(*) from briefing_suggestions; if (select count(*) from briefing_suggestions) <> 0 then raise exception 'FAIL anon reads suggestions'; end if; raise notice 'PASS anon sees no suggestions'; end $$;
do $$ begin if (select count(*) from daily_briefings) <> 0 then raise exception 'FAIL anon reads briefings'; end if; raise notice 'PASS anon sees no briefings'; end $$;
do $$ begin perform count(*) from assistant_keys; raise exception 'FAIL anon read keys';
exception when insufficient_privilege then raise notice 'PASS anon cannot read keys'; end $$;
do $$ begin insert into briefing_suggestions (user_id,briefing_id,type,title) values ('11111111-1111-1111-1111-111111111111',gen_random_uuid(),'idea','x'); raise exception 'FAIL anon direct insert';
exception when others then if sqlstate in ('42501','23503') or sqlerrm like '%row-level%' then raise notice 'PASS anon cannot insert directly'; else raise; end if; end $$;
do $$ begin perform _assistant_owner('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'FAIL anon called private helper';
exception when insufficient_privilege then raise notice 'PASS private helper not callable'; end $$;

-- Q1 cross-owner: B's key writes only B's rows; A's rows untouched
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','B only','','sms:bbbbbbbb-0000-0000-0000-000000000001','explicit'); end $$;
reset role;
do $$ begin
  if (select count(*) from briefing_suggestions where title='B only' and user_id='22222222-2222-2222-2222-222222222222') <> 1 then raise exception 'FAIL B row missing'; end if;
  if exists (select 1 from briefing_suggestions where title='B only' and user_id='11111111-1111-1111-1111-111111111111') then raise exception 'FAIL B wrote to A'; end if;
  if exists (select 1 from briefing_suggestions s join daily_briefings b on b.id=s.briefing_id where s.user_id<>b.user_id) then raise exception 'FAIL container owner mismatch'; end if;
  raise notice 'PASS Q1 owner B key writes only B, container owner matches';
end $$;
-- Same source + title for B is NOT blocked by A's identical one.
set role anon;
do $$ declare r jsonb; begin
  r := assistant_add_suggestion('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','Book the made-up venue','','sms:aaaaaaaa-0000-0000-0000-000000000001','inferred');
  if (r->>'added')::bool is not true then raise exception 'FAIL dedupe crossed owners'; end if;
  raise notice 'PASS dedupe is per owner';
end $$;

-- A5 must-fail: tasks unchanged
reset role;
do $$ begin
  if (select count(*) from tasks) <> (select n from tcount) then raise exception 'FAIL A5 tasks count changed'; end if;
  raise notice 'PASS A5 tasks count unchanged (%)', (select n from tcount);
end $$;

-- Revoked key refused at once
update assistant_keys set revoked_at = now() where key_hint='aaaa';
set role anon;
do $$ begin perform assistant_add_suggestion('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','t','x','sms:aaaaaaaa-0000-0000-0000-000000000004','explicit'); raise exception 'FAIL revoked key works';
exception when invalid_authorization_specification then raise notice 'PASS revoked key refused'; end $$;
reset role;
