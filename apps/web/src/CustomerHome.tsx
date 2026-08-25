// هوک useEffect برای اجرای کارهای جانبی بعد از رندر و useState برای نگهداری وضعیت محلی کامپوننت از React وارد می‌شوند.
import { useEffect, useState } from 'react';

// این Type شکل داده‌ای را مشخص می‌کند که API داشبورد مشتری می‌تواند به فرانت‌اند برگرداند.
type DashboardData = {
  // ok در صورت وجود نشان می‌دهد عملیات سمت API موفق بوده است.
  ok?: boolean;
  // message پیام اختیاری API است و معمولاً برای توضیح خطا یا نتیجه استفاده می‌شود.
  message?: string;
  // user اطلاعات پایه کاربر واردشده را نگه می‌دارد.
  user?: {
    // email ایمیل حساب کاربری است.
    email?: string;
    // displayName نام نمایشی کاربر است و می‌تواند خالی یا null باشد.
    displayName?: string | null;
  };
  // telegramBots فهرست ربات‌های تلگرام متصل به این کاربر را نگه می‌دارد.
  telegramBots?: Array<{
    // id شناسه داخلی هر ربات تلگرام است.
    id: string;
    // status وضعیت اتصال/فعالیت ربات را مشخص می‌کند.
    status: string;
  }>;
  // instagramAccounts فهرست حساب‌های اینستاگرام متصل را نگه می‌دارد.
  instagramAccounts?: Array<{
    // id شناسه داخلی حساب اینستاگرام است.
    id: string;
    // status وضعیت اتصال حساب اینستاگرام است.
    status: string;
  }>;
  // whatsappAccounts فهرست حساب‌های واتساپ متصل را نگه می‌دارد.
  whatsappAccounts?: Array<{
    // id شناسه داخلی حساب واتساپ است.
    id: string;
    // status وضعیت اتصال حساب واتساپ را مشخص می‌کند.
    status: string;
  }>;
  // summary آمار خلاصه‌ای است که Backend می‌تواند برای کارت‌های داشبورد برگرداند.
  summary?: {
    // activeSubscriptions تعداد اشتراک‌های فعال کاربر است.
    activeSubscriptions?: number;
    // activeTelegramBots تعداد ربات‌های تلگرام فعال است.
    activeTelegramBots?: number;
    // activeInstagramAccounts تعداد حساب‌های اینستاگرام فعال است.
    activeInstagramAccounts?: number;
    // activeWhatsAppAccounts تعداد حساب‌های واتساپ فعال است.
    activeWhatsAppAccounts?: number;
  };
};

// این کامپوننت صفحه اصلی پنل مشتری را می‌سازد و اطلاعات اتصال کانال‌ها را از API دریافت می‌کند.
export default function CustomerHome() {
  // data پاسخ موفق API را نگه می‌دارد؛ قبل از دریافت پاسخ مقدار آن null است.
  const [data, setData] = useState<DashboardData | null>(null);
  // error متن خطای قابل نمایش به کاربر را نگه می‌دارد.
  const [error, setError] = useState('');

  // این Effect فقط یک بار بعد از اولین رندر اجرا می‌شود چون dependency array آن خالی است.
  useEffect(() => {
    // درخواست GET به API داشبورد مشتری ارسال می‌شود؛ cache=no-store باعث می‌شود داده قدیمی مرورگر استفاده نشود.
    void fetch('/api/customer/dashboard', {
      // از سرور صریحاً پاسخ JSON درخواست می‌کنیم.
      headers: { accept: 'application/json' },
      // پاسخ این درخواست نباید از Cache مرورگر خوانده شود.
      cache: 'no-store',
    })
      // بعد از دریافت پاسخ HTTP، بدنه آن بررسی می‌شود.
      .then(async (response) => {
        // پاسخ JSON خوانده می‌شود؛ اگر JSON معتبر نباشد یک شیء خالی جایگزین می‌شود تا برنامه Crash نکند.
        const payload = (await response.json().catch(() => ({}))) as DashboardData;
        // کد 401 یعنی Session معتبر نیست؛ در این حالت کاربر به صفحه Login منتقل می‌شود.
        if (response.status === 401) {
          // آدرس مرورگر را به صفحه ورود تغییر می‌دهیم.
          window.location.assign('/login');
          // ادامه پردازش این پاسخ متوقف می‌شود.
          return;
        }
        // هر پاسخ ناموفق دیگر به Error تبدیل می‌شود تا وارد catch پایین شود.
        if (!response.ok) throw new Error(payload.message || 'dashboard_failed');
        // در پاسخ موفق، داده دریافتی داخل State قرار می‌گیرد و کامپوننت دوباره رندر می‌شود.
        setData(payload);
      })
      // اگر شبکه یا پردازش پاسخ خطا بدهد، پیام فارسی خطا برای کاربر ذخیره می‌شود.
      .catch(() => setError('داشبورد فعلاً دریافت نشد.'));
  }, []);

  // خروجی JSX زیر رابط اصلی داشبورد را می‌سازد.
  return (
    // div ریشه صفحه است؛ کلاس simple-home برای استایل و dir=rtl برای راست‌به‌چپ بودن رابط فارسی استفاده می‌شود.
    <div className="simple-home" dir="rtl">
      {/* استایل‌های محلی تعریف‌شده در ثابت styles را داخل صفحه تزریق می‌کنیم. */}
      <style>{styles}</style>
      {/* main محدوده اصلی محتوای داشبورد است. */}
      <main>
        {/* header خوشامدگویی کاربر و لینک حساب کاربری را نمایش می‌دهد. */}
        <header>
          {/* این div متن معرفی و نام کاربر را گروه‌بندی می‌کند. */}
          <div>
            {/* نام محصول/پنل را نمایش می‌دهیم. */}
            <span>AI Panel</span>
            {/* اگر displayName موجود باشد سلام شخصی‌سازی‌شده و در غیر این صورت عنوان عمومی داشبورد نشان داده می‌شود. */}
            <h1>{data?.user?.displayName ? `سلام ${data.user.displayName}` : 'داشبورد'}</h1>
            {/* توضیح کوتاه درباره نقش صفحه اصلی پنل نمایش داده می‌شود. */}
            <p>از اینجا فقط کارهای اصلی را شروع کن. تنظیمات جزئی داخل هر بخش قرار گرفته‌اند.</p>
          </div>
          {/* این لینک کاربر را به صفحه حساب کاربری می‌برد. */}
          <a href="/app/account">حساب کاربری</a>
        </header>

        {/* فقط زمانی که State خطا خالی نباشد، جعبه خطا نمایش داده می‌شود. */}
        {error && <div className="error">{error}</div>}

        {/* این Section سه اقدام اصلی مربوط به فروشگاه و سفارش را نمایش می‌دهد. */}
        <section className="primary-actions">
          {/* لینک 01 صفحه مدیریت فروشگاه را باز می‌کند. */}
          <a href="/app/store">
            {/* شماره بصری کارت فروشگاه است. */}
            <i>01</i>
            {/* عنوان و توضیح کارت فروشگاه را گروه‌بندی می‌کند. */}
            <div>
              {/* عنوان اقدام اصلی است. */}
              <b>فروشگاه</b>
              {/* توضیح می‌دهد در این بخش چه چیزهایی مدیریت می‌شوند. */}
              <span>محصول، نوع محصول و دسته‌بندی</span>
            </div>
            {/* فلش فقط نشانه بصری ورود به صفحه بعدی است. */}
            <em>←</em>
          </a>
          {/* لینک 02 سازنده جریان فروش ربات را باز می‌کند. */}
          <a href="/app/bot-commerce">
            {/* شماره بصری کارت ربات فروش است. */}
            <i>02</i>
            {/* عنوان و توضیح کارت ربات فروش را گروه‌بندی می‌کند. */}
            <div>
              {/* عنوان اقدام ربات فروش است. */}
              <b>ربات فروش</b>
              {/* توضیح کوتاه درباره منو و جریان خرید مشترک نمایش داده می‌شود. */}
              <span>منو و جریان خرید مشترک</span>
            </div>
            {/* فلش ورود به صفحه بعدی است. */}
            <em>←</em>
          </a>
          {/* لینک 03 صفحه مدیریت سفارش‌ها را باز می‌کند. */}
          <a href="/app/orders">
            {/* شماره بصری کارت سفارش‌ها است. */}
            <i>03</i>
            {/* عنوان و توضیح کارت سفارش‌ها را گروه‌بندی می‌کند. */}
            <div>
              {/* عنوان کارت سفارش‌ها است. */}
              <b>سفارش‌ها</b>
              {/* توضیح می‌دهد این صفحه برای پیگیری سفارش مشتریان است. */}
              <span>پیگیری سفارش‌های مشتریان</span>
            </div>
            {/* فلش ورود به صفحه بعدی است. */}
            <em>←</em>
          </a>
        </section>

        {/* این Section میانبر کانال‌ها و گزارش‌ها را نمایش می‌دهد. */}
        <section className="secondary">
          {/* عنوان بخش اتصال پیام‌رسان‌ها را نمایش می‌دهد. */}
          <div className="section-title">
            {/* این div برچسب کوچک و عنوان اصلی را کنار هم نگه می‌دارد. */}
            <div>
              {/* برچسب دسته این قسمت است. */}
              <span>کانال‌ها</span>
              {/* عنوان اصلی بخش کانال‌ها است. */}
              <h2>اتصال پیام‌رسان‌ها</h2>
            </div>
          </div>
          {/* Grid زیر کارت‌های کانال‌ها را کنار هم می‌چیند. */}
          <div className="channel-grid">
            {/* این لینک مرکز کنترل تلگرام را باز می‌کند. */}
            <a href="/app/telegram">
              {/* نام کانال تلگرام نمایش داده می‌شود. */}
              <b>تلگرام</b>
              {/* پس از دریافت data تعداد ربات‌ها نمایش داده می‌شود؛ قبل از آن سه نقطه دیده می‌شود. */}
              <span>{data ? `${data.telegramBots?.length ?? 0} ربات متصل` : '...'}</span>
            </a>
            {/* این لینک مرکز کنترل اینستاگرام را باز می‌کند. */}
            <a href="/app/instagram">
              {/* نام کانال اینستاگرام نمایش داده می‌شود. */}
              <b>اینستاگرام</b>
              {/* تعداد حساب‌های اینستاگرام متصل یا حالت بارگذاری نمایش داده می‌شود. */}
              <span>{data ? `${data.instagramAccounts?.length ?? 0} حساب` : '...'}</span>
            </a>
            {/* این لینک مرکز کنترل واتساپ را باز می‌کند. */}
            <a href="/app/whatsapp">
              {/* نام کانال واتساپ نمایش داده می‌شود. */}
              <b>واتساپ</b>
              {/* تعداد حساب‌های واتساپ متصل یا حالت بارگذاری نمایش داده می‌شود. */}
              <span>{data ? `${data.whatsappAccounts?.length ?? 0} حساب` : '...'}</span>
            </a>
            {/* این لینک داشبورد تحلیل و گزارش‌ها را باز می‌کند. */}
            <a href="/app/analytics">
              {/* عنوان گزارش‌ها نمایش داده می‌شود. */}
              <b>گزارش‌ها</b>
              {/* کارکرد صفحه گزارش‌ها به‌صورت کوتاه توضیح داده می‌شود. */}
              <span>آمار و عملکرد</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

// این Template String تمام CSS مخصوص داشبورد ساده مشتری را نگه می‌دارد و توسط تگ style بالای صفحه مصرف می‌شود.
const styles = `
/* کانتینر ریشه تمام ارتفاع صفحه را می‌گیرد و رنگ و فونت پایه را تعریف می‌کند. */
.simple-home{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}
/* box-sizing برای همه عناصر فرزند باعث می‌شود padding و border داخل اندازه نهایی حساب شوند. */
.simple-home *{box-sizing:border-box}
/* عرض محتوای اصلی محدود و در مرکز صفحه قرار داده می‌شود. */
.simple-home main{max-width:1120px;margin:auto;padding:42px 20px 110px}
/* هدر با Flex عنوان و لینک حساب را در دو سمت قرار می‌دهد. */
.simple-home header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:28px}
/* برچسب‌های کوچک هدر و عنوان Section رنگ و اندازه ثانویه دارند. */
.simple-home header span,.section-title span{color:#768397;font-size:10px;font-weight:800}
/* اندازه و فاصله عنوان اصلی صفحه تنظیم می‌شود. */
.simple-home header h1{font-size:34px;margin:7px 0}
/* متن توضیح هدر با رنگ کم‌رنگ‌تر و عرض کنترل‌شده نمایش داده می‌شود. */
.simple-home header p{color:#8592a5;line-height:1.8;margin:0;max-width:620px}
/* لینک حساب کاربری شبیه دکمه تیره طراحی می‌شود. */
.simple-home header>a{background:#141b25;border:1px solid #293447;color:#dce3ed;text-decoration:none;border-radius:11px;padding:10px 13px;font-size:11px;font-weight:800}
/* سه اقدام اصلی در دسکتاپ در یک Grid سه‌ستونه قرار می‌گیرند. */
.primary-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
/* هر لینک اقدام اصلی به شکل کارت Grid با سه ستون داخلی طراحی می‌شود. */
.primary-actions>a{display:grid;grid-template-columns:42px 1fr auto;gap:12px;align-items:center;padding:20px;border:1px solid #253043;background:#0d131c;border-radius:18px;color:#fff;text-decoration:none;min-height:124px}
/* هنگام Hover حاشیه و پس‌زمینه کارت کمی روشن‌تر می‌شود. */
.primary-actions>a:hover{border-color:#52617a;background:#111923}
/* شماره کارت داخل یک مربع گرد نمایش داده می‌شود. */
.primary-actions i{font-style:normal;width:42px;height:42px;border-radius:12px;background:#192231;display:grid;place-items:center;color:#9ba8b9;font-size:10px}
/* متن عنوان و توضیح کارت به‌صورت Grid عمودی چیده می‌شود. */
.primary-actions div{display:grid;gap:6px}
/* اندازه فونت عنوان هر کارت تعیین می‌شود. */
.primary-actions b{font-size:17px}
/* توضیح کارت با رنگ کم‌رنگ و فاصله خطی مناسب نمایش داده می‌شود. */
.primary-actions span{color:#7f8c9f;font-size:11px;line-height:1.6}
/* فلش کارت بدون حالت italic و با رنگ ثانویه نمایش داده می‌شود. */
.primary-actions em{font-style:normal;color:#8592a5}
/* بخش ثانویه از کارت‌های اصلی فاصله می‌گیرد. */
.secondary{margin-top:28px}
/* اندازه و فاصله عنوان بخش ثانویه تنظیم می‌شود. */
.section-title h2{font-size:20px;margin:5px 0 12px}
/* کارت‌های کانال در دسکتاپ در چهار ستون قرار می‌گیرند. */
.channel-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
/* هر لینک کانال به شکل کارت تیره با حاشیه و گوشه گرد نمایش داده می‌شود. */
.channel-grid a{display:grid;gap:5px;padding:14px 15px;background:#0d131c;border:1px solid #222c3a;border-radius:13px;color:#fff;text-decoration:none}
/* اندازه عنوان کانال تنظیم می‌شود. */
.channel-grid b{font-size:12px}
/* متن آمار کانال کوچک‌تر و کم‌رنگ‌تر نمایش داده می‌شود. */
.channel-grid span{font-size:10px;color:#758296}
/* جعبه خطا با رنگ قرمز تیره از محتوای عادی متمایز می‌شود. */
.error{padding:12px 14px;background:#25151a;border:1px solid #60323b;color:#ffc1cb;border-radius:12px;margin-bottom:14px}
/* در نمایشگرهای حداکثر 760px چیدمان برای موبایل/تبلت جمع‌وجور می‌شود. */
@media(max-width:760px){
  /* Padding صفحه در موبایل کاهش می‌یابد. */
  .simple-home main{padding:28px 13px 90px}
  /* هدر از Flex به Grid تبدیل می‌شود تا آیتم‌ها زیر هم قرار بگیرند. */
  .simple-home header{display:grid}
  /* کارت‌های اصلی تک‌ستونه می‌شوند. */
  .primary-actions{grid-template-columns:1fr}
  /* حداقل ارتفاع اجباری کارت‌های اصلی در موبایل حذف می‌شود. */
  .primary-actions>a{min-height:auto}
  /* کارت‌های کانال در دو ستون قرار می‌گیرند. */
  .channel-grid{grid-template-columns:1fr 1fr}
  /* اندازه عنوان اصلی برای صفحه کوچک کاهش می‌یابد. */
  .simple-home header h1{font-size:29px}
}
/* در موبایل‌های باریک‌تر از 440px کارت‌های کانال نیز تک‌ستونه می‌شوند. */
@media(max-width:440px){
  /* فقط یک کانال در هر ردیف نمایش داده می‌شود. */
  .channel-grid{grid-template-columns:1fr}
}
`;
