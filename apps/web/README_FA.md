# راهنمای پوشه apps/web

این پوشه رابط کاربری اصلی AI Panel است و با React + TypeScript + Vite ساخته شده است.

## فایل‌های سطح پوشه
- `index.html`: پوسته اولیه HTML و محل `#root` برای React.
- `package.json`: وابستگی‌ها و Scriptهای Web؛ JSON خالص است و کامنت داخل آن مجاز نیست.
- `tsconfig*.json`: تنظیمات TypeScript؛ JSON است و باید بدون کامنت بماند مگر فرمت JSONC باشد.
- `dist/`: خروجی Build؛ توسط Vite تولید می‌شود و کد منبع نیست.

## پوشه src
- `main.tsx`: نقطه ورود و Router سطح اول.
- `App.tsx`: Landing، Auth و بخشی از Shell/پنل.
- `CustomerHome.tsx`: داشبورد مشتری.
- `TelegramControlCenter.tsx`: کنترل تلگرام.
- `InstagramControlCenter.tsx`: کنترل اینستاگرام.
- `WhatsAppControlCenter.tsx`: کنترل واتساپ.
- `BaleControlCenter.tsx`: کنترل بله.
- `RubikaControlCenter.tsx`: کنترل روبیکا.
- `DiscordControlCenter.tsx`: کنترل دیسکورد.
- `AnalyticsDashboard.tsx`: آمار و تحلیل‌ها.
- `Booking*.tsx`: مجموعه صفحات Time/Booking.
- `Public*.tsx`: صفحات عمومی بدون نیاز به حضور در داشبورد.
- `TelegramProjectMiniAppV2.tsx`: Mini App تلگرام.
- `styles.css`: CSS سراسری.

## چه چیزهایی برنامه‌نویسی خود پروژه هستند؟
تمام فایل‌های داخل `src`، `index.html` و تنظیمات Vite/TypeScript بخشی از سورس پروژه‌اند.

## چه چیزهایی تولیدی هستند؟
`dist` با Build ساخته می‌شود و نباید دستی توسعه داده شود.
