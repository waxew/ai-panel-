# Platform module architecture

AI Panel is a multi-tenant SaaS with a unified customer experience and isolated provider integrations.

## Rule

Every external platform owns its provider-specific code. Shared business rules stay in core/shared packages. A platform module must not import another platform module directly.

## Backend layout

```text
apps/cloudflare/src/
  core/
    http.ts
    types.ts
  modules/
    telegram/
      index.ts
    instagram/
      index.ts
    whatsapp/
      index.ts
    bale/
      index.ts
    rubika/
      index.ts
    discord/
      index.ts
    scheduler/
      index.ts
    analytics/
      index.ts
    registry.ts
```

Each provider module is responsible for its own API endpoints, authentication/connection flow, webhooks, provider payload validation, provider errors and mapping provider data into AI Panel domain data.

## Frontend layout

```text
apps/web/src/
  app/
  components/
  features/
    telegram/
    instagram/
    whatsapp/
    bale/
    rubika/
    discord/
    scheduler/
    analytics/
  pages/
    public/
    customer/
    admin/
```

The customer sees one product catalog and one dashboard, while feature pages are implemented independently.

## Shared domain

`packages/shared` owns platform identifiers, labels, product metadata types and cross-app contracts. It must not contain credentials or provider-specific API clients.

## Security

- Credentials are backend-only and encrypted at rest.
- Provider secrets are never returned to the browser.
- Customer endpoints are scoped to the authenticated user's workspace.
- Admin endpoints require ADMIN or SUPER_ADMIN authorization.
- Webhooks validate a provider signature/secret where the provider supports it.

## Provider onboarding

- Telegram: BotFather token.
- Bale: Bale BotFather token; Telegram-compatible Bot API with provider-specific differences.
- Rubika: Rubika BotFather token; Rubika Bot API v3 and webhook endpoint.
- Discord: Discord application/bot token plus server installation/OAuth flow.
- WhatsApp: Meta WhatsApp Business Platform connection (WABA, phone number and access credentials); not a BotFather-style flow.
- Instagram: Meta account/business connection and provider permissions.

The common dashboard consumes normalized service-instance summaries so customers do not need to understand provider implementation differences.
