// Adapter رسمی PostgreSQL برای Prisma را وارد می‌کنیم تا Prisma بتواند با PostgreSQL از طریق connection string کار کند.
import { PrismaPg } from '@prisma/adapter-pg';
// PrismaClient تولیدشده از schema.prisma را وارد می‌کنیم؛ این Client متدهای دسترسی به مدل‌های دیتابیس را فراهم می‌کند.
import { PrismaClient } from './generated/prisma/client.js';

// آدرس اتصال دیتابیس را از متغیر محیطی DATABASE_URL می‌خوانیم؛ مقدار Secret واقعی نباید داخل سورس نوشته شود.
const connectionString = process.env.DATABASE_URL;

// یک نمونه مشترک Prisma برای استفاده Routeها و Serviceها Export می‌کنیم.
export const prisma = connectionString
  // اگر DATABASE_URL وجود داشته باشد، PrismaClient با Adapter PostgreSQL ساخته می‌شود.
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  // اگر DATABASE_URL تنظیم نشده باشد، به‌جای تلاش برای اتصال مقدار null می‌دهیم تا کد بتواند نبود دیتابیس را تشخیص دهد.
  : null;
