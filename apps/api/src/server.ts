// فایل .env را در شروع برنامه می‌خواند تا متغیرهایی مثل DATABASE_URL و PORT داخل process.env قابل استفاده باشند.
import 'dotenv/config';
// فریم‌ورک Fastify را برای ساخت HTTP API وارد می‌کنیم.
import Fastify from 'fastify';
// پلاگین CORS برای اجازه/کنترل درخواست‌های مرورگر از Originهای دیگر.
import cors from '@fastify/cors';
// پلاگین سرو فایل‌های Static مثل خروجی Build فرانت‌اند.
import fastifyStatic from '@fastify/static';
// توابع کمکی Node برای ساخت و مدیریت مسیر فایل‌ها.
import { dirname, join } from 'node:path';
// import.meta.url یک URL است؛ این تابع آن را به مسیر فایل سیستم تبدیل می‌کند.
import { fileURLToPath } from 'node:url';
// Routeهای مخصوص تلگرام را از فایل جداگانه وارد می‌کنیم.
import { telegramRoutes } from './routes/telegram.js';

// یک نمونه Fastify می‌سازیم و Logger داخلی را روشن می‌کنیم تا Requestها و خطاها ثبت شوند.
const app = Fastify({ logger: true });

// پلاگین CORS را روی برنامه ثبت می‌کنیم.
await app.register(cors, {
  // اگر WEB_ORIGIN تنظیم شده باشد فقط همان Origin مبنا قرار می‌گیرد؛ در غیر این صورت true اجازه انعطاف بیشتری می‌دهد.
  origin: process.env.WEB_ORIGIN ?? true,
});

// Endpoint سلامت سرویس؛ برای تست اینکه API زنده و قابل دسترس است استفاده می‌شود.
app.get('/health', async () => ({
  // نشان می‌دهد پاسخ موفق است.
  ok: true,
  // نام سرویس را برای تشخیص در لاگ/مانیتورینگ برمی‌گرداند.
  service: 'ai-panel-api',
  // اگر DATABASE_URL وجود نداشته باشد سرویس عملاً در Demo Mode است.
  demoMode: !process.env.DATABASE_URL,
  // زمان فعلی سرور را به فرمت ISO برمی‌گرداند.
  timestamp: new Date().toISOString(),
}));

// Endpoint ساده‌ای که وضعیت فعال/غیرفعال بودن ماژول‌های پروژه را برمی‌گرداند.
app.get('/api/modules', async () => ({
  // آرایه اطلاعات ماژول‌ها.
  modules: [
    // تلگرام در فاز 1 فعال است.
    { key: 'telegram', enabled: true, phase: 1 },
    // اینستاگرام در این API قدیمی به‌عنوان فاز 2 و غیرفعال علامت خورده است.
    { key: 'instagram', enabled: false, phase: 2 },
    // Scheduler در فاز 1 فعال است.
    { key: 'scheduler', enabled: true, phase: 1 },
    // Analytics در این تعریف فاز 2 است.
    { key: 'analytics', enabled: false, phase: 2 },
  ],
}));

// تمام Routeهای telegramRoutes را با پیشوند /api/telegram ثبت می‌کنیم.
await app.register(telegramRoutes, { prefix: '/api/telegram' });

// مسیر پوشه‌ای که فایل server.ts/خروجی آن در آن قرار دارد محاسبه می‌شود.
const currentDir = dirname(fileURLToPath(import.meta.url));
// از مسیر فعلی به پوشه Build فرانت‌اند یعنی apps/web/dist می‌رسیم.
const webDist = join(currentDir, '../../web/dist');

// Fastify را طوری تنظیم می‌کنیم که فایل‌های Build فرانت‌اند را هم سرو کند.
await app.register(fastifyStatic, {
  // ریشه فایل‌های Static همان webDist است.
  root: webDist,
  // فایل‌ها از ریشه URL در دسترس قرار می‌گیرند.
  prefix: '/',
  // Wildcard داخلی Static خاموش است چون fallback SPA را خودمان پایین‌تر مدیریت می‌کنیم.
  wildcard: false,
});

// Handler عمومی برای آدرس‌هایی که هیچ Route مستقیمی پیدا نکرده‌اند.
app.setNotFoundHandler((request, reply) => {
  // اگر مسیر مربوط به API باشد نباید index.html برگردد؛ باید 404 واقعی API بدهیم.
  if (request.url.startsWith('/api/')) {
    // پاسخ 404 JSON برای API ناشناخته.
    return reply.code(404).send({ ok: false, message: 'API route not found' });
  }

  // برای Routeهای فرانت‌اند index.html را می‌فرستیم تا SPA/React مسیر را مدیریت کند.
  return reply.sendFile('index.html');
});

// پورت سرور را ابتدا از PORT، بعد API_PORT و در نهایت عدد 4000 می‌گیریم.
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
// سرور را روی تمام Interfaceهای شبکه با آدرس 0.0.0.0 بالا می‌آوریم تا فقط محدود به localhost نباشد.
await app.listen({ port, host: '0.0.0.0' });
