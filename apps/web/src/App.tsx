import { useEffect, useMemo, useState } from 'react';

type View = 'landing' | 'customer' | 'admin' | 'telegram';

type ConnectedBot = {
  id: string;
  telegramBotId: string;
  username?: string;
  displayName?: string;
  description?: string;
  status: string;
};

type ModuleState = {
  key: string;
  enabled: boolean;
  phase: number;
};

const services = [
  { key: 'telegram', title: 'ربات تلگرام', short: 'TG', description: 'ساخت منو، فروش محصول، اشتراک، کیف پول و مدیریت سفارش‌ها', badge: 'فعال' },
  { key: 'instagram', title: 'اینستاگرام', short: 'IG', description: 'دایرکت هوشمند، پاسخ کامنت، زمان‌بندی محتوا و آنالیز پیج', badge: 'مرحله بعد' },
  { key: 'whatsapp', title: 'واتساپ بیزینس', short: 'WA', description: 'اتوماسیون پیام، پاسخ سریع، لید و پیگیری مشتریان', badge: 'در حال توسعه' },
  { key: 'bale', title: 'ربات بله', short: 'BA', description: 'ساخت ربات فروش و پشتیبانی برای پیام‌رسان بله', badge: 'در حال توسعه' },
  { key: 'rubika', title: 'ربات روبیکا', short: 'RU', description: 'مدیریت پیام، خدمات و اتوماسیون کسب‌وکار در روبیکا', badge: 'در حال توسعه' },
  { key: 'discord', title: 'دیسکورد', short: 'DC', description: 'بات کامیونیتی، نقش‌ها، اعلان‌ها و اتوماسیون سرور', badge: 'در حال توسعه' },
  { key: 'scheduler', title: 'زمان‌بندی انتشار', short: 'SC', description: 'صف انتشار پست، استوری، پیام و کمپین‌های زمان‌بندی‌شده', badge: 'زیرساخت' },
  { key: 'analytics', title: 'آنالیز و گزارش', short: 'AN', description: 'شاخص‌های عملکرد، فروش، تعامل و پیشنهادهای بهبود', badge: 'زیرساخت' },
];

const adminStats = [
  ['مشتریان', '0', 'کاربر ثبت‌شده'],
  ['اشتراک فعال', '0', 'در همه سرویس‌ها'],
  ['سفارش در انتظار', '0', 'نیازمند پیگیری'],
  ['فروش ثبت‌شده', '0', 'تومان'],
];

const customerStats = [
  ['سرویس فعال', '0'],
  ['اتوماسیون اجراشده', '0'],
  ['پیام امروز', '0'],
  ['اعتبار حساب', '۰ تومان'],
];

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bot, setBot] = useState<ConnectedBot | null>(null);
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    fetch('/api/modules')
      .then((response) => {
        if (!response.ok) throw new Error('api');
        return response.json();
      })
      .then((data) => {
        setModules(Array.isArray(data.modules) ? data.modules : []);
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
  }, []);

  const moduleMap = useMemo(() => new Map(modules.map((item) => [item.key, item])), [modules]);

  async function connectBot() {
    setLoading(true);
    setMessage('');
    setBot(null);

    try {
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? 'اتصال ربات انجام نشد.');
        return;
      }
      setBot(data.bot);
      setMessage(data.demoMode
        ? 'توکن توسط Telegram تأیید شد. ذخیره دائمی توکن در مرحله اتصال امن دیتابیس فعال می‌شود.'
        : 'ربات با موفقیت متصل شد.');
      setToken('');
    } catch {
      setMessage('ارتباط با API برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  if (view === 'landing') {
    return (
      <div className="portal landing" dir="rtl">
        <style>{styles}</style>
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />
        <header className="topbar landing-topbar">
          <button className="brand-button" onClick={() => setView('landing')}>
            <span className="logo-mark">AP</span>
            <span><b>AI PANEL</b><small>اتوماسیون یکپارچه شبکه‌های اجتماعی</small></span>
          </button>
          <div className="top-actions">
            <span className={`health ${apiOnline ? 'online' : ''}`}><i />{apiOnline ? 'API آنلاین' : 'در حال بررسی API'}</span>
            <button className="ghost" onClick={() => setView('admin')}>پنل مدیریت</button>
            <button className="primary" onClick={() => setView('customer')}>ورود به پنل</button>
          </div>
        </header>

        <main className="landing-main">
          <section className="hero">
            <div className="hero-copy">
              <span className="kicker">پلتفرم چندسرویسی اتوماسیون</span>
              <h1>همه ربات‌ها و شبکه‌های اجتماعی، در یک پنل.</h1>
              <p>تلگرام، اینستاگرام، واتساپ، بله، روبیکا و دیسکورد را از یک داشبورد مدیریت کنید؛ از اتصال حساب تا فروش، زمان‌بندی و گزارش‌گیری.</p>
              <div className="hero-actions">
                <button className="primary large" onClick={() => setView('customer')}>شروع مدیریت سرویس‌ها</button>
                <button className="ghost large" onClick={() => setView('telegram')}>اتصال ربات تلگرام</button>
              </div>
              <div className="trust-row">
                <span>چندمستاجری</span><span>RLS</span><span>Cloudflare Workers</span><span>Supabase</span>
              </div>
            </div>
            <div className="hero-panel">
              <div className="mini-window">
                <div className="window-head"><span>AI Panel / Workspace</span><b>●</b></div>
                <div className="window-grid">
                  <div className="mini-stat"><small>سرویس‌های قابل مدیریت</small><strong>8</strong></div>
                  <div className="mini-stat"><small>زیرساخت API</small><strong>{apiOnline ? 'Online' : '...'}</strong></div>
                </div>
                <div className="flow-line"><i>1</i><span>اتصال حساب</span><b>←</b><i>2</i><span>تعریف اتوماسیون</span><b>←</b><i>3</i><span>گزارش</span></div>
                <div className="service-stack">
                  {services.slice(0, 4).map((service) => <div key={service.key}><span>{service.short}</span><b>{service.title}</b><small>{moduleMap.get(service.key)?.enabled ? 'فعال' : service.badge}</small></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="landing-section">
            <div className="section-title"><span>سرویس‌ها</span><h2>هسته واحد، ماژول‌های مستقل</h2><p>هر سرویس به‌صورت ماژول جدا توسعه پیدا می‌کند و همه از یک حساب، صورتحساب و مرکز مدیریت استفاده می‌کنند.</p></div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.key}>
                  <div className="service-card-head"><span className="service-icon">{service.short}</span><span className="badge">{moduleMap.get(service.key)?.enabled ? 'فعال' : service.badge}</span></div>
                  <h3>{service.title}</h3><p>{service.description}</p>
                  <button onClick={() => service.key === 'telegram' ? setView('telegram') : setView('customer')}>ورود به سرویس ←</button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="portal app-shell" dir="rtl">
      <style>{styles}</style>
      <aside className="sidebar-new">
        <button className="brand-button side-brand" onClick={() => setView('landing')}>
          <span className="logo-mark">AP</span><span><b>AI PANEL</b><small>Automation OS</small></span>
        </button>
        <div className="workspace-switch"><small>فضای کاری</small><b>Workspace اصلی</b><span>Free plan</span></div>
        <nav className="nav-new">
          <button className={view === 'customer' ? 'active' : ''} onClick={() => setView('customer')}><span>⌂</span>داشبورد مشتری</button>
          <button className={view === 'telegram' ? 'active' : ''} onClick={() => setView('telegram')}><span>✦</span>ربات تلگرام</button>
          <button onClick={() => setView('customer')}><span>◎</span>اینستاگرام</button>
          <button onClick={() => setView('customer')}><span>◈</span>واتساپ</button>
          <button onClick={() => setView('customer')}><span>◷</span>زمان‌بندی</button>
          <button onClick={() => setView('customer')}><span>▥</span>گزارش‌ها</button>
          <div className="nav-label">مدیریت سیستم</div>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}><span>◆</span>داشبورد مدیر</button>
        </nav>
        <div className="sidebar-foot"><span className={`health ${apiOnline ? 'online' : ''}`}><i />{apiOnline ? 'API آنلاین' : 'API در دسترس نیست'}</span><button onClick={() => setView('landing')}>بازگشت به سایت</button></div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="kicker">{view === 'admin' ? 'مرکز کنترل کسب‌وکار' : view === 'telegram' ? 'Telegram Bot Builder' : 'مرکز سرویس‌های شما'}</span>
            <h1>{view === 'admin' ? 'داشبورد مدیریت' : view === 'telegram' ? 'مدیریت ربات تلگرام' : 'داشبورد مشتری'}</h1>
          </div>
          <div className="header-actions"><button className="ghost compact">اعلان‌ها <b className="dot">0</b></button><button className="avatar">W</button></div>
        </header>

        {view === 'customer' && <CustomerDashboard setView={setView} moduleMap={moduleMap} />}
        {view === 'admin' && <AdminDashboard moduleMap={moduleMap} />}
        {view === 'telegram' && (
          <TelegramPanel token={token} setToken={setToken} loading={loading} connectBot={connectBot} message={message} bot={bot} />
        )}
      </main>
    </div>
  );
}

function CustomerDashboard({ setView, moduleMap }: { setView: (view: View) => void; moduleMap: Map<string, ModuleState> }) {
  return <>
    <section className="stat-grid">{customerStats.map(([label, value]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>شروع فعالیت پس از اتصال سرویس</small></article>)}</section>
    <section className="dashboard-section">
      <div className="section-line"><div><span className="kicker">سرویس‌های من</span><h2>مدیریت کانال‌ها</h2></div><button className="primary" onClick={() => setView('telegram')}>+ افزودن سرویس</button></div>
      <div className="service-grid dashboard-services">{services.map((service) => <article className="service-card" key={service.key}><div className="service-card-head"><span className="service-icon">{service.short}</span><span className={`badge ${moduleMap.get(service.key)?.enabled ? 'live' : ''}`}>{moduleMap.get(service.key)?.enabled ? 'قابل استفاده' : service.badge}</span></div><h3>{service.title}</h3><p>{service.description}</p><button onClick={() => service.key === 'telegram' ? setView('telegram') : undefined}>{service.key === 'telegram' ? 'مدیریت سرویس ←' : 'به‌زودی'}</button></article>)}</div>
    </section>
  </>;
}

function AdminDashboard({ moduleMap }: { moduleMap: Map<string, ModuleState> }) {
  return <>
    <section className="stat-grid">{adminStats.map(([label, value, note]) => <article className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section>
    <section className="admin-grid">
      <article className="panel-card wide"><div className="section-line"><div><span className="kicker">فروش و اشتراک</span><h2>نمای کلی عملکرد</h2></div><span className="badge">۳۰ روز اخیر</span></div><div className="empty-chart"><div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div><p>با ثبت اولین سفارش، نمودار فروش اینجا نمایش داده می‌شود.</p></div></article>
      <article className="panel-card"><span className="kicker">وضعیت سرویس‌ها</span><h2>ماژول‌های پلتفرم</h2><div className="status-list">{services.slice(0, 6).map((service) => <div key={service.key}><span className="service-icon small">{service.short}</span><b>{service.title}</b><small className={moduleMap.get(service.key)?.enabled ? 'green' : ''}>{moduleMap.get(service.key)?.enabled ? 'فعال' : 'آماده توسعه'}</small></div>)}</div></article>
      <article className="panel-card"><span className="kicker">عملیات سریع</span><h2>مدیریت سیستم</h2><div className="quick-list"><button>محصولات و قیمت‌گذاری <span>←</span></button><button>سفارش‌ها و پرداخت‌ها <span>←</span></button><button>مشتریان و دسترسی‌ها <span>←</span></button><button>کمپین و اعلان گروهی <span>←</span></button></div></article>
    </section>
  </>;
}

function TelegramPanel({ token, setToken, loading, connectBot, message, bot }: {
  token: string;
  setToken: (value: string) => void;
  loading: boolean;
  connectBot: () => void;
  message: string;
  bot: ConnectedBot | null;
}) {
  return <>
    <section className="telegram-hero panel-card">
      <div><span className="kicker">مرحله ۱ از راه‌اندازی</span><h2>اتصال ربات BotFather</h2><p>توکن در همین API بررسی می‌شود. پس از اتصال لایه امن ذخیره‌سازی، توکن به‌صورت رمزنگاری‌شده نگهداری خواهد شد.</p></div>
      <div className="stepper"><div className="done"><i>1</i><span>اتصال ربات</span></div><div><i>2</i><span>منو و دکمه‌ها</span></div><div><i>3</i><span>محصول و سفارش</span></div><div><i>4</i><span>انتشار</span></div></div>
    </section>
    <section className="telegram-grid">
      <article className="panel-card connect-card"><div className="service-card-head"><span className="service-icon">TG</span><span className="badge live">Telegram API</span></div><h2>توکن ربات را وارد کنید</h2><p>توکن را از BotFather دریافت کنید. توکن در صفحه نمایش داده یا ذخیره نمی‌شود.</p><label>BotFather Token</label><input type="password" dir="ltr" autoComplete="off" placeholder="123456789:AA..." value={token} onChange={(event) => setToken(event.target.value)} /><button className="primary full" disabled={loading || !token.trim()} onClick={connectBot}>{loading ? 'در حال بررسی...' : 'بررسی و اتصال ربات'}</button>{message && <div className={`notice ${bot ? 'success' : 'error'}`}>{message}</div>}{bot && <div className="bot-profile"><span className="avatar large-avatar">TG</span><div><b>{bot.displayName ?? 'Telegram Bot'}</b><small>{bot.username ? `@${bot.username}` : `ID: ${bot.telegramBotId}`}</small></div><span className="badge live">متصل</span></div>}</article>
      <article className="panel-card"><span className="kicker">بعد از اتصال</span><h2>امکانات ربات</h2><div className="feature-list"><div><b>منوی مشتری</b><small>محصولات، اشتراک، کیف پول، خدمات و پشتیبانی</small></div><div><b>مدیریت فروش</b><small>محصول، قیمت، سفارش، پرداخت و گزارش</small></div><div><b>ارجاع و آموزش</b><small>کد دعوت، محتوای آموزشی و پیام‌های خودکار</small></div><div><b>ارسال و زمان‌بندی</b><small>برادکست، کمپین و صف اجرای پیام‌ها</small></div></div></article>
    </section>
  </>;
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f4f7fb;background:#070a0f}*{box-sizing:border-box}body{margin:0;background:#070a0f;color:#f4f7fb}button,input{font:inherit}button{cursor:pointer}.portal{min-height:100vh;background:#070a0f;color:#f4f7fb;position:relative;overflow:hidden}.ambient{position:fixed;width:520px;height:520px;border-radius:50%;filter:blur(120px);opacity:.11;pointer-events:none}.ambient-a{background:#6d5dfc;top:-220px;right:-170px}.ambient-b{background:#00d9a3;bottom:-250px;left:-190px}.topbar{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid #1b2230;background:rgba(7,10,15,.74);backdrop-filter:blur(18px);position:relative;z-index:5}.brand-button{display:flex;align-items:center;gap:11px;background:none;border:0;color:#fff;padding:0;text-align:right}.brand-button>span:last-child{display:grid;gap:2px}.brand-button b{font-size:15px;letter-spacing:1.4px;direction:ltr}.brand-button small{color:#77839a;font-size:10px}.logo-mark{width:38px;height:38px;border:1px solid #39445a;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:12px;background:linear-gradient(145deg,#171e2a,#0d1119);box-shadow:inset 0 0 20px rgba(255,255,255,.025)}.top-actions,.hero-actions,.header-actions{display:flex;align-items:center;gap:10px}.health{display:inline-flex;align-items:center;gap:7px;font-size:11px;color:#7f8a9d}.health i{width:7px;height:7px;border-radius:50%;background:#705f65}.health.online i{background:#38d996;box-shadow:0 0 0 4px rgba(56,217,150,.09)}.primary,.ghost{border-radius:11px;padding:10px 15px;border:1px solid transparent;font-weight:750}.primary{background:#f4f7fb;color:#090d13}.primary:hover{background:#fff}.primary:disabled{opacity:.5;cursor:not-allowed}.ghost{background:#101620;border-color:#273044;color:#cbd3df}.ghost:hover{border-color:#4a5872;color:#fff}.large{padding:13px 18px}.compact{padding:8px 12px}.landing-main{position:relative;z-index:1}.hero{max-width:1320px;margin:0 auto;min-height:620px;display:grid;grid-template-columns:1.1fr .9fr;gap:60px;align-items:center;padding:72px clamp(20px,4vw,50px)}.hero-copy{max-width:660px}.kicker{display:inline-block;color:#7f8ba0;font-size:12px;font-weight:700;letter-spacing:.3px;margin-bottom:9px}.hero h1{font-size:clamp(40px,6vw,74px);line-height:1.15;letter-spacing:-2.5px;margin:0 0 22px}.hero-copy>p{color:#99a4b7;font-size:18px;line-height:2;max-width:610px;margin:0 0 28px}.trust-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:25px}.trust-row span{border:1px solid #232c3d;color:#7f8b9e;padding:7px 10px;border-radius:999px;font-size:10px;background:#0c1119}.hero-panel{padding:14px}.mini-window{border:1px solid #273044;border-radius:22px;background:linear-gradient(150deg,rgba(22,29,40,.94),rgba(10,14,21,.97));padding:18px;box-shadow:0 34px 90px rgba(0,0,0,.38)}.window-head{display:flex;justify-content:space-between;color:#7f8ba0;font-size:11px;border-bottom:1px solid #222b3a;padding-bottom:15px}.window-head b{color:#35d69a}.window-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.mini-stat{border:1px solid #273044;background:#0b1017;border-radius:15px;padding:16px}.mini-stat small{color:#788498;display:block}.mini-stat strong{display:block;margin-top:11px;font-size:25px}.flow-line{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#0a0f16;border:1px solid #242d3d;border-radius:14px;padding:12px;font-size:10px;color:#8d98ab}.flow-line i{font-style:normal;width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:#151d29;color:#fff}.flow-line b{color:#4b566a}.service-stack{display:grid;gap:8px;margin-top:12px}.service-stack>div{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:10px;padding:10px;border:1px solid #222b39;border-radius:12px}.service-stack>div>span{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#19212e;font-size:9px;font-weight:900}.service-stack small{color:#788498;font-size:9px}.landing-section{max-width:1320px;margin:0 auto;padding:40px clamp(20px,4vw,50px) 95px}.section-title{max-width:650px;margin-bottom:25px}.section-title>span{font-size:11px;color:#7b8799}.section-title h2,.section-line h2,.panel-card h2{font-size:24px;margin:6px 0 8px}.section-title p{color:#8c98aa;line-height:1.9}.service-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.service-card,.panel-card,.metric{border:1px solid #222b39;background:linear-gradient(145deg,#101620,#0c1118);border-radius:17px}.service-card{padding:17px;min-height:210px;display:flex;flex-direction:column}.service-card-head{display:flex;align-items:center;justify-content:space-between}.service-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:#17202c;border:1px solid #2b3649;font-size:10px;font-weight:900;color:#dce3ec}.service-icon.small{width:31px;height:31px;border-radius:9px;font-size:8px}.badge{display:inline-flex;align-items:center;border:1px solid #2d3749;border-radius:999px;padding:5px 8px;color:#7f8b9e;font-size:9px;background:#111823}.badge.live{color:#8de7c1;border-color:#235a47;background:#0d241c}.service-card h3{font-size:17px;margin:18px 0 8px}.service-card p{color:#7f8b9f;line-height:1.8;font-size:12px;flex:1;margin:0 0 14px}.service-card>button{border:0;background:none;color:#cbd4e2;padding:0;text-align:right;font-size:11px;font-weight:700}.app-shell{display:grid;grid-template-columns:246px 1fr;min-height:100vh}.sidebar-new{background:#0a0f16;border-left:1px solid #1f2836;padding:20px 14px;display:flex;flex-direction:column;gap:18px}.side-brand{padding:5px}.workspace-switch{border:1px solid #252e3d;border-radius:13px;padding:12px;background:#0f151e;display:grid;gap:4px}.workspace-switch small{color:#6f7c90;font-size:9px}.workspace-switch b{font-size:12px}.workspace-switch span{font-size:9px;color:#6d7a8d}.nav-new{display:grid;gap:5px}.nav-new button{display:grid;grid-template-columns:28px 1fr;align-items:center;text-align:right;border:1px solid transparent;background:transparent;color:#8490a3;border-radius:10px;padding:9px 10px;font-size:11px}.nav-new button span{font-size:14px;color:#5d6a80}.nav-new button.active,.nav-new button:hover{background:#131b26;border-color:#263144;color:#fff}.nav-new button.active span{color:#fff}.nav-label{font-size:9px;color:#58657a;padding:18px 10px 5px}.sidebar-foot{margin-top:auto;display:grid;gap:11px;border-top:1px solid #1d2532;padding-top:14px}.sidebar-foot button{border:0;background:none;text-align:right;color:#69768a;font-size:10px;padding:0}.dashboard-main{min-width:0;padding:28px clamp(18px,3vw,42px) 60px;max-width:1500px;width:100%;margin:0 auto}.dashboard-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:25px}.dashboard-header h1{font-size:29px;margin:1px 0}.avatar{width:38px;height:38px;border-radius:12px;border:1px solid #303a4c;background:#151d28;color:#fff;font-weight:800}.dot{font-size:8px;border-radius:99px;background:#293447;padding:2px 5px}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}.metric{padding:17px}.metric>span{display:block;color:#788599;font-size:10px}.metric strong{display:block;font-size:29px;margin:10px 0 8px}.metric small{color:#536074;font-size:9px}.dashboard-section{margin-top:30px}.section-line{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.section-line h2{margin:2px 0}.dashboard-services{grid-template-columns:repeat(4,1fr)}.admin-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:12px;margin-top:12px}.panel-card{padding:18px}.panel-card.wide{grid-row:span 2;min-height:430px}.empty-chart{min-height:310px;display:flex;flex-direction:column;justify-content:end}.chart-bars{height:210px;display:flex;align-items:end;gap:12px;padding:18px;border-bottom:1px solid #263044;background:repeating-linear-gradient(to top,transparent,transparent 49px,#182130 50px)}.chart-bars i{flex:1;background:linear-gradient(to top,#263246,#53637f);border-radius:6px 6px 0 0;min-height:9px}.chart-bars i:nth-child(1){height:20%}.chart-bars i:nth-child(2){height:35%}.chart-bars i:nth-child(3){height:24%}.chart-bars i:nth-child(4){height:46%}.chart-bars i:nth-child(5){height:31%}.chart-bars i:nth-child(6){height:56%}.chart-bars i:nth-child(7){height:43%}.chart-bars i:nth-child(8){height:67%}.empty-chart p{color:#647187;font-size:10px;text-align:center;margin:12px 0 0}.status-list,.feature-list,.quick-list{display:grid;gap:8px;margin-top:14px}.status-list>div{display:grid;grid-template-columns:35px 1fr auto;align-items:center;gap:9px;border:1px solid #202938;padding:8px;border-radius:11px}.status-list b{font-size:10px}.status-list small{font-size:8px;color:#69768a}.status-list small.green{color:#50d6a1}.quick-list button{display:flex;justify-content:space-between;border:1px solid #242e3e;background:#0d131b;color:#9ca8ba;border-radius:10px;padding:11px;text-align:right;font-size:10px}.telegram-hero{display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center}.telegram-hero p,.connect-card>p{color:#7f8b9f;line-height:1.9;font-size:11px}.stepper{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.stepper>div{display:grid;justify-items:center;gap:7px;color:#606d81;font-size:8px;text-align:center}.stepper i{font-style:normal;width:30px;height:30px;border:1px solid #2b3547;border-radius:10px;display:grid;place-items:center}.stepper .done{color:#c7d0dc}.stepper .done i{background:#eef2f7;color:#0b1017;border-color:#eef2f7}.telegram-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:12px;margin-top:12px}.connect-card label{display:block;color:#7c899c;font-size:9px;margin:16px 0 7px}.connect-card input{width:100%;background:#070b11;color:#fff;border:1px solid #2b3547;border-radius:11px;padding:12px;outline:none}.connect-card input:focus{border-color:#52617b}.full{width:100%;margin-top:9px}.notice{margin-top:10px;border-radius:10px;padding:10px;font-size:10px;line-height:1.7}.notice.success{border:1px solid #245944;background:#0e211a;color:#96e4c4}.notice.error{border:1px solid #62343a;background:#241316;color:#f0a9b0}.bot-profile{margin-top:10px;border:1px solid #263144;border-radius:12px;padding:10px;display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:9px}.bot-profile div{display:grid;gap:3px}.bot-profile small{color:#78869a;direction:ltr;text-align:right;font-size:9px}.large-avatar{width:40px;height:40px}.feature-list>div{border:1px solid #222b3a;border-radius:11px;padding:11px;display:grid;gap:4px}.feature-list b{font-size:11px}.feature-list small{font-size:9px;color:#718096}.green{color:#50d6a1}@media(max-width:1100px){.service-grid,.dashboard-services{grid-template-columns:repeat(2,1fr)}.stat-grid{grid-template-columns:repeat(2,1fr)}.admin-grid{grid-template-columns:1fr}.panel-card.wide{grid-row:auto}.hero{grid-template-columns:1fr;min-height:auto}.hero-panel{max-width:620px}.hero h1{max-width:760px}}@media(max-width:760px){.landing-topbar .health,.landing-topbar .ghost{display:none}.topbar{padding:0 16px}.brand-button small{display:none}.hero{padding:48px 18px 28px;gap:35px}.hero h1{font-size:43px;letter-spacing:-1.4px}.hero-copy>p{font-size:14px}.hero-actions{align-items:stretch;flex-direction:column}.landing-section{padding:35px 18px 70px}.service-grid,.dashboard-services{grid-template-columns:1fr}.app-shell{grid-template-columns:1fr}.sidebar-new{position:static;border-left:0;border-bottom:1px solid #202938;padding:13px}.workspace-switch,.nav-new .nav-label,.nav-new button:nth-of-type(n+4),.sidebar-foot{display:none}.side-brand{margin-bottom:2px}.nav-new{grid-template-columns:repeat(3,1fr)}.nav-new button{grid-template-columns:1fr;justify-items:center;text-align:center;padding:7px;font-size:9px}.dashboard-main{padding:20px 14px 45px}.dashboard-header{align-items:flex-start}.dashboard-header .ghost{display:none}.stat-grid{grid-template-columns:1fr 1fr}.metric strong{font-size:23px}.telegram-hero,.telegram-grid{grid-template-columns:1fr}.stepper{grid-template-columns:repeat(2,1fr)}.service-stack>div{grid-template-columns:31px 1fr}.service-stack small{display:none}.flow-line span{display:none}.admin-grid{grid-template-columns:1fr}}
`;
