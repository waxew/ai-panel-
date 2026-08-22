import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { encryptSecret } from '../lib/crypto.js';
import { verifyTelegramBot } from '../services/telegram-api.js';

const connectSchema = z.object({
  token: z.string().min(20),
  workspaceId: z.string().min(1).optional(),
});

function parseTelegramToken(token: string) {
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  if (!match) return null;
  return {
    botId: match[1],
    maskedToken: `${match[1]}:${'*'.repeat(10)}${match[2].slice(-4)}`,
  };
}

function resolveWorkspaceId(input?: string) {
  return input ?? process.env.DEFAULT_WORKSPACE_ID;
}

async function ensureDevelopmentWorkspace(workspaceId: string) {
  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (existing || process.env.NODE_ENV === 'production') return existing;

  return prisma.workspace.create({
    data: {
      id: workspaceId,
      name: 'Development Workspace',
    },
  });
}

export async function telegramRoutes(app: FastifyInstance) {
  app.post('/connect', async (request, reply) => {
    const result = connectSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ ok: false, message: 'توکن یا اطلاعات اتصال معتبر نیست.' });
    }

    const token = result.data.token.trim();
    const parsed = parseTelegramToken(token);
    if (!parsed) {
      return reply.code(400).send({ ok: false, message: 'فرمت توکن BotFather صحیح نیست.' });
    }

    const workspaceId = resolveWorkspaceId(result.data.workspaceId);
    if (!workspaceId) {
      return reply.code(400).send({ ok: false, message: 'Workspace برای اتصال مشخص نشده است.' });
    }

    const workspace = await ensureDevelopmentWorkspace(workspaceId);
    if (!workspace) {
      return reply.code(404).send({ ok: false, message: 'Workspace پیدا نشد.' });
    }

    let verification;
    try {
      verification = await verifyTelegramBot(token);
    } catch (error) {
      request.log.error({ err: error }, 'Telegram verification request failed');
      return reply.code(502).send({ ok: false, message: 'ارتباط با Telegram برقرار نشد. دوباره تلاش کنید.' });
    }

    if (!verification.ok) {
      return reply.code(401).send({
        ok: false,
        message: 'Telegram این توکن را تأیید نکرد. توکن BotFather را بررسی کنید.',
      });
    }

    const telegramBotId = String(verification.bot.id);
    const existing = await prisma.telegramBot.findUnique({ where: { telegramBotId } });

    if (existing && existing.workspaceId !== workspaceId) {
      return reply.code(409).send({ ok: false, message: 'این ربات قبلاً به Workspace دیگری متصل شده است.' });
    }

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

    return reply.send({ ok: true, status: 'connected', token: parsed.maskedToken, bot });
  });

  app.get('/status/:botId', async (request, reply) => {
    const params = z.object({ botId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.code(400).send({ ok: false });

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

    if (!bot) return reply.code(404).send({ ok: false, message: 'ربات پیدا نشد.' });
    return reply.send({ ok: true, bot });
  });
}
