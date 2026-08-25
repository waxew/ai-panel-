# راهنمای پوشه apps/cloudflare

این پوشه Cloudflare Worker اصلی پروژه را نگه می‌دارد.

## فایل‌ها
- `src/index.ts`: Entry point اصلی Worker؛ APIها و درخواست‌های پروژه را پردازش می‌کند.
- `src/telegram-miniapp.ts`: منطق اختصاصی Mini App تلگرام در محیط Cloudflare.
- `wrangler.jsonc`: تنظیمات Wrangler؛ نام Worker، Entry point، Assets و رفتار SPA.
- `package.json`: وابستگی‌ها و Scriptهای اجرای Worker.
- `tsconfig.json`: تنظیم TypeScript.

## ارتباط با Web
Worker پوشه `apps/web/dist` را به عنوان Static Assets سرو می‌کند. بنابراین قبل از اجرای بعضی حالت‌های Wrangler باید Web Build شده باشد.

## ابزار
Wrangler ابزار رسمی توسعه و Deploy کردن Cloudflare Workers است. `wrangler dev` محیط توسعه و `wrangler deploy` انتشار را انجام می‌دهد.
