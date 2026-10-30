create extension if not exists pgcrypto with schema extensions;

create table if not exists public.assistant_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null check (length(name) between 1 and 60),
  key_hash     text not null unique,
  key_hint     text not null,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

revoke all on public.assistant_keys from anon;
grant select, insert, update on public.assistant_keys to authenticated;
grant all on public.assistant_keys to service_role;

alter table public.assistant_keys enable row level security;

drop policy if exists "Owners read their assistant keys" on public.assistant_keys;
create policy "Owners read their assistant keys" on public.assistant_keys
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Owners add assistant keys" on public.assistant_keys;
create policy "Owners add assistant keys" on public.assistant_keys
  for insert to authenticated with check (auth.uid() = user_id and revoked_at is null);

drop policy if exists "Owners revoke their assistant keys" on public.assistant_keys;
create policy "Owners revoke their assistant keys" on public.assistant_keys
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
    'open_tasks', (select count(*) from public.tasks
                    where user_id = v_user and completed = false
                      and coalesce(status, '') not in ('archived', 'completed')),
    'pending_suggestions', (select count(*) from public.briefing_suggestions
                             where user_id = v_user and status = 'pending'),
    'checked_at', now()
  );
end;
$$;

revoke all on function public.assistant_summary(text) from public;
grant execute on function public.assistant_summary(text) to anon, authenticated;