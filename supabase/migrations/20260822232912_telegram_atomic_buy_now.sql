create or replace function public.telegram_create_store_order(
  p_store_id text,
  p_item_id text,
  p_external_user_id text,
  p_username text,
  p_display_name text,
  p_external_conversation_id text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store public."Store"%rowtype;
  v_item public."StoreItem"%rowtype;
  v_customer_id text;
  v_order_id text;
  v_existing public."StoreOrder"%rowtype;
begin
  select * into v_store
  from public."Store"
  where id = p_store_id and status = 'ACTIVE'::public."StoreStatus";

  if not found then
    raise exception 'store_unavailable';
  end if;

  select * into v_item
  from public."StoreItem"
  where id = p_item_id
    and "storeId" = p_store_id
    and "isActive" = true
  for update;

  if not found then
    raise exception 'item_unavailable';
  end if;

  if v_item."inventoryCount" is not null and v_item."inventoryCount" <= 0 then
    raise exception 'out_of_stock';
  end if;

  insert into public."StoreCustomer" (
    id, "storeId", platform, "externalUserId", username, "displayName", metadata,
    "lastSeenAt", "createdAt", "updatedAt"
  ) values (
    gen_random_uuid()::text,
    p_store_id,
    'telegram',
    p_external_user_id,
    nullif(p_username, ''),
    nullif(p_display_name, ''),
    '{}'::jsonb,
    now(), now(), now()
  )
  on conflict ("storeId", platform, "externalUserId")
  do update set
    username = excluded.username,
    "displayName" = excluded."displayName",
    "lastSeenAt" = now(),
    "updatedAt" = now()
  returning id into v_customer_id;

  if p_idempotency_key is not null then
    select * into v_existing
    from public."StoreOrder"
    where "storeId" = p_store_id
      and "idempotencyKey" = p_idempotency_key
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

  v_order_id := gen_random_uuid()::text;

  insert into public."StoreOrder" (
    id, "storeId", "customerId", "sourcePlatform", "externalConversationId",
    status, "subtotalAmount", "discountAmount", "totalAmount", currency,
    note, "idempotencyKey", "createdAt", "updatedAt"
  ) values (
    v_order_id,
    p_store_id,
    v_customer_id,
    'telegram',
    p_external_conversation_id,
    'AWAITING_PAYMENT'::public."StoreOrderStatus",
    v_item."priceAmount",
    0,
    v_item."priceAmount",
    v_item.currency,
    null,
    p_idempotency_key,
    now(), now()
  );

  insert into public."StoreOrderItem" (
    id, "orderId", "itemId", "titleSnapshot", "skuSnapshot", "unitPriceAmount",
    quantity, "lineTotalAmount", metadata, "createdAt"
  ) values (
    gen_random_uuid()::text,
    v_order_id,
    v_item.id,
    v_item.title,
    v_item.sku,
    v_item."priceAmount",
    1,
    v_item."priceAmount",
    '{}'::jsonb,
    now()
  );

  return jsonb_build_object(
    'orderId', v_order_id,
    'status', 'AWAITING_PAYMENT',
    'totalAmount', v_item."priceAmount",
    'currency', v_item.currency,
    'replayed', false
  );
end;
$$;

revoke all on function public.telegram_create_store_order(text,text,text,text,text,text,text) from public;
revoke all on function public.telegram_create_store_order(text,text,text,text,text,text,text) from anon;
revoke all on function public.telegram_create_store_order(text,text,text,text,text,text,text) from authenticated;
grant execute on function public.telegram_create_store_order(text,text,text,text,text,text,text) to service_role;