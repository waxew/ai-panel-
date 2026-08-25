# راهنمای فارسی پوشه `.github`

این پوشه تنظیمات و فایل‌های مربوط به GitHub و GitHub Actions را نگه می‌دارد. کد اصلی UI یا Backend از این پوشه اجرا نمی‌شود؛ GitHub در سمت سرور خودش این فایل‌ها را برای CI/CD و Automation می‌خواند.

## `workflows/cloudflare-preview.yml`

این Workflow خط‌به‌خط داخل خود فایل با کامنت فارسی مستند شده است. وظیفه آن Build، بررسی و در شرایط تعیین‌شده Deploy کردن قسمت‌های AI Panel به Cloudflare/Supabase است.

قاعده کلی YAML:
- `name`: نام Workflow یا Step.
- `on`: رویدادهایی که Workflow را اجرا می‌کنند.
- `permissions`: سطح دسترسی Token اجرای Workflow.
- `jobs`: مجموعه Jobها.
- `steps`: مراحل هر Job.
- `uses`: استفاده از یک GitHub Action آماده.
- `run`: اجرای یک فرمان Shell.
- `if`: شرط اجرای Step/Job.
- `with`: ورودی‌های Action.
- `env`: متغیرهای محیطی.

## `workflows/persian-inline-comments.yml`

این Workflow برای درخواست آموزشی فعلی ساخته شده است. وظیفه آن اجرای `scripts/add-persian-inline-comments.mjs` و تولید کامنت‌های فارسی روی سورس پروژه بوده است. فایل اصلی پروژه برای Runtime به این Workflow وابسته نیست؛ این فقط ابزار مستندسازی است.

## `cloudflare-diagnostic.txt`

این فایل کد اجرایی نیست؛ یک Log/Diagnostic ذخیره‌شده از اجرای قبلی Cloudflare CI است. سطرهای آن اطلاعاتی مانند Commit، نسخه Node، نسخه pnpm، نتیجه نصب و Log نصب Dependencyها را ثبت می‌کنند.

نمونه معنی خطوط:
- `commit=...`: SHA کامیتی که تست روی آن انجام شده است.
- `node=...`: نسخه Node.js Runner.
- `pnpm=...`: نسخه pnpm.
- `install_status=1`: کد خروجی مرحله Install؛ مقدار غیرصفر معمولاً یعنی مرحله با خطا پایان یافته است.
- `Progress: ...`: گزارش پیشرفت pnpm هنگام Resolve/Download/Install پکیج‌ها.
- `Packages: +...`: تعداد پکیج‌های اضافه‌شده.
- `devDependencies`: Dependencyهای توسعه نصب‌شده.
- `ERR_PNPM_...`: خطای گزارش‌شده توسط pnpm.

چون `cloudflare-diagnostic.txt` یک خروجی تشخیصی/Log است، افزودن کامنت داخل آن داده تاریخی Log را تغییر می‌دهد؛ بنابراین توضیح آن در این فایل کنار Log نگهداری می‌شود.
