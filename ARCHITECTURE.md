# Architecture decisions

## Product boundary

Ai Panel is a multi-tenant SaaS. Every customer-owned resource belongs to a Workspace. This prevents Telegram/Instagram assets from different customers being mixed and gives us a clean subscription/billing boundary later.

## Applications

- `web`: customer + admin interface.
- `api`: authentication, configuration, Telegram/Instagram webhooks, business APIs.
- `worker`: scheduled publishing, broadcasts, analytics ingestion and retryable background jobs.

## Infrastructure

- PostgreSQL: source of truth.
- Redis: queues, locks, rate limiting and short-lived cache.
- Object storage: media uploads will be added before scheduled Instagram/Telegram publishing.

## Credential handling

Never return provider tokens to the browser after connection. Store encrypted ciphertext only. Decryption should happen only in API/worker processes immediately before calling provider APIs.

## Telegram MVP sequence

1. Customer enters BotFather token.
2. API validates format.
3. API calls Telegram `getMe` to verify ownership/token validity.
4. API encrypts and stores token.
5. Customer edits bot name/description and menu buttons in Ai Panel.
6. Backend configures webhook.
7. Incoming updates are routed to the customer's bot configuration.
8. Products/orders/wallet/services are added on top of the same bot identity.
