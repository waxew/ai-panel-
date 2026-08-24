# AI Panel project state

Architecture checkpoint: 2026-08-24
Supabase source-sync checkpoint: 2026-08-24

This file is the cross-chat handoff for the project. It describes the current repository/production state that future work must continue from.

## Canonical runtime

- Frontend + API gateway: Cloudflare Worker `ai-panel-demo`.
- Authentication/database/Edge Functions: Supabase project `spncmjuvnvfkrahjnyjm`.
- Canonical Cloudflare config: `apps/cloudflare/wrangler.jsonc`.
- Canonical module registry: `packages/shared/src/modules.ts`.
- Canonical provider/API contract helpers: `packages/shared/src/providers.ts`.
- Canonical database history: `supabase/migrations/`.
- Canonical Edge Function source: `supabase/functions/` plus `supabase/config.toml`.
- Render is not the active runtime at this checkpoint.
- Prisma is legacy/reference schema material; Supabase SQL migrations are canonical for production database evolution.

## Current auth/account checkpoint

- Supabase email/password authentication is active behind the Cloudflare Worker.
- Access and refresh tokens are stored as HttpOnly, Secure, SameSite=Lax cookies by the Worker.
- `/api/session` validates identity directly with Supabase Auth and does not fail login when dashboard enrichment fails.
- Existing accounts can sign in with email/password and are routed into `/app`.
- New signup uses the current-origin confirmation redirect. When Supabase returns an implicit-flow session in the confirmation URL fragment, the React bootstrap sends that session to `/api/auth/adopt-session`; the Worker validates/rotates the tokens with Supabase before adopting them into HttpOnly cookies and routing to `/app`.
- `/app/account` is the shared account/profile/wallet page. It reads/writes profile data through `account-manage` and displays the real `UserWallet` and `WalletTransaction` ledger.
- The auth-user provisioning trigger creates the internal User, Wallet, Workspace and WorkspaceMember records for a new account.

## Module status

| Module | Status | UI | Backend | Main remaining work |
| --- | --- | --- | --- | --- |
| Telegram | live | React | active | payment, subscription/referral expansion, broader bot-builder features |
| Instagram | partial | React | active | real-account E2E, scheduled publishing, deeper post/content analytics |
| WhatsApp | partial | React | active | Meta production setup/E2E and commerce parity |
| Bale | partial | React | active | real-bot E2E and feature parity |
| Rubika | partial | React | active | real-bot E2E and feature parity |
| Discord | partial | React | active | real-bot/server E2E, moderation/community features |
| Booking/Tiktime | partial | React | active | real SMS provider, external payment provider; loyalty/site/inbox foundations are present |
| Scheduler | planned | none | foundation only | shared execution worker/queue and publishing adapters |
| Analytics | partial | React | active v1 | deeper per-post/content metrics, trends and recommendations |
| Twitter/X | planned | none | none | next provider module after architecture/core work |

## Shared cores already present

- Supabase Auth + workspace membership.
- Shared account/profile + wallet/ledger.
- Commerce Core: store, categories, items, customers, carts and orders.
- Channel commerce RPC used by multiple providers.
- Booking domain: appointments, services, staff, CRM, finance, feedback, automation outbox, loyalty/lottery, business site and unified booking inbox.
- Admin/customer dashboards.
- Provider contract helpers derive customer route, connect/manage API routes, module manifest entries and shared status labels from the central module registry. Navigation uses these helpers instead of duplicating Instagram API paths and route-active/status logic.
- Route-level React code splitting keeps channel, Booking and public pages in independent chunks; the primary client bundle was reduced from about 540 kB to about 242 kB at the 2026-08-24 build checkpoint.

## Analytics v1 checkpoint

- `/app/analytics` is a lazy-loaded React platform module and is exposed through the central module registry/navigation.
- It reads the authenticated `/api/customer/dashboard` response rather than creating a duplicate API/auth path.
- Production `customer-dashboard` is version 7 with `verify_jwt=true` and matching source tracked in GitHub.
- The additive `analytics` response normalizes Telegram, Instagram, WhatsApp, Bale, Rubika and Discord connection health.
- Instagram v1 KPIs include total followers/following/posts, average stored engagement rate, last sync, and per-account comparison.
- Operational KPIs include pending scheduler jobs, open WhatsApp conversations, Store orders/successful orders, Booking customers and upcoming appointments.
- Store order metrics are scoped through `Store.workspaceId -> StoreOrder.storeId`; `StoreOrder` does not have a direct `workspaceId` column.
- Existing customer-dashboard response fields are preserved so current dashboard/session consumers remain compatible.

## Supabase ↔ GitHub sync status

Production source drift identified during the 2026-08-24 end-to-end audit has been repaired at this checkpoint:

- 34/34 active Supabase Edge Functions have source tracked under `supabase/functions/<slug>/index.ts`.
- 31/31 applied production migrations have matching files under `supabase/migrations/` using their original version and name.
- Production `verify_jwt` settings are tracked in `supabase/config.toml`.
- `supabase/SYNC_MANIFEST.md` records the synced inventory.
- Existing production migrations were copied into GitHub; they were not replayed against production during this sync.

Current rule: no Supabase deployment or schema change is complete unless matching source, migration and relevant function configuration are committed in the same change set.

## Deployment verification rule

- Pull requests build shared contracts and the web app, deploy with Wrangler temporary preview, and poll/smoke the preview `/health`, unauthenticated `/api/session`, and invalid adopt-session behavior during temporary-route propagation.
- Pushes to `main` deploy production and smoke `https://ai-panel-demo.bustling-larch.workers.dev/health` plus unauthenticated session behavior.
- Preview and production use separate concurrency groups so a PR run cannot cancel a production deploy.
- `packages/shared/tsconfig.json` explicitly sets `rootDir: src`, fixing the TypeScript 7 CI regression discovered in the 2026-08-24 audit.

## UI migration checkpoint

The standalone customer-channel HTML pattern has been retired. WhatsApp, Rubika and Discord now join Telegram, Bale and Instagram on React routes inside the main SPA. `apps/cloudflare/wrangler.jsonc` runs the Worker before static assets only for `/api/*` and `/health`; customer module routes use the SPA fallback. No new customer module may introduce a standalone HTML control panel.

## Provider contract checkpoint

`packages/shared/src/providers.ts` is the first normalized provider contract layer. It exports the platform manifest, active provider contracts, derived connect/manage API routes, status labels and route-active logic. New provider code should use these helpers instead of reconstructing paths or status labels locally. `CommerceQuickNav` is the first consumer. Next, move the remaining landing/Worker module manifests and shared provider UI primitives onto this layer.

## Next architecture milestones

1. Finish provider contract adoption and extract shared provider UI primitives.
2. Implement the generic scheduler/worker and expose its shared queue UI.
3. Extend Analytics v1 with historical/post-level metrics and actionable recommendations.
4. Complete billing/payment/subscription/referral flows on top of the shared wallet core.
5. Add Twitter/X using the unified module contract.
