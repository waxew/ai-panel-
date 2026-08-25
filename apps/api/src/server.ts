/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// فایل .env را در شروع برنامه می‌خواند تا متغیرهایی مثل DATABASE_URL و PORT داخل process.env قابل استفاده باشند.
// راهنما: این دستور فایل/ماژول را از ماژول «dotenv/config» وارد می‌کند تا در این فایل قابل استفاده باشد.
import 'dotenv/config';
// فریم‌ورک Fastify را برای ساخت HTTP API وارد می‌کنیم.
// راهنما: این دستور Fastify را از ماژول «fastify» وارد می‌کند تا در این فایل قابل استفاده باشد.
import Fastify from 'fastify';
// پلاگین CORS برای اجازه/کنترل درخواست‌های مرورگر از Originهای دیگر.
// راهنما: این دستور cors را از ماژول «@fastify/cors» وارد می‌کند تا در این فایل قابل استفاده باشد.
import cors from '@fastify/cors';
// پلاگین سرو فایل‌های Static مثل خروجی Build فرانت‌اند.
// راهنما: این دستور fastifyStatic را از ماژول «@fastify/static» وارد می‌کند تا در این فایل قابل استفاده باشد.
import fastifyStatic from '@fastify/static';
// توابع کمکی Node برای ساخت و مدیریت مسیر فایل‌ها.
// راهنما: این دستور { dirname, join } را از ماژول «node:path» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { dirname, join } from 'node:path';
// import.meta.url یک URL است؛ این تابع آن را به مسیر فایل سیستم تبدیل می‌کند.
// راهنما: این دستور { fileURLToPath } را از ماژول «node:url» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { fileURLToPath } from 'node:url';
// Routeهای مخصوص تلگرام را از فایل جداگانه وارد می‌کنیم.
// راهنما: این دستور { telegramRoutes } را از ماژول «./routes/telegram.js» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { telegramRoutes } from './routes/telegram.js';

// یک نمونه Fastify می‌سازیم و Logger داخلی را روشن می‌کنیم تا Requestها و خطاها ثبت شوند.
// راهنما: این دستور متغیر/ثابت «app» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const app = Fastify({ logger: true });

// پلاگین CORS را روی برنامه ثبت می‌کنیم.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await app.register(cors, { // اگر WEB_ORIGIN تنظیم شده باشد فقط همان Origin مبنا قرار می‌…».
await app.register(cors, {
  // اگر WEB_ORIGIN تنظیم شده باشد فقط همان Origin مبنا قرار می‌گیرد؛ در غیر این صورت true اجازه انعطاف بیشتری می‌دهد.
  origin: process.env.WEB_ORIGIN ?? true,
});

// Endpoint سلامت سرویس؛ برای تست اینکه API زنده و قابل دسترس است استفاده می‌شود.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «app.get('/health', async () => ({ // نشان می‌دهد پاسخ موفق است. ok: true, // نام سرویس را…».
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
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «app.get('/api/modules', async () => ({ // آرایه اطلاعات ماژول‌ها. modules: [ // تلگرام در…».
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
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await app.register(telegramRoutes, { prefix: '/api/telegram' })».
await app.register(telegramRoutes, { prefix: '/api/telegram' });

// مسیر پوشه‌ای که فایل server.ts/خروجی آن در آن قرار دارد محاسبه می‌شود.
// راهنما: این دستور متغیر/ثابت «currentDir» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const currentDir = dirname(fileURLToPath(import.meta.url));
// از مسیر فعلی به پوشه Build فرانت‌اند یعنی apps/web/dist می‌رسیم.
// راهنما: این دستور متغیر/ثابت «webDist» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const webDist = join(currentDir, '../../web/dist');

// Fastify را طوری تنظیم می‌کنیم که فایل‌های Build فرانت‌اند را هم سرو کند.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await app.register(fastifyStatic, { // ریشه فایل‌های Static همان webDist است. root: webDi…».
await app.register(fastifyStatic, {
  // ریشه فایل‌های Static همان webDist است.
  root: webDist,
  // فایل‌ها از ریشه URL در دسترس قرار می‌گیرند.
  prefix: '/',
  // Wildcard داخلی Static خاموش است چون fallback SPA را خودمان پایین‌تر مدیریت می‌کنیم.
  wildcard: false,
});

// Handler عمومی برای آدرس‌هایی که هیچ Route مستقیمی پیدا نکرده‌اند.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «app.setNotFoundHandler((request, reply) => { // اگر مسیر مربوط به API باشد نباید index.ht…».
app.setNotFoundHandler((request, reply) => {
  // اگر مسیر مربوط به API باشد نباید index.html برگردد؛ باید 404 واقعی API بدهیم.
  // راهنما: این شرط بررسی می‌کند آیا «request.url.startsWith('/api/')» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.url.startsWith('/api/')) {
    // پاسخ 404 JSON برای API ناشناخته.
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(404).send({ ok: false, message: 'API route not found' })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return reply.code(404).send({ ok: false, message: 'API route not found' });
  }

  // برای Routeهای فرانت‌اند index.html را می‌فرستیم تا SPA/React مسیر را مدیریت کند.
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.sendFile('index.html')» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return reply.sendFile('index.html');
});

// پورت سرور را ابتدا از PORT، بعد API_PORT و در نهایت عدد 4000 می‌گیریم.
// راهنما: این دستور متغیر/ثابت «port» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
// سرور را روی تمام Interfaceهای شبکه با آدرس 0.0.0.0 بالا می‌آوریم تا فقط محدود به localhost نباشد.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await app.listen({ port, host: '0.0.0.0' })».
await app.listen({ port, host: '0.0.0.0' });
