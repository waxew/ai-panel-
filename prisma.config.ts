/**
 * AI-PANEL-FA-INLINE-GUIDE
 * راهنمای فارسی تنظیمات Prisma در سطح ریشه پروژه.
 * این کامنت‌ها فقط برای آموزش هستند و در اجرای برنامه نقشی ندارند.
 */

// راهنما: این Import فایل‌های .env را بارگذاری می‌کند تا متغیرهایی مثل DATABASE_URL از process.env قابل خواندن باشند.
import 'dotenv/config';

// راهنما: تابع defineConfig را از پکیج رسمی Prisma وارد می‌کند تا تنظیمات Prisma با ساختار معتبر تعریف شوند.
import { defineConfig } from 'prisma/config';

// راهنما: تنظیمات اصلی Prisma CLI از این فایل Export می‌شود تا دستورهای Prisma هنگام اجرا آن را بخوانند.
export default defineConfig({
  // راهنما: مشخص می‌کند فایل اصلی Schema دیتابیس Prisma در چه مسیری قرار دارد.
  schema: 'prisma/schema.prisma',

  // راهنما: تنظیمات مربوط به Migrationهای Prisma در این بخش قرار می‌گیرد.
  migrations: {
    // راهنما: مسیر پوشه‌ای را تعیین می‌کند که Migrationهای Prisma در آن خوانده/ساخته می‌شوند.
    path: 'prisma/migrations',
  },

  // راهنما: تنظیمات اتصال به منبع داده یا Database در این بخش تعریف می‌شود.
  datasource: {
    // راهنما: ابتدا DATABASE_URL را از محیط می‌خواند؛ اگر وجود نداشته باشد فقط برای حالت Demo/Local از آدرس PostgreSQL پیش‌فرض استفاده می‌کند.
    url: process.env.DATABASE_URL ?? 'postgresql://demo:demo@localhost:5432/demo',
  },
});
