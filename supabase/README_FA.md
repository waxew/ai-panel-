# راهنمای Supabase در AI Panel

## `config.toml`
تنظیمات Supabase CLI و محیط Local را نگه می‌دارد. بخش‌های API، Auth، Database، Studio و Edge Functions از این فایل پیکربندی می‌شوند.

## `functions/`
هر زیرپوشه معمولاً یک Supabase Edge Function مستقل است. فایل `index.ts` داخل آن Entry point همان Function است. این کدها توسط برنامه‌نویس نوشته می‌شوند و روی Runtime سروری Supabase اجرا می‌شوند.

گروه‌های مهم:
- `account-*`: عملیات حساب کاربری.
- `admin-*`: عملیات پنل مدیریت.
- `telegram-*`: اتصال، مدیریت و Webhook تلگرام.
- `bale-*`: اتصال/مدیریت/وبهوک بله.
- `booking-*`: ماژول‌های سیستم Time/Booking.
- Functionهای Instagram/WhatsApp/Rubika/Discord: Backend شبکه‌های اجتماعی مربوطه.

## `migrations/`
فایل‌های SQL تاریخچه تغییرات دیتابیس PostgreSQL هستند. هر Migration معمولاً یک تغییر Schema، Table، Policy، Index، Function یا Trigger را ثبت می‌کند.

### قواعد مهم Migration
- Migration اعمال‌شده روی محیط واقعی را بدون بررسی دوباره ویرایش نکنید.
- برای تغییر جدید معمولاً Migration جدید ساخته می‌شود.
- دستورات SQL با `--` یا `/* ... */` قابل توضیح‌گذاری هستند، اما توضیح نباید ترتیب و Syntax اجرای SQL را خراب کند.

## چه چیزی تولیدی است؟
بعضی Metadata/Stateهای محلی Supabase توسط CLI ساخته می‌شوند. سورس مهم و قابل توسعه معمولاً `functions`، `migrations` و `config.toml` است.
