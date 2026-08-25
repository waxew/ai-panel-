# راهنمای خط‌به‌خط `20260824171800_telegram_miniapp_identity_links.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create table if not exists public."TelegramIdentityLink" (` — این دستور یک جدول جدید در PostgreSQL ایجاد می‌کند.
- خط 2: `"telegramUserId" text primary key,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `"userId" text not null references public."User"(id) on delete cascade,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 4: `"username" text,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `"firstName" text,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `"lastName" text,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 7: `"photoUrl" text,` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `"linkedAt" timestamptz not null default now(),` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 9: `"lastSeenAt" timestamptz not null default now(),` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 10: `"createdAt" timestamptz not null default now(),` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 11: `"updatedAt" timestamptz not null default now()` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 12: `);` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 14: `create unique index if not exists "TelegramIdentityLink_userId_key"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 15: `on public."TelegramIdentityLink" ("userId");` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 17: `alter table public."TelegramIdentityLink" enable row level security;` — این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.
- خط 19: `comment on table public."TelegramIdentityLink" is` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 20: `'Verified Telegram Mini App identity links. Service-role only; no direct browser policies.';` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.