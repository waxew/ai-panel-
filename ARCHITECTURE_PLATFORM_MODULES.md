# AI Panel unified module architecture

AI Panel is a multi-tenant SaaS with one customer experience, shared business cores and isolated provider adapters.

## Source of truth

The module catalog lives in `packages/shared/src/modules.ts`. Navigation, module status and future API discovery must derive from this registry rather than duplicate module lists in individual pages.

Cross-chat development state lives in `PROJECT_STATE.md`. Coding agents must follow `AGENTS.md` before editing the project.

## Architecture layers

```text
apps/web
  shared shell + navigation
  customer/admin pages
  provider feature UIs

apps/cloudflare
  auth/session gateway
  same-origin API routing
  public webhook/interaction routing

supabase/functions
  provider connect/manage/webhook adapters
  business service endpoints

shared/core domain
  workspace authorization
  commerce
  scheduling
  analytics
  billing
  normalized contracts

provider adapters
  telegram
  instagram
  whatsapp
  bale
  rubika
  discord
  twitter (planned)
```

## Provider contract

A provider module owns only provider-specific behavior:

- credential validation and connection flow;
- provider API calls;
- webhook/signature validation;
- provider payload parsing;
- mapping to/from shared domain data;
- provider-specific errors/capabilities.

A provider module must not own shared commerce, billing, scheduler or analytics rules and must not import another provider module.

## Shared core contract

Shared cores own business behavior independent of a social network:

- Commerce Core: products, customers, cart, checkout and orders.
- Scheduler Core: scheduled jobs, retries, idempotency and execution state.
- Analytics Core: normalized metrics/events and cross-channel reports.
- Billing Core: plans, subscriptions, wallet/payment/refund state.
- Workspace/Auth Core: tenant scope and role authorization.

Providers consume these cores through stable interfaces.

## UI contract

Target structure:

```text
apps/web/src/
  app/
  components/
    shell/
    modules/
  features/
    telegram/
    instagram/
    whatsapp/
    bale/
    rubika/
    discord/
    twitter/
    booking/
    scheduler/
    analytics/
```

All new customer modules use the React shell and central registry. Standalone HTML pages are deprecated adapters and must not be used as a template for new modules.

## Module lifecycle

Statuses are intentionally explicit:

- `planned`: architecture placeholder; no customer route.
- `partial`: real implementation exists but production capability/E2E is incomplete.
- `live`: core supported flow is operational; additional features may still be added.

Changing a status requires updating both the registry and `PROJECT_STATE.md`.

## Database and Edge Function source policy

GitHub must be able to reconstruct production.

- Every schema change is committed as a Supabase migration.
- Every Edge Function deployed to Supabase has matching committed source.
- Production-only code or schema is architecture drift and must be repaired.

## Cloudflare routing

There is one Wrangler configuration: `apps/cloudflare/wrangler.jsonc`.

Worker-first routes include all API/health routes plus compatibility routes for legacy module HTML pages. React routes use SPA fallback.

## Adding a new provider

1. Register the provider in `packages/shared/src/modules.ts` as `planned`.
2. Add provider-owned database models only when provider-specific persistence is required.
3. Implement connect/manage/webhook functions without importing another provider.
4. Reuse shared cores for commerce/scheduling/analytics/billing.
5. Add the React feature route and unified navigation entry.
6. Add E2E/provider verification.
7. Move status from `planned` to `partial`/`live` and update `PROJECT_STATE.md`.

Twitter/X is the next planned provider and must follow this sequence.
