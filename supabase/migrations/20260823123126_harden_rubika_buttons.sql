create index if not exists "RubikaButton_parentId_idx" on public."RubikaButton" ("parentId");

create policy "Members can read own rubika buttons"
on public."RubikaButton"
for select
to authenticated
using (
  exists (
    select 1
    from public."RubikaBot" b
    join public."WorkspaceMember" m on m."workspaceId" = b."workspaceId"
    where b.id = "RubikaButton"."botId"
      and m."userId" = (select auth.uid())::text
  )
);