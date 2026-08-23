create type public."UserRole" as enum ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
create type public."BotStatus" as enum ('PENDING', 'ACTIVE', 'INVALID', 'DISABLED');
create type public."ScheduledJobStatus" as enum ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

create table public."User" (
  id text primary key default gen_random_uuid()::text,
  email text not null unique,
  "displayName" text,
  role public."UserRole" not null default 'CUSTOMER',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."Workspace" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."WorkspaceMember" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "userId" text not null references public."User"(id) on delete cascade,
  role public."UserRole" not null default 'CUSTOMER',
  unique ("workspaceId", "userId")
);

create table public."TelegramBot" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "telegramBotId" text not null unique,
  username text,
  "displayName" text,
  description text,
  "tokenCiphertext" text not null,
  status public."BotStatus" not null default 'PENDING',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."TelegramButton" (
  id text primary key default gen_random_uuid()::text,
  "botId" text not null references public."TelegramBot"(id) on delete cascade,
  "parentId" text,
  title text not null,
  "actionType" text not null,
  "actionValue" text,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table public."ScheduledJob" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  platform text not null,
  "jobType" text not null,
  payload jsonb not null,
  "runAt" timestamptz not null,
  status public."ScheduledJobStatus" not null default 'PENDING',
  attempts integer not null default 0,
  "lastError" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index "ScheduledJob_status_runAt_idx" on public."ScheduledJob" (status, "runAt");

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create trigger user_set_updated_at before update on public."User"
for each row execute function public.set_updated_at();
create trigger workspace_set_updated_at before update on public."Workspace"
for each row execute function public.set_updated_at();
create trigger telegram_bot_set_updated_at before update on public."TelegramBot"
for each row execute function public.set_updated_at();
create trigger scheduled_job_set_updated_at before update on public."ScheduledJob"
for each row execute function public.set_updated_at();

alter table public."User" enable row level security;
alter table public."Workspace" enable row level security;
alter table public."WorkspaceMember" enable row level security;
alter table public."TelegramBot" enable row level security;
alter table public."TelegramButton" enable row level security;
alter table public."ScheduledJob" enable row level security;

revoke all on table public."User" from anon, authenticated;
revoke all on table public."Workspace" from anon, authenticated;
revoke all on table public."WorkspaceMember" from anon, authenticated;
revoke all on table public."TelegramBot" from anon, authenticated;
revoke all on table public."TelegramButton" from anon, authenticated;
revoke all on table public."ScheduledJob" from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public."User" to service_role;
grant select, insert, update, delete on table public."Workspace" to service_role;
grant select, insert, update, delete on table public."WorkspaceMember" to service_role;
grant select, insert, update, delete on table public."TelegramBot" to service_role;
grant select, insert, update, delete on table public."TelegramButton" to service_role;
grant select, insert, update, delete on table public."ScheduledJob" to service_role;

insert into public."Workspace" (id, name)
values ('local-workspace', 'AI Panel MVP Workspace')
on conflict (id) do nothing;