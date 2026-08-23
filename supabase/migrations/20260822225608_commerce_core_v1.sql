do $$ begin
  create type public."StoreStatus" as enum ('DRAFT','ACTIVE','PAUSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."StoreItemType" as enum ('DIGITAL','PHYSICAL','SERVICE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."StoreCartStatus" as enum ('ACTIVE','CONVERTED','ABANDONED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public."StoreOrderStatus" as enum ('NEW','AWAITING_PAYMENT','PAID','PROCESSING','COMPLETED','CANCELLED','REFUNDED');
exception when duplicate_object then null; end $$;

create table if not exists public."Store" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null unique references public."Workspace"(id) on delete cascade,
  name text not null default 'فروشگاه من',
  currency text not null default 'IRR',
  status public."StoreStatus" not null default 'ACTIVE',
  settings jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."StoreCategory" (
  id text primary key default gen_random_uuid()::text,
  "storeId" text not null references public."Store"(id) on delete cascade,
  title text not null,
  slug text not null,
  "sortOrder" integer not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("storeId", slug)
);

create table if not exists public."StoreItem" (
  id text primary key default gen_random_uuid()::text,
  "storeId" text not null references public."Store"(id) on delete cascade,
  "categoryId" text references public."StoreCategory"(id) on delete set null,
  sku text,
  title text not null,
  description text,
  "itemType" public."StoreItemType" not null default 'DIGITAL',
  "priceAmount" bigint not null,
  currency text not null default 'IRR',
  "inventoryCount" integer,
  "imageUrl" text,
  "sortOrder" integer not null default 0,
  "isActive" boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "StoreItem_priceAmount_nonnegative" check ("priceAmount" >= 0),
  constraint "StoreItem_inventory_nonnegative" check ("inventoryCount" is null or "inventoryCount" >= 0),
  unique ("storeId", sku)
);

create table if not exists public."StoreCustomer" (
  id text primary key default gen_random_uuid()::text,
  "storeId" text not null references public."Store"(id) on delete cascade,
  platform text not null,
  "externalUserId" text not null,
  username text,
  "displayName" text,
  phone text,
  metadata jsonb not null default '{}'::jsonb,
  "lastSeenAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("storeId", platform, "externalUserId")
);

create table if not exists public."StoreCart" (
  id text primary key default gen_random_uuid()::text,
  "storeId" text not null references public."Store"(id) on delete cascade,
  "customerId" text not null references public."StoreCustomer"(id) on delete cascade,
  status public."StoreCartStatus" not null default 'ACTIVE',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."StoreCartItem" (
  id text primary key default gen_random_uuid()::text,
  "cartId" text not null references public."StoreCart"(id) on delete cascade,
  "itemId" text not null references public."StoreItem"(id) on delete cascade,
  quantity integer not null default 1,
  "unitPriceAmount" bigint not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "StoreCartItem_quantity_positive" check (quantity > 0),
  constraint "StoreCartItem_unitPrice_nonnegative" check ("unitPriceAmount" >= 0),
  unique ("cartId", "itemId")
);

create table if not exists public."StoreOrder" (
  id text primary key default gen_random_uuid()::text,
  "storeId" text not null references public."Store"(id) on delete cascade,
  "customerId" text references public."StoreCustomer"(id) on delete set null,
  "sourcePlatform" text not null,
  "externalConversationId" text,
  status public."StoreOrderStatus" not null default 'NEW',
  "subtotalAmount" bigint not null default 0,
  "discountAmount" bigint not null default 0,
  "totalAmount" bigint not null default 0,
  currency text not null default 'IRR',
  note text,
  "idempotencyKey" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "paidAt" timestamptz,
  constraint "StoreOrder_subtotal_nonnegative" check ("subtotalAmount" >= 0),
  constraint "StoreOrder_discount_nonnegative" check ("discountAmount" >= 0),
  constraint "StoreOrder_total_nonnegative" check ("totalAmount" >= 0),
  unique ("storeId", "idempotencyKey")
);

create table if not exists public."StoreOrderItem" (
  id text primary key default gen_random_uuid()::text,
  "orderId" text not null references public."StoreOrder"(id) on delete cascade,
  "itemId" text references public."StoreItem"(id) on delete set null,
  "titleSnapshot" text not null,
  "skuSnapshot" text,
  "unitPriceAmount" bigint not null,
  quantity integer not null,
  "lineTotalAmount" bigint not null,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now(),
  constraint "StoreOrderItem_quantity_positive" check (quantity > 0),
  constraint "StoreOrderItem_unitPrice_nonnegative" check ("unitPriceAmount" >= 0),
  constraint "StoreOrderItem_lineTotal_nonnegative" check ("lineTotalAmount" >= 0)
);

create index if not exists "StoreCategory_storeId_sortOrder_idx" on public."StoreCategory" ("storeId", "sortOrder");
create index if not exists "StoreItem_storeId_active_sortOrder_idx" on public."StoreItem" ("storeId", "isActive", "sortOrder");
create index if not exists "StoreItem_categoryId_active_idx" on public."StoreItem" ("categoryId", "isActive");
create index if not exists "StoreCustomer_storeId_platform_idx" on public."StoreCustomer" ("storeId", platform);
create unique index if not exists "StoreCart_customer_active_unique" on public."StoreCart" ("customerId") where status = 'ACTIVE';
create index if not exists "StoreCart_storeId_status_idx" on public."StoreCart" ("storeId", status);
create index if not exists "StoreOrder_storeId_createdAt_idx" on public."StoreOrder" ("storeId", "createdAt" desc);
create index if not exists "StoreOrder_storeId_status_idx" on public."StoreOrder" ("storeId", status);
create index if not exists "StoreOrder_customerId_createdAt_idx" on public."StoreOrder" ("customerId", "createdAt" desc);
create index if not exists "StoreOrderItem_orderId_idx" on public."StoreOrderItem" ("orderId");

alter table public."Store" enable row level security;
alter table public."StoreCategory" enable row level security;
alter table public."StoreItem" enable row level security;
alter table public."StoreCustomer" enable row level security;
alter table public."StoreCart" enable row level security;
alter table public."StoreCartItem" enable row level security;
alter table public."StoreOrder" enable row level security;
alter table public."StoreOrderItem" enable row level security;

revoke all on table public."Store" from anon, authenticated;
revoke all on table public."StoreCategory" from anon, authenticated;
revoke all on table public."StoreItem" from anon, authenticated;
revoke all on table public."StoreCustomer" from anon, authenticated;
revoke all on table public."StoreCart" from anon, authenticated;
revoke all on table public."StoreCartItem" from anon, authenticated;
revoke all on table public."StoreOrder" from anon, authenticated;
revoke all on table public."StoreOrderItem" from anon, authenticated;

grant all on table public."Store" to service_role;
grant all on table public."StoreCategory" to service_role;
grant all on table public."StoreItem" to service_role;
grant all on table public."StoreCustomer" to service_role;
grant all on table public."StoreCart" to service_role;
grant all on table public."StoreCartItem" to service_role;
grant all on table public."StoreOrder" to service_role;
grant all on table public."StoreOrderItem" to service_role;
