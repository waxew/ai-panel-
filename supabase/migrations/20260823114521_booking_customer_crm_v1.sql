alter table public."BookingCustomer"
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists "isVip" boolean not null default false;

create index if not exists "BookingCustomer_workspace_tags_idx"
  on public."BookingCustomer" using gin(tags);

create index if not exists "BookingCustomer_workspace_vip_idx"
  on public."BookingCustomer"("workspaceId", "isVip");