# راهنمای خط‌به‌خط `20260822234432_telegram_cart_rpc_and_indexes.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create index if not exists "StoreCartItem_itemId_idx" on public."StoreCartItem"("itemId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 2: `create index if not exists "StoreOrderItem_itemId_idx" on public."StoreOrderItem"("itemId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 4: `alter function private.telegram_cart_change(text,text,text,text,text,integer) set schema public;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 5: `alter function private.telegram_cart_snapshot(text,text) set schema public;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 6: `alter function private.telegram_checkout_cart(text,text,text,text) set schema public;` — این خط بخشی از دستور SQL یا تعریف ساختار/داده دیتابیس است.
- خط 8: `revoke all on function public.telegram_cart_change(text,text,text,text,text,integer) from public, anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 9: `revoke all on function public.telegram_cart_snapshot(text,text) from public, anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 10: `revoke all on function public.telegram_checkout_cart(text,text,text,text) from public, anon, authenticated;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 11: `grant execute on function public.telegram_cart_change(text,text,text,text,text,integer) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 12: `grant execute on function public.telegram_cart_snapshot(text,text) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 13: `grant execute on function public.telegram_checkout_cart(text,text,text,text) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.