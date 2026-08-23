# AI Panel project state

Architecture checkpoint: 2026-08-23
Supabase source-sync checkpoint: 2026-08-23

This file is the cross-chat handoff for the project. It describes the current repository/production state that future work must continue from.

## Canonical runtime

- Frontend + API gateway: Cloudflare Worker `ai-panel-demo`.
- Authentication/database/Edge Functions: Supabase project `spncmjuvnvfkrahjnyjm`.
- Canonical Cloudflare config: `apps/cloudflare/wrangler.jsonc`.
- Canonical module registry: `packages/shared/src/modules.ts`.
- Canonical database history: `supabase/migrations/`.
- Canonical Edge Function source: `supabase/functions/` plus `supabase/config.toml`.
- Render is not the active runtime at this checkpoint.
- Prisma is legacy/reference schema material; Supabase SQL migrations are canonical for production database evolution.

## Module status

| Module | Status | UI | Backend | Main remaining work |
| --- | --- | --- | --- | --- |
| Telegram | live | React | active | payment, wallet/subscriptions/referrals, broader bot-builder features |
| Instagram | partial | React | active | real-account E2E, scheduled publishing, full content analytics |
| WhatsApp | partial | legacy HTML | active | Meta production setup/E2E, commerce parity, React migration |
| Bale | partial | React | active | real-bot E2E and feature parity |
| Rubika | partial | legacy HTML | active | real-bot E2E, React migration |
| Discord | partial | legacy HTML | active | moderation/community features, React migration |
| Booking/Tiktime | partial | React | active | real SMS provider, external payment provider |
| Scheduler | planned | none | foundation only | shared execution worker/queue and publishing adapters |
| Analytics | partial | fragmented | partial | normalized cross-channel analytics engine |
| Twitter/X | planned | none | none | next provider module after architecture/core work |

## Shared cores already present

- Supabase Auth + workspace membership.
- Commerce Core: store, categories, items, customers, carts and orders.
- Channel commerce RPC used by multiple providers.
- Booking domain: appointments, services, staff, CRM, finance, feedback and automation outbox.
- Admin/customer dashboards.

## Supabase ↔ GitHub sync status

Production source drift identified during the architecture audit has been repaired at this checkpoint:

- 29/29 active Supabase Edge Functions have source tracked under `supabase/functions/<slug>/index.ts`.
- 27/27 applied production migrations have matching files under `supabase/migrations/` using their original version and name.
- Production `verify_jwt` settings are tracked in `supabase/config.toml`.
- `supabase/SYNC_MANIFEST.md` records the synced inventory.
- Existing production migrations were copied into GitHub; they were not replayed against production during this sync.

Current rule: no Supabase deployment or schema change is complete unless matching source, migration and relevant function configuration are committed in the same change set.

## UI migration rule

WhatsApp, Rubika and Discord currently use independent HTML pages. They remain supported adapters, but no new module may copy this pattern. Their target is the shared React module shell and central navigation.

## Next architecture milestones

1. Migrate legacy HTML channel pages to React module pages.
2. Extract shared provider UI primitives and normalized module API contracts.
3. Implement the generic scheduler/worker.
4. Implement normalized cross-channel analytics.
5. Complete billing/payment/wallet/subscription/referral core flows.
6. Add Twitter/X using the unified module contract.
