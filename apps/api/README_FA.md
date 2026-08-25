# راهنمای پوشه apps/api

این پوشه Backend مستقل Node.js/TypeScript پروژه است و با Fastify اجرا می‌شود.

## فایل‌ها
- `src/server.ts`: نقطه شروع سرور HTTP، CORS، Routeها، Static files و Listen.
- `src/db.ts`: ساخت Prisma Client و اتصال PostgreSQL.
- `src/lib/crypto.ts`: رمزنگاری Secretها مثل Tokenها قبل از ذخیره.
- `src/routes/telegram.ts`: Endpointهای مخصوص اتصال/مدیریت تلگرام.
- `src/services/telegram-api.ts`: Wrapper برای Telegram Bot API.
- `package.json`: وابستگی‌ها و Scriptهای API؛ JSON خالص و بدون قابلیت Comment.
- `tsconfig.json`: تنظیمات TypeScript.

## ارتباط فایل‌ها
`server.ts` Routeها را ثبت می‌کند. Routeها برای دیتابیس از `db.ts`، برای امنیت از `crypto.ts` و برای ارتباط با Telegram از `telegram-api.ts` استفاده می‌کنند.
