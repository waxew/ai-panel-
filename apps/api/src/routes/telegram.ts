import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const connectSchema = z.object({
  token: z.string().min(20),
});

function parseTelegramToken(token: string) {
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  if (!match) return null;
  return {
    botId: match[1],
    maskedToken: `${match[1]}:${'*'.repeat(10)}${match[2].slice(-4)}`,
  };
}

export async function telegramRoutes(app: FastifyInstance) {
  app.post('/connect', async (request, reply) => {
    const result = connectSchema.safeParse(request.body);
    if (!result.success) {
      return reply.code(400).send({ ok: false, message: 'توکن واردشده معتبر نیست.' });
    }

    const parsed = parseTelegramToken(result.data.token.trim());
    if (!parsed) {
      return reply.code(400).send({ ok: false, message: 'فرمت توکن BotFather صحیح نیست.' });
    }

    return reply.send({
      ok: true,
      botId: parsed.botId,
      token: parsed.maskedToken,
      status: 'format_valid',
    });
  });
}
