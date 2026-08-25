# راهنمای خط‌به‌خط `20260823114457_booking_security_perf_cleanup_v1.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create schema if not exists extensions;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `alter extension btree_gist set schema extensions;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `create index if not exists "BookingMessageOutbox_appointmentId_idx"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 6: `on public."BookingMessageOutbox"("appointmentId");` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `create index if not exists "BookingMessageOutbox_ruleId_idx"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 9: `on public."BookingMessageOutbox"("ruleId");` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.