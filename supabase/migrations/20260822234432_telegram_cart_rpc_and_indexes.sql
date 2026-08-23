create index if not exists "StoreCartItem_itemId_idx" on public."StoreCartItem"("itemId");
create index if not exists "StoreOrderItem_itemId_idx" on public."StoreOrderItem"("itemId");

alter function private.telegram_cart_change(text,text,text,text,text,integer) set schema public;
alter function private.telegram_cart_snapshot(text,text) set schema public;
alter function private.telegram_checkout_cart(text,text,text,text) set schema public;

revoke all on function public.telegram_cart_change(text,text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.telegram_cart_snapshot(text,text) from public, anon, authenticated;
revoke all on function public.telegram_checkout_cart(text,text,text,text) from public, anon, authenticated;
grant execute on function public.telegram_cart_change(text,text,text,text,text,integer) to service_role;
grant execute on function public.telegram_cart_snapshot(text,text) to service_role;
grant execute on function public.telegram_checkout_cart(text,text,text,text) to service_role;