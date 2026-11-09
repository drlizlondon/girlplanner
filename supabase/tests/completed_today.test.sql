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

-- BST: 2026-07-09 23:30 UTC is 2026-07-10 00:30 in London, so it counts on 10 July.
-- 2026-07-10 22:59 UTC is 23:59 London, still 10 July. 2026-07-08 12:00 UTC counts on 8 July.
insert into tasks (user_id, title, completed, completed_at) values
 ('11111111-1111-1111-1111-111111111111','A late',   true, '2026-07-09 23:30:00+00'),
 ('11111111-1111-1111-1111-111111111111','A end',    true, '2026-07-10 22:59:00+00'),
 ('11111111-1111-1111-1111-111111111111','A earlier',true, '2026-07-08 12:00:00+00'),
 ('11111111-1111-1111-1111-111111111111','A old',    true, '2026-06-20 12:00:00+00'),
 ('22222222-2222-2222-2222-222222222222','B late',   true, '2026-07-09 23:30:00+00');

do $$ declare r jsonb; begin
  r := assistant_completed_by_date('11111111-1111-1111-1111-111111111111', date '2026-07-10');
  if jsonb_array_length(r) <> 7 then raise exception 'FAIL expected 7 days %', r; end if;
  if (r->0->>'date') <> '2026-07-04' or (r->6->>'date') <> '2026-07-10' then raise exception 'FAIL date span %', r; end if;
  if (r->6->>'count')::int <> 2 then raise exception 'FAIL London 10 July should be 2 (00:30 BST and 23:59 BST): %', r; end if;
  if (r->5->>'count')::int <> 0 then raise exception 'FAIL 9 July should be 0 (the 23:30 UTC task is 10 July in London): %', r; end if;
  if (r->4->>'count')::int <> 1 then raise exception 'FAIL 8 July should be 1: %', r; end if;
  raise notice 'PASS counted by Europe/London date (23:30 UTC on a BST date is the next local day)';
  if (select sum((e->>'count')::int) from jsonb_array_elements(r) e) <> 3 then raise exception 'FAIL a task outside 7 days was counted %', r; end if;
  raise notice 'PASS tasks older than 7 days are not counted; zero days are present';
  r := assistant_completed_by_date('22222222-2222-2222-2222-222222222222', date '2026-07-10');
  if (r->6->>'count')::int <> 1 or (select sum((e->>'count')::int) from jsonb_array_elements(r) e) <> 1 then
    raise exception 'FAIL B counts %', r; end if;
  raise notice 'PASS helper counts the given owner only';
end $$;

-- Through the key, as anon: A's key returns A's counts only; old fields unchanged.
insert into tasks (user_id, title, completed, completed_at) values
 ('11111111-1111-1111-1111-111111111111','A today 1', true, now()),
 ('11111111-1111-1111-1111-111111111111','A today 2', true, now()),
 ('11111111-1111-1111-1111-111111111111','A today 3', true, now()),
 ('22222222-2222-2222-2222-222222222222','B today',   true, now());
set role anon;
do $$ declare r jsonb; rb jsonb; today date := (now() at time zone 'Europe/London')::date; begin
  r := assistant_summary('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  if (r->'completed_by_date'->6->>'date')::date <> today then raise exception 'FAIL last entry is not London today %', r->'completed_by_date'; end if;
  if (r->'completed_by_date'->6->>'count')::int <> 3 then raise exception 'FAIL A today count %', r->'completed_by_date'; end if;
  rb := assistant_summary('gpk_TESTKEY_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  if (rb->'completed_by_date'->6->>'count')::int <> 1 then raise exception 'FAIL B today count (A counts leaked?) %', rb->'completed_by_date'; end if;
  raise notice 'PASS summary returns completed_by_date for the key owner only';
  if (r->>'open_tasks')::int <> 1 then raise exception 'FAIL open_tasks %', r; end if;
  if (r->>'pending_suggestions')::int <> 0 then raise exception 'FAIL pending %', r; end if;
  if not (r ? 'checked_at') or jsonb_typeof(r->'opens') <> 'array' then raise exception 'FAIL checked_at/opens %', r; end if;
  if (select count(*) from jsonb_object_keys(r)) <> 5 then raise exception 'FAIL fields %', r; end if;
  raise notice 'PASS existing fields unchanged (open_tasks, pending_suggestions, checked_at, opens)';
end $$;
-- Neither anon nor signed-in users can call the helper with someone else's id.
do $$ begin perform assistant_completed_by_date('11111111-1111-1111-1111-111111111111', current_date);
  raise exception 'FAIL anon called the helper'; exception when insufficient_privilege then raise notice 'PASS anon cannot call the helper'; end $$;
reset role;
set role authenticated;
do $$ begin perform assistant_completed_by_date('11111111-1111-1111-1111-111111111111', current_date);
  raise exception 'FAIL authenticated called the helper'; exception when insufficient_privilege then raise notice 'PASS signed-in users cannot call the helper'; end $$;
reset role;
-- A bad key is still refused.
set role anon;
do $$ begin perform assistant_summary('gpk_WRONG_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  raise exception 'FAIL bad key accepted'; exception when invalid_authorization_specification then raise notice 'PASS bad key refused'; end $$;
reset role;
