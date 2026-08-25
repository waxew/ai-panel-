# راهنمای خط‌به‌خط `20260823120957_workspace_owner_admin_v1.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create or replace function private.handle_new_auth_user()` — این دستور یک Function سمت PostgreSQL تعریف یا جایگزین می‌کند.
- خط 2: `returns trigger` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `language plpgsql` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 4: `security definer` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `set search_path = ''` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `as $$` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `declare` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `v_user_id text := new.id::text;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 9: `v_workspace_id text := new.id::text || ':workspace';` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 10: `begin` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 11: `insert into public."User" (id, email, "displayName")` — این دستور داده جدید در جدول درج می‌کند.
- خط 12: `values (v_user_id, coalesce(new.email, v_user_id || '@local.invalid'), null)` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 13: `on conflict (id) do update set email = excluded.email;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 15: `insert into public."Workspace" (id, name)` — این دستور داده جدید در جدول درج می‌کند.
- خط 16: `values (v_workspace_id, 'فضای کاری من')` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 17: `on conflict (id) do nothing;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 19: `insert into public."WorkspaceMember" (id, "workspaceId", "userId", role)` — این دستور داده جدید در جدول درج می‌کند.
- خط 20: `values (v_user_id || ':member', v_workspace_id, v_user_id, 'ADMIN')` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 21: `on conflict ("workspaceId", "userId") do update set role = 'ADMIN';` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 23: `insert into public."BookingSettings" ("workspaceId", "publicSlug")` — این دستور داده جدید در جدول درج می‌کند.
- خط 24: `values (v_workspace_id, 'workspace-' || left(replace(new.id::text, '-', ''), 8))` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 25: `on conflict ("workspaceId") do nothing;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 27: `return new;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 28: `end;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 29: `$$;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 31: `revoke all on function private.handle_new_auth_user() from public, anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.