# AI Panel agent rules

This repository is the source of truth for AI Panel. Every coding session, including work started from a different project chat, must continue from the current repository state rather than from an old chat snapshot.

Before changing code:

1. Read `PROJECT_STATE.md`.
2. Read `ARCHITECTURE_PLATFORM_MODULES.md`.
3. Read `packages/shared/src/modules.ts`.
4. Inspect the current implementation of the target module and shared core it depends on.

Non-negotiable architecture rules:

- Provider modules are isolated. A Telegram module never imports a Bale/Rubika/WhatsApp/Discord/Instagram provider implementation.
- Shared business behavior belongs in shared/core services. Commerce, scheduling, analytics, auth, billing and workspace authorization must not be reimplemented per provider.
- Every new customer-facing module must be registered in `packages/shared/src/modules.ts` before navigation or API exposure is added.
- No new standalone HTML module pages. `legacy-html` is a temporary compatibility state only for WhatsApp, Rubika and Discord until they are migrated to the React module shell.
- Credentials remain backend-only and encrypted at rest. Never return provider secrets to the browser.
- Every database schema change must have a committed migration in `supabase/migrations/` in the same change set.
- Every deployed Supabase Edge Function must have the exact deployed source committed under `supabase/functions/<slug>/` in the same change set.
- After a module changes status/capabilities, update `PROJECT_STATE.md` and the central module registry in the same change set.
- Cloudflare has one canonical Wrangler configuration: `apps/cloudflare/wrangler.jsonc`.
- Do not duplicate navigation lists or module status lists in individual pages. Consume the central registry.

Definition of done for module work:

- provider-specific code stays isolated;
- shared capabilities are reused;
- auth/workspace scope is enforced;
- UI route is reachable through unified navigation when appropriate;
- webhook/public route security is verified;
- source is committed before/with deployment;
- `PROJECT_STATE.md` reflects the new reality.
