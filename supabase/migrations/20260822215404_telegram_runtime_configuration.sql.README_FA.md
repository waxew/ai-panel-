# راهنمای خط‌به‌خط `20260822215404_telegram_runtime_configuration.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `alter table public."TelegramBot"` — این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.
- خط 2: `add column if not exists "welcomeMessage" text not null default 'سلام! به ربات خوش آمدید. از منوی زیر یکی از گزینه‌ها را انتخاب کنید.',` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 3: `add column if not exists "webhookSecretHash" text;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `create index if not exists "TelegramButton_botId_sortOrder_idx"` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 6: `on public."TelegramButton" ("botId", "sortOrder");` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.