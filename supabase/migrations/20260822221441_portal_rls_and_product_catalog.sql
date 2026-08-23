drop policy if exists "Public can read visible products" on public."Product";
create policy "Public can read visible products"
on public."Product" for select
to anon, authenticated
using (status <> 'HIDDEN');
grant select on table public."Product" to anon, authenticated;

drop policy if exists "Users can read own profile" on public."User";
create policy "Users can read own profile"
on public."User" for select
to authenticated
using (id = (select auth.uid())::text);
grant select on table public."User" to authenticated;

drop policy if exists "Users can read own memberships" on public."WorkspaceMember";
create policy "Users can read own memberships"
on public."WorkspaceMember" for select
to authenticated
using ("userId" = (select auth.uid())::text);
grant select on table public."WorkspaceMember" to authenticated;

drop policy if exists "Members can read their workspaces" on public."Workspace";
create policy "Members can read their workspaces"
on public."Workspace" for select
to authenticated
using (exists (
  select 1 from public."WorkspaceMember" m
  where m."workspaceId" = id
    and m."userId" = (select auth.uid())::text
));
grant select on table public."Workspace" to authenticated;

drop policy if exists "Users can read own subscriptions" on public."Subscription";
create policy "Users can read own subscriptions"
on public."Subscription" for select
to authenticated
using ("userId" = (select auth.uid())::text);
grant select on table public."Subscription" to authenticated;

drop policy if exists "Users can read own orders" on public."Order";
create policy "Users can read own orders"
on public."Order" for select
to authenticated
using ("userId" = (select auth.uid())::text);
grant select on table public."Order" to authenticated;

drop policy if exists "Members can read own telegram bots" on public."TelegramBot";
create policy "Members can read own telegram bots"
on public."TelegramBot" for select
to authenticated
using (exists (
  select 1 from public."WorkspaceMember" m
  where m."workspaceId" = "TelegramBot"."workspaceId"
    and m."userId" = (select auth.uid())::text
));
revoke all on table public."TelegramBot" from authenticated;
grant select (id, "workspaceId", "telegramBotId", username, "displayName", description, status, "createdAt", "updatedAt", "welcomeMessage") on public."TelegramBot" to authenticated;

drop policy if exists "Members can read own instagram accounts" on public."InstagramAccount";
create policy "Members can read own instagram accounts"
on public."InstagramAccount" for select
to authenticated
using (exists (
  select 1 from public."WorkspaceMember" m
  where m."workspaceId" = "InstagramAccount"."workspaceId"
    and m."userId" = (select auth.uid())::text
));
revoke all on table public."InstagramAccount" from authenticated;
grant select (id, "workspaceId", username, "displayName", "followersCount", "followingCount", "postsCount", "engagementRate", metrics, status, "lastSyncedAt", "createdAt", "updatedAt") on public."InstagramAccount" to authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists "WorkspaceMember_userId_idx" on public."WorkspaceMember" ("userId");
create index if not exists "TelegramBot_workspaceId_idx" on public."TelegramBot" ("workspaceId");
create index if not exists "ScheduledJob_workspaceId_idx" on public."ScheduledJob" ("workspaceId");
create index if not exists "Subscription_productId_idx" on public."Subscription" ("productId");
create index if not exists "Order_productId_idx" on public."Order" ("productId");