create table if not exists public."BookingFeedbackInvite" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "appointmentId" text not null unique references public."BookingAppointment"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  "tokenHash" text not null unique,
  status text not null default 'OPEN' check (status in ('OPEN','COMPLETED','REVOKED')),
  "expiresAt" timestamptz not null,
  "createdByUserId" text references public."User"(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BookingFeedbackResponse" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "inviteId" text not null unique references public."BookingFeedbackInvite"(id) on delete cascade,
  "appointmentId" text not null references public."BookingAppointment"(id) on delete cascade,
  "customerId" text not null references public."BookingCustomer"(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  "recommendScore" smallint check ("recommendScore" between 0 and 10),
  comment text,
  tags text[] not null default '{}',
  "createdAt" timestamptz not null default now()
);

create index if not exists "BookingFeedbackInvite_workspace_created_idx" on public."BookingFeedbackInvite"("workspaceId", "createdAt" desc);
create index if not exists "BookingFeedbackInvite_customer_idx" on public."BookingFeedbackInvite"("customerId");
create index if not exists "BookingFeedbackResponse_workspace_created_idx" on public."BookingFeedbackResponse"("workspaceId", "createdAt" desc);
create index if not exists "BookingFeedbackResponse_appointment_idx" on public."BookingFeedbackResponse"("appointmentId");
create index if not exists "BookingFeedbackResponse_customer_idx" on public."BookingFeedbackResponse"("customerId");

alter table public."BookingFeedbackInvite" enable row level security;
alter table public."BookingFeedbackResponse" enable row level security;
revoke all on public."BookingFeedbackInvite" from anon, authenticated;
revoke all on public."BookingFeedbackResponse" from anon, authenticated;
grant select, insert, update, delete on public."BookingFeedbackInvite" to service_role;
grant select, insert, update, delete on public."BookingFeedbackResponse" to service_role;

create or replace function private.booking_feedback_fill_context()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  ap_workspace text;
  ap_customer text;
begin
  select a."workspaceId", a."customerId" into ap_workspace, ap_customer
  from public."BookingAppointment" a where a.id = new."appointmentId";
  if ap_workspace is null then raise exception 'Appointment not found'; end if;
  new."workspaceId" := ap_workspace;
  new."customerId" := ap_customer;
  if tg_table_name = 'BookingFeedbackInvite' then new."updatedAt" := now(); end if;
  return new;
end;
$$;
revoke all on function private.booking_feedback_fill_context() from public, anon, authenticated;

drop trigger if exists booking_feedback_invite_context on public."BookingFeedbackInvite";
create trigger booking_feedback_invite_context before insert or update of "appointmentId" on public."BookingFeedbackInvite"
for each row execute function private.booking_feedback_fill_context();

drop trigger if exists booking_feedback_response_context on public."BookingFeedbackResponse";
create trigger booking_feedback_response_context before insert or update of "appointmentId" on public."BookingFeedbackResponse"
for each row execute function private.booking_feedback_fill_context();