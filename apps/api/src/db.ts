/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// Adapter رسمی PostgreSQL برای Prisma را وارد می‌کنیم تا Prisma بتواند با PostgreSQL از طریق connection string کار کند.
// راهنما: این دستور { PrismaPg } را از ماژول «@prisma/adapter-pg» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { PrismaPg } from '@prisma/adapter-pg';
// PrismaClient تولیدشده از schema.prisma را وارد می‌کنیم؛ این Client متدهای دسترسی به مدل‌های دیتابیس را فراهم می‌کند.
// راهنما: این دستور { PrismaClient } را از ماژول «./generated/prisma/client.js» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { PrismaClient } from './generated/prisma/client.js';

// آدرس اتصال دیتابیس را از متغیر محیطی DATABASE_URL می‌خوانیم؛ مقدار Secret واقعی نباید داخل سورس نوشته شود.
// راهنما: این دستور متغیر/ثابت «connectionString» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const connectionString = process.env.DATABASE_URL;

// یک نمونه مشترک Prisma برای استفاده Routeها و Serviceها Export می‌کنیم.
// راهنما: این دستور متغیر/ثابت «prisma» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
export const prisma = connectionString
  // اگر DATABASE_URL وجود داشته باشد، PrismaClient با Adapter PostgreSQL ساخته می‌شود.
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  // اگر DATABASE_URL تنظیم نشده باشد، به‌جای تلاش برای اتصال مقدار null می‌دهیم تا کد بتواند نبود دیتابیس را تشخیص دهد.
  : null;
