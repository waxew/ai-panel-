# راهنمای خط‌به‌خط `20260823111928_booking_core_v1_indexes.sql`

> SQL می‌تواند شامل Function body و رشته‌های چندخطی باشد؛ تزریق کامنت خودکار بین همه خطوط ممکن است معنی Migration را عوض کند. برای حفظ دیتابیس، توضیح خط‌به‌خط در این فایل کنار Migration ذخیره می‌شود.

- خط 1: `create index if not exists "BookingAppointment_serviceId_idx" on public."BookingAppointment"("serviceId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 2: `create index if not exists "BookingAppointment_createdByUserId_idx" on public."BookingAppointment"("createdByUserId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.
- خط 3: `create index if not exists "BookingStaffService_serviceId_idx" on public."BookingStaffService"("serviceId");` — این دستور Index ایجاد می‌کند تا جستجو/Unique constraint بهینه یا enforce شود.