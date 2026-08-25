# راهنمای فارسی `package.json`

فایل اصلی: `apps/cloudflare/package.json`

> JSON استاندارد کامنت را پشتیبانی نمی‌کند؛ بنابراین اگر داخل فایل اصلی `//` یا `#` بگذاریم ابزارهایی مثل npm یا TypeScript آن را نامعتبر می‌دانند. توضیح خط/کلیدها در این فایل کنار آن نگهداری می‌شود.

## `name`
نام پکیج یا Workspace را مشخص می‌کند.
- مقدار فعلی: `@ai-panel/cloudflare`

## `private`
مشخص می‌کند پکیج نباید ناخواسته در Registry عمومی منتشر شود.
- مقدار فعلی: `true`

## `version`
نسخه پکیج را مشخص می‌کند.
- مقدار فعلی: `0.1.0`

## `type`
نوع سیستم ماژول Node، مانند ESM، را تعیین می‌کند.
- مقدار فعلی: `module`

## `scripts`
دستورهای قابل اجرای npm/pnpm را تعریف می‌کند.
- `dev`: کلید «dev» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.
- `deploy`: کلید «deploy» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.
- `typecheck`: کلید «typecheck» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.

## `dependencies`
کتابخانه‌هایی را فهرست می‌کند که برنامه در Runtime به آن‌ها نیاز دارد.
- `@ai-panel/shared`: کلید «@ai-panel/shared» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.

## `devDependencies`
ابزارهایی را فهرست می‌کند که بیشتر برای توسعه، Build، Typecheck یا تست استفاده می‌شوند.
- `@cloudflare/workers-types`: کلید «@cloudflare/workers-types» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.
- `typescript`: کلید «typescript» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.
- `wrangler`: کلید «wrangler» بخشی از تنظیمات این فایل JSON است و مقدار آن از نوع string است.
