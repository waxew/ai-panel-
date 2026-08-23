create schema if not exists private;
create or replace function private.booking_business_site_autoprovision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text;
begin
  v_slug := 'workspace-' || substr(replace(new.id, ':workspace', ''), 1, 8);
  insert into public."BookingBusinessSite"("workspaceId", slug, "brandName")
  values (new.id, v_slug, new.name)
  on conflict ("workspaceId") do nothing;
  return new;
end;
$$;
revoke all on function private.booking_business_site_autoprovision() from public, anon, authenticated;
drop trigger if exists booking_business_site_autoprovision on public."Workspace";
create trigger booking_business_site_autoprovision
after insert on public."Workspace"
for each row execute function private.booking_business_site_autoprovision();
