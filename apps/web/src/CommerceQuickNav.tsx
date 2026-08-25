/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// useState برای نگهداری باز یا بسته بودن منوی «بیشتر» از React وارد می‌شود.
// راهنما: این دستور { useState } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useState } from 'react';

// این آرایه لینک‌های اصلی و همیشه قابل مشاهده منوی سریع پایین صفحه را تعریف می‌کند.
// راهنما: این دستور متغیر/ثابت «coreLinks» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const coreLinks = [
  // لینک خانه کاربر را به داشبورد اصلی می‌برد.
  ['/app', 'خانه'],
  // لینک فروشگاه صفحه مدیریت محصولات و فروشگاه را باز می‌کند.
  ['/app/store', 'فروشگاه'],
  // لینک ربات فروش سازنده جریان مشترک Bot Commerce را باز می‌کند.
  ['/app/bot-commerce', 'ربات فروش'],
  // لینک سفارش‌ها صفحه مدیریت سفارش‌های مشتریان را باز می‌کند.
  ['/app/orders', 'سفارش‌ها'],
// as const باعث می‌شود TypeScript مقادیر رشته‌ای این آرایه را Literal و فقط‌خواندنی در نظر بگیرد.
] as const;

// این آرایه لینک‌هایی را نگه می‌دارد که داخل پنل بازشونده «بخش‌های دیگر» نمایش داده می‌شوند.
// راهنما: این دستور متغیر/ثابت «moreLinks» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const moreLinks = [
  // صفحه پروفایل، کیف پول و اطلاعات حساب کاربری.
  ['/app/account', 'حساب کاربری'],
  // مرکز کنترل ربات‌ها و اتصال تلگرام.
  ['/app/telegram', 'تلگرام'],
  // مرکز کنترل حساب و اتوماسیون اینستاگرام.
  ['/app/instagram', 'اینستاگرام'],
  // مرکز کنترل واتساپ.
  ['/app/whatsapp', 'واتساپ'],
  // مرکز کنترل پیام‌رسان بله.
  ['/app/bale', 'بله'],
  // مرکز کنترل روبیکا.
  ['/app/rubika', 'روبیکا'],
  // مرکز کنترل دیسکورد.
  ['/app/discord', 'دیسکورد'],
  // داشبورد گزارش‌ها و تحلیل عملکرد.
  ['/app/analytics', 'گزارش‌ها'],
  // صفحه طراحی و مدیریت قالب فروشگاه.
  ['/app/store/templates', 'قالب فروشگاه'],
  // ورودی اصلی ماژول رزرو، نوبت‌دهی و مدیریت مشتری.
  ['/app/booking', 'رزرو و نوبت'],
// این آرایه نیز با as const به شکل Tupleهای فقط‌خواندنی و دقیق Type می‌شود.
] as const;

// این کامپوننت یک منوی سریع ثابت در پایین تمام صفحات داخلی /app ایجاد می‌کند.
// راهنما: این تابع «CommerceQuickNav» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function CommerceQuickNav() {
  // مسیر فعلی مرورگر برای تشخیص صفحه فعال خوانده می‌شود.
  // راهنما: این دستور متغیر/ثابت «path» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const path = window.location.pathname;
  // State زیر مشخص می‌کند پنل «بخش‌های دیگر» باز باشد یا بسته.
  // راهنما: این دستور State محلی React برای «[open, setOpen]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [open, setOpen] = useState(false);
  // اگر کاربر خارج از بخش داخلی /app باشد اصلاً منوی سریع رندر نمی‌شود.
  // راهنما: این شرط بررسی می‌کند آیا «!path.startsWith('/app')» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!path.startsWith('/app')) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;

  // این متغیر دو URL قدیمی و جدید سازنده ربات فروش را به‌عنوان یک بخش فعال در نظر می‌گیرد.
  // راهنما: این دستور متغیر/ثابت «botActive» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const botActive = path === '/app/bot-commerce' || path === '/app/telegram-builder';

  // خروجی JSX شامل پنل «بیشتر» و نوار ناوبری ثابت پایین صفحه است.
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «( // پوسته اصلی منو ثابت است و dir=rtl جهت رابط فارسی را تعیین می‌کند. <di…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (
    // پوسته اصلی منو ثابت است و dir=rtl جهت رابط فارسی را تعیین می‌کند.
    <div className="quick-shell" dir="rtl">
      {/* CSS محلی این کامپوننت از ثابت styles داخل تگ style قرار می‌گیرد. */}
      <style>{styles}</style>
      {/* پنل لینک‌های بیشتر فقط زمانی رندر می‌شود که open برابر true باشد. */}
      {open && (
        // quick-more کادر شناور بالای نوار اصلی است.
        <div className="quick-more">
          {/* سطر بالای پنل عنوان و دکمه بستن را نگه می‌دارد. */}
          <div>
            {/* عنوان پنل لینک‌های ثانویه است. */}
            <b>بخش‌های دیگر</b>
            {/* کلیک روی این دکمه State را false می‌کند و پنل بسته می‌شود. */}
            <button type="button" onClick={() => setOpen(false)}>بستن</button>
          </div>
          {/* nav فهرست لینک‌های ثانویه را از آرایه moreLinks می‌سازد. */}
          <nav>
            {/* map برای هر جفت href/label یک لینک تولید می‌کند. */}
            {moreLinks.map(([href, label]) => (
              // href مقصد لینک است؛ key برای شناسایی پایدار آیتم توسط React استفاده می‌شود.
              <a
                key={href}
                href={href}
                // لینک دقیق فعلی active می‌شود؛ برای Booking تمام زیرمسیرهای /app/booking هم فعال محسوب می‌شوند.
                className={path === href || (href === '/app/booking' && path.startsWith('/app/booking')) ? 'active' : ''}
              >
                {/* label متن فارسی تعریف‌شده در آرایه moreLinks است. */}
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
      {/* نوار اصلی همیشه در صفحات /app نمایش داده می‌شود و برای Accessibility نام فارسی دارد. */}
      <nav className="quick-nav" aria-label="منوی اصلی">
        {/* لینک‌های اصلی با map از آرایه coreLinks تولید می‌شوند. */}
        {coreLinks.map(([href, label]) => (
          // هر لینک صفحه مقصد و کلاس active احتمالی خودش را می‌گیرد.
          <a
            key={href}
            href={href}
            // برای ربات فروش علاوه بر مسیر اصلی، alias قدیمی telegram-builder هم حالت active را فعال می‌کند.
            className={path === href || (href === '/app/bot-commerce' && botActive) ? 'active' : ''}
          >
            {/* label متن قابل مشاهده لینک است. */}
            {label}
          </a>
        ))}
        {/* دکمه «بیشتر» پنل لینک‌های ثانویه را Toggle می‌کند. */}
        <button
          type="button"
          // وقتی پنل باز است خود دکمه نیز کلاس active می‌گیرد.
          className={open ? 'active' : ''}
          // مقدار قبلی State برعکس می‌شود؛ false به true و true به false تبدیل می‌شود.
          onClick={() => setOpen((value) => !value)}
        >
          {/* متن دکمه بازکننده پنل ثانویه. */}
          بیشتر
        </button>
      </nav>
    </div>
  );
}

// این Template String تمام CSS مخصوص منوی سریع را نگه می‌دارد.
// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
/* پوسته منو پایین و وسط Viewport ثابت می‌ماند و z-index بالا آن را روی محتوای صفحه قرار می‌دهد. */
.quick-shell{position:fixed;z-index:120;left:50%;bottom:10px;transform:translateX(-50%);font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}
/* نوار اصلی لینک‌ها را افقی می‌چیند و پس‌زمینه نیمه‌شفاف، Border و Blur ایجاد می‌کند. */
.quick-nav{display:flex;align-items:center;gap:4px;padding:5px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.97);box-shadow:0 14px 45px rgba(0,0,0,.42);backdrop-filter:blur(16px)}
/* لینک‌ها و دکمه داخل نوار ظاهر یکسان، بدون Border پیش‌فرض و با Cursor قابل کلیک دارند. */
.quick-nav a,.quick-nav button{border:0;background:transparent;color:#8f9bad;text-decoration:none;padding:9px 12px;border-radius:9px;white-space:nowrap;font:800 10px inherit;cursor:pointer}
/* لینک Hover یا Active و دکمه Active با پس‌زمینه روشن از بقیه متمایز می‌شوند. */
.quick-nav a:hover,.quick-nav a.active,.quick-nav button.active{background:#eef3f9;color:#090e15}
/* پنل «بیشتر» بالای نوار اصلی و در مرکز قرار می‌گیرد و حداکثر عرض آن برای موبایل محدود می‌شود. */
.quick-more{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);width:min(460px,calc(100vw - 20px));padding:12px;border:1px solid #2a3548;border-radius:14px;background:#0b1119;box-shadow:0 20px 60px rgba(0,0,0,.55)}
/* سطر عنوان پنل بیشتر با Flex عنوان و دکمه بستن را دو طرف قرار می‌دهد. */
.quick-more>div{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;color:#dce3ed;font-size:11px}
/* دکمه بستن پنل ظاهر کوچک و تیره دارد. */
.quick-more>div button{border:0;background:#17202d;color:#aeb8c6;border-radius:8px;padding:6px 8px;font-size:9px;cursor:pointer}
/* لینک‌های ثانویه در دسکتاپ به‌صورت Grid دو ستونه چیده می‌شوند. */
.quick-more nav{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
/* هر لینک ثانویه به شکل یک کارت کوچک دارای Border نمایش داده می‌شود. */
.quick-more a{padding:10px;border:1px solid #222c3a;border-radius:10px;color:#aeb8c6;text-decoration:none;font-size:10px}
/* لینک فعال یا Hover در پنل بیشتر روشن‌تر می‌شود. */
.quick-more a.active,.quick-more a:hover{border-color:#52617a;color:#fff;background:#111923}
/* قوانین زیر فقط در صفحه‌های با عرض حداکثر 520px اعمال می‌شوند. */
@media(max-width:520px){
  /* در موبایل پوسته به‌جای مرکز شدن با transform، از دو سمت 8px فاصله می‌گیرد. */
  .quick-shell{left:8px;right:8px;transform:none}
  /* لینک‌های نوار اصلی در تمام عرض موجود پخش می‌شوند. */
  .quick-nav{justify-content:space-between}
  /* Padding و فونت آیتم‌های نوار برای فضای کم موبایل کوچک‌تر می‌شوند. */
  .quick-nav a,.quick-nav button{padding:9px 8px;font-size:9px}
  /* پنل بیشتر در موبایل تمام عرض پوسته را می‌گیرد و transform آن حذف می‌شود. */
  .quick-more{left:0;right:0;transform:none;width:auto}
  /* لینک‌های پنل بیشتر همچنان در دو ستون باقی می‌مانند. */
  .quick-more nav{grid-template-columns:1fr 1fr}
}
`;
