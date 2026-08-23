create table if not exists public."BookingSettings" (
  "workspaceId" text primary key references public."Workspace"(id) on delete cascade,
  "timezone" text not null default 'Asia/Tehran',
  "slotIntervalMinutes" integer not null default 15 check ("slotIntervalMinutes" between 5 and 180),
  "minBookingNoticeMinutes" integer not null default 120 check ("minBookingNoticeMinutes" between 0 and 10080),
  "cancellationNoticeMinutes" integer not null default 360 check ("cancellationNoticeMinutes" between 0 and 43200),
  "allowCustomerCancellation" boolean not null default true,
  "requireDeposit" boolean not null default false,
  "defaultDepositPercent" integer not null default 30 check ("defaultDepositPercent" between 0 and 100),
  "publicBookingEnabled" boolean not null default true,
  "publicSlug" text unique,
  "reminders" jsonb not null default '{"confirmation":true,"before24h":true,"whatsapp":false}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BookingService" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  title text not null,
  description text,
  "durationMinutes" integer not null check ("durationMinutes" between 5 and 1440),
  "bufferMinutes" integer not null default 0 check ("bufferMinutes" between 0 and 240),
  "priceAmount" bigint not null default 0 check ("priceAmount" >= 0),
  currency text not null default 'IRR',
  "depositPercent" integer check ("depositPercent" is null or "depositPercent" between 0 and 100),
  color text not null default '#6659e5',
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BookingStaff" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  name text not null,
  "roleTitle" text,
  phone text,
  email text,
  color text not null default '#11a779',
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BookingStaffService" (
  "staffId" text not null references public."BookingStaff"(id) on delete cascade,
  "serviceId" text not null references public."BookingService"(id) on delete cascade,
  "priceAmountOverride" bigint check ("priceAmountOverride" is null or "priceAmountOverride" >= 0),
  "durationMinutesOverride" integer check ("durationMinutesOverride" is null or "durationMinutesOverride" between 5 and 1440),
  primary key ("staffId", "serviceId")
);

create table if not exists public."BookingWorkingHour" (
  id text primary key default gen_random_uuid()::text,
  "staffId" text not null references public."BookingStaff"(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  "startTime" time not null default '09:00',
  "endTime" time not null default '18:00',
  "isWorking" boolean not null default true,
  unique ("staffId", weekday),
  check ("endTime" > "startTime")
);

create table if not exists public."BookingCustomer" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "fullName" text not null,
  phone text not null,
  email text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("workspaceId", phone)
);

create table if not exists public."BookingAppointment" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete restrict,
  "serviceId" text not null references public."BookingService"(id) on delete restrict,
  "staffId" text not null references public."BookingStaff"(id) on delete restrict,
  "startsAt" timestamptz not null,
  "endsAt" timestamptz not null,
  status text not null default 'CONFIRMED' check (status in ('PENDING','CONFIRMED','DONE','CANCELLED','NO_SHOW')),
  "amount" bigint not null default 0 check ("amount" >= 0),
  "depositAmount" bigint not null default 0 check ("depositAmount" >= 0),
  "paidAmount" bigint not null default 0 check ("paidAmount" >= 0),
  currency text not null default 'IRR',
  source text not null default 'PANEL' check (source in ('PANEL','PUBLIC_BOOKING','TELEGRAM','INSTAGRAM','WHATSAPP','IMPORT')),
  note text,
  "createdByUserId" text references public."User"(id) on delete set null,
  "completedAt" timestamptz,
  "cancelledAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check ("endsAt" > "startsAt")
);

create index if not exists "BookingService_workspaceId_idx" on public."BookingService"("workspaceId");
create index if not exists "BookingStaff_workspaceId_idx" on public."BookingStaff"("workspaceId");
create index if not exists "BookingCustomer_workspaceId_idx" on public."BookingCustomer"("workspaceId");
create index if not exists "BookingAppointment_workspace_starts_idx" on public."BookingAppointment"("workspaceId", "startsAt");
create index if not exists "BookingAppointment_staff_starts_idx" on public."BookingAppointment"("staffId", "startsAt");
create index if not exists "BookingAppointment_customer_starts_idx" on public."BookingAppointment"("customerId", "startsAt");
create index if not exists "BookingAppointment_status_starts_idx" on public."BookingAppointment"(status, "startsAt");

alter table public."BookingSettings" enable row level security;
alter table public."BookingService" enable row level security;
alter table public."BookingStaff" enable row level security;
alter table public."BookingStaffService" enable row level security;
alter table public."BookingWorkingHour" enable row level security;
alter table public."BookingCustomer" enable row level security;
alter table public."BookingAppointment" enable row level security;

revoke all on public."BookingSettings" from anon, authenticated;
revoke all on public."BookingService" from anon, authenticated;
revoke all on public."BookingStaff" from anon, authenticated;
revoke all on public."BookingStaffService" from anon, authenticated;
revoke all on public."BookingWorkingHour" from anon, authenticated;
revoke all on public."BookingCustomer" from anon, authenticated;
revoke all on public."BookingAppointment" from anon, authenticated;