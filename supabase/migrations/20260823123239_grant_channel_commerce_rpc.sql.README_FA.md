# راهنمای خط‌به‌خط `20260823123239_grant_channel_commerce_rpc.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `grant execute on function public.channel_cart_snapshot(text,text,text) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 2: `grant execute on function public.channel_cart_change(text,text,text,text,text,text,integer) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.
- خط 3: `grant execute on function public.channel_checkout_cart(text,text,text,text,text) to service_role;` — این دستور Permission دسترسی نقش‌های دیتابیس را تنظیم می‌کند.