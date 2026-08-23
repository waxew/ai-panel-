# AI Panel project state

Architecture checkpoint: 2026-08-23

This file is the cross-chat handoff for the project. It describes the current repository/production state that future work must continue from.

## Canonical runtime

- Frontend + API gateway: Cloudflare Worker `ai-panel-demo`.
- Authentication/database/Edge Functions: Supabase project `spncmjuvnvfkrahjnyjm`.
- Canonical Cloudflare config: `apps/cloudflare/wrangler.jsonc`.
- Canonical module registry: `packages/shared/src/modules.ts`.
- Render is not the active runtime at this checkpoint.

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
| Twitter/X | planned | none | none | next provider module after sync/architecture work |

## Shared cores already present

- Supabase Auth + workspace membership.
- Commerce Core: store, categories, items, customers, carts and orders.
- Channel commerce RPC used by multiple providers.
- Booking domain: appointments, services, staff, CRM, finance, feedback and automation outbox.
- Admin/customer dashboards.

## Known source-sync debt

Production contains Supabase migrations and some Edge Functions that were created/deployed before their source was consistently tracked in GitHub. Architecture work must reduce this debt, not add to it.

Current rule: no new deployment is considered complete unless its migration/function source is committed in the repository.

## UI migration rule

WhatsApp, Rubika and Discord currently use independent HTML pages. They remain supported adapters, but no new module may copy this pattern. Their target is the shared React module shell and central navigation.

## Next architecture milestones

1. Recover/commit missing deployed Supabase Edge Function sources.
2. Recover production migration history into `supabase/migrations` and keep it current.
3. Migrate legacy HTML channel pages to React module pages.
4. Extract shared provider UI primitives and normalized module API contracts.
5. Implement the generic scheduler/worker.
6. Add Twitter/X using the unified module contract.
