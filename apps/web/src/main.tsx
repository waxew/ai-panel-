// React اصلی را وارد می‌کنیم؛ lazy برای بارگذاری تنبل صفحات و Suspense برای نمایش حالت انتظار هنگام بارگذاری استفاده می‌شود.
import React, { lazy, Suspense } from 'react';
// ReactDOM رابط بین React و DOM مرورگر است و createRoot برنامه را داخل عنصر HTML با id=root سوار می‌کند.
import ReactDOM from 'react-dom/client';
// App مسیرهای عمومی/قدیمی مثل Landing، Login و Register را مدیریت می‌کند و در انتهای Router به‌عنوان fallback استفاده می‌شود.
import App from './App';
// این کامپوننت ناوبری سریع مشترک بخش Commerce را روی بیشتر صفحات پنل نمایش می‌دهد.
import CommerceQuickNav from './CommerceQuickNav';
// فایل CSS سراسری رابط کاربری را وارد می‌کنیم تا استایل‌های مشترک روی همه صفحات اعمال شوند.
import './styles.css';

// هر خط lazy زیر یک صفحه را فقط زمانی دانلود و اجرا می‌کند که واقعاً آن مسیر باز شود؛ این کار حجم بارگذاری اولیه را کمتر می‌کند.
// داشبورد اصلی مشتری در مسیر /app.
const CustomerHome = lazy(() => import('./CustomerHome'));
// مدیریت فروشگاه مشتری در مسیر /app/store.
const StoreManagerV2 = lazy(() => import('./StoreManagerV2'));
// سازنده عمومی تجارت/فروشگاه برای ربات‌ها.
const SimpleBotCommerceBuilder = lazy(() => import('./SimpleBotCommerceBuilder'));
// مرکز کنترل ربات تلگرام.
const TelegramControlCenter = lazy(() => import('./TelegramControlCenter'));
// مرکز کنترل پیام‌رسان بله.
const BaleControlCenter = lazy(() => import('./BaleControlCenter'));
// صفحه سفارش‌های فروشگاه.
const StoreOrders = lazy(() => import('./StoreOrders'));
// مدیریت قالب‌های فروشگاه.
const StoreTemplateEngine = lazy(() => import('./StoreTemplateEngine'));
// مرکز کنترل اینستاگرام.
const InstagramControlCenter = lazy(() => import('./InstagramControlCenter'));
// مرکز کنترل واتساپ.
const WhatsAppControlCenter = lazy(() => import('./WhatsAppControlCenter'));
// مرکز کنترل روبیکا.
const RubikaControlCenter = lazy(() => import('./RubikaControlCenter'));
// مرکز کنترل دیسکورد.
const DiscordControlCenter = lazy(() => import('./DiscordControlCenter'));
// داشبورد آمار و تحلیل‌های چندکاناله.
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
// صفحه اصلی سیستم نوبت‌دهی.
const BookingManagerV2 = lazy(() => import('./BookingManagerV2'));
// ابزارهای کسب‌وکار بخش نوبت‌دهی.
const BookingBusinessTools = lazy(() => import('./BookingBusinessTools'));
// اتوماسیون‌های سیستم نوبت‌دهی.
const BookingAutomations = lazy(() => import('./BookingAutomations'));
// مدیریت کارکنان سیستم نوبت‌دهی.
const BookingStaffManager = lazy(() => import('./BookingStaffManager'));
// CRM و پرونده مشتریان سیستم نوبت‌دهی.
const BookingCustomersCRM = lazy(() => import('./BookingCustomersCRM'));
// امور مالی بخش نوبت‌دهی.
const BookingFinance = lazy(() => import('./BookingFinance'));
// گزارش‌های بخش نوبت‌دهی.
const BookingReports = lazy(() => import('./BookingReports'));
// مدیریت دسترسی کارکنان.
const BookingStaffAccess = lazy(() => import('./BookingStaffAccess'));
// مدیریت بازخورد مشتریان.
const BookingFeedbackManager = lazy(() => import('./BookingFeedbackManager'));
// باشگاه مشتریان و وفاداری.
const BookingLoyalty = lazy(() => import('./BookingLoyalty'));
// مدیریت سایت عمومی کسب‌وکار نوبت‌دهی.
const BookingBusinessSiteManager = lazy(() => import('./BookingBusinessSiteManager'));
// Inbox پیام‌های مرتبط با بخش نوبت‌دهی.
const BookingInbox = lazy(() => import('./BookingInbox'));
// صفحه عمومی رزرو که مشتری نهایی از بیرون پنل می‌بیند.
const PublicBookingPage = lazy(() => import('./PublicBookingPage'));
// صفحه عمومی ثبت بازخورد.
const PublicFeedbackPage = lazy(() => import('./PublicFeedbackPage'));
// سایت عمومی کسب‌وکار.
const PublicBusinessSite = lazy(() => import('./PublicBusinessSite'));
// Mini App پروژه تلگرام که داخل Telegram WebView باز می‌شود.
const TelegramProjectMiniApp = lazy(() => import('./TelegramProjectMiniAppV2'));

// این تابع Session برگشتی از Supabase Auth را از hash آدرس مرورگر می‌گیرد و به Session سمت سرور پروژه تبدیل می‌کند.
async function adoptImplicitAuthSession() {
  // اگر URL هیچ hash ندارد، توکن Auth هم وجود ندارد و تابع زود تمام می‌شود.
  if (!window.location.hash) return;
  // علامت # ابتدای hash حذف می‌شود و باقی پارامترها به شکل URLSearchParams خوانده می‌شوند.
  const params = new URLSearchParams(window.location.hash.slice(1));
  // access_token توکن کوتاه‌مدت دسترسی کاربر است.
  const accessToken = params.get('access_token');
  // refresh_token برای گرفتن access token جدید پس از انقضا استفاده می‌شود.
  const refreshToken = params.get('refresh_token');
  // اگر هرکدام از دو توکن موجود نباشد، Session قابل پذیرش نیست.
  if (!accessToken || !refreshToken) return;
  try {
    // توکن‌ها را به API داخلی می‌فرستیم تا سرور Session معتبر پروژه را ایجاد/پذیرش کند.
    const response = await fetch('/api/auth/adopt-session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }) });
    // بعد از پاسخ، hash حساس توکن از URL پاک می‌شود؛ در موفقیت کاربر به /app و در خطا به Login هدایت می‌شود.
    window.history.replaceState({}, '', response.ok ? '/app' : '/login?confirmation_error=1');
  } catch {
    // اگر درخواست شبکه شکست بخورد، کاربر به صفحه ورود همراه با فلگ خطا هدایت می‌شود.
    window.history.replaceState({}, '', '/login?confirmation_error=1');
  }
}

// هنگام دانلود تنبل یک Route، این صفحه ساده تا آماده شدن کامپوننت مقصد نمایش داده می‌شود.
function RouteLoading() {
  // یک صفحه تمام‌قد RTL با متن «در حال بارگذاری...» برمی‌گردانیم.
  return <div dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#070a0f', color: '#dbe4ef', fontFamily: 'Inter, system-ui, sans-serif' }}>در حال بارگذاری...</div>;
}

// این تابع نقطه اصلی تصمیم‌گیری برای نمایش Routeهای فرانت‌اند است.
async function renderApp() {
  // قبل از Render هر صفحه، اگر Session Auth در URL وجود دارد آن را به Session پروژه تبدیل می‌کنیم.
  await adoptImplicitAuthSession();
  // pathname قسمت مسیر URL مثل /app/telegram را می‌گیرد.
  const path = window.location.pathname;

  // بر اساس path یک کامپوننت صفحه انتخاب می‌کنیم.
  // /miniapp و /telegram-app هر دو Mini App تلگرام را باز می‌کنند.
  const rootView = path === '/miniapp' || path === '/telegram-app' ? <TelegramProjectMiniApp />
    // هر آدرس شروع‌شونده با /book/ صفحه رزرو عمومی است.
    : path.startsWith('/book/') ? <PublicBookingPage />
    // هر آدرس شروع‌شونده با /feedback/ صفحه عمومی بازخورد است.
    : path.startsWith('/feedback/') ? <PublicFeedbackPage />
    // هر آدرس شروع‌شونده با /site/ سایت عمومی کسب‌وکار است.
    : path.startsWith('/site/') ? <PublicBusinessSite />
    // داشبورد اصلی مشتری.
    : path === '/app' ? <CustomerHome />
    // مدیریت فروشگاه.
    : path === '/app/store' ? <StoreManagerV2 />
    // دو URL مختلف برای یک سازنده Bot Commerce نگه داشته شده‌اند.
    : path === '/app/bot-commerce' || path === '/app/telegram-builder' ? <SimpleBotCommerceBuilder />
    // مرکز کنترل تلگرام.
    : path === '/app/telegram' ? <TelegramControlCenter />
    // مرکز کنترل بله.
    : path === '/app/bale' ? <BaleControlCenter />
    // سفارش‌های فروشگاه.
    : path === '/app/orders' ? <StoreOrders />
    // قالب‌های فروشگاه.
    : path === '/app/store/templates' ? <StoreTemplateEngine />
    // مرکز کنترل اینستاگرام.
    : path === '/app/instagram' ? <InstagramControlCenter />
    // مرکز کنترل واتساپ.
    : path === '/app/whatsapp' ? <WhatsAppControlCenter />
    // مرکز کنترل روبیکا.
    : path === '/app/rubika' ? <RubikaControlCenter />
    // مرکز کنترل دیسکورد.
    : path === '/app/discord' ? <DiscordControlCenter />
    // داشبورد Analytics.
    : path === '/app/analytics' ? <AnalyticsDashboard />
    // Inbox نوبت‌دهی.
    : path === '/app/booking/inbox' ? <BookingInbox />
    // اتوماسیون نوبت‌دهی.
    : path === '/app/booking/automations' ? <BookingAutomations />
    // مالی نوبت‌دهی.
    : path === '/app/booking/finance' ? <BookingFinance />
    // گزارش‌های نوبت‌دهی.
    : path === '/app/booking/reports' ? <BookingReports />
    // مدیریت بازخورد.
    : path === '/app/booking/feedback' ? <BookingFeedbackManager />
    // وفاداری مشتریان.
    : path === '/app/booking/loyalty' ? <BookingLoyalty />
    // مدیریت سایت کسب‌وکار.
    : path === '/app/booking/site' ? <BookingBusinessSiteManager />
    // دسترسی کارکنان.
    : path === '/app/booking/staff-access' ? <BookingStaffAccess />
    // CRM مشتریان.
    : path === '/app/booking/customers' ? <BookingCustomersCRM />
    // مدیریت پرسنل.
    : path === '/app/booking/staff' ? <BookingStaffManager />
    // ابزارهای کسب‌وکار.
    : path === '/app/booking/tools' ? <BookingBusinessTools />
    // صفحه اصلی Booking.
    : path === '/app/booking' ? <BookingManagerV2 />
    // اگر هیچ مسیر بالا match نشد، App عمومی/قدیمی اجرا می‌شود.
    : <App />;

  // عنصر HTML با id=root را پیدا می‌کنیم و یک React Root روی آن می‌سازیم.
  ReactDOM.createRoot(document.getElementById('root')!).render(
    // StrictMode در محیط توسعه کمک می‌کند الگوهای مشکل‌دار React زودتر دیده شوند.
    <React.StrictMode>
      {/* Suspense تا زمانی که صفحه lazy دانلود شود RouteLoading را نشان می‌دهد. */}
      <Suspense fallback={<RouteLoading />}>{rootView}</Suspense>
      {/* Quick Nav روی صفحات عادی نمایش داده می‌شود اما داخل Mini App تلگرام مخفی می‌ماند. */}
      {!path.startsWith('/miniapp') && path !== '/telegram-app' && <CommerceQuickNav />}
    </React.StrictMode>,
  );
}

// اجرای تابع اصلی Render را شروع می‌کنیم؛ void یعنی Promise برگشتی را عمداً در این نقطه await نمی‌کنیم.
void renderApp();
