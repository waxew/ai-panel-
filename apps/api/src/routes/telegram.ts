/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور type { FastifyInstance } را از ماژول «fastify» وارد می‌کند تا در این فایل قابل استفاده باشد.
import type { FastifyInstance } from 'fastify';
// راهنما: این دستور { randomUUID } را از ماژول «node:crypto» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { randomUUID } from 'node:crypto';
// راهنما: این دستور { z } را از ماژول «zod» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { z } from 'zod';
// راهنما: این دستور { prisma } را از ماژول «../db.js» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { prisma } from '../db.js';
// راهنما: این دستور { encryptSecret } را از ماژول «../lib/crypto.js» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { encryptSecret } from '../lib/crypto.js';
// راهنما: این دستور { verifyTelegramBot } را از ماژول «../services/telegram-api.js» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { verifyTelegramBot } from '../services/telegram-api.js';

// راهنما: این دستور متغیر/ثابت «connectSchema» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const connectSchema = z.object({
  token: z.string().min(20),
  workspaceId: z.string().min(1).optional(),
});

// راهنما: این تابع «parseTelegramToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function parseTelegramToken(token: string) {
  // راهنما: این دستور متغیر/ثابت «match» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  // راهنما: این شرط بررسی می‌کند آیا «!match» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!match) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ botId: match[1], maskedToken: `${match[1]}:${'*'.repeat(10)}${match[2].s…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    botId: match[1],
    maskedToken: `${match[1]}:${'*'.repeat(10)}${match[2].slice(-4)}`,
  };
}

// راهنما: این تابع «resolveWorkspaceId» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function resolveWorkspaceId(input?: string) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «input ?? process.env.DEFAULT_WORKSPACE_ID ?? 'local-workspace'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return input ?? process.env.DEFAULT_WORKSPACE_ID ?? 'local-workspace';
}

// راهنما: این Type با نام «DemoBot» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DemoBot = {
  id: string;
  workspaceId: string;
  telegramBotId: string;
  username?: string;
  displayName?: string;
  description?: string;
  tokenCiphertext: string;
  status: 'ACTIVE';
  updatedAt: Date;
};

// راهنما: این دستور متغیر/ثابت «demoBots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const demoBots = new Map<string, DemoBot>();

// راهنما: این تابع «ensureDevelopmentWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureDevelopmentWorkspace(workspaceId: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!prisma» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!prisma) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ id: workspaceId, name: 'Demo Workspace' }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { id: workspaceId, name: 'Demo Workspace' };

  // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  // راهنما: این شرط بررسی می‌کند آیا «existing || process.env.NODE_ENV === 'production'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existing || process.env.NODE_ENV === 'production') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «existing» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return existing;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «prisma.workspace.create({ data: { id: workspaceId, name: 'Development Work…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return prisma.workspace.create({
    data: {
      id: workspaceId,
      name: 'Development Workspace',
    },
  });
}

// راهنما: این تابع «telegramRoutes» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export async function telegramRoutes(app: FastifyInstance) {
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «app.post('/connect', async (request, reply) => { const result = connectSchema.safeParse(r…».
  app.post('/connect', async (request, reply) => {
    // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const result = connectSchema.safeParse(request.body);
    // راهنما: این شرط بررسی می‌کند آیا «!result.success» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!result.success) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(400).send({ ok: false, message: 'توکن یا اطلاعات اتصال معتبر نی…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(400).send({ ok: false, message: 'توکن یا اطلاعات اتصال معتبر نیست.' });
    }

    // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const token = result.data.token.trim();
    // راهنما: این دستور متغیر/ثابت «parsed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const parsed = parseTelegramToken(token);
    // راهنما: این شرط بررسی می‌کند آیا «!parsed» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!parsed) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(400).send({ ok: false, message: 'فرمت توکن BotFather صحیح نیست.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(400).send({ ok: false, message: 'فرمت توکن BotFather صحیح نیست.' });
    }

    // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const workspaceId = resolveWorkspaceId(result.data.workspaceId);
    // راهنما: این دستور متغیر/ثابت «workspace» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const workspace = await ensureDevelopmentWorkspace(workspaceId);
    // راهنما: این شرط بررسی می‌کند آیا «!workspace» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!workspace) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(404).send({ ok: false, message: 'Workspace پیدا نشد.' })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(404).send({ ok: false, message: 'Workspace پیدا نشد.' });
    }

    // راهنما: این دستور متغیر/ثابت «verification» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let verification;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «verification = await verifyTelegramBot(token)».
      verification = await verifyTelegramBot(token);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «request.log.error({ err: error }, 'Telegram verification request failed')».
      request.log.error({ err: error }, 'Telegram verification request failed');
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(502).send({ ok: false, message: 'ارتباط با Telegram برقرار نشد.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(502).send({ ok: false, message: 'ارتباط با Telegram برقرار نشد. دوباره تلاش کنید.' });
    }

    // راهنما: این شرط بررسی می‌کند آیا «!verification.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!verification.ok) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(401).send({ ok: false, message: 'Telegram این توکن را تأیید نکر…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(401).send({
        ok: false,
        message: 'Telegram این توکن را تأیید نکرد. توکن BotFather را بررسی کنید.',
      });
    }

    // راهنما: این دستور متغیر/ثابت «telegramBotId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const telegramBotId = String(verification.bot.id);

    // راهنما: این شرط بررسی می‌کند آیا «!prisma» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!prisma) {
      // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const existing = [...demoBots.values()].find((item) => item.telegramBotId === telegramBotId);
      // راهنما: این شرط بررسی می‌کند آیا «existing && existing.workspaceId !== workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (existing && existing.workspaceId !== workspaceId) {
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(409).send({ ok: false, message: 'این ربات قبلاً به Workspace دی…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return reply.code(409).send({ ok: false, message: 'این ربات قبلاً به Workspace دیگری متصل شده است.' });
      }

      // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const bot: DemoBot = {
        id: existing?.id ?? randomUUID(),
        workspaceId,
        telegramBotId,
        username: verification.bot.username,
        displayName: verification.bot.first_name,
        description: verification.description,
        tokenCiphertext: encryptSecret(token),
        status: 'ACTIVE',
        updatedAt: new Date(),
      };
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «demoBots.set(bot.id, bot)».
      demoBots.set(bot.id, bot);

      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.send({ ok: true, status: 'connected', token: parsed.maskedToken, dem…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.send({
        ok: true,
        status: 'connected',
        token: parsed.maskedToken,
        demoMode: true,
        bot: {
          id: bot.id,
          telegramBotId: bot.telegramBotId,
          username: bot.username,
          displayName: bot.displayName,
          description: bot.description,
          status: bot.status,
          updatedAt: bot.updatedAt,
        },
      });
    }

    // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const existing = await prisma.telegramBot.findUnique({ where: { telegramBotId } });

    // راهنما: این شرط بررسی می‌کند آیا «existing && existing.workspaceId !== workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (existing && existing.workspaceId !== workspaceId) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(409).send({ ok: false, message: 'این ربات قبلاً به Workspace دی…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.code(409).send({ ok: false, message: 'این ربات قبلاً به Workspace دیگری متصل شده است.' });
    }

    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await prisma.telegramBot.upsert({
      where: { telegramBotId },
      create: {
        workspaceId,
        telegramBotId,
        username: verification.bot.username,
        displayName: verification.bot.first_name,
        description: verification.description,
        tokenCiphertext: encryptSecret(token),
        status: 'ACTIVE',
      },
      update: {
        username: verification.bot.username,
        displayName: verification.bot.first_name,
        description: verification.description,
        tokenCiphertext: encryptSecret(token),
        status: 'ACTIVE',
      },
      select: {
        id: true,
        telegramBotId: true,
        username: true,
        displayName: true,
        description: true,
        status: true,
        updatedAt: true,
      },
    });

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.send({ ok: true, status: 'connected', token: parsed.maskedToken, dem…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return reply.send({ ok: true, status: 'connected', token: parsed.maskedToken, demoMode: false, bot });
  });

  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «app.get('/status/:botId', async (request, reply) => { const params = z.object({ botId: z.…».
  app.get('/status/:botId', async (request, reply) => {
    // راهنما: این دستور متغیر/ثابت «params» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const params = z.object({ botId: z.string().min(1) }).safeParse(request.params);
    // راهنما: این شرط بررسی می‌کند آیا «!params.success» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!params.success) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(400).send({ ok: false })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return reply.code(400).send({ ok: false });

    // راهنما: این شرط بررسی می‌کند آیا «!prisma» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!prisma) {
      // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const bot = demoBots.get(params.data.botId);
      // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(404).send({ ok: false, message: 'ربات پیدا نشد.' })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return reply.code(404).send({ ok: false, message: 'ربات پیدا نشد.' });
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.send({ ok: true, demoMode: true, bot: { id: bot.id, telegramBotId: b…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return reply.send({
        ok: true,
        demoMode: true,
        bot: {
          id: bot.id,
          telegramBotId: bot.telegramBotId,
          username: bot.username,
          displayName: bot.displayName,
          description: bot.description,
          status: bot.status,
          updatedAt: bot.updatedAt,
        },
      });
    }

    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await prisma.telegramBot.findUnique({
      where: { id: params.data.botId },
      select: {
        id: true,
        telegramBotId: true,
        username: true,
        displayName: true,
        description: true,
        status: true,
        updatedAt: true,
      },
    });

    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.code(404).send({ ok: false, message: 'ربات پیدا نشد.' })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return reply.code(404).send({ ok: false, message: 'ربات پیدا نشد.' });
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «reply.send({ ok: true, demoMode: false, bot })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return reply.send({ ok: true, demoMode: false, bot });
  });
}
