\set ON_ERROR_STOP 1
insert into auth.users values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222');
insert into tasks (user_id, title, completed, status) values
 ('11111111-1111-1111-1111-111111111111','Open A',false,'active'),
 ('11111111-1111-1111-1111-111111111111','Focus B',false,'focus'),
 ('11111111-1111-1111-1111-111111111111','Done C',true,'active'),
 ('11111111-1111-1111-1111-111111111111','Archived D',false,'archived'),
 ('22222222-2222-2222-2222-222222222222','Other user task',false,'active');
insert into briefing_suggestions (user_id, title, status) values
 ('11111111-1111-1111-1111-111111111111','S1','pending'),
 ('11111111-1111-1111-1111-111111111111','S2','accepted'),
 ('22222222-2222-2222-2222-222222222222','S3','pending');

-- Owner adds a key the way the app will: as the signed-in user, hash only.
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
insert into assistant_keys (user_id, name, key_hash, key_hint) values
 ('11111111-1111-1111-1111-111111111111','Queen Mode', encode(extensions.digest('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','sha256'),'hex'),'aaaa');
-- RLS: cannot add a key for someone else.
do $$ begin
  insert into assistant_keys (user_id, name, key_hash, key_hint) values ('22222222-2222-2222-2222-222222222222','x','h','x');
  raise exception 'FAIL: inserted a key for another user';
exception when insufficient_privilege or check_violation then raise notice 'PASS rls blocks keys for other users';
when others then if sqlstate = '42501' then raise notice 'PASS rls'; else raise; end if; end $$;
reset role;

-- As anon (what Queen uses): no login at all.
select set_config('request.jwt.claim.sub','', false);
set role anon;
do $$ declare r jsonb; begin
  r := assistant_summary('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  if (r->>'open_tasks')::int <> 2 then raise exception 'FAIL open_tasks %', r; end if;      -- A + focus B
  if (r->>'pending_suggestions')::int <> 1 then raise exception 'FAIL pending %', r; end if;
  if r::text ~ 'Open A|Focus B|S1|Other' then raise exception 'FAIL leaked text %', r; end if;
  if (select count(*) from jsonb_object_keys(r)) <> 3 then raise exception 'FAIL extra fields %', r; end if;
  raise notice 'PASS counts only: %', r;
end $$;
-- Wrong key, short key, null.
do $$ begin perform assistant_summary('gpk_WRONGKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'FAIL wrong key accepted';
exception when invalid_authorization_specification then raise notice 'PASS wrong key refused'; end $$;
do $$ begin perform assistant_summary('short'); raise exception 'FAIL short key accepted';
exception when invalid_authorization_specification then raise notice 'PASS short key refused'; end $$;
do $$ begin perform assistant_summary(null); raise exception 'FAIL null accepted';
exception when invalid_authorization_specification then raise notice 'PASS null refused'; end $$;
-- anon cannot read the keys table or tasks directly.
do $$ begin perform count(*) from assistant_keys; raise exception 'FAIL anon read keys';
exception when insufficient_privilege then raise notice 'PASS anon cannot read keys table'; end $$;
do $$ begin if (select count(*) from tasks) <> 0 then raise exception 'FAIL anon read tasks'; end if; raise notice 'PASS anon sees no tasks'; end $$;
reset role;

-- last_used_at recorded; revoke stops it at once.
do $$ begin if (select last_used_at from assistant_keys) is null then raise exception 'FAIL last_used_at'; end if; raise notice 'PASS last_used_at set'; end $$;
-- A stranger (signed in as user 2) cannot revoke her key.
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
set role authenticated;
update assistant_keys set revoked_at = now();
reset role;
do $$ begin if (select revoked_at from assistant_keys) is not null then raise exception 'FAIL stranger revoked key'; end if; raise notice 'PASS stranger cannot revoke'; end $$;
-- The owner can.
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);
set role authenticated;
update assistant_keys set revoked_at = now();
reset role;
do $$ begin if (select revoked_at from assistant_keys) is null then raise exception 'FAIL owner revoke did nothing'; end if; raise notice 'PASS owner revoked'; end $$;
select set_config('request.jwt.claim.sub','', false);
set role anon;
do $$ begin perform assistant_summary('gpk_TESTKEY_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'FAIL revoked key works';
exception when invalid_authorization_specification then raise notice 'PASS revoked key refused'; end $$;
reset role;
