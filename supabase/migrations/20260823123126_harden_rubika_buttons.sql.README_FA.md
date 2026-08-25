# راهنمای خط‌به‌خط `20260823123126_harden_rubika_buttons.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create index if not exists "RubikaButton_parentId_idx" on public."RubikaButton" ("parentId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 3: `create policy "Members can read own rubika buttons"` — این دستور Policy مربوط به Row Level Security را تعریف می‌کند.
- خط 4: `on public."RubikaButton"` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `for select` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `to authenticated` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `using (` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `exists (` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 9: `select 1` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 10: `from public."RubikaBot" b` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 11: `join public."WorkspaceMember" m on m."workspaceId" = b."workspaceId"` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 12: `where b.id = "RubikaButton"."botId"` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 13: `and m."userId" = (select auth.uid())::text` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 14: `)` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 15: `);` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.