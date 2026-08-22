# Ai Panel

SaaS bot-builder platform for Telegram first, then Instagram automation, scheduled publishing, analytics and admin operations.

## Phase 1 scope

- Customer dashboard
- Telegram bot connection flow
- Bot profile and button builder
- Products, orders, wallet and services domain model
- Scheduled jobs foundation
- Admin/customer separation
- PostgreSQL + Redis infrastructure
- Background worker foundation

## Repository structure

```text
apps/
  web/      React/Vite customer and admin panel
  api/      Fastify API
  worker/   background jobs and scheduled publishing
packages/
  shared/   shared TypeScript types
prisma/     database schema
docker-compose.yml
```

## Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL and Redis: `docker compose up -d`.
3. Install dependencies: `pnpm install`.
4. Generate Prisma client and migrate the database after Prisma is wired into the API.
5. Start all apps: `pnpm dev`.

Web: http://localhost:5173
API: http://localhost:4000
Health: http://localhost:4000/health

## Security rules

Telegram bot tokens, Instagram access tokens and other credentials must never be stored in plaintext. The database schema uses ciphertext fields so application-level encryption can be added before persistence.
