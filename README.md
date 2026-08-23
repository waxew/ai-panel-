# AI Panel

Multi-tenant SaaS for building and operating automation across Telegram, Instagram, WhatsApp, Bale, Rubika, Discord and business tools such as booking, commerce, scheduling and analytics.

## Start here

Before changing the project, read:

1. `AGENTS.md` — mandatory development rules.
2. `PROJECT_STATE.md` — current cross-chat/runtime status.
3. `ARCHITECTURE_PLATFORM_MODULES.md` — unified architecture.
4. `packages/shared/src/modules.ts` — canonical module registry.

## Repository structure

```text
apps/
  web/          React/Vite customer + admin UI
  cloudflare/   production same-origin gateway + static assets
  api/          legacy/local Fastify service
  worker/       scheduled/background worker foundation
packages/
  shared/       shared platform contracts and module registry
prisma/         legacy/schema model reference
supabase/
  functions/    deployed Edge Function source (must remain in sync)
```

Production database/auth/Edge Functions use Supabase. Production frontend/API gateway uses Cloudflare Workers.

## Architecture rule

Provider integrations are isolated adapters. Shared business behavior belongs to shared cores. A provider must not import another provider implementation. New modules must register centrally and use the shared React shell; standalone provider HTML pages are migration-only legacy adapters.

## Local development

1. Copy `.env.example` to `.env` for the legacy/local services when needed.
2. `pnpm install`
3. `pnpm dev`

Web: http://localhost:5173
Legacy/local API: http://localhost:4000

## Security

Provider credentials are backend-only and encrypted at rest. Provider secrets must never be returned to browsers or committed to GitHub. Workspace authorization is enforced server-side.
