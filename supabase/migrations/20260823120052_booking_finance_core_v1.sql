create table if not exists public."BookingPayment" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "appointmentId" text not null references public."BookingAppointment"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  type text not null default 'PAYMENT' check (type in ('PAYMENT','REFUND')),
  method text not null default 'CASH' check (method in ('CASH','CARD','POS','TRANSFER','OTHER')),
  amount bigint not null check (amount > 0),
  currency text not null default 'IRR',
  reference text,
  note text,
  status text not null default 'POSTED' check (status in ('POSTED','VOID')),
  "paidAt" timestamptz not null default now(),
  "createdByUserId" text references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public."BookingExpense" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  category text not null,
  amount bigint not null check (amount > 0),
  currency text not null default 'IRR',
  vendor text,
  note text,
  status text not null default 'POSTED' check (status in ('POSTED','VOID')),
  "occurredAt" timestamptz not null default now(),
  "createdByUserId" text references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "BookingPayment_workspace_paidAt_idx" on public."BookingPayment"("workspaceId", "paidAt" desc);
create index if not exists "BookingPayment_appointment_idx" on public."BookingPayment"("appointmentId", "paidAt" desc);
create index if not exists "BookingPayment_customer_idx" on public."BookingPayment"("customerId", "paidAt" desc);
create index if not exists "BookingPayment_createdBy_idx" on public."BookingPayment"("createdByUserId");
create index if not exists "BookingExpense_workspace_occurredAt_idx" on public."BookingExpense"("workspaceId", "occurredAt" desc);
create index if not exists "BookingExpense_createdBy_idx" on public."BookingExpense"("createdByUserId");

alter table public."BookingPayment" enable row level security;
alter table public."BookingExpense" enable row level security;
revoke all on public."BookingPayment" from anon, authenticated;
revoke all on public."BookingExpense" from anon, authenticated;
grant select, insert, update, delete on public."BookingPayment" to service_role;
grant select, insert, update, delete on public."BookingExpense" to service_role;

create schema if not exists private;

create or replace function private.booking_payment_fill_context()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  ap_workspace text;
  ap_customer text;
  ap_currency text;
begin
  select a."workspaceId", a."customerId", a.currency
    into ap_workspace, ap_customer, ap_currency
  from public."BookingAppointment" a
  where a.id = new."appointmentId";

  if ap_workspace is null then
    raise exception 'Appointment not found';
  end if;

  new."workspaceId" := ap_workspace;
  new."customerId" := ap_customer;
  new.currency := ap_currency;
  return new;
end;
$$;

create or replace function private.booking_payment_sync_appointment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_id text;
  total bigint;
begin
  target_id := coalesce(new."appointmentId", old."appointmentId");
  select greatest(0, coalesce(sum(
    case when p.type = 'PAYMENT' then p.amount else -p.amount end
  ) filter (where p.status = 'POSTED'), 0))::bigint
  into total
  from public."BookingPayment" p
  where p."appointmentId" = target_id;

  update public."BookingAppointment"
  set "paidAmount" = total,
      "updatedAt" = now()
  where id = target_id;

  return coalesce(new, old);
end;
$$;

revoke all on function private.booking_payment_fill_context() from public, anon, authenticated;
revoke all on function private.booking_payment_sync_appointment() from public, anon, authenticated;

drop trigger if exists booking_payment_fill_context on public."BookingPayment";
create trigger booking_payment_fill_context
before insert or update of "appointmentId" on public."BookingPayment"
for each row execute function private.booking_payment_fill_context();

drop trigger if exists booking_payment_sync_appointment on public."BookingPayment";
create trigger booking_payment_sync_appointment
after insert or update of amount, type, status or delete on public."BookingPayment"
for each row execute function private.booking_payment_sync_appointment();