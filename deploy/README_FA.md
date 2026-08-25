# راهنمای فارسی پوشه `deploy`

این پوشه برای فایل‌هایی استفاده می‌شود که به استقرار/انتشار پروژه مربوط هستند و لزوماً کد اجرایی برنامه نیستند.

## `portal-auth-store-live.txt`

محتوای فعلی فایل:

`Deploy trigger for authenticated portal, store manager, admin dashboard, and Telegram commerce integration.`

معنی آن این است که این فایل به‌عنوان یک Marker/Trigger برای انتشار یا ثبت تغییر مربوط به این بخش‌ها ساخته شده است:

- پورتال احراز هویت‌شده کاربران
- مدیریت فروشگاه
- داشبورد ادمین
- اتصال Commerce به تلگرام

این فایل TypeScript/JavaScript نیست و Syntax کامنت برنامه‌نویسی ندارد. بنابراین برای جلوگیری از تغییر نقش احتمالی آن در فرآیند Deployment، توضیحات آموزشی داخل همین `README_FA.md` نگهداری می‌شود و خود فایل Trigger بدون تغییر باقی مانده است.
