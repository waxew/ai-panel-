create table if not exists public."BaleBot" (
  id text primary key default gen_random_uuid()::text,
  "workspaceId" text not null references public."Workspace"(id) on delete cascade,
  "baleBotId" text not null unique,
  username text,
  "displayName" text,
  description text,
  "tokenCiphertext" text not null,
  status public."BotStatus" not null default 'PENDING'::public."BotStatus",
  "welcomeMessage" text not null default 'سلام! به ربات بله خوش آمدید. از منوی زیر یکی از گزینه‌ها را انتخاب کنید.',
  "webhookSecretHash" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."BaleButton" (
  id text primary key default gen_random_uuid()::text,
  "botId" text not null references public."BaleBot"(id) on delete cascade,
  "parentId" text,
  title text not null,
  "actionType" text not null,
  "actionValue" text,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create index if not exists "BaleBot_workspaceId_idx" on public."BaleBot"("workspaceId");
create index if not exists "BaleButton_botId_idx" on public."BaleButton"("botId");
create index if not exists "BaleButton_parentId_idx" on public."BaleButton"("parentId");

alter table public."BaleBot" enable row level security;
alter table public."BaleButton" enable row level security;

drop policy if exists "Members can read own bale bots" on public."BaleBot";
create policy "Members can read own bale bots"
on public."BaleBot" for select to authenticated
using (
  exists (
    select 1 from public."WorkspaceMember" m
    where m."workspaceId" = "BaleBot"."workspaceId"
      and m."userId" = (select auth.uid())::text
  )
);

drop policy if exists "Members can read own bale buttons" on public."BaleButton";
create policy "Members can read own bale buttons"
on public."BaleButton" for select to authenticated
using (
  exists (
    select 1
    from public."BaleBot" b
    join public."WorkspaceMember" m on m."workspaceId" = b."workspaceId"
    where b.id = "BaleButton"."botId"
      and m."userId" = (select auth.uid())::text
  )
);

insert into public."AppSecret" (id, value)
select 'bale_token_encryption', encode(gen_random_bytes(32), 'hex')
where not exists (select 1 from public."AppSecret" where id = 'bale_token_encryption');

create or replace function public.bale_cart_snapshot(p_store_id text, p_external_user_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id text;
  v_cart_id text;
  v_currency text := 'IRR';
  v_total bigint := 0;
  v_count integer := 0;
  v_items jsonb := '[]'::jsonb;
begin
  select id into v_customer_id
  from public."StoreCustomer"
  where "storeId" = p_store_id
    and platform = 'bale'
    and "externalUserId" = p_external_user_id
  limit 1;

  if v_customer_id is null then
    return jsonb_build_object('cartId', null, 'itemCount', 0, 'totalAmount', 0, 'currency', 'IRR', 'items', '[]'::jsonb);
  end if;

  select id into v_cart_id
  from public."StoreCart"
  where "customerId" = v_customer_id
    and "storeId" = p_store_id
    and status = 'ACTIVE'::public."StoreCartStatus"
  limit 1;

  if v_cart_id is null then
    return jsonb_build_object('cartId', null, 'itemCount', 0, 'totalAmount', 0, 'currency', 'IRR', 'items', '[]'::jsonb);
  end if;

  select coalesce(sum(ci.quantity * ci."unitPriceAmount"), 0)::bigint,
         coalesce(sum(ci.quantity), 0)::integer,
         coalesce(max(si.currency), 'IRR'),
         coalesce(jsonb_agg(
           jsonb_build_object(
             'itemId', si.id,
             'title', si.title,
             'quantity', ci.quantity,
             'unitPriceAmount', ci."unitPriceAmount",
             'lineTotalAmount', ci.quantity * ci."unitPriceAmount",
             'currency', si.currency,
             'inventoryCount', si."inventoryCount",
             'isActive', si."isActive"
           ) order by ci."createdAt"
         ), '[]'::jsonb)
    into v_total, v_count, v_currency, v_items
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id;

  return jsonb_build_object(
    'cartId', v_cart_id,
    'itemCount', v_count,
    'totalAmount', v_total,
    'currency', v_currency,
    'items', v_items
  );
end;
$$;

create or replace function public.bale_cart_change(
  p_store_id text,
  p_item_id text,
  p_external_user_id text,
  p_username text,
  p_display_name text,
  p_delta integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public."StoreItem"%rowtype;
  v_customer_id text;
  v_cart_id text;
  v_existing_qty integer := 0;
  v_new_qty integer;
  v_total bigint := 0;
  v_count integer := 0;
begin
  if p_delta = 0 or p_delta < -99 or p_delta > 99 then
    raise exception 'invalid_delta';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_store_id || ':bale:' || p_external_user_id));

  if not exists (
    select 1 from public."Store"
    where id = p_store_id and status = 'ACTIVE'::public."StoreStatus"
  ) then
    raise exception 'store_unavailable';
  end if;

  select * into v_item
  from public."StoreItem"
  where id = p_item_id
    and "storeId" = p_store_id
    and "isActive" = true
  for update;

  if not found then raise exception 'item_unavailable'; end if;

  insert into public."StoreCustomer" (
    id, "storeId", platform, "externalUserId", username, "displayName", metadata,
    "lastSeenAt", "createdAt", "updatedAt"
  ) values (
    gen_random_uuid()::text, p_store_id, 'bale', p_external_user_id,
    nullif(p_username, ''), nullif(p_display_name, ''), '{}'::jsonb,
    now(), now(), now()
  )
  on conflict ("storeId", platform, "externalUserId")
  do update set
    username = excluded.username,
    "displayName" = excluded."displayName",
    "lastSeenAt" = now(),
    "updatedAt" = now()
  returning id into v_customer_id;

  select id into v_cart_id
  from public."StoreCart"
  where "customerId" = v_customer_id and status = 'ACTIVE'::public."StoreCartStatus"
  limit 1
  for update;

  if v_cart_id is null then
    insert into public."StoreCart" (id, "storeId", "customerId", status, "createdAt", "updatedAt")
    values (gen_random_uuid()::text, p_store_id, v_customer_id, 'ACTIVE'::public."StoreCartStatus", now(), now())
    returning id into v_cart_id;
  end if;

  select quantity into v_existing_qty
  from public."StoreCartItem"
  where "cartId" = v_cart_id and "itemId" = p_item_id
  for update;

  v_existing_qty := coalesce(v_existing_qty, 0);
  v_new_qty := v_existing_qty + p_delta;

  if v_new_qty <= 0 then
    delete from public."StoreCartItem"
    where "cartId" = v_cart_id and "itemId" = p_item_id;
  else
    if v_item."inventoryCount" is not null and v_new_qty > v_item."inventoryCount" then
      raise exception 'insufficient_stock';
    end if;

    insert into public."StoreCartItem" (
      id, "cartId", "itemId", quantity, "unitPriceAmount", "createdAt", "updatedAt"
    ) values (
      gen_random_uuid()::text, v_cart_id, p_item_id, v_new_qty, v_item."priceAmount", now(), now()
    )
    on conflict ("cartId", "itemId")
    do update set
      quantity = excluded.quantity,
      "unitPriceAmount" = excluded."unitPriceAmount",
      "updatedAt" = now();
  end if;

  update public."StoreCart" set "updatedAt" = now() where id = v_cart_id;

  select coalesce(sum(ci.quantity * ci."unitPriceAmount"), 0)::bigint,
         coalesce(sum(ci.quantity), 0)::integer
    into v_total, v_count
  from public."StoreCartItem" ci
  where ci."cartId" = v_cart_id;

  return jsonb_build_object(
    'cartId', v_cart_id,
    'itemCount', v_count,
    'totalAmount', v_total,
    'currency', v_item.currency
  );
end;
$$;

create or replace function public.bale_checkout_cart(
  p_store_id text,
  p_external_user_id text,
  p_external_conversation_id text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id text;
  v_cart_id text;
  v_order_id text;
  v_existing public."StoreOrder"%rowtype;
  v_total bigint := 0;
  v_currency text := 'IRR';
  v_bad_count integer := 0;
begin
  perform pg_advisory_xact_lock(hashtext(p_store_id || ':bale:' || p_external_user_id));

  if p_idempotency_key is not null then
    select * into v_existing
    from public."StoreOrder"
    where "storeId" = p_store_id and "idempotencyKey" = p_idempotency_key
    limit 1;
    if found then
      return jsonb_build_object(
        'orderId', v_existing.id,
        'status', v_existing.status,
        'totalAmount', v_existing."totalAmount",
        'currency', v_existing.currency,
        'replayed', true
      );
    end if;
  end if;

  select id into v_customer_id
  from public."StoreCustomer"
  where "storeId" = p_store_id
    and platform = 'bale'
    and "externalUserId" = p_external_user_id
  limit 1;

  if v_customer_id is null then raise exception 'cart_empty'; end if;

  select id into v_cart_id
  from public."StoreCart"
  where "customerId" = v_customer_id
    and "storeId" = p_store_id
    and status = 'ACTIVE'::public."StoreCartStatus"
  limit 1
  for update;

  if v_cart_id is null then raise exception 'cart_empty'; end if;

  perform 1
  from public."StoreItem" si
  join public."StoreCartItem" ci on ci."itemId" = si.id
  where ci."cartId" = v_cart_id
  order by si.id
  for update of si;

  select count(*)::integer into v_bad_count
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id
    and (
      si."storeId" <> p_store_id
      or si."isActive" = false
      or (si."inventoryCount" is not null and ci.quantity > si."inventoryCount")
    );

  if v_bad_count > 0 then raise exception 'cart_items_unavailable'; end if;

  select coalesce(sum(ci.quantity * si."priceAmount"), 0)::bigint,
         coalesce(max(si.currency), 'IRR')
    into v_total, v_currency
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id;

  if v_total <= 0 and not exists (select 1 from public."StoreCartItem" where "cartId" = v_cart_id) then
    raise exception 'cart_empty';
  end if;

  v_order_id := gen_random_uuid()::text;

  insert into public."StoreOrder" (
    id, "storeId", "customerId", "sourcePlatform", "externalConversationId",
    status, "subtotalAmount", "discountAmount", "totalAmount", currency,
    note, "idempotencyKey", "createdAt", "updatedAt"
  ) values (
    v_order_id, p_store_id, v_customer_id, 'bale', p_external_conversation_id,
    'AWAITING_PAYMENT'::public."StoreOrderStatus", v_total, 0, v_total, v_currency,
    null, p_idempotency_key, now(), now()
  );

  insert into public."StoreOrderItem" (
    id, "orderId", "itemId", "titleSnapshot", "skuSnapshot", "unitPriceAmount",
    quantity, "lineTotalAmount", metadata, "createdAt"
  )
  select gen_random_uuid()::text, v_order_id, si.id, si.title, si.sku, si."priceAmount",
         ci.quantity, ci.quantity * si."priceAmount", '{}'::jsonb, now()
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id;

  update public."StoreCart"
  set status = 'CONVERTED'::public."StoreCartStatus", "updatedAt" = now()
  where id = v_cart_id;

  return jsonb_build_object(
    'orderId', v_order_id,
    'status', 'AWAITING_PAYMENT',
    'totalAmount', v_total,
    'currency', v_currency,
    'replayed', false
  );
end;
$$;

revoke all on function public.bale_cart_snapshot(text,text) from public, anon, authenticated;
revoke all on function public.bale_cart_change(text,text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.bale_checkout_cart(text,text,text,text) from public, anon, authenticated;
grant execute on function public.bale_cart_snapshot(text,text) to service_role;
grant execute on function public.bale_cart_change(text,text,text,text,text,integer) to service_role;
grant execute on function public.bale_checkout_cart(text,text,text,text) to service_role;