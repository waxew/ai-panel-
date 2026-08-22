import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { telegramRoutes } from './routes/telegram.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? true,
});

app.get('/health', async () => ({
  ok: true,
  service: 'ai-panel-api',
  demoMode: !process.env.DATABASE_URL,
  timestamp: new Date().toISOString(),
}));

app.get('/api/modules', async () => ({
  modules: [
    { key: 'telegram', enabled: true, phase: 1 },
    { key: 'instagram', enabled: false, phase: 2 },
    { key: 'scheduler', enabled: true, phase: 1 },
    { key: 'analytics', enabled: false, phase: 2 },
  ],
}));

await app.register(telegramRoutes, { prefix: '/api/telegram' });

const currentDir = dirname(fileURLToPath(import.meta.url));
const webDist = join(currentDir, '../../web/dist');

await app.register(fastifyStatic, {
  root: webDist,
  prefix: '/',
  wildcard: false,
});

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({ ok: false, message: 'API route not found' });
  }

  return reply.sendFile('index.html');
});

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });
