# راهنمای خط‌به‌خط `20260822213855_telegram_token_encryption_secret.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create table public."AppSecret" (` — این دستور یک جدول جدید در PostgreSQL ایجاد می‌کند.
- خط 2: `id text primary key,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `value text not null,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 4: `"createdAt" timestamptz not null default now()` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `);` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `alter table public."AppSecret" enable row level security;` — این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.
- خط 8: `revoke all on table public."AppSecret" from anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 9: `grant select on table public."AppSecret" to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 11: `insert into public."AppSecret" (id, value)` — این دستور داده جدید در جدول درج می‌کند.
- خط 12: `values ('telegram_token_encryption', encode(gen_random_bytes(32), 'hex'))` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 13: `on conflict (id) do nothing;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.