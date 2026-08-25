/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// متغیرهای محیطی فایل .env را هنگام شروع Worker داخل process.env بارگذاری می‌کند.
// راهنما: این دستور فایل/ماژول را از ماژول «dotenv/config» وارد می‌کند تا در این فایل قابل استفاده باشد.
import 'dotenv/config';

// این Log نشان می‌دهد Process مربوط به Worker با موفقیت شروع شده است.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.log('[ai-panel-worker] worker process started')».
console.log('[ai-panel-worker] worker process started');
// این پیام یادآوری می‌کند که منطق Queue انتشار زمان‌بندی‌شده هنوز باید در همین Worker متصل/پیاده‌سازی شود.
// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.log('[ai-panel-worker] scheduled publishing queue will be attached here')».
console.log('[ai-panel-worker] scheduled publishing queue will be attached here');
