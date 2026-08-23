alter table public."User" add column if not exists phone text;

create table if not exists public."UserWallet" (
  "userId" text primary key references public."User"(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  currency text not null default 'IRR',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."WalletTransaction" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references public."User"(id) on delete cascade,
  type text not null check (type in ('CREDIT','DEBIT','ADJUSTMENT','REFUND')),
  amount bigint not null check (amount <> 0),
  "balanceAfter" bigint not null check ("balanceAfter" >= 0),
  description text,
  reference text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "WalletTransaction_userId_createdAt_idx"
  on public."WalletTransaction" ("userId", "createdAt" desc);

alter table public."UserWallet" enable row level security;
alter table public."WalletTransaction" enable row level security;

revoke all on table public."UserWallet" from anon, authenticated;
revoke all on table public."WalletTransaction" from anon, authenticated;
grant select, insert, update, delete on table public."UserWallet" to service_role;
grant select, insert, update, delete on table public."WalletTransaction" to service_role;

drop trigger if exists user_wallet_set_updated_at on public."UserWallet";
create trigger user_wallet_set_updated_at before update on public."UserWallet"
for each row execute function public.set_updated_at();

insert into public."UserWallet" ("userId")
select id from public."User"
on conflict ("userId") do nothing;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text := new.id::text;
  v_workspace_id text := new.id::text || ':workspace';
begin
  insert into public."User" (id, email, "displayName")
  values (v_user_id, coalesce(new.email, v_user_id || '@local.invalid'), null)
  on conflict (id) do update set email = excluded.email;

  insert into public."UserWallet" ("userId")
  values (v_user_id)
  on conflict ("userId") do nothing;

  insert into public."Workspace" (id, name)
  values (v_workspace_id, 'فضای کاری من')
  on conflict (id) do nothing;

  insert into public."WorkspaceMember" (id, "workspaceId", "userId", role)
  values (v_user_id || ':member', v_workspace_id, v_user_id, 'CUSTOMER')
  on conflict ("workspaceId", "userId") do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
