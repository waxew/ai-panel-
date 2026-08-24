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
- Canonical Bot Commerce contracts: `packages/shared/src/bot-commerce.ts`.
- Canonical merged commerce architecture: `ARCHITECTURE_UNIFIED_BOT_COMMERCE.md`.
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

## Telegram project Mini App checkpoint

- `/miniapp` is the canonical Telegram-facing shell for the whole AI Panel product; `/telegram-app` is an alias.
- The Mini App is not a second product/database. It reuses the same React routes, Cloudflare API gateway, Supabase Auth, workspace data and provider modules as the website.
- `TelegramProjectMiniApp.tsx` provides a Telegram-optimized mobile launcher for dashboard, account/wallet, store, orders, Bot Commerce, store templates and all currently customer-visible platform modules.
- The official Telegram WebApp bridge is loaded by the shared web entry point and the Mini App calls `ready()`/`expand()` when available.
- `/api/telegram-miniapp/validate` validates Telegram `initData` server-side with HMAC-SHA-256 and rejects stale/invalid payloads. It never trusts `initDataUnsafe` for authorization.
- The dedicated AI Panel project-bot token is a Cloudflare secret named `TELEGRAM_PROJECT_BOT_TOKEN`; it must never be committed to GitHub or returned to the browser.
- Until the project bot token is configured and Telegram identity-to-AI-Panel-account linking is implemented, the Mini App uses the existing Supabase email/password session for access to real account data. This keeps one account model and avoids creating a second auth system.
- Next Mini App step: configure the project bot token, point BotFather's Mini App/Menu Button URL to the deployed `/miniapp` URL, then add an explicit verified Telegram identity-link table/flow for automatic sign-in.

## Module status

| Module | Status | UI | Backend | Main remaining work |
| --- | --- | --- | --- | --- |
| Telegram | live | React | active | Payment/Fulfillment/Wallet/Referral expansion through shared Bot Commerce cores |
| Instagram | partial | React | active | real-account E2E, scheduled publishing, deeper post/content analytics |
| WhatsApp | partial | React | active | Meta production setup/E2E and future adoption of shared Bot Commerce where API capabilities allow |
| Bale | partial | React | active | real-bot E2E plus remaining shared Bot Commerce actions |
| Rubika | partial | React | active | real-bot E2E plus remaining shared Bot Commerce actions |
| Discord | partial | React | active | real-bot/server E2E, moderation/community features |
| Booking/Tiktime | partial | React | active | real SMS provider, external payment provider; loyalty/site/inbox foundations are present |
| Scheduler | planned | none | foundation only | shared execution worker/queue and publishing adapters |
| Analytics | partial | React | active v1 | deeper per-post/content metrics, trends and recommendations |
| Twitter/X | planned | none | none | next provider module after architecture/core work |

## Shared cores already present

- Supabase Auth + workspace membership.
- Shared account/profile + AI Panel account wallet/ledger.
- Commerce Core: Store, categories, items, customers, carts and orders.
- Store Template Engine v1: draft/published web-store configuration stored in `Store.settings`, using the existing Commerce catalog as the single data source.
- Unified Bot Commerce v1: one logical commerce menu/flow with Draft/Published/version state and Telegram/Bale/Rubika targets.
- Channel commerce RPC used by multiple providers.
- Booking domain: appointments, services, staff, CRM, finance, feedback, automation outbox, loyalty/lottery, business site and unified booking inbox.
- Admin/customer dashboards.
- Provider contract helpers derive customer route, connect/manage API routes, module manifest entries and shared status labels from the central module registry.
- Cloudflare `/api/modules` now consumes the shared module registry rather than keeping a second hardcoded manifest.
- Customer channel/control surfaces are React SPA routes; Cloudflare no longer owns provider-specific HTML control panels.

## Unified Bot Commerce v1 checkpoint

The Babba-style Telegram commerce-builder flow and AI Panel multi-provider architecture are now merged at the architecture/application layer.

- Babba is used as the feature reference; AI Panel remains the system architecture and source-of-truth model.
- `/app/bot-commerce` is the canonical shared bot-commerce editor. `/app/telegram-builder` is a backward-compatible alias to the same editor.
- `/app/telegram`, `/app/bale` and `/app/rubika` remain provider connection/health surfaces. Token/API/Webhook behavior stays inside provider adapters.
- One Bot Commerce draft can select multiple connected Telegram, Bale and Rubika bots as release targets.
- Three initial presets exist: full commerce, services/subscriptions and digital products.
- Shared logical actions are defined once in `packages/shared/src/bot-commerce.ts`.
- Runtime-ready common actions across all three current adapters are `CATALOG`, `CART`, `ORDERS`, `SUPPORT`, `TEXT`, `URL` and `SUBMENU`.
- Planned actions `SEARCH`, `TRACK_ORDER`, `ACCOUNT`, `WALLET`, `MY_SERVICES`, `PRICING`, `REFERRAL` and `TUTORIAL` are present as architecture foundations but are rejected by the backend if enabled during Publish. The product must not present an unfinished action as a live feature.
- `bot-commerce-manage` is the authenticated application service. It validates target ownership, target ACTIVE state, menu graph/cycles/depth, action readiness and URL/value constraints.
- Canonical shared Bot Commerce state is stored under `Store.settings.botCommerce` with `draft`, `draftSavedAt`, `published`, `publishedAt`, `version` and `legacyTargets`.
- Publish materializes the enabled logical menu into the existing Telegram/Bale/Rubika Button tables as a compatibility projection so current webhook runtimes continue operating without a destructive migration.
- Before the first projection into a bot, its previous provider-specific menu/welcome state is snapshotted. Unpublish restores that legacy state.
- The existing provider Button identifiers are `text`, so shared projection identifiers are compatible with all three current tables.
- No database migration is required for v1 because the canonical configuration envelope already exists in `Store.settings JSONB`.
- The merchant Store domain is deliberately separate from AI Panel SaaS billing. A future Store-customer wallet must not reuse the AI Panel owner `UserWallet`.

## Store Template Engine v1 checkpoint

- `/app/store/templates` is a lazy-loaded React editor exposed from the Commerce quick navigation.
- It supports three base presets (`minimal`, `showcase`, `catalog`), global colors, logo URL, card radius and typography scale.
- Page composition uses reorderable/disableable `hero`, `categories`, `products` and `promo` sections. Product/category sections read the existing `StoreCategory` and `StoreItem` records instead of maintaining a duplicate catalog.
- The editor includes desktop/mobile live preview; when the Store has no catalog yet, preview-only placeholder data is used and is never persisted.
- `store-manage` accepts `save_template_draft` and `publish_template`. Both validate and normalize the template server-side before writing it under `Store.settings.templateEngine`.
- Draft and published snapshots are separate. Publish increments a version and records `publishedAt`.
- First-time users can call the existing `ensure_store` action before the first save/publish.

## Analytics v1 checkpoint

- `/app/analytics` is a lazy-loaded React platform module and is exposed through the central module registry/navigation.
- It reads the authenticated `/api/customer/dashboard` response rather than creating a duplicate API/auth path.
- Production `customer-dashboard` is version 7 with `verify_jwt=true` and matching source tracked in GitHub.
- The additive `analytics` response normalizes Telegram, Instagram, WhatsApp, Bale, Rubika and Discord connection health.
- Instagram v1 KPIs include total followers/following/posts, average stored engagement rate, last sync, and per-account comparison.
- Operational KPIs include pending scheduler jobs, open WhatsApp conversations, Store orders/successful orders, Booking customers and upcoming appointments.
- Store order metrics are scoped through `Store.workspaceId -> StoreOrder.storeId`; `StoreOrder` does not have a direct `workspaceId` column.

## Supabase ↔ GitHub sync status

- 35/35 active Supabase Edge Functions have source tracked under `supabase/functions/<slug>/index.ts` after adding `bot-commerce-manage`.
- 31/31 applied production migrations have matching files under `supabase/migrations/` using their original version and name.
- Production `verify_jwt` settings are tracked in `supabase/config.toml`.
- `bot-commerce-manage` is deployed with `verify_jwt=true` and matching source is committed in this change set.
- `supabase/SYNC_MANIFEST.md` records the synced inventory.

Current rule: no Supabase deployment or schema change is complete unless matching source, migration and relevant function configuration are committed in the same change set.

## Deployment verification rule

- The platform workflow covers changes under shared contracts, web, Cloudflare and Supabase source.
- Pull requests install dependencies, build shared contracts, typecheck the Cloudflare Worker, build the React app, validate Supabase function/config pairing, deploy a temporary Wrangler preview, and smoke `/health` plus unauthenticated session behavior.
- Production release order is backend-first: changed Supabase Edge Functions and any committed migrations must be available before Cloudflare routes/UI that consume them.
- Supabase automatic production deployment is gated by repository variable `SUPABASE_DEPLOY_ENABLED`; database migration deployment is separately gated by `SUPABASE_DB_DEPLOY_ENABLED` and its DB password secret.
- Pushes to `main` deploy Cloudflare production and run production health/session smoke checks.
- Preview and production use separate concurrency groups so a PR run cannot cancel a production deploy.

## UI migration checkpoint

The standalone customer-channel HTML pattern has been retired. WhatsApp, Rubika and Discord join Telegram, Bale and Instagram on React routes inside the main SPA. `apps/cloudflare/wrangler.jsonc` runs the Worker before static assets only for `/api/*` and `/health`; customer module routes use the SPA fallback. No new customer module may introduce a standalone HTML control panel.

## Provider contract checkpoint

`packages/shared/src/providers.ts` is the normalized provider route/API helper layer. `packages/shared/src/bot-commerce.ts` is the shared bot-commerce action/template contract. Telegram/Bale/Rubika provider code should render/execute shared actions rather than introduce independent commerce schemas or canonical menus.

## Next architecture milestones

Complete the Babba feature set domain-first, then expose each completed core to every compatible provider:

1. Product plans/variants (`StoreItemPlan` or equivalent normalized model).
2. Payment Core: payment methods, card-to-card, gateway attempts/transactions and verified order payment transitions.
3. Fulfillment Core: manual fulfillment plus secure automatic digital/file/code delivery.
4. StoreCustomer account and order-tracking runtime actions.
5. Store-customer wallet with an immutable ledger, separate from AI Panel SaaS/account wallet.
6. Promotion/discount codes with redemption limits.
7. Referral/sub-affiliate core.
8. Shared seller customer management, message templates and bulk catalog price operations.
9. Backup/export jobs and normalized commerce analytics.
10. Generic scheduler/worker/queue for long-running delivery, broadcast, import/export and bulk jobs.
11. Twitter/X after the shared platform/business cores are sufficiently complete.
