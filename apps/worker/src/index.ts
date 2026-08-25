// متغیرهای محیطی فایل .env را هنگام شروع Worker داخل process.env بارگذاری می‌کند.
import 'dotenv/config';

// این Log نشان می‌دهد Process مربوط به Worker با موفقیت شروع شده است.
console.log('[ai-panel-worker] worker process started');
// این پیام یادآوری می‌کند که منطق Queue انتشار زمان‌بندی‌شده هنوز باید در همین Worker متصل/پیاده‌سازی شود.
console.log('[ai-panel-worker] scheduled publishing queue will be attached here');
