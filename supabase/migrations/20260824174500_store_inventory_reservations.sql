create table if not exists public."StoreInventoryReservation" (
  id text primary key default gen_random_uuid()::text,
  "orderId" text not null references public."StoreOrder"(id) on delete cascade,
  "itemId" text references public."StoreItem"(id) on delete set null,
  quantity integer not null check (quantity > 0),
  status text not null default 'RESERVED' check (status in ('RESERVED', 'CONSUMED', 'RELEASED')),
  "expiresAt" timestamptz not null,
  "releasedAt" timestamptz,
  "consumedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("orderId", "itemId")
);

create index if not exists "StoreInventoryReservation_orderId_idx"
  on public."StoreInventoryReservation" ("orderId");
create index if not exists "StoreInventoryReservation_itemId_idx"
  on public."StoreInventoryReservation" ("itemId");
create index if not exists "StoreInventoryReservation_status_expiresAt_idx"
  on public."StoreInventoryReservation" (status, "expiresAt");

alter table public."StoreInventoryReservation" enable row level security;
revoke all on table public."StoreInventoryReservation" from public, anon, authenticated;
grant select, insert, update, delete on table public."StoreInventoryReservation" to service_role;

create or replace function public.telegram_checkout_cart(
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
  v_expires_at timestamptz := now() + interval '30 minutes';
begin
  perform pg_advisory_xact_lock(hashtext(p_store_id || ':' || p_external_user_id));

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
        'reservationExpiresAt', (
          select max(r."expiresAt")
          from public."StoreInventoryReservation" r
          where r."orderId" = v_existing.id and r.status = 'RESERVED'
        ),
        'replayed', true
      );
    end if;
  end if;

  select id into v_customer_id
  from public."StoreCustomer"
  where "storeId" = p_store_id
    and platform = 'telegram'
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

  select count(*)::integer
    into v_bad_count
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
    v_order_id, p_store_id, v_customer_id, 'telegram', p_external_conversation_id,
    'AWAITING_PAYMENT'::public."StoreOrderStatus", v_total, 0, v_total, v_currency,
    null, p_idempotency_key, now(), now()
  );

  insert into public."StoreOrderItem" (
    id, "orderId", "itemId", "titleSnapshot", "skuSnapshot", "unitPriceAmount",
    quantity, "lineTotalAmount", metadata, "createdAt"
  )
  select gen_random_uuid()::text, v_order_id, si.id, si.title, si.sku, si."priceAmount",
         ci.quantity, ci.quantity * si."priceAmount",
         jsonb_build_object('inventoryReservation', case when si."inventoryCount" is null then 'unlimited' else 'reserved' end),
         now()
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id;

  insert into public."StoreInventoryReservation" (
    id, "orderId", "itemId", quantity, status, "expiresAt", "createdAt", "updatedAt"
  )
  select gen_random_uuid()::text, v_order_id, si.id, ci.quantity, 'RESERVED', v_expires_at, now(), now()
  from public."StoreCartItem" ci
  join public."StoreItem" si on si.id = ci."itemId"
  where ci."cartId" = v_cart_id
    and si."inventoryCount" is not null;

  update public."StoreItem" si
  set "inventoryCount" = si."inventoryCount" - reserved.quantity,
      "updatedAt" = now()
  from (
    select ci."itemId", ci.quantity
    from public."StoreCartItem" ci
    join public."StoreItem" locked_item on locked_item.id = ci."itemId"
    where ci."cartId" = v_cart_id
      and locked_item."inventoryCount" is not null
  ) reserved
  where si.id = reserved."itemId";

  update public."StoreCart"
  set status = 'CONVERTED'::public."StoreCartStatus", "updatedAt" = now()
  where id = v_cart_id;

  return jsonb_build_object(
    'orderId', v_order_id,
    'status', 'AWAITING_PAYMENT',
    'totalAmount', v_total,
    'currency', v_currency,
    'reservationExpiresAt', v_expires_at,
    'replayed', false
  );
end;
$$;

create or replace function public.store_cancel_order(
  p_store_id text,
  p_order_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public."StoreOrder"%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext('store-order:' || p_order_id));

  select * into v_order
  from public."StoreOrder"
  where id = p_order_id and "storeId" = p_store_id
  for update;

  if not found then raise exception 'order_not_found'; end if;

  if v_order.status = 'CANCELLED'::public."StoreOrderStatus" then
    return jsonb_build_object('orderId', v_order.id, 'status', v_order.status, 'replayed', true);
  end if;

  if v_order.status not in ('NEW'::public."StoreOrderStatus", 'AWAITING_PAYMENT'::public."StoreOrderStatus") then
    raise exception 'invalid_transition';
  end if;

  perform 1
  from public."StoreItem" si
  join public."StoreInventoryReservation" r on r."itemId" = si.id
  where r."orderId" = p_order_id and r.status = 'RESERVED'
  order by si.id
  for update of si;

  update public."StoreItem" si
  set "inventoryCount" = si."inventoryCount" + released.quantity,
      "updatedAt" = now()
  from (
    select r."itemId", sum(r.quantity)::integer as quantity
    from public."StoreInventoryReservation" r
    where r."orderId" = p_order_id
      and r.status = 'RESERVED'
      and r."itemId" is not null
    group by r."itemId"
  ) released
  where si.id = released."itemId"
    and si."inventoryCount" is not null;

  update public."StoreInventoryReservation"
  set status = 'RELEASED', "releasedAt" = now(), "updatedAt" = now()
  where "orderId" = p_order_id and status = 'RESERVED';

  update public."StoreOrder"
  set status = 'CANCELLED'::public."StoreOrderStatus", "updatedAt" = now()
  where id = p_order_id and "storeId" = p_store_id;

  return jsonb_build_object('orderId', p_order_id, 'status', 'CANCELLED', 'replayed', false);
end;
$$;

create or replace function public.store_confirm_order_payment(
  p_store_id text,
  p_order_id text,
  p_paid_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public."StoreOrder"%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext('store-order:' || p_order_id));

  select * into v_order
  from public."StoreOrder"
  where id = p_order_id and "storeId" = p_store_id
  for update;

  if not found then raise exception 'order_not_found'; end if;

  if v_order.status = 'PAID'::public."StoreOrderStatus" then
    return jsonb_build_object('orderId', v_order.id, 'status', v_order.status, 'paidAt', v_order."paidAt", 'replayed', true);
  end if;

  if v_order.status <> 'AWAITING_PAYMENT'::public."StoreOrderStatus" then
    raise exception 'invalid_transition';
  end if;

  if exists (
    select 1
    from public."StoreInventoryReservation"
    where "orderId" = p_order_id and status = 'RESERVED' and "expiresAt" <= now()
  ) then
    raise exception 'reservation_expired';
  end if;

  update public."StoreInventoryReservation"
  set status = 'CONSUMED', "consumedAt" = p_paid_at, "updatedAt" = now()
  where "orderId" = p_order_id and status = 'RESERVED';

  update public."StoreOrder"
  set status = 'PAID'::public."StoreOrderStatus", "paidAt" = p_paid_at, "updatedAt" = now()
  where id = p_order_id and "storeId" = p_store_id;

  return jsonb_build_object('orderId', p_order_id, 'status', 'PAID', 'paidAt', p_paid_at, 'replayed', false);
end;
$$;

create or replace function public.store_release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_count integer := 0;
begin
  for v_row in
    select distinct o."storeId", o.id
    from public."StoreOrder" o
    join public."StoreInventoryReservation" r on r."orderId" = o.id
    where o.status = 'AWAITING_PAYMENT'::public."StoreOrderStatus"
      and r.status = 'RESERVED'
      and r."expiresAt" <= now()
    order by o.id
  loop
    begin
      perform public.store_cancel_order(v_row."storeId", v_row.id);
      v_count := v_count + 1;
    exception when others then
      raise warning 'failed to release expired store order %: %', v_row.id, sqlerrm;
    end;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.telegram_checkout_cart(text, text, text, text) from public, anon, authenticated;
grant execute on function public.telegram_checkout_cart(text, text, text, text) to service_role;
revoke all on function public.store_cancel_order(text, text) from public, anon, authenticated;
grant execute on function public.store_cancel_order(text, text) to service_role;
revoke all on function public.store_confirm_order_payment(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.store_confirm_order_payment(text, text, timestamptz) to service_role;
revoke all on function public.store_release_expired_reservations() from public, anon, authenticated;
grant execute on function public.store_release_expired_reservations() to service_role;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'store-release-expired-reservations' limit 1;
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  perform cron.schedule(
    'store-release-expired-reservations',
    '*/5 * * * *',
    'select public.store_release_expired_reservations();'
  );
end;
$$;
