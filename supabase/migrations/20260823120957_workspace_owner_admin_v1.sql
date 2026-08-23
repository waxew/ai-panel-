create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text := new.id::text;
  v_workspace_id text := new.id::text || ':workspace';
begin
  insert into public."User" (id, email, "displayName")
  values (v_user_id, coalesce(new.email, v_user_id || '@local.invalid'), null)
  on conflict (id) do update set email = excluded.email;

  insert into public."Workspace" (id, name)
  values (v_workspace_id, 'فضای کاری من')
  on conflict (id) do nothing;

  insert into public."WorkspaceMember" (id, "workspaceId", "userId", role)
  values (v_user_id || ':member', v_workspace_id, v_user_id, 'ADMIN')
  on conflict ("workspaceId", "userId") do update set role = 'ADMIN';

  insert into public."BookingSettings" ("workspaceId", "publicSlug")
  values (v_workspace_id, 'workspace-' || left(replace(new.id::text, '-', ''), 8))
  on conflict ("workspaceId") do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;