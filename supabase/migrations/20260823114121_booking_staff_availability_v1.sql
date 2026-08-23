create extension if not exists btree_gist;

create table if not exists public."BookingTimeOff" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "staffId" text not null references public."BookingStaff"(id) on delete cascade,
  "startsAt" timestamptz not null,
  "endsAt" timestamptz not null,
  type text not null default 'LEAVE' check (type in ('LEAVE','BLOCK','SICK','OTHER')),
  note text,
  "createdAt" timestamptz not null default now(),
  check ("endsAt" > "startsAt")
);

create index if not exists "BookingTimeOff_workspace_staff_starts_idx"
  on public."BookingTimeOff"("workspaceId", "staffId", "startsAt");
create index if not exists "BookingTimeOff_staff_ends_idx"
  on public."BookingTimeOff"("staffId", "endsAt");
create index if not exists "BookingStaffService_serviceId_idx"
  on public."BookingStaffService"("serviceId");

alter table public."BookingTimeOff" enable row level security;
revoke all on public."BookingTimeOff" from anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'BookingAppointment_no_staff_overlap'
      and conrelid = 'public."BookingAppointment"'::regclass
  ) then
    alter table public."BookingAppointment"
      add constraint "BookingAppointment_no_staff_overlap"
      exclude using gist (
        "staffId" with =,
        tstzrange("startsAt", "endsAt", '[)') with &&
      ) where (status in ('PENDING','CONFIRMED'));
  end if;
end $$;

insert into public."BookingStaffService"("staffId","serviceId")
select st.id, sv.id
from public."BookingStaff" st
join public."BookingService" sv on sv."workspaceId" = st."workspaceId"
where st."isActive" = true and sv."isActive" = true
on conflict ("staffId","serviceId") do nothing;