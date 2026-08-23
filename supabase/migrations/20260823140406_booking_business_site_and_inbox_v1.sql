create table if not exists public."BookingBusinessSite" (
  "workspaceId" text primary key references public."Workspace"(id) on delete cascade,
  slug text not null unique,
  enabled boolean not null default true,
  "brandName" text not null default 'کسب‌وکار من',
  tagline text,
  "aboutText" text,
  phone text,
  email text,
  address text,
  "instagramUrl" text,
  "whatsappUrl" text,
  "websiteUrl" text,
  "logoUrl" text,
  "coverUrl" text,
  "accentColor" text not null default '#6659e5',
  theme text not null default 'LIGHT' check (theme in ('LIGHT','DARK')),
  "showServices" boolean not null default true,
  "showStaff" boolean not null default true,
  "showBooking" boolean not null default true,
  "showContact" boolean not null default true,
  "showLoyalty" boolean not null default true,
  "metaTitle" text,
  "metaDescription" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check (slug ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  check ("accentColor" ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public."BookingInboxMessage" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  source text not null default 'WEBSITE' check (source in ('WEBSITE','BOOKING','FEEDBACK','MANUAL','WHATSAPP','INSTAGRAM','TELEGRAM','OTHER')),
  "customerId" text references public."BookingCustomer"(id) on delete set null,
  name text,
  phone text,
  email text,
  subject text,
  body text not null,
  status text not null default 'NEW' check (status in ('NEW','OPEN','DONE','ARCHIVED','SPAM')),
  priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH','URGENT')),
  "handledByUserId" text references public."User"(id) on delete set null,
  "handledAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "BookingBusinessSite_enabled_slug_idx" on public."BookingBusinessSite"(enabled,slug);
create index if not exists "BookingInboxMessage_workspace_status_created_idx" on public."BookingInboxMessage"("workspaceId",status,"createdAt" desc);
create index if not exists "BookingInboxMessage_customer_idx" on public."BookingInboxMessage"("customerId","createdAt" desc);
create index if not exists "BookingInboxMessage_handler_idx" on public."BookingInboxMessage"("handledByUserId");

alter table public."BookingBusinessSite" enable row level security;
alter table public."BookingInboxMessage" enable row level security;
revoke all on public."BookingBusinessSite" from anon, authenticated;
revoke all on public."BookingInboxMessage" from anon, authenticated;
grant select, insert, update, delete on public."BookingBusinessSite" to service_role;
grant select, insert, update, delete on public."BookingInboxMessage" to service_role;

insert into public."BookingBusinessSite"("workspaceId",slug,"brandName")
select w.id,
       coalesce(bs."publicSlug", lower(substr(replace(w.id,':','-'),1,40))),
       w.name
from public."Workspace" w
left join public."BookingSettings" bs on bs."workspaceId"=w.id
where not exists(select 1 from public."BookingBusinessSite" s where s."workspaceId"=w.id)
on conflict do nothing;
