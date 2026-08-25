# راهنمای خط‌به‌خط `20260823114521_booking_customer_crm_v1.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `alter table public."BookingCustomer"` — این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.
- خط 2: `add column if not exists tags text[] not null default '{}'::text[],` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `add column if not exists "isVip" boolean not null default false;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `create index if not exists "BookingCustomer_workspace_tags_idx"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 6: `on public."BookingCustomer" using gin(tags);` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `create index if not exists "BookingCustomer_workspace_vip_idx"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 9: `on public."BookingCustomer"("workspaceId", "isVip");` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.