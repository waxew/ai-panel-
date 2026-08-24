# Supabase production sync manifest

Checkpoint: 2026-08-24
Project ref: `spncmjuvnvfkrahjnyjm`

This manifest records the production-to-GitHub source sync checkpoint. GitHub `main` is the canonical source for future AI Panel changes. Production migrations listed here were already applied before this checkpoint; they were copied into the repository and were not replayed.

## Edge Functions — 35/35 tracked

| Function | verify_jwt |
| --- | --- |
| telegram-connect | true |
| telegram-webhook | false |
| customer-dashboard | true |
| store-manage | true |
| bot-commerce-manage | true |
| admin-dashboard | true |
| telegram-manage | true |
| store-orders | true |
| instagram-manage | true |
| instagram-connect | false |
| instagram-webhook | false |
| booking-manage | true |
| booking-automations | true |
| booking-public | false |
| booking-finance | true |
| booking-staff-access | true |
| booking-feedback-manage | true |
| booking-feedback-public | false |
| discord-connect | true |
| rubika-connect | true |
| discord-manage | true |
| discord-interactions | false |
| whatsapp-connect | true |
| rubika-manage | true |
| whatsapp-manage | true |
| whatsapp-webhook | false |
| rubika-webhook | false |
| bale-connect | true |
| bale-manage | true |
| bale-webhook | false |
| booking-loyalty | true |
| booking-site-manage | true |
| booking-site-public | false |
| booking-inbox | true |
| account-manage | true |

Function source is stored under `supabase/functions/<slug>/index.ts`. Per-function platform auth settings are stored in `supabase/config.toml`.

Current production notes:

- `customer-dashboard` version 7 is ACTIVE with `verify_jwt=true`; the tracked source includes the additive normalized Analytics v1 payload and corrected Store-order workspace scoping through `Store.workspaceId -> StoreOrder.storeId`.
- `bot-commerce-manage` was added on 2026-08-24 with `verify_jwt=true`. It is the authenticated shared Draft/Publish/application service for Telegram/Bale/Rubika Bot Commerce and persists canonical state under `Store.settings.botCommerce`.

## Migration history — 31/31 tracked

1. `20260822213612_initial_ai_panel_schema.sql`
2. `20260822213855_telegram_token_encryption_secret.sql`
3. `20260822215404_telegram_runtime_configuration.sql`
4. `20260822220244_customer_portal_catalog_and_subscriptions.sql`
5. `20260822221441_portal_rls_and_product_catalog.sql`
6. `20260822222840_portal_admin_metrics_and_catalog_ordering_fix.sql`
7. `20260822225608_commerce_core_v1.sql`
8. `20260822232912_telegram_atomic_buy_now.sql`
9. `20260822234416_telegram_cart_engine.sql`
10. `20260822234432_telegram_cart_rpc_and_indexes.sql`
11. `20260823111848_booking_core_v1.sql`
12. `20260823111928_booking_core_v1_indexes.sql`
13. `20260823113031_booking_automation_core_v1.sql`
14. `20260823114121_booking_staff_availability_v1.sql`
15. `20260823114457_booking_security_perf_cleanup_v1.sql`
16. `20260823114521_booking_customer_crm_v1.sql`
17. `20260823120052_booking_finance_core_v1.sql`
18. `20260823120531_booking_staff_access_v1.sql`
19. `20260823120809_add_rubika_bot_builder.sql`
20. `20260823120957_workspace_owner_admin_v1.sql`
21. `20260823121029_booking_feedback_v1.sql`
22. `20260823121433_add_whatsapp_core.sql`
23. `20260823121441_add_rubika_webhook_secret.sql`
24. `20260823121735_add_bale_bot_platform.sql`
25. `20260823123126_harden_rubika_buttons.sql`
26. `20260823123231_add_channel_commerce_rpc.sql`
27. `20260823123239_grant_channel_commerce_rpc.sql`
28. `20260823134944_booking_loyalty_and_lottery_v1.sql`
29. `20260823140406_booking_business_site_and_inbox_v1.sql`
30. `20260823140912_booking_business_site_autoprovision_v1.sql`
31. `20260823153918_account_profile_wallet.sql`

The historical SQL was recovered from `supabase_migrations.schema_migrations` using the original version/name and stored under `supabase/migrations/`.

No new database migration was required for Unified Bot Commerce v1 because its configuration is stored in the existing `Store.settings JSONB` envelope.

## Going forward

- A schema change is incomplete until its migration is committed.
- An Edge Function deployment is incomplete until matching source and its `verify_jwt` configuration are committed.
- Do not deploy production-only Supabase changes and backfill GitHub later.
- Prisma is a legacy/reference model in this project; Supabase SQL migrations are the canonical database history.
