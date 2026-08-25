# راهنمای فارسی ساختار و کدهای AI Panel

این فایل برای یادگیری ساختار پروژه ساخته شده است تا هنگام باز کردن پروژه در VS Code بدانید هر پوشه، فایل و نوع فایل چه نقشی دارد و کدام بخش توسط برنامه‌نویس نوشته شده و کدام بخش توسط ابزارها تولید یا نصب می‌شود.

> نکته مهم: فایل‌های اجرایی پروژه تا حد ممکن داخل خودشان هم با کامنت فارسی توضیح داده می‌شوند. فایل‌هایی که فرمتشان کامنت را پشتیبانی نمی‌کند یا توسط ابزارها تولید می‌شوند، نباید با کامنت دستی خراب شوند؛ توضیح آن‌ها در این راهنما نگهداری می‌شود.

## 1) فایل‌ها و پوشه‌های تولیدشده یا نصب‌شده

### `node_modules/`
- توسط برنامه‌نویس نوشته نمی‌شود.
- با `pnpm install` از روی `package.json` و `pnpm-lock.yaml` ساخته می‌شود.
- شامل کد کتابخانه‌هایی مانند React، Vite، Wrangler، TypeScript و وابستگی‌های دیگر است.
- در Git نگهداری نمی‌شود و در `.gitignore` قرار دارد.
- هر تغییری داخل آن با نصب مجدد وابستگی‌ها از بین می‌رود؛ بنابراین جای مناسبی برای نوشتن توضیح یا تغییر کد پروژه نیست.

### `dist/`
- کد منبع نیست؛ خروجی Build است.
- در بخش Web معمولاً با `pnpm --filter @ai-panel/web build` تولید می‌شود.
- Vite و TypeScript فایل‌های `src` را پردازش می‌کنند و خروجی قابل سرو در مرورگر را در `dist` قرار می‌دهند.
- در Git نگهداری نمی‌شود و با Build بعدی دوباره ساخته می‌شود.

### `pnpm-lock.yaml`
- عمدتاً توسط pnpm مدیریت می‌شود.
- نسخه دقیق تمام وابستگی‌ها را قفل می‌کند تا نصب روی سیستم‌های مختلف قابل تکرار باشد.
- معمولاً نباید دستی ویرایش شود.

## 2) ریشه پروژه

### `package.json`
فایل مدیریت Monorepo در سطح ریشه است. نام پروژه، اسکریپت‌های کلی و وابستگی‌های توسعه در آن تعریف می‌شوند. JSON استاندارد کامنت را قبول نمی‌کند، بنابراین توضیح مستقیم بین خطوط این فایل باعث خراب شدن JSON می‌شود.

### `pnpm-workspace.yaml`
به pnpm می‌گوید کدام پوشه‌ها عضو Workspace هستند؛ در این پروژه برنامه‌های داخل `apps/*` و پکیج‌های مشترک داخل `packages/*` با هم یک Monorepo را تشکیل می‌دهند.

### `.env.example`
نمونه نام متغیرهای محیطی موردنیاز پروژه است. مقدار Secret واقعی نباید در این فایل Commit شود. توسعه‌دهنده از روی آن فایل `.env` شخصی خودش را می‌سازد.

### `.gitignore`
مشخص می‌کند Git چه فایل‌ها/پوشه‌هایی را دنبال نکند؛ مانند `node_modules`، `dist`، `.env` و فایل‌های Log.

### `docker-compose.yml`
برای بالا آوردن سرویس‌های موردنیاز پروژه با Docker استفاده می‌شود. این فایل زیرساخت محلی را تعریف می‌کند، نه UI برنامه را.

### `prisma.config.ts`
تنظیمات Prisma CLI را نگه می‌دارد و به Prisma می‌گوید Schema و تنظیمات اتصال/Generation از کجا خوانده شوند.

### `README.md`
راهنمای شروع پروژه است.

### `ARCHITECTURE*.md` و `PROJECT_STATE.md`
اسناد معماری و وضعیت پروژه‌اند و مستقیماً در Runtime اجرا نمی‌شوند.

## 3) پوشه `apps/`

این پوشه برنامه‌های اجرایی پروژه را نگه می‌دارد.

### `apps/web/` — رابط کاربری
این بخش React + TypeScript + Vite است و چیزی است که در مرورگر می‌بینید.

- `index.html`: پوسته HTML اولیه. Vite برنامه React را داخل عنصر `#root` قرار می‌دهد.
- `package.json`: وابستگی‌ها و Scriptهای مخصوص Web مانند `dev` و `build`.
- `src/main.tsx`: نقطه ورود اصلی React و مسیریاب سطح اول پروژه. با توجه به URL تصمیم می‌گیرد کدام صفحه/Control Center نمایش داده شود.
- `src/App.tsx`: بخش قدیمی/عمومی برنامه، Landing، Login/Register و بخشی از پنل را مدیریت می‌کند.
- `src/CustomerHome.tsx`: داشبورد اصلی مشتری.
- `src/TelegramControlCenter.tsx`: پنل مدیریت ربات تلگرام.
- `src/InstagramControlCenter.tsx`: پنل اینستاگرام.
- `src/WhatsAppControlCenter.tsx`: پنل واتساپ.
- `src/BaleControlCenter.tsx`: پنل بله.
- `src/RubikaControlCenter.tsx`: پنل روبیکا.
- `src/DiscordControlCenter.tsx`: پنل دیسکورد.
- `src/AnalyticsDashboard.tsx`: آمار و تحلیل‌ها.
- فایل‌های `Booking*.tsx`: قسمت‌های مختلف سیستم نوبت‌دهی، مشتریان، کارکنان، مالی، گزارش، وفاداری، Inbox، Automations و سایت عمومی.
- `src/TelegramProjectMiniAppV2.tsx`: Mini App پروژه برای تلگرام.
- `src/styles.css`: استایل‌های CSS مشترک رابط کاربری.

فایل‌های `.tsx` توسط برنامه‌نویس نوشته می‌شوند. پسوند TSX یعنی TypeScript همراه JSX، یعنی امکان نوشتن ساختار UI شبیه HTML داخل TypeScript.

### `apps/api/` — API مبتنی بر Node
Backend مستقل Node/TypeScript پروژه است.

- `src/server.ts`: سرور را می‌سازد، Middleware/Routeها را متصل می‌کند و Listen را شروع می‌کند.
- `src/db.ts`: دسترسی مشترک به Prisma/Database.
- `src/routes/telegram.ts`: Endpointهای مرتبط با تلگرام.
- `src/services/telegram-api.ts`: ارتباط سطح پایین‌تر با Telegram Bot API.
- `src/lib/crypto.ts`: توابع رمزنگاری/رمزگشایی Secretها.
- `package.json`: وابستگی‌ها و Scriptهای API.
- `tsconfig.json`: تنظیمات TypeScript مخصوص API.

### `apps/cloudflare/` — Worker و API لبه Cloudflare
این برنامه با Wrangler اجرا/Deploy می‌شود و بخش مهم Runtime آنلاین فعلی پروژه است.

- `src/index.ts`: Worker اصلی؛ Requestهای API و Assets را مدیریت می‌کند.
- `src/telegram-miniapp.ts`: منطق مرتبط با Mini App تلگرام در Worker.
- `wrangler.jsonc`: تنظیم Cloudflare Worker، مسیر Entry Point، Assets و تاریخ Compatibility. JSONC برخلاف JSON معمولی اجازه کامنت دارد.
- `package.json`: Scriptهای Wrangler مانند `dev` و `deploy`.

### `apps/worker/`
Worker جداگانه برای کارهای Background/Queue است.

- `src/index.ts`: Entry point پردازش Worker.
- این بخش معمولاً برای Jobهایی مناسب است که نباید در Request اصلی کاربر اجرا شوند.

## 4) پوشه `packages/shared/`

کد مشترکی که چند برنامه (`web`، `api`، `cloudflare` و Workerها) می‌توانند استفاده کنند اینجا قرار می‌گیرد.

- `src/index.ts`: Export مرکزی پکیج.
- `src/bot-commerce.ts`: مدل‌ها/تعاریف مشترک تجارت و Bot Commerce.
- `src/modules.ts`: تعریف ماژول‌های پلتفرم و اطلاعات مشترک آن‌ها.
- `src/providers.ts`: تعریف Providerها/کانال‌های خارجی.

هدف این پوشه جلوگیری از کپی کردن یک Type یا Constant مشابه در چند برنامه است.

## 5) پوشه `prisma/`

### `schema.prisma`
نقشه دیتابیس در Prisma است. Modelها، Relationها، Enumها و فیلدهای دیتابیس در این فایل تعریف می‌شوند. این فایل توسط برنامه‌نویس نوشته می‌شود و Prisma بر اساس آن Client یا Migration تولید می‌کند.

قاعده ساده:
- `model` تقریباً معادل یک موجودیت/جدول برنامه است.
- هر خط داخل Model یک فیلد/ستون یا Relation را توصیف می‌کند.
- `@id` کلید اصلی است.
- `@unique` مقدار یکتا می‌خواهد.
- `@default(...)` مقدار پیش‌فرض تعیین می‌کند.
- `@relation(...)` رابطه بین Modelها را تعریف می‌کند.

## 6) پوشه `supabase/`

این پوشه زیرساخت Backend مبتنی بر Supabase را نگه می‌دارد.

### `config.toml`
تنظیم پروژه Supabase CLI محلی است: Auth، API، Database، Studio و Edge Functionها.

### `functions/`
هر زیرپوشه معمولاً یک Supabase Edge Function مستقل است. این Functionها Backendهای کوچک Serverless هستند و اغلب فایل `index.ts` دارند.

نمونه گروه‌ها:
- `account-*`: حساب کاربری.
- `admin-*`: پنل مدیر.
- `telegram-*`: اتصال، مدیریت و Webhook تلگرام.
- `bale-*`: اتصال/مدیریت/وبهوک بله.
- `booking-*`: بخش‌های مختلف سیستم نوبت‌دهی.
- Functionهای Instagram/WhatsApp/Rubika/Discord: منطق Server-side همان شبکه.

### `migrations/`
فایل‌های SQL تاریخچه تغییرات ساختار دیتابیس Supabase/Postgres هستند. این‌ها باید ترتیبی اجرا شوند و دستکاری Migrationهای قبلاً اعمال‌شده باید با احتیاط انجام شود.

## 7) پوشه `.github/`

### `.github/workflows/*.yml`
Workflowهای GitHub Actions هستند. GitHub با Push/PR یا Trigger مشخص آن‌ها را اجرا می‌کند. برای Build، Test و Deploy خودکار استفاده می‌شوند.

### `.github/cloudflare-diagnostic.txt`
خروجی/یادداشت تشخیصی مربوط به Cloudflare است و کد اجرایی برنامه نیست.

## 8) پوشه `deploy/`

فایل‌های مربوط به استقرار سرویس‌ها را نگه می‌دارد. این فایل‌ها معمولاً توسط Docker/Render/Cloudflare یا ابزارهای Deployment خوانده می‌شوند و UI نیستند.

## 9) فرق «نوشته‌شده توسط ما» و «ساخته‌شده توسط ابزار»

### معمولاً توسط ما/برنامه‌نویس نوشته می‌شود
- `apps/**/src/**`
- `packages/shared/src/**`
- `prisma/schema.prisma`
- `supabase/functions/**`
- `supabase/migrations/**`
- فایل‌های Workflow و Config
- HTML/CSS پروژه

### معمولاً ابزار تولید/نصب می‌کند
- `node_modules/`
- `dist/`
- Cacheها
- Coverage
- Logها
- بخش عمده `pnpm-lock.yaml`

## 10) قانون کامنت‌گذاری این نسخه آموزشی

برای اینکه پروژه همچنان قابل اجرا بماند:

1. TypeScript/JavaScript: از `//` و `/* ... */` استفاده می‌شود.
2. داخل JSX/TSX در جایی که کامنت بین عناصر لازم باشد از `{/* ... */}` استفاده می‌شود.
3. CSS: از `/* ... */` استفاده می‌شود.
4. HTML: از `<!-- ... -->` استفاده می‌شود.
5. SQL: از `--` یا `/* ... */` استفاده می‌شود.
6. Prisma: از `//` استفاده می‌شود.
7. YAML/TOML: از `#` استفاده می‌شود.
8. JSON خالص (`package.json`) کامنت ندارد؛ توضیح آن در این راهنما یا فایل Guide کنار آن نوشته می‌شود.
9. فایل تولیدی/وابستگی Vendor دستکاری نمی‌شود، چون دوباره تولید می‌شود یا ممکن است پروژه را بشکند.

## 11) مسیر اجرای پروژه روی لپ‌تاپ

ترتیب کلی:

1. GitHub → `git pull`
2. نصب وابستگی‌ها → `pnpm install`
3. در صورت نیاز Build وب → `pnpm --filter @ai-panel/web build`
4. اجرای محیط توسعه → `pnpm dev`
5. باز کردن URL محلی که Vite/Wrangler چاپ می‌کند.

این Guide بخشی از خود Repository است؛ بنابراین پس از Pull در VS Code نیز قابل مشاهده خواهد بود.
