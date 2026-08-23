create table if not exists public."BookingStaffAccess" (
  "staffId" text primary key references public."BookingStaff"(id) on delete cascade,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "userId" text references public."User"(id) on delete set null,
  "isEnabled" boolean not null default false,
  "appointmentScope" text not null default 'OWN' check ("appointmentScope" in ('OWN','ALL')),
  permissions jsonb not null default '{"booking":true,"customers":false,"finance":false,"reports":false,"services":false,"staff":false,"settings":false,"automations":false}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("workspaceId", "userId")
);

create index if not exists "BookingStaffAccess_workspace_idx" on public."BookingStaffAccess"("workspaceId");
create index if not exists "BookingStaffAccess_user_idx" on public."BookingStaffAccess"("userId") where "userId" is not null;

alter table public."BookingStaffAccess" enable row level security;
revoke all on public."BookingStaffAccess" from anon, authenticated;
grant select, insert, update, delete on public."BookingStaffAccess" to service_role;

create or replace function private.booking_staff_access_fill_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  staff_workspace text;
begin
  select s."workspaceId" into staff_workspace
  from public."BookingStaff" s
  where s.id = new."staffId";
  if staff_workspace is null then raise exception 'Staff not found'; end if;
  new."workspaceId" := staff_workspace;
  new."updatedAt" := now();
  return new;
end;
$$;
revoke all on function private.booking_staff_access_fill_workspace() from public, anon, authenticated;

drop trigger if exists booking_staff_access_fill_workspace on public."BookingStaffAccess";
create trigger booking_staff_access_fill_workspace
before insert or update of "staffId" on public."BookingStaffAccess"
for each row execute function private.booking_staff_access_fill_workspace();

insert into public."BookingStaffAccess"("staffId","workspaceId")
select s.id,s."workspaceId" from public."BookingStaff" s
on conflict ("staffId") do nothing;