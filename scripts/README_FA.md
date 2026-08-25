# راهنمای فارسی پوشه `scripts`

این پوشه ابزارهای کمکی توسعه و نگهداری Repository را نگه می‌دارد و جزو صفحه‌های UI یا API اصلی محصول نیست.

## `add-persian-inline-comments.mjs`

این فایل برای درخواست فعلی مستندسازی ساخته شده است. کار آن این است که سورس‌های پروژه را بخواند و بدون تغییر منطق برنامه، توضیح فارسی به آن‌ها اضافه کند.

ساختار کلی آن:

- `import fs from 'node:fs'`: برای خواندن و نوشتن فایل‌ها از File System Node.js.
- `import path from 'node:path'`: برای ساخت و مقایسه مسیر فایل‌ها.
- `import ts from 'typescript'`: برای Parse کردن TypeScript/TSX با AST به‌جای جستجو و جایگزینی کورکورانه متن.
- `walk(...)`: پوشه‌ها را پیمایش می‌کند و فایل‌های هدف را پیدا می‌کند؛ پوشه‌هایی مانند `node_modules`، `dist` و `.git` را رد می‌کند.
- `describeTsNode(...)`: بر اساس نوع هر Node در AST یک توضیح فارسی برای Import، Type، Variable، Function، If، Return، useEffect، fetch و دستورهای دیگر تولید می‌کند.
- `annotateTs(...)`: جای امن درج کامنت‌ها را پیدا می‌کند، کامنت‌ها را اضافه می‌کند و فایل جدید را دوباره Parse می‌کند تا خطای Syntax جدید ایجاد نشده باشد.
- `annotatePrisma(...)`: برای خطوط `schema.prisma` توضیح متناسب با Model، Enum، Field، Relation و تنظیمات تولید می‌کند.
- `annotateHashConfig(...)`: فایل‌های YAML/TOML را با `#` مستند می‌کند.
- `annotateCss(...)`: برای Ruleها و Propertyهای CSS کامنت `/* ... */` اضافه می‌کند.
- `annotateEnvOrIgnore(...)`: `.env.example` و `.gitignore` را توضیح می‌دهد.
- `jsonGuide(...)`: چون JSON کامنت قبول نمی‌کند، فایل `README_FA.md` کنار JSON تولید می‌کند.
- `sqlGuide(...)`: چون تزریق خودکار کامنت در همه خطوط Migrationهای پیچیده SQL می‌تواند Function body یا رشته‌های چندخطی را تغییر دهد، راهنمای خطی کنار فایل SQL تولید می‌کند.

این Script برای مستندسازی است و برای اجرای معمول AI Panel نیازی نیست آن را دستی اجرا کنی.
