# AI Panel — Unified Bot Commerce Architecture

Checkpoint: 2026-08-24

This document is the canonical architecture for merging the Babba-style Telegram commerce-builder feature set with AI Panel's multi-provider platform architecture.

The rule is simple:

> Babba is a feature reference. AI Panel is the system architecture. Shared business logic must never be reimplemented inside Telegram, Bale, Rubika, or a future provider.

## 1. Product boundary

AI Panel has two different commerce domains and they must remain separate:

1. **AI Panel SaaS billing** — the customer buys AI Panel modules/subscriptions. This uses the platform `Product`, `Subscription`, and SaaS order lifecycle.
2. **Merchant Store Commerce** — the AI Panel customer owns a Store and sells products/services to end customers. This uses `Store`, `StoreCategory`, `StoreItem`, `StoreCustomer`, `StoreCart`, and `StoreOrder`.

A Store customer wallet is not the same thing as the AI Panel account wallet. A Store product plan is not the same thing as an AI Panel SaaS Product.

## 2. Target system

```text
Customer Web Browser
        |
        v
React SPA / apps/web
  - Account & SaaS subscriptions
  - Store / catalog manager
  - Store web template engine
  - Unified Bot Commerce Builder
  - Orders / customers / analytics
        |
        v
Cloudflare Worker BFF / apps/cloudflare
  - Auth session cookies
  - /api routing
  - shared module manifest
  - no channel business logic
        |
        v
Supabase Edge Functions
  +-----------------------------+
  | Shared Application Services |
  | store-manage                |
  | store-orders                |
  | bot-commerce-manage         |
  | billing / analytics / ...   |
  +-----------------------------+
          |              |
          v              v
    PostgreSQL       Provider Adapters
    Commerce Core    - Telegram
                     - Bale
                     - Rubika
                     - future providers
                          |
                          v
                    Provider APIs/Webhooks
```

## 3. Sources of truth

### Store/catalog/order data

Postgres Commerce Core is authoritative:

- `Store`
- `StoreCategory`
- `StoreItem`
- `StoreCustomer`
- `StoreCart`
- `StoreCartItem`
- `StoreOrder`
- `StoreOrderItem`

Provider adapters must read/write this shared data and must not create Telegram-only, Bale-only, or Rubika-only product/order systems.

### Bot commerce flow

The canonical logical bot flow is stored in:

`Store.settings.botCommerce`

It contains:

- `draft`
- `draftSavedAt`
- `published`
- `publishedAt`
- `version`
- `legacyTargets` snapshots used to restore provider-specific menus when a shared release is unpublished

Only the published snapshot is a release. Draft changes never become runtime behavior until Publish succeeds.

### Provider credentials/runtime identity

Credentials remain provider-specific because their security models and APIs are different:

- `TelegramBot`
- `BaleBot`
- `RubikaBot`

Token encryption, provider identity, webhook secret, API validation, webhook payload parsing, and transport errors belong to the provider adapter.

## 4. Unified Bot Commerce release model

The editor builds one logical tree:

```text
/start
  Products
    Categories
      Product detail
        Add to cart / Buy
  Search
  Cart
  Orders
  Track order
  Account
  Wallet
  My services
  Pricing
  Referral
  Tutorial
  Support
```

A single draft can target multiple connected bots:

```text
Unified Flow v7
  -> Telegram Bot A
  -> Bale Bot B
  -> Rubika Bot C
```

The provider layer is a renderer/adapter, not a second source of truth.

For the current compatibility phase, Publish materializes the enabled shared menu into the existing provider button tables. Before first materialization, the previous provider menu/welcome message is captured in `legacyTargets`. Unpublish restores that snapshot.

This lets existing Telegram/Bale/Rubika webhook runtimes continue operating while the product moves to one central editor without destructive migration.

## 5. Action contract

### Runtime-live now

These actions have working provider runtimes and may be published:

- `CATALOG`
- `CART`
- `ORDERS`
- `SUPPORT`
- `TEXT`
- `URL`
- `SUBMENU`

### Architecture foundation — must not publish until runtime is complete

- `SEARCH`
- `TRACK_ORDER`
- `ACCOUNT`
- `WALLET`
- `MY_SERVICES`
- `PRICING`
- `REFERRAL`
- `TUTORIAL`

The UI exposes these so the complete product architecture is visible, but the backend rejects a release when an unfinished action is enabled. This prevents a design mock from being confused with a production capability.

## 6. Babba feature map into AI Panel

| Babba feature | AI Panel owner | Current state / destination |
| --- | --- | --- |
| Bot token validation | Provider Adapter | Existing Telegram/Bale/Rubika connection functions |
| Ready store template | Bot Commerce + Store Template Engine | Unified presets + web theme presets |
| Categories | Catalog Core | Existing `StoreCategory` |
| Products | Catalog Core | Existing `StoreItem` |
| Product image/description/price/stock | Catalog Core | Existing StoreItem fields |
| Product plans/variants | Catalog Core | Target: `StoreItemPlan` / variant model |
| Search | Bot Commerce Runtime | Foundation |
| Cart | Commerce Core | Existing shared channel commerce RPC |
| Orders | Commerce Core | Existing StoreOrder flow |
| Order tracking | Order Service | Foundation |
| Payment | Payment Service | Provider/gateway integration still required |
| Card-to-card | Payment Service | Target payment method |
| Automatic digital fulfillment | Fulfillment Service | Target secure fulfillment engine |
| Manual fulfillment | Fulfillment Service | Order workflow extension |
| Customer account | Customer Core | Foundation over `StoreCustomer` |
| End-customer wallet | Store Wallet Core | Must be separate from AI Panel account wallet |
| Discount codes | Promotion Core | Target `StorePromotion` model |
| Bulk price changes | Catalog Operations | Target server-side batch operation |
| Configurable messages | Bot Commerce Content | Shared message/template layer |
| Forced channel membership | Provider Policy | Telegram/Bale capability adapter, not Commerce Core |
| Seller customer management | Seller Operations | Shared StoreCustomer admin UI |
| Analytics | Analytics Core | Shared normalized metrics |
| Backup | Backup/Export Service | Shared Store export, not provider-specific backup |
| Trial / Active / Suspend / Renewal | AI Panel SaaS Billing | Existing Subscription domain; enforcement needs completion |

## 7. Frontend ownership

### Canonical shared surfaces

- `/app/store` — catalog/store operations
- `/app/store/templates` — web storefront visual template
- `/app/bot-commerce` — canonical bot menu/flow + multi-provider publishing
- `/app/orders` — shared orders

`/app/telegram-builder` is now an alias of the unified Bot Commerce Builder for backward-compatible navigation.

### Provider surfaces

Provider pages remain responsible for connection and provider health only:

- `/app/telegram`
- `/app/bale`
- `/app/rubika`

Provider-specific menu editors are compatibility/legacy surfaces and must not become the canonical editor again.

## 8. Backend ownership

### Cloudflare Worker

Cloudflare is the BFF/gateway. It owns:

- secure session cookies
- session refresh
- authenticated API proxying
- public callback routing where applicable
- static React assets
- health checks

It must not own catalog/order/menu business rules.

### Supabase Edge Functions

Authenticated application services use `withSupabase({ auth: 'user' })` and keep platform JWT verification enabled.

Provider webhooks are public transport endpoints (`verify_jwt=false`) and must validate their provider secret/signature in the function before touching privileged data.

### Postgres

Postgres owns transactional commerce state and atomic mutations. Channel-specific RPC duplication should be retired in favor of the generic `channel_*` commerce RPC surface.

## 9. Future normalized domain modules

The following additions complete the Babba feature set without polluting provider adapters:

1. `StoreItemPlan` / product variants
2. `StorePaymentMethod` + payment attempts/transactions
3. `StoreFulfillment` + encrypted digital delivery assets
4. `StoreCustomerWallet` + immutable wallet ledger
5. `StorePromotion` + redemption limits
6. `StoreMessageTemplate`
7. `StoreChannelPolicy` for provider-specific requirements such as mandatory membership
8. `StoreReferral` / referral ledger
9. Store export/backup jobs
10. unified analytics events

Long-running delivery, broadcast, backup, import, and bulk jobs should run through a queue/worker rather than inside request handlers.

## 10. Deployment architecture

Canonical release order:

```text
feature branch
  -> PR CI
      -> shared contract build
      -> Cloudflare typecheck
      -> React production build
      -> temporary Cloudflare preview
      -> smoke tests
  -> merge main
      -> deploy changed Supabase Edge Functions first
      -> apply committed SQL migrations when present
      -> deploy Cloudflare Worker + static web assets
      -> production health/session smoke
      -> module-specific smoke
```

Why Supabase first: the new frontend/BFF must never route traffic to a backend function that has not been deployed yet.

GitHub `main` remains the canonical source. A Supabase production change is incomplete until the exact function/config/migration source is committed.

## 11. Non-negotiable architecture rules

1. No provider-specific product/category/order database.
2. No second canonical menu after Unified Bot Commerce is published.
3. Provider adapters own transport, not commerce rules.
4. Draft and Published are different states.
5. Unfinished actions cannot be published.
6. Provider credentials are encrypted and never exposed to the browser after connection.
7. End-customer wallet and AI Panel account wallet stay separate.
8. SaaS subscription lifecycle and merchant Store orders stay separate.
9. Every externally triggered write must be idempotent where retries are possible.
10. GitHub source, Supabase production, and Cloudflare production must remain synchronized at release checkpoints.

## 12. Completion path

The next implementation sequence is intentionally domain-first rather than provider-first:

1. finish shared product plans/variants
2. finish Payment Core
3. finish fulfillment (manual + secure automatic digital)
4. finish StoreCustomer account + order tracking
5. add Store Wallet ledger
6. add discounts/promotions
7. add referral system
8. add seller customer/messages/bulk price operations
9. add backup/export and normalized analytics
10. expose each completed capability to every compatible provider adapter

A provider is never considered "complete" by duplicating these features locally. It becomes complete by adopting the shared cores.
