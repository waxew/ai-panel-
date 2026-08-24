create table if not exists public."TelegramIdentityLink" (
  "telegramUserId" text primary key,
  "userId" text not null references public."User"(id) on delete cascade,
  "username" text,
  "firstName" text,
  "lastName" text,
  "photoUrl" text,
  "linkedAt" timestamptz not null default now(),
  "lastSeenAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists "TelegramIdentityLink_userId_key"
  on public."TelegramIdentityLink" ("userId");

alter table public."TelegramIdentityLink" enable row level security;

comment on table public."TelegramIdentityLink" is
  'Verified Telegram Mini App identity links. Service-role only; no direct browser policies.';
