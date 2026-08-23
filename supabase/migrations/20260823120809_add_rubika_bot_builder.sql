create table public."RubikaBot" (
  id text primary key default (gen_random_uuid())::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "rubikaBotId" text not null unique,
  username text,
  "displayName" text,
  description text,
  "tokenCiphertext" text not null,
  status public."BotStatus" not null default 'PENDING'::public."BotStatus",
  "welcomeMessage" text not null default 'سلام! به ربات روبیکا خوش آمدید. از منوی زیر یکی از گزینه‌ها را انتخاب کنید.'::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index "RubikaBot_workspaceId_idx" on public."RubikaBot" ("workspaceId");

create table public."RubikaButton" (
  id text primary key default (gen_random_uuid())::text,
  "botId" text not null references public."RubikaBot"(id) on delete cascade,
  "parentId" text references public."RubikaButton"(id) on delete set null,
  title text not null,
  "actionType" text not null,
  "actionValue" text,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create index "RubikaButton_botId_sortOrder_idx" on public."RubikaButton" ("botId", "sortOrder");

alter table public."RubikaBot" enable row level security;
alter table public."RubikaButton" enable row level security;

create policy "Members can read own rubika bots"
on public."RubikaBot"
for select
to authenticated
using (
  exists (
    select 1 from public."WorkspaceMember" m
    where m."workspaceId" = "RubikaBot"."workspaceId"
      and m."userId" = (select auth.uid())::text
  )
);

insert into public."AppSecret" (id, value)
select 'rubika_token_encryption', encode(gen_random_bytes(32), 'hex')
where not exists (select 1 from public."AppSecret" where id = 'rubika_token_encryption');