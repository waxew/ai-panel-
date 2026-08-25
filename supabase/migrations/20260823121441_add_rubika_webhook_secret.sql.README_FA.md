# راهنمای خط‌به‌خط `20260823121441_add_rubika_webhook_secret.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `alter table public."RubikaBot" add column "webhookSecretHash" text;` — این دستور ساختار یا Constraintهای یک جدول موجود را تغییر می‌دهد.