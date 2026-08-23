create extension if not exists pg_cron;

alter table public."BookingCustomer"
  add column if not exists "birthDate" date,
  add column if not exists "marketingOptIn" boolean not null default true;

create table if not exists public."BookingAutomationRule" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  type text not null check (type in ('APPOINTMENT_REMINDER','BIRTHDAY','WINBACK')),
  name text not null,
  channel text not null default 'SMS' check (channel in ('SMS','WHATSAPP')),
  "isActive" boolean not null default false,
  template text not null,
  "leadMinutes" integer not null default 1440 check ("leadMinutes" between 0 and 43200),
  "daysAfterLastVisit" integer not null default 60 check ("daysAfterLastVisit" between 1 and 3650),
  "sendTime" time not null default '10:00',
  settings jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("workspaceId", type)
);

create table if not exists public."BookingMessageOutbox" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "appointmentId" text references public."BookingAppointment"(id) on delete cascade,
  "ruleId" text references public."BookingAutomationRule"(id) on delete set null,
  channel text not null default 'SMS' check (channel in ('SMS','WHATSAPP')),
  recipient text not null,
  body text not null,
  "scheduledFor" timestamptz not null default now(),
  status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED','CANCELLED','BLOCKED')),
  attempts integer not null default 0 check (attempts >= 0),
  "providerMessageId" text,
  "lastError" text,
  "dedupeKey" text not null unique,
  "createdAt" timestamptz not null default now(),
  "sentAt" timestamptz
);

create table if not exists public."BookingSmsAccount" (
  "workspaceId" text primary key references public."Workspace"(id) on delete cascade,
  provider text not null default 'NOT_CONNECTED',
  status text not null default 'DISCONNECTED' check (status in ('DISCONNECTED','CONNECTED','ERROR')),
  "senderNumber" text,
  "balanceMessages" integer not null default 0 check ("balanceMessages" >= 0),
  "bulkBalanceMessages" integer not null default 0 check ("bulkBalanceMessages" >= 0),
  "subscriptionEndsAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "BookingAutomationRule_workspace_active_idx" on public."BookingAutomationRule"("workspaceId", "isActive");
create index if not exists "BookingMessageOutbox_workspace_status_schedule_idx" on public."BookingMessageOutbox"("workspaceId", status, "scheduledFor");
create index if not exists "BookingMessageOutbox_customer_idx" on public."BookingMessageOutbox"("customerId", "createdAt");
create index if not exists "BookingCustomer_birthDate_idx" on public."BookingCustomer"("workspaceId", "birthDate");

alter table public."BookingAutomationRule" enable row level security;
alter table public."BookingMessageOutbox" enable row level security;
alter table public."BookingSmsAccount" enable row level security;

revoke all on public."BookingAutomationRule" from anon, authenticated;
revoke all on public."BookingMessageOutbox" from anon, authenticated;
revoke all on public."BookingSmsAccount" from anon, authenticated;

create schema if not exists private;

create or replace function private.booking_generate_due_messages()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public."BookingMessageOutbox" (
    "workspaceId", "customerId", "appointmentId", "ruleId", channel, recipient, body,
    "scheduledFor", status, "dedupeKey"
  )
  select
    r."workspaceId",
    c.id,
    a.id,
    r.id,
    r.channel,
    c.phone,
    replace(
      replace(
        replace(
          replace(r.template, '{name}', c."fullName"),
          '{date}', to_char(a."startsAt" at time zone coalesce(bs.timezone, 'Asia/Tehran'), 'YYYY/MM/DD')
        ),
        '{time}', to_char(a."startsAt" at time zone coalesce(bs.timezone, 'Asia/Tehran'), 'HH24:MI')
      ),
      '{service}', s.title
    ),
    a."startsAt" - make_interval(mins => r."leadMinutes"),
    'PENDING',
    'REMINDER:' || r.id || ':' || a.id
  from public."BookingAutomationRule" r
  join public."BookingAppointment" a on a."workspaceId" = r."workspaceId"
  join public."BookingCustomer" c on c.id = a."customerId"
  join public."BookingService" s on s.id = a."serviceId"
  left join public."BookingSettings" bs on bs."workspaceId" = r."workspaceId"
  where r.type = 'APPOINTMENT_REMINDER'
    and r."isActive" = true
    and a.status in ('PENDING','CONFIRMED')
    and a."startsAt" > now()
    and a."startsAt" - make_interval(mins => r."leadMinutes") <= now()
  on conflict ("dedupeKey") do nothing;

  insert into public."BookingMessageOutbox" (
    "workspaceId", "customerId", "ruleId", channel, recipient, body,
    "scheduledFor", status, "dedupeKey"
  )
  select
    r."workspaceId",
    c.id,
    r.id,
    r.channel,
    c.phone,
    replace(r.template, '{name}', c."fullName"),
    now(),
    'PENDING',
    'BIRTHDAY:' || r.id || ':' || c.id || ':' || extract(year from (now() at time zone coalesce(bs.timezone, 'Asia/Tehran')))::int::text
  from public."BookingAutomationRule" r
  join public."BookingCustomer" c on c."workspaceId" = r."workspaceId"
  left join public."BookingSettings" bs on bs."workspaceId" = r."workspaceId"
  where r.type = 'BIRTHDAY'
    and r."isActive" = true
    and c."marketingOptIn" = true
    and c."birthDate" is not null
    and extract(month from c."birthDate") = extract(month from (now() at time zone coalesce(bs.timezone, 'Asia/Tehran')))
    and extract(day from c."birthDate") = extract(day from (now() at time zone coalesce(bs.timezone, 'Asia/Tehran')))
    and (now() at time zone coalesce(bs.timezone, 'Asia/Tehran'))::time >= r."sendTime"
  on conflict ("dedupeKey") do nothing;

  insert into public."BookingMessageOutbox" (
    "workspaceId", "customerId", "ruleId", channel, recipient, body,
    "scheduledFor", status, "dedupeKey"
  )
  select
    r."workspaceId",
    c.id,
    r.id,
    r.channel,
    c.phone,
    replace(r.template, '{name}', c."fullName"),
    now(),
    'PENDING',
    'WINBACK:' || r.id || ':' || c.id || ':' || to_char(now() at time zone coalesce(bs.timezone, 'Asia/Tehran'), 'YYYY-MM')
  from public."BookingAutomationRule" r
  join public."BookingCustomer" c on c."workspaceId" = r."workspaceId"
  left join public."BookingSettings" bs on bs."workspaceId" = r."workspaceId"
  join lateral (
    select max(a."startsAt") as "lastVisit"
    from public."BookingAppointment" a
    where a."customerId" = c.id and a."workspaceId" = r."workspaceId" and a.status = 'DONE'
  ) lv on lv."lastVisit" is not null
  where r.type = 'WINBACK'
    and r."isActive" = true
    and c."marketingOptIn" = true
    and lv."lastVisit" <= now() - make_interval(days => r."daysAfterLastVisit")
    and (now() at time zone coalesce(bs.timezone, 'Asia/Tehran'))::time >= r."sendTime"
  on conflict ("dedupeKey") do nothing;
end;
$$;

revoke all on function private.booking_generate_due_messages() from public, anon, authenticated;

select cron.unschedule(jobid)
from cron.job
where jobname = 'booking-automation-every-5-min';

select cron.schedule(
  'booking-automation-every-5-min',
  '*/5 * * * *',
  'select private.booking_generate_due_messages();'
);