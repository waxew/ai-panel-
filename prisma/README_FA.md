# راهنمای Prisma در AI Panel

## `schema.prisma`
این فایل Schema اصلی Prisma است و توسط برنامه‌نویس نگهداری می‌شود. مدل‌های داده، Enumها، Relationها، Unique Constraintها و Defaultها اینجا تعریف می‌شوند.

### معنی دستورات رایج
- `generator`: مشخص می‌کند Prisma چه Client/Artifactی تولید کند.
- `datasource`: نوع دیتابیس و منبع Connection را معرفی می‌کند.
- `model`: یک موجودیت دیتابیس را تعریف می‌کند.
- `enum`: مجموعه مقدارهای محدود و از پیش تعریف‌شده.
- `@id`: Primary Key.
- `@default(...)`: مقدار پیش‌فرض.
- `@unique`: Unique Constraint.
- `@relation(...)`: Relation بین Modelها.
- `@updatedAt`: Prisma هنگام Update زمان این فیلد را به‌روز می‌کند.
- `@@index`: Index چندفیلدی/سطح Model.
- `@@unique`: Unique Constraint چندفیلدی.

## فایل‌های generated Prisma
فایل‌های Client که از Schema تولید می‌شوند سورس اصلی طراحی دیتابیس نیستند. با اجرای Prisma Generate دوباره ساخته می‌شوند، پس برای یادگیری و تغییر ساختار باید اول `schema.prisma` را بررسی کرد.
