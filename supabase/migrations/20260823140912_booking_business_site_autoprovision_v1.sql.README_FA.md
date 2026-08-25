# راهنمای خط‌به‌خط `20260823140912_booking_business_site_autoprovision_v1.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create schema if not exists private;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 2: `create or replace function private.booking_business_site_autoprovision()` — این دستور یک Function سمت PostgreSQL تعریف یا جایگزین می‌کند.
- خط 3: `returns trigger` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 4: `language plpgsql` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `security definer` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `set search_path = ''` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `as $$` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `declare` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 9: `v_slug text;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 10: `begin` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 11: `v_slug := 'workspace-' || substr(replace(new.id, ':workspace', ''), 1, 8);` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 12: `insert into public."BookingBusinessSite"("workspaceId", slug, "brandName")` — این دستور داده جدید در جدول درج می‌کند.
- خط 13: `values (new.id, v_slug, new.name)` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 14: `on conflict ("workspaceId") do nothing;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 15: `return new;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 16: `end;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 17: `$$;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 18: `revoke all on function private.booking_business_site_autoprovision() from public, anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 19: `drop trigger if exists booking_business_site_autoprovision on public."Workspace";` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 20: `create trigger booking_business_site_autoprovision` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 21: `after insert on public."Workspace"` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 22: `for each row execute function private.booking_business_site_autoprovision();` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.