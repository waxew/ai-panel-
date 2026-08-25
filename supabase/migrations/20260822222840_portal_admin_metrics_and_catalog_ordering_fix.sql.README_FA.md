# راهنمای خط‌به‌خط `20260822222840_portal_admin_metrics_and_catalog_ordering_fix.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `update public."Product" set "sortOrder" = case id` — این دستور داده‌های موجود را به‌روزرسانی می‌کند.
- خط 2: `when 'telegram-bot' then 10` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `when 'instagram-smart-dm' then 20` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 4: `when 'whatsapp-business' then 30` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `when 'bale-bot' then 40` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `when 'rubika-bot' then 50` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `when 'discord-bot' then 60` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `when 'scheduler' then 70` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 9: `when 'analytics' then 80` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 10: `else "sortOrder"` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 11: `end;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 13: `create index if not exists "Order_status_createdAt_idx" on public."Order" (status, "createdAt" desc);` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 14: `create index if not exists "Subscription_status_expiresAt_idx" on public."Subscription" (status, "expiresAt");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 15: `create index if not exists "User_createdAt_idx" on public."User" ("createdAt" desc);` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.