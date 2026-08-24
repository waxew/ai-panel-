import { platformModules } from '@ai-panel/shared';
import { useEffect, useMemo, useState } from 'react';

type ChannelMetric = {
  key: string;
  label: string;
  connected: number;
  active: number;
};

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

type DashboardResponse = {
  ok?: boolean;
  analytics?: AnalyticsData;
  workspaces?: Array<{ id: string; name?: string | null }>;
  message?: string;
};

const channelRegistry = new Map(platformModules.map((module) => [module.key, module]));

function fa(value: number | null | undefined, maximumFractionDigits = 0) {
  return Number(value ?? 0).toLocaleString('fa-IR', { maximumFractionDigits });
}

function date(value?: string | null) {
  if (!value) return 'هنوز همگام نشده';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return '—';
  }
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/customer/dashboard');
      const payload = (await response.json().catch(() => ({}))) as DashboardResponse;
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!response.ok || !payload.analytics) throw new Error(payload.message || 'داده‌های Analytics دریافت نشد.');
      setData(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'داده‌های Analytics دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const analytics = data?.analytics;
  const workspaceLabel = useMemo(() => {
    const workspaces = data?.workspaces ?? [];
    if (!workspaces.length) return 'Workspace بدون نام';
    if (workspaces.length === 1) return workspaces[0]?.name || 'Workspace اصلی';
    return `${fa(workspaces.length)} Workspace`;
  }, [data]);

  const channelRows = useMemo(() => (analytics?.channels ?? []).map((metric) => {
    const module = channelRegistry.get(metric.key as never);
    return {
      ...metric,
      labelFa: module?.labelFa ?? metric.label,
      shortCode: module?.shortCode ?? metric.label.slice(0, 2).toUpperCase(),
      route: module?.customerRoute ?? null,
      description: module?.descriptionFa ?? '',
      health: percent(metric.active, metric.connected),
    };
  }), [analytics]);

  const activeRate = analytics ? percent(analytics.totals.activeAccounts, analytics.totals.connectedAccounts) : 0;
  const paidOrderRate = analytics ? percent(analytics.operations.paidStoreOrders, analytics.operations.storeOrders) : 0;

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

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="an-card an-metric"><small>{label}</small><strong>{value}</strong><span>{note}</span></article>;
}

function Operation({ href, code, label, value, note }: { href: string; code: string; label: string; value: number; note: string }) {
  return <a href={href} className="an-operation"><i>{code}</i><span><b>{label}</b><small>{note}</small></span><strong>{fa(value)}</strong></a>;
}

function Empty({ text }: { text: string }) {
  return <div className="an-empty">{text}</div>;
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.an-page{min-height:100vh;background:#f4f6f9;color:#111827;display:grid;grid-template-columns:260px minmax(0,1fr)}.an-side{background:#0b1220;color:#fff;padding:26px 18px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh}.an-brand,.an-provider{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.an-brand i,.an-provider i{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#172033;font-style:normal;font-weight:900}.an-provider i{background:#0f766e}.an-brand span,.an-provider span{display:grid;gap:3px}.an-brand small,.an-provider small{color:#8290a6}.an-side nav{display:grid;gap:4px}.an-side nav a,.an-back{color:#c2ccda;text-decoration:none;padding:11px 12px;border-radius:11px}.an-side nav a:hover,.an-side nav a.active{background:#172033;color:#fff}.an-back{margin-top:auto}.an-main{padding:34px;max-width:1480px;width:100%;margin:0 auto}.an-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.an-header h1{font-size:32px;margin:7px 0}.an-header p{margin:0;color:#64748b;line-height:1.9;max-width:820px}.an-eyebrow{color:#0f766e;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:900}.an-refresh{border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:12px;padding:11px 15px;font:inherit;font-weight:800;cursor:pointer;white-space:nowrap}.an-refresh:disabled{opacity:.55;cursor:wait}.an-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 8px 28px rgba(15,23,42,.035)}.an-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.an-metric{padding:17px}.an-metric small,.an-metric span{color:#64748b;font-size:11px}.an-metric strong{display:block;font-size:30px;margin:8px 0}.an-section{padding:20px;margin-bottom:18px}.an-section h2{margin:5px 0 14px;font-size:20px}.an-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.an-section-head>small{color:#94a3b8}.an-section-head a{color:#0f766e;text-decoration:none;font-weight:800;font-size:12px}.an-channel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.an-channel{border:1px solid #e5e7eb;border-radius:14px;padding:13px}.an-channel-top{display:flex;align-items:center;gap:9px}.an-channel-top i{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#f0fdfa;color:#0f766e;font-style:normal;font-weight:900;font-size:10px}.an-channel-top>span{display:grid;gap:3px;flex:1}.an-channel-top small{color:#94a3b8;font-size:9px;line-height:1.5}.an-channel-top em{font-style:normal;font-size:9px;border-radius:999px;padding:5px 7px;background:#f1f5f9;color:#64748b}.an-channel-top em.good{background:#dcfce7;color:#166534}.an-channel-top em.warn{background:#fff7ed;color:#c2410c}.an-progress{height:6px;background:#eef2f7;border-radius:99px;overflow:hidden;margin:14px 0 10px}.an-progress span{display:block;height:100%;background:#0f766e;border-radius:99px}.an-channel-meta{display:flex;justify-content:space-between;gap:6px;color:#64748b;font-size:9px}.an-channel-meta b{color:#111827}.an-channel>a{display:inline-block;margin-top:12px;color:#0f766e;text-decoration:none;font-size:10px;font-weight:800}.an-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px}.an-instagram-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px}.an-instagram-metrics>div{border:1px solid #e8edf3;background:#f8fafc;border-radius:13px;padding:13px}.an-instagram-metrics small{display:block;color:#64748b}.an-instagram-metrics strong{display:block;font-size:23px;margin-top:6px}.an-sync{color:#94a3b8;font-size:10px;margin:13px 0 0}.an-account-list{display:grid;max-height:330px;overflow:auto}.an-account-list>div{display:grid;grid-template-columns:minmax(150px,1fr) repeat(3,90px);gap:12px;align-items:center;padding:12px 2px;border-bottom:1px solid #edf0f4}.an-account-list>div:last-child{border-bottom:0}.an-account-list span{display:grid;gap:2px}.an-account-list small{color:#94a3b8;font-size:9px}.an-ops-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.an-operation{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #e5e7eb;border-radius:14px;padding:13px;text-decoration:none;color:#111827}.an-operation:hover{border-color:#99f6e4;background:#f0fdfa}.an-operation i{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:#f1f5f9;color:#475569;font-style:normal;font-weight:900;font-size:10px}.an-operation span{display:grid;gap:3px}.an-operation small{color:#94a3b8;font-size:9px}.an-operation strong{font-size:21px}.an-footer{padding:5px 3px 50px;color:#94a3b8;font-size:10px;line-height:1.8}.an-empty{padding:24px;border:1px dashed #cbd5e1;border-radius:13px;color:#94a3b8;text-align:center}.an-notice{display:flex;gap:12px;align-items:center;border-radius:13px;padding:12px 14px;margin-bottom:18px}.an-notice.error{background:#fff1f2;color:#9f1239}.an-notice span{flex:1}.an-notice button{border:0;background:#fff;border-radius:8px;padding:7px 10px;color:inherit;font-weight:800}.an-loading{min-height:320px;display:grid;place-items:center;align-content:center;gap:13px;color:#64748b}.an-loading i{width:35px;height:35px;border:3px solid #cbd5e1;border-top-color:#0f766e;border-radius:50%;animation:an-spin .8s linear infinite}@keyframes an-spin{to{transform:rotate(360deg)}}@media(max-width:1050px){.an-channel-grid,.an-ops-grid{grid-template-columns:repeat(2,1fr)}.an-grid{grid-template-columns:1fr}}@media(max-width:760px){.an-page{display:block}.an-side{height:auto;position:static}.an-side nav{display:flex;overflow:auto}.an-back{margin-top:0}.an-main{padding:22px 14px 70px}.an-header{display:grid}.an-metrics,.an-channel-grid,.an-ops-grid{grid-template-columns:1fr 1fr}.an-account-list>div{grid-template-columns:1fr 70px 70px}.an-account-list>div span:last-child{display:none}}@media(max-width:520px){.an-metrics,.an-channel-grid,.an-ops-grid,.an-instagram-metrics{grid-template-columns:1fr}.an-account-list>div{grid-template-columns:1fr 70px}.an-account-list>div span:nth-child(3){display:none}}
`;
