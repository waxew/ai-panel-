/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { platformModules } را از ماژول «@ai-panel/shared» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { platformModules } from '@ai-panel/shared';
// راهنما: این دستور { useEffect, useMemo, useState } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useEffect, useMemo, useState } from 'react';

// راهنما: این Type با نام «ChannelMetric» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ChannelMetric = {
  key: string;
  label: string;
  connected: number;
  active: number;
};

// راهنما: این Type با نام «InstagramAccountMetric» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type InstagramAccountMetric = {
  id: string;
  workspaceId: string;
  username?: string | null;
  displayName?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate?: number | null;
  metrics?: Record<string, unknown>;
  status: string;
  lastSyncedAt?: string | null;
};

// راهنما: این Type با نام «AnalyticsData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type AnalyticsData = {
  generatedAt: string;
  channels: ChannelMetric[];
  totals: {
    connectedChannels: number;
    connectedAccounts: number;
    activeAccounts: number;
  };
  instagram: {
    followers: number;
    following: number;
    posts: number;
    averageEngagementRate?: number | null;
    lastSyncedAt?: string | null;
    accounts: InstagramAccountMetric[];
  };
  operations: {
    pendingScheduledJobs: number;
    openWhatsAppConversations: number;
    storeOrders: number;
    paidStoreOrders: number;
    bookingCustomers: number;
    upcomingBookings: number;
  };
};

// راهنما: این Type با نام «DashboardResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DashboardResponse = {
  ok?: boolean;
  analytics?: AnalyticsData;
  workspaces?: Array<{ id: string; name?: string | null }>;
  message?: string;
};

// راهنما: این دستور متغیر/ثابت «channelRegistry» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const channelRegistry = new Map(platformModules.map((module) => [module.key, module]));

// راهنما: این تابع «fa» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fa(value: number | null | undefined, maximumFractionDigits = 0) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number(value ?? 0).toLocaleString('fa-IR', { maximumFractionDigits })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Number(value ?? 0).toLocaleString('fa-IR', { maximumFractionDigits });
}

// راهنما: این تابع «date» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function date(value?: string | null) {
  // راهنما: این شرط بررسی می‌کند آیا «!value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'هنوز همگام نشده'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'هنوز همگام نشده';
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short'…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'—'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return '—';
  }
}

// راهنما: این تابع «percent» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function percent(value: number, total: number) {
  // راهنما: این شرط بررسی می‌کند آیا «!total» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!total) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 0;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Math.min(100, Math.max(0, Math.round((value / total) * 100)))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

// راهنما: این تابع «AnalyticsDashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function AnalyticsDashboard() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<DashboardResponse | null>(null);
  // راهنما: این دستور State محلی React برای «[error, setError]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [error, setError] = useState('');
  // راهنما: این دستور State محلی React برای «[loading, setLoading]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [loading, setLoading] = useState(true);

  // راهنما: این تابع «load» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function load() {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setLoading(true)».
    setLoading(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setError('')».
    setError('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
      const response = await fetch('/api/customer/dashboard');
      // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const payload = (await response.json().catch(() => ({}))) as DashboardResponse;
      // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (response.status === 401) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'».
        window.location.href = '/login';
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return;
      }
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !payload.analytics» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok || !payload.analytics) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(payload.message || 'داده‌های Analytics دریافت نشد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(payload)».
      setData(payload);
    } catch (cause) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setError(cause instanceof Error ? cause.message : 'داده‌های Analytics دریافت نشد.')».
      setError(cause instanceof Error ? cause.message : 'داده‌های Analytics دریافت نشد.');
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setLoading(false)».
      setLoading(false);
    }
  }

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load()». */ void load(); }, []);

  // راهنما: این دستور متغیر/ثابت «analytics» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const analytics = data?.analytics;
  // راهنما: این دستور مقدار «workspaceLabel» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const workspaceLabel = useMemo(() => {
    // راهنما: این دستور متغیر/ثابت «workspaces» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const workspaces = data?.workspaces ?? [];
    // راهنما: این شرط بررسی می‌کند آیا «!workspaces.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!workspaces.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'Workspace بدون نام'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'Workspace بدون نام';
    // راهنما: این شرط بررسی می‌کند آیا «workspaces.length === 1» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (workspaces.length === 1) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «workspaces[0]?.name || 'Workspace اصلی'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return workspaces[0]?.name || 'Workspace اصلی';
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${fa(workspaces.length)} Workspace`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return `${fa(workspaces.length)} Workspace`;
  }, [data]);

  // راهنما: این دستور مقدار «channelRows» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const channelRows = useMemo(() => (analytics?.channels ?? []).map((metric) => {
    // راهنما: این دستور متغیر/ثابت «module» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const module = channelRegistry.get(metric.key as never);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ...metric, labelFa: module?.labelFa ?? metric.label, shortCode: module?.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return {
      ...metric,
      labelFa: module?.labelFa ?? metric.label,
      shortCode: module?.shortCode ?? metric.label.slice(0, 2).toUpperCase(),
      route: module?.customerRoute ?? null,
      description: module?.descriptionFa ?? '',
      health: percent(metric.active, metric.connected),
    };
  }), [analytics]);

  // راهنما: این دستور متغیر/ثابت «activeRate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const activeRate = analytics ? percent(analytics.totals.activeAccounts, analytics.totals.connectedAccounts) : 0;
  // راهنما: این دستور متغیر/ثابت «paidOrderRate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const paidOrderRate = analytics ? percent(analytics.operations.paidStoreOrders, analytics.operations.storeOrders) : 0;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="an-page" dir="rtl"> <style>{styles}</style> <aside classNa…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="an-page" dir="rtl">
    <style>{styles}</style>
    <aside className="an-side">
      <a href="/app" className="an-brand"><i>AP</i><span><b>AI PANEL</b><small>Unified Analytics</small></span></a>
      <div className="an-provider"><i>AN</i><span><b>آنالیز یکپارچه</b><small>{workspaceLabel}</small></span></div>
      <nav>
        <a className="active" href="#overview">نمای کلی</a>
        <a href="#channels">کانال‌ها</a>
        <a href="#instagram">Instagram KPI</a>
        <a href="#operations">عملیات کسب‌وکار</a>
        <a href="/app/account">حساب و کیف پول</a>
      </nav>
      <a href="/app" className="an-back">← بازگشت به داشبورد</a>
    </aside>

    <main className="an-main">
      <header className="an-header">
        <div>
          <span className="an-eyebrow">Cross-channel intelligence</span>
          <h1>Analytics کل AI Panel</h1>
          <p>یک نمای مشترک از اتصال کانال‌ها، KPIهای فعلی Instagram، صف‌های عملیاتی، فروشگاه و Booking. این لایه مبنای گزارش‌های پیشرفته‌تر همه شبکه‌ها خواهد بود.</p>
        </div>
        <button type="button" className="an-refresh" onClick={() => void load()} disabled={loading}>{loading ? 'در حال بروزرسانی…' : 'بروزرسانی داده‌ها'}</button>
      </header>

      {error && <div className="an-notice error"><b>دریافت اطلاعات ناموفق بود.</b><span>{error}</span><button type="button" onClick={() => void load()}>تلاش دوباره</button></div>}
      {loading && !analytics && <div className="an-loading"><i/><span>در حال ساخت نمای Analytics از داده‌های Workspace…</span></div>}

      {analytics && <>
        <section id="overview" className="an-metrics">
          <Metric label="کانال متصل" value={fa(analytics.totals.connectedChannels)} note={`از ${fa(analytics.channels.length)} کانال قابل سنجش`} />
          <Metric label="اتصال‌های ثبت‌شده" value={fa(analytics.totals.connectedAccounts)} note="Bot / Account" />
          <Metric label="اتصال فعال" value={fa(analytics.totals.activeAccounts)} note={`${fa(activeRate)}٪ سلامت اتصال`} />
          <Metric label="کار زمان‌بندی‌شده" value={fa(analytics.operations.pendingScheduledJobs)} note="Pending / Processing" />
        </section>

        <section id="channels" className="an-card an-section">
          <div className="an-section-head"><div><span className="an-eyebrow">Channel health</span><h2>وضعیت کانال‌ها</h2></div><small>ساخته‌شده از Registry و داده‌های واقعی Workspace</small></div>
          <div className="an-channel-grid">
            {channelRows.map((channel) => <article key={channel.key} className="an-channel">
              <div className="an-channel-top"><i>{channel.shortCode}</i><span><b>{channel.labelFa}</b><small>{channel.description}</small></span><em className={channel.active > 0 ? 'good' : channel.connected > 0 ? 'warn' : ''}>{channel.active > 0 ? 'فعال' : channel.connected > 0 ? 'نیازمند بررسی' : 'متصل نیست'}</em></div>
              <div className="an-progress"><span style={{ width: `${channel.health}%` }} /></div>
              <div className="an-channel-meta"><span><b>{fa(channel.connected)}</b> اتصال</span><span><b>{fa(channel.active)}</b> فعال</span><span><b>{fa(channel.health)}٪</b> سلامت</span></div>
              {channel.route && <a href={channel.route}>بازکردن ماژول ←</a>}
            </article>)}
          </div>
        </section>

        <section id="instagram" className="an-grid">
          <article className="an-card an-section">
            <div className="an-section-head"><div><span className="an-eyebrow">Instagram</span><h2>KPIهای پیج‌ها</h2></div><a href="/app/instagram">مرکز Instagram ←</a></div>
            <div className="an-instagram-metrics">
              <div><small>Followers</small><strong>{fa(analytics.instagram.followers)}</strong></div>
              <div><small>Following</small><strong>{fa(analytics.instagram.following)}</strong></div>
              <div><small>Posts</small><strong>{fa(analytics.instagram.posts)}</strong></div>
              <div><small>Avg Engagement</small><strong>{analytics.instagram.averageEngagementRate == null ? '—' : `${fa(analytics.instagram.averageEngagementRate, 2)}٪`}</strong></div>
            </div>
            <p className="an-sync">آخرین Sync: {date(analytics.instagram.lastSyncedAt)}</p>
          </article>

          <article className="an-card an-section">
            <span className="an-eyebrow">Account comparison</span><h2>مقایسه پیج‌های Instagram</h2>
            {analytics.instagram.accounts.length ? <div className="an-account-list">{analytics.instagram.accounts.map((account) => <div key={account.id}>
              <span><b>{account.displayName || account.username || 'Instagram'}</b><small>{account.username ? `@${account.username}` : account.status} · {date(account.lastSyncedAt)}</small></span>
              <span><b>{fa(account.followersCount)}</b><small>Follower</small></span>
              <span><b>{fa(account.postsCount)}</b><small>Post</small></span>
              <span><b>{account.engagementRate == null ? '—' : `${fa(account.engagementRate, 2)}٪`}</b><small>Engagement</small></span>
            </div>)}</div> : <Empty text="هنوز Instagram Account متصل نشده یا داده‌ای Sync نشده است." />}
          </article>
        </section>

        <section id="operations" className="an-card an-section">
          <div className="an-section-head"><div><span className="an-eyebrow">Operations</span><h2>شاخص‌های عملیاتی</h2></div><small>بدون وابستگی به Provider خارجی</small></div>
          <div className="an-ops-grid">
            <Operation href="/app/whatsapp" code="WA" label="گفتگوی باز WhatsApp" value={analytics.operations.openWhatsAppConversations} note="Inbox conversations" />
            <Operation href="/app/orders" code="OR" label="کل سفارش فروشگاه" value={analytics.operations.storeOrders} note={`${fa(paidOrderRate)}٪ پرداخت/درحال پردازش/تکمیل`} />
            <Operation href="/app/orders" code="PD" label="سفارش موفق" value={analytics.operations.paidStoreOrders} note="Paid + Processing + Completed" />
            <Operation href="/app/booking/customers" code="CR" label="مشتری Booking" value={analytics.operations.bookingCustomers} note="CRM customers" />
            <Operation href="/app/booking" code="BK" label="نوبت آینده" value={analytics.operations.upcomingBookings} note="Pending + Confirmed" />
            <Operation href="/app" code="SC" label="صف زمان‌بندی" value={analytics.operations.pendingScheduledJobs} note="Pending + Processing" />
          </div>
        </section>

        <footer className="an-footer">آخرین تولید Snapshot: {date(analytics.generatedAt)} · Analytics v1 فقط داده‌ی معتبر موجود را نمایش می‌دهد؛ متریک‌های محتوایی بیشتر در فاز بعدی به همین قرارداد اضافه می‌شوند.</footer>
      </>}
    </main>
  </div>;
}

// راهنما: این تابع «Metric» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<article className="an-card an-metric"><small>{label}</small><strong>{valu…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <article className="an-card an-metric"><small>{label}</small><strong>{value}</strong><span>{note}</span></article>;
}

// راهنما: این تابع «Operation» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Operation({ href, code, label, value, note }: { href: string; code: string; label: string; value: number; note: string }) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<a href={href} className="an-operation"><i>{code}</i><span><b>{label}</b><…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <a href={href} className="an-operation"><i>{code}</i><span><b>{label}</b><small>{note}</small></span><strong>{fa(value)}</strong></a>;
}

// راهنما: این تابع «Empty» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Empty({ text }: { text: string }) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="an-empty">{text}</div>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="an-empty">{text}</div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.an-page{min-height:100vh;background:#f4f6f9;color:#111827;display:grid;grid-template-columns:260px minmax(0,1fr)}.an-side{background:#0b1220;color:#fff;padding:26px 18px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh}.an-brand,.an-provider{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.an-brand i,.an-provider i{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#172033;font-style:normal;font-weight:900}.an-provider i{background:#0f766e}.an-brand span,.an-provider span{display:grid;gap:3px}.an-brand small,.an-provider small{color:#8290a6}.an-side nav{display:grid;gap:4px}.an-side nav a,.an-back{color:#c2ccda;text-decoration:none;padding:11px 12px;border-radius:11px}.an-side nav a:hover,.an-side nav a.active{background:#172033;color:#fff}.an-back{margin-top:auto}.an-main{padding:34px;max-width:1480px;width:100%;margin:0 auto}.an-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.an-header h1{font-size:32px;margin:7px 0}.an-header p{margin:0;color:#64748b;line-height:1.9;max-width:820px}.an-eyebrow{color:#0f766e;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:900}.an-refresh{border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:12px;padding:11px 15px;font:inherit;font-weight:800;cursor:pointer;white-space:nowrap}.an-refresh:disabled{opacity:.55;cursor:wait}.an-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 8px 28px rgba(15,23,42,.035)}.an-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.an-metric{padding:17px}.an-metric small,.an-metric span{color:#64748b;font-size:11px}.an-metric strong{display:block;font-size:30px;margin:8px 0}.an-section{padding:20px;margin-bottom:18px}.an-section h2{margin:5px 0 14px;font-size:20px}.an-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.an-section-head>small{color:#94a3b8}.an-section-head a{color:#0f766e;text-decoration:none;font-weight:800;font-size:12px}.an-channel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.an-channel{border:1px solid #e5e7eb;border-radius:14px;padding:13px}.an-channel-top{display:flex;align-items:center;gap:9px}.an-channel-top i{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#f0fdfa;color:#0f766e;font-style:normal;font-weight:900;font-size:10px}.an-channel-top>span{display:grid;gap:3px;flex:1}.an-channel-top small{color:#94a3b8;font-size:9px;line-height:1.5}.an-channel-top em{font-style:normal;font-size:9px;border-radius:999px;padding:5px 7px;background:#f1f5f9;color:#64748b}.an-channel-top em.good{background:#dcfce7;color:#166534}.an-channel-top em.warn{background:#fff7ed;color:#c2410c}.an-progress{height:6px;background:#eef2f7;border-radius:99px;overflow:hidden;margin:14px 0 10px}.an-progress span{display:block;height:100%;background:#0f766e;border-radius:99px}.an-channel-meta{display:flex;justify-content:space-between;gap:6px;color:#64748b;font-size:9px}.an-channel-meta b{color:#111827}.an-channel>a{display:inline-block;margin-top:12px;color:#0f766e;text-decoration:none;font-size:10px;font-weight:800}.an-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px}.an-instagram-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px}.an-instagram-metrics>div{border:1px solid #e8edf3;background:#f8fafc;border-radius:13px;padding:13px}.an-instagram-metrics small{display:block;color:#64748b}.an-instagram-metrics strong{display:block;font-size:23px;margin-top:6px}.an-sync{color:#94a3b8;font-size:10px;margin:13px 0 0}.an-account-list{display:grid;max-height:330px;overflow:auto}.an-account-list>div{display:grid;grid-template-columns:minmax(150px,1fr) repeat(3,90px);gap:12px;align-items:center;padding:12px 2px;border-bottom:1px solid #edf0f4}.an-account-list>div:last-child{border-bottom:0}.an-account-list span{display:grid;gap:2px}.an-account-list small{color:#94a3b8;font-size:9px}.an-ops-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.an-operation{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #e5e7eb;border-radius:14px;padding:13px;text-decoration:none;color:#111827}.an-operation:hover{border-color:#99f6e4;background:#f0fdfa}.an-operation i{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:#f1f5f9;color:#475569;font-style:normal;font-weight:900;font-size:10px}.an-operation span{display:grid;gap:3px}.an-operation small{color:#94a3b8;font-size:9px}.an-operation strong{font-size:21px}.an-footer{padding:5px 3px 50px;color:#94a3b8;font-size:10px;line-height:1.8}.an-empty{padding:24px;border:1px dashed #cbd5e1;border-radius:13px;color:#94a3b8;text-align:center}.an-notice{display:flex;gap:12px;align-items:center;border-radius:13px;padding:12px 14px;margin-bottom:18px}.an-notice.error{background:#fff1f2;color:#9f1239}.an-notice span{flex:1}.an-notice button{border:0;background:#fff;border-radius:8px;padding:7px 10px;color:inherit;font-weight:800}.an-loading{min-height:320px;display:grid;place-items:center;align-content:center;gap:13px;color:#64748b}.an-loading i{width:35px;height:35px;border:3px solid #cbd5e1;border-top-color:#0f766e;border-radius:50%;animation:an-spin .8s linear infinite}@keyframes an-spin{to{transform:rotate(360deg)}}@media(max-width:1050px){.an-channel-grid,.an-ops-grid{grid-template-columns:repeat(2,1fr)}.an-grid{grid-template-columns:1fr}}@media(max-width:760px){.an-page{display:block}.an-side{height:auto;position:static}.an-side nav{display:flex;overflow:auto}.an-back{margin-top:0}.an-main{padding:22px 14px 70px}.an-header{display:grid}.an-metrics,.an-channel-grid,.an-ops-grid{grid-template-columns:1fr 1fr}.an-account-list>div{grid-template-columns:1fr 70px 70px}.an-account-list>div span:last-child{display:none}}@media(max-width:520px){.an-metrics,.an-channel-grid,.an-ops-grid,.an-instagram-metrics{grid-template-columns:1fr}.an-account-list>div{grid-template-columns:1fr 70px}.an-account-list>div span:nth-child(3){display:none}}
`;
