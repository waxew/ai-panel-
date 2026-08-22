import { useCallback, useEffect, useState, type FormEvent } from 'react';

type Route = '/' | '/login' | '/register' | '/app' | '/app/store' | '/app/telegram' | '/admin';
type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

type SessionUser = {
  id: string;
  email: string;
  displayName?: string | null;
  role: UserRole;
};

type CustomerDashboardData = {
  ok: boolean;
  user: SessionUser;
  workspaces: Array<{ id: string; name: string }>;
  subscriptions: Array<{ id: string; status: string; product?: { name?: string } | null }>;
  orders: Array<{ id: string; status: string; amount?: number | string | null; currency: string; product?: { name?: string } | null }>;
  telegramBots: Array<{ id: string; telegramBotId: string; username?: string | null; displayName?: string | null; status: string }>;
  instagramAccounts: Array<{ id: string; username: string; status: string }>;
  summary: {
    activeSubscriptions: number;
    activeTelegramBots: number;
    activeInstagramAccounts: number;
    pendingScheduledJobs: number;
  };
};

type StoreDashboardData = {
  ok: boolean;
  store: null | { id: string; name: string; currency: string; status: string };
  categories: Array<{ id: string; title: string; slug: string; isActive: boolean }>;
  items: Array<{
    id: string;
    categoryId?: string | null;
    title: string;
    description?: string | null;
    itemType: string;
    priceAmount: number | string;
    currency: string;
    inventoryCount?: number | null;
    isActive: boolean;
  }>;
  orders: Array<{
    id: string;
    sourcePlatform: string;
    status: string;
    totalAmount: number | string;
    currency: string;
    createdAt: string;
  }>;
  summary: {
    itemCount: number;
    categoryCount: number;
    orderCount: number;
    paidOrderCount: number;
    customerCount: number;
  };
};

type AdminDashboardData = {
  ok: boolean;
  user: SessionUser;
  summary: {
    customerCount: number;
    activeSubscriptions: number;
    pendingOrders: number;
    billingRevenue: number;
    storeCount: number;
    commerceRevenue: number;
    commercePaidOrders: number;
    activeTelegramBots: number;
    activeInstagramAccounts: number;
  };
  recentStoreOrders: Array<{ id: string; totalAmount: number | string; currency: string; status: string; createdAt: string }>;
};

type ConnectedBot = {
  id: string;
  telegramBotId: string;
  username?: string;
  displayName?: string;
  status: string;
};

const serviceCards = [
  ['TG', 'تلگرام', 'فروشگاه، منوی ربات، سبد خرید و سفارش', 'active'],
  ['IG', 'اینستاگرام', 'دایرکت، کامنت و آنالیز', 'soon'],
  ['WA', 'واتساپ', 'اتوماسیون پیام و فروش', 'soon'],
  ['BA', 'بله', 'ربات فروش و پشتیبانی', 'soon'],
  ['RU', 'روبیکا', 'ربات و اتوماسیون کسب‌وکار', 'soon'],
  ['DC', 'دیسکورد', 'بات کامیونیتی و اعلان', 'soon'],
] as const;

function normalizeRoute(): Route {
  const path = window.location.pathname;
  const allowed: Route[] = ['/', '/login', '/register', '/app', '/app/store', '/app/telegram', '/admin'];
  return allowed.includes(path as Route) ? (path as Route) : '/';
}

async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  return { response, data };
}

function money(value: number | string | null | undefined, currency = 'IRR') {
  const number = Number(value ?? 0);
  return `${new Intl.NumberFormat('fa-IR').format(Number.isFinite(number) ? number : 0)} ${currency === 'IRR' ? 'ریال' : currency}`;
}

function count(value: number | string | null | undefined) {
  return new Intl.NumberFormat('fa-IR').format(Number(value ?? 0));
}

export default function App() {
  const [route, setRoute] = useState<Route>(normalizeRoute());
  const [session, setSession] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);

  const go = useCallback((target: Route) => {
    window.history.pushState({}, '', target);
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const { response, data } = await api<{ authenticated?: boolean; user?: SessionUser }>('/api/session');
      if (response.ok && data.authenticated && data.user) {
        setSession(data.user);
        return data.user;
      }
    } catch {
      // A network error is handled as an unauthenticated state below.
    }
    setSession(null);
    return null;
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(normalizeRoute());
    window.addEventListener('popstate', onPopState);
    void loadSession().finally(() => setBooting(false));
    return () => window.removeEventListener('popstate', onPopState);
  }, [loadSession]);

  useEffect(() => {
    if (booting) return;
    const protectedRoute = route === '/app' || route === '/app/store' || route === '/app/telegram' || route === '/admin';
    if (protectedRoute && !session) go('/login');
    if ((route === '/login' || route === '/register') && session) go('/app');
  }, [booting, route, session, go]);

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => undefined);
    setSession(null);
    go('/');
  }

  if (booting) return <LoadingScreen />;

  if (route === '/') return <Landing go={go} session={session} />;
  if (route === '/login' || route === '/register') {
    return <AuthPage mode={route === '/login' ? 'login' : 'register'} go={go} onAuthenticated={async () => {
      const user = await loadSession();
      if (user) go('/app');
    }} />;
  }
  if (!session) return <LoadingScreen />;

  return (
    <AppShell route={route} user={session} go={go} signOut={signOut}>
      {route === '/app' && <CustomerDashboard go={go} />}
      {route === '/app/store' && <StoreManager />}
      {route === '/app/telegram' && <TelegramManager />}
      {route === '/admin' && <AdminDashboard user={session} go={go} />}
    </AppShell>
  );
}

function LoadingScreen() {
  return <div className="ap-loading" dir="rtl"><style>{styles}</style><div className="ap-spinner" /><b>AI PANEL</b><span>در حال آماده‌سازی پنل...</span></div>;
}

function Landing({ go, session }: { go: (route: Route) => void; session: SessionUser | null }) {
  return (
    <div className="ap-page ap-landing" dir="rtl">
      <style>{styles}</style>
      <header className="ap-public-header">
        <button className="ap-brand" onClick={() => go('/')}><i>AP</i><span><b>AI PANEL</b><small>Commerce Automation OS</small></span></button>
        <nav><button className="ap-btn ghost" onClick={() => go(session ? '/app' : '/login')}>{session ? 'داشبورد' : 'ورود'}</button><button className="ap-btn primary" onClick={() => go(session ? '/app' : '/register')}>{session ? 'باز کردن پنل' : 'ساخت حساب'}</button></nav>
      </header>

      <main>
        <section className="ap-hero">
          <div className="ap-hero-copy">
            <span className="ap-eyebrow">فروشگاه‌ساز و اتوماسیون چندکاناله</span>
            <h1>فروش در تلگرام را بساز. بعد همان فروشگاه را به کانال‌های دیگر وصل کن.</h1>
            <p>محصول، دسته‌بندی، مشتری، سبد خرید و سفارش در یک هسته مرکزی مدیریت می‌شوند. تلگرام اولین کانال فعال AI Panel است و واتساپ، اینستاگرام، بله، روبیکا و دیسکورد روی همان هسته اضافه می‌شوند.</p>
            <div className="ap-actions"><button className="ap-btn primary large" onClick={() => go(session ? '/app' : '/register')}>شروع ساخت فروشگاه</button><button className="ap-btn ghost large" onClick={() => go(session ? '/app/telegram' : '/login')}>اتصال ربات تلگرام</button></div>
            <div className="ap-chips"><span>Multi-tenant</span><span>Supabase Auth</span><span>Cloudflare</span><span>Telegram Webhook</span></div>
          </div>
          <div className="ap-product-preview">
            <div className="ap-preview-head"><span>Workspace / فروشگاه من</span><b>● آنلاین</b></div>
            <div className="ap-preview-stats"><div><small>محصول</small><strong>—</strong></div><div><small>سفارش</small><strong>—</strong></div><div><small>مشتری</small><strong>—</strong></div></div>
            <div className="ap-preview-flow"><span>۱. ساخت فروشگاه</span><span>۲. افزودن محصول</span><span>۳. اتصال ربات</span><span>۴. دریافت سفارش</span></div>
          </div>
        </section>

        <section className="ap-section">
          <div className="ap-section-title"><span className="ap-eyebrow">کانال‌ها</span><h2>یک Commerce Core، چند کانال فروش</h2></div>
          <div className="ap-service-grid">{serviceCards.map(([short, title, description, state]) => <article key={title} className="ap-card ap-service"><div><i>{short}</i><span className={`ap-pill ${state === 'active' ? 'live' : ''}`}>{state === 'active' ? 'فعال' : 'در صف توسعه'}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>
      </main>
    </div>
  );
}

function AuthPage({ mode, go, onAuthenticated }: { mode: 'login' | 'register'; go: (route: Route) => void; onAuthenticated: () => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setSuccess(false);
    try {
      const endpoint = mode === 'login' ? '/api/auth/signin' : '/api/auth/signup';
      const { response, data } = await api<{ ok?: boolean; requiresConfirmation?: boolean; message?: string }>(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setMessage(data.message ?? 'عملیات انجام نشد.');
        return;
      }
      if (mode === 'register' && data.requiresConfirmation) {
        setSuccess(true);
        setMessage(data.message ?? 'ایمیل تأیید ارسال شد.');
        return;
      }
      await onAuthenticated();
    } catch {
      setMessage('ارتباط با سرور برقرار نشد.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ap-auth-page" dir="rtl">
      <style>{styles}</style>
      <button className="ap-brand auth-brand" onClick={() => go('/')}><i>AP</i><span><b>AI PANEL</b><small>Commerce Automation OS</small></span></button>
      <form className="ap-auth-card" onSubmit={submit}>
        <span className="ap-eyebrow">{mode === 'login' ? 'ورود امن' : 'شروع کار'}</span>
        <h1>{mode === 'login' ? 'ورود به پنل' : 'ساخت حساب مشتری'}</h1>
        <p>{mode === 'login' ? 'با حساب خود وارد داشبورد و فروشگاه شوید.' : 'بعد از ثبت‌نام، Workspace و دسترسی مشتری برای شما ساخته می‌شود.'}</p>
        <label>ایمیل<input type="email" dir="ltr" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
        <label>رمز عبور<input type="password" dir="ltr" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="حداقل ۸ کاراکتر" required /></label>
        <button className="ap-btn primary full" disabled={busy}>{busy ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ساخت حساب'}</button>
        {message && <div className={`ap-notice ${success ? 'success' : 'error'}`}>{message}</div>}
        <div className="ap-auth-switch">{mode === 'login' ? <>حساب ندارید؟ <button type="button" onClick={() => go('/register')}>ثبت‌نام</button></> : <>قبلاً حساب ساخته‌اید؟ <button type="button" onClick={() => go('/login')}>ورود</button></>}</div>
      </form>
    </div>
  );
}

function AppShell({ route, user, go, signOut, children }: { route: Route; user: SessionUser; go: (route: Route) => void; signOut: () => Promise<void>; children: React.ReactNode }) {
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  return (
    <div className="ap-shell" dir="rtl">
      <style>{styles}</style>
      <aside className="ap-sidebar">
        <button className="ap-brand" onClick={() => go('/')}><i>AP</i><span><b>AI PANEL</b><small>Commerce OS</small></span></button>
        <div className="ap-account"><small>حساب</small><b>{user.displayName || user.email}</b><span>{user.role}</span></div>
        <nav className="ap-nav">
          <button className={route === '/app' ? 'active' : ''} onClick={() => go('/app')}><i>⌂</i>داشبورد</button>
          <button className={route === '/app/store' ? 'active' : ''} onClick={() => go('/app/store')}><i>▦</i>فروشگاه من</button>
          <button className={route === '/app/telegram' ? 'active' : ''} onClick={() => go('/app/telegram')}><i>✦</i>ربات تلگرام</button>
          {isAdmin && <><span className="ap-nav-label">مدیریت پلتفرم</span><button className={route === '/admin' ? 'active' : ''} onClick={() => go('/admin')}><i>◆</i>داشبورد مدیر</button></>}
        </nav>
        <button className="ap-signout" onClick={() => void signOut()}>خروج از حساب</button>
      </aside>
      <main className="ap-main">{children}</main>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="ap-page-header"><div><span className="ap-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="ap-card ap-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function CustomerDashboard({ go }: { go: (route: Route) => void }) {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void api<CustomerDashboardData>('/api/customer/dashboard').then(({ response, data }) => {
      if (!response.ok) throw new Error(data.message ?? 'خطا');
      setData(data);
    }).catch(() => setError('اطلاعات داشبورد دریافت نشد.'));
  }, []);

  return <>
    <PageHeader eyebrow="Workspace مشتری" title="داشبورد" description="این اعداد از دیتابیس واقعی حساب شما خوانده می‌شوند." action={<button className="ap-btn primary" onClick={() => go('/app/store')}>مدیریت فروشگاه</button>} />
    {error && <div className="ap-notice error">{error}</div>}
    {!data ? <Skeleton /> : <>
      <section className="ap-metrics"><Metric label="اشتراک فعال" value={count(data.summary.activeSubscriptions)} note="اشتراک‌های ACTIVE / TRIALING" /><Metric label="ربات تلگرام فعال" value={count(data.summary.activeTelegramBots)} note="ربات متصل به Workspace" /><Metric label="اینستاگرام فعال" value={count(data.summary.activeInstagramAccounts)} note="حساب‌های متصل" /><Metric label="کار زمان‌بندی‌شده" value={count(data.summary.pendingScheduledJobs)} note="در انتظار یا در حال پردازش" /></section>
      <section className="ap-two-col">
        <article className="ap-card ap-panel"><div className="ap-panel-head"><div><span className="ap-eyebrow">کانال‌ها</span><h2>سرویس‌های شما</h2></div></div><div className="ap-channel-list"><button onClick={() => go('/app/telegram')}><i>TG</i><span><b>تلگرام</b><small>{data.telegramBots.length ? `${count(data.telegramBots.length)} ربات متصل` : 'هنوز رباتی متصل نشده'}</small></span><em>{data.telegramBots.length ? 'مدیریت ←' : 'اتصال ←'}</em></button><button disabled><i>IG</i><span><b>اینستاگرام</b><small>مرحله بعدی محصول</small></span><em>به‌زودی</em></button></div></article>
        <article className="ap-card ap-panel"><span className="ap-eyebrow">فعالیت حساب</span><h2>آخرین سفارش‌های اشتراک</h2>{data.orders.length === 0 ? <Empty text="هنوز سفارشی ثبت نشده است." /> : <div className="ap-list">{data.orders.slice(0, 6).map((order) => <div key={order.id}><span><b>{order.product?.name || 'سفارش'}</b><small>{order.status}</small></span><strong>{money(order.amount, order.currency)}</strong></div>)}</div>}</article>
      </section>
    </>}
  </>;
}

function StoreManager() {
  const [data, setData] = useState<StoreDashboardData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [storeName, setStoreName] = useState('فروشگاه من');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [product, setProduct] = useState({ title: '', description: '', priceAmount: '', inventoryCount: '', itemType: 'DIGITAL', categoryId: '' });

  const load = useCallback(async () => {
    const { response, data } = await api<StoreDashboardData>('/api/store');
    if (!response.ok) throw new Error(data.message ?? 'خطا');
    setData(data);
  }, []);

  useEffect(() => { void load().catch(() => setMessage('فروشگاه قابل دریافت نیست.')); }, [load]);

  async function action(body: Record<string, unknown>) {
    setBusy(true); setMessage('');
    try {
      const { response, data } = await api<StoreDashboardData>('/api/store', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) { setMessage(data.message ?? 'عملیات انجام نشد.'); return false; }
      setData(data); return true;
    } catch { setMessage('ارتباط با سرور برقرار نشد.'); return false; }
    finally { setBusy(false); }
  }

  async function createStore(event: FormEvent) { event.preventDefault(); await action({ action: 'ensure_store', name: storeName }); }
  async function createCategory(event: FormEvent) { event.preventDefault(); if (await action({ action: 'create_category', title: categoryTitle })) setCategoryTitle(''); }
  async function createProduct(event: FormEvent) {
    event.preventDefault();
    const ok = await action({ action: 'create_item', title: product.title, description: product.description, priceAmount: Number(product.priceAmount), inventoryCount: product.inventoryCount === '' ? null : Number(product.inventoryCount), itemType: product.itemType, categoryId: product.categoryId || null });
    if (ok) setProduct({ title: '', description: '', priceAmount: '', inventoryCount: '', itemType: 'DIGITAL', categoryId: '' });
  }

  return <>
    <PageHeader eyebrow="Commerce Core" title="فروشگاه من" description="محصولات این فروشگاه بین کانال‌ها مشترک‌اند؛ تلگرام اولین کانال فعال است." />
    {message && <div className="ap-notice error">{message}</div>}
    {!data ? <Skeleton /> : !data.store ? <section className="ap-card ap-onboarding"><span className="ap-eyebrow">مرحله اول</span><h2>فروشگاه Workspace را بساز</h2><p>بعد از ساخت، محصول و دسته‌بندی اضافه می‌کنی و ربات تلگرام همان Catalog را استفاده می‌کند.</p><form onSubmit={createStore}><input value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="نام فروشگاه" required /><button className="ap-btn primary" disabled={busy}>{busy ? 'در حال ساخت...' : 'ساخت فروشگاه'}</button></form></section> : <>
      <section className="ap-store-banner ap-card"><div><span className="ap-pill live">{data.store.status}</span><h2>{data.store.name}</h2><p>Commerce ID: <code>{data.store.id.slice(0, 12)}</code></p></div><span>ارز پایه: {data.store.currency}</span></section>
      <section className="ap-metrics"><Metric label="محصول" value={count(data.summary.itemCount)} note="محصول فعال/ثبت‌شده" /><Metric label="دسته‌بندی" value={count(data.summary.categoryCount)} note="ساختار کاتالوگ" /><Metric label="سفارش" value={count(data.summary.orderCount)} note="آخرین سفارش‌های فروشگاه" /><Metric label="مشتری" value={count(data.summary.customerCount)} note="مشتری شناخته‌شده کانال‌ها" /></section>
      <section className="ap-store-grid">
        <article className="ap-card ap-panel"><span className="ap-eyebrow">افزودن محصول</span><h2>محصول جدید</h2><form className="ap-form-grid" onSubmit={createProduct}><label>نام محصول<input value={product.title} onChange={(event) => setProduct({ ...product, title: event.target.value })} required /></label><label>قیمت (ریال)<input type="number" min="0" dir="ltr" value={product.priceAmount} onChange={(event) => setProduct({ ...product, priceAmount: event.target.value })} required /></label><label>نوع<select value={product.itemType} onChange={(event) => setProduct({ ...product, itemType: event.target.value })}><option value="DIGITAL">دیجیتال</option><option value="PHYSICAL">فیزیکی</option><option value="SERVICE">خدمت</option></select></label><label>موجودی<input type="number" min="0" dir="ltr" value={product.inventoryCount} onChange={(event) => setProduct({ ...product, inventoryCount: event.target.value })} placeholder="خالی = نامحدود" /></label><label>دسته<select value={product.categoryId} onChange={(event) => setProduct({ ...product, categoryId: event.target.value })}><option value="">بدون دسته</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label><label className="wide">توضیح<textarea value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} rows={3} /></label><button className="ap-btn primary wide" disabled={busy}>ثبت محصول</button></form></article>
        <article className="ap-card ap-panel"><span className="ap-eyebrow">کاتالوگ</span><h2>دسته‌بندی‌ها</h2><form className="ap-inline-form" onSubmit={createCategory}><input value={categoryTitle} onChange={(event) => setCategoryTitle(event.target.value)} placeholder="مثلاً اشتراک‌ها" required /><button className="ap-btn ghost" disabled={busy}>افزودن</button></form>{data.categories.length === 0 ? <Empty text="هنوز دسته‌ای ساخته نشده است." /> : <div className="ap-tag-list">{data.categories.map((category) => <span key={category.id}>{category.title}</span>)}</div>}</article>
      </section>
      <section className="ap-two-col store-lists">
        <article className="ap-card ap-panel"><div className="ap-panel-head"><div><span className="ap-eyebrow">Catalog</span><h2>محصولات</h2></div><span className="ap-pill">{count(data.items.length)} مورد</span></div>{data.items.length === 0 ? <Empty text="اولین محصول را با فرم بالا اضافه کنید." /> : <div className="ap-list products">{data.items.map((item) => <div key={item.id}><span><b>{item.title}</b><small>{item.itemType} · {item.inventoryCount == null ? 'موجودی نامحدود' : `موجودی ${count(item.inventoryCount)}`}</small></span><strong>{money(item.priceAmount, item.currency)}</strong></div>)}</div>}</article>
        <article className="ap-card ap-panel"><div className="ap-panel-head"><div><span className="ap-eyebrow">Orders</span><h2>سفارش‌ها</h2></div><span className="ap-pill live">پرداخت‌شده {count(data.summary.paidOrderCount)}</span></div>{data.orders.length === 0 ? <Empty text="با اولین خرید مشتری، سفارش اینجا ظاهر می‌شود." /> : <div className="ap-list">{data.orders.map((order) => <div key={order.id}><span><b>#{order.id.slice(0, 8)}</b><small>{order.sourcePlatform} · {order.status}</small></span><strong>{money(order.totalAmount, order.currency)}</strong></div>)}</div>}</article>
      </section>
    </>}
  </>;
}

function TelegramManager() {
  const [dashboard, setDashboard] = useState<CustomerDashboardData | null>(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState<ConnectedBot | null>(null);

  const load = useCallback(async () => {
    const { response, data } = await api<CustomerDashboardData>('/api/customer/dashboard');
    if (!response.ok) throw new Error(data.message ?? 'خطا');
    setDashboard(data);
  }, []);

  useEffect(() => { void load().catch(() => setMessage('وضعیت ربات دریافت نشد.')); }, [load]);

  async function connect(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const { response, data } = await api<{ ok?: boolean; message?: string; bot?: ConnectedBot; webhookConfigured?: boolean }>('/api/telegram/connect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      if (!response.ok || !data.bot) { setMessage(data.message ?? 'اتصال انجام نشد.'); return; }
      setConnected(data.bot); setToken(''); setMessage(data.webhookConfigured ? 'ربات ذخیره شد و Webhook تلگرام فعال است.' : 'ربات متصل شد.'); await load();
    } catch { setMessage('ارتباط با سرور برقرار نشد.'); }
    finally { setBusy(false); }
  }

  const bots = dashboard?.telegramBots ?? [];
  return <>
    <PageHeader eyebrow="Telegram Commerce" title="ربات تلگرام" description="ربات به Workspace شما وصل می‌شود؛ توکن رمزنگاری می‌شود و Webhook با Secret اختصاصی تنظیم می‌شود." />
    {message && <div className={`ap-notice ${connected ? 'success' : 'error'}`}>{message}</div>}
    <section className="ap-two-col telegram">
      <article className="ap-card ap-panel"><span className="ap-eyebrow">BotFather</span><h2>{bots.length ? 'اتصال ربات دیگر' : 'اتصال اولین ربات'}</h2><p className="ap-muted">توکن BotFather فقط برای اعتبارسنجی و اتصال امن استفاده می‌شود و در رابط کاربری نمایش داده نمی‌شود.</p><form className="ap-connect-form" onSubmit={connect}><label>Bot Token<input type="password" dir="ltr" autoComplete="off" placeholder="123456789:AA..." value={token} onChange={(event) => setToken(event.target.value)} required /></label><button className="ap-btn primary full" disabled={busy || !token.trim()}>{busy ? 'در حال اتصال...' : 'اتصال امن ربات'}</button></form></article>
      <article className="ap-card ap-panel"><span className="ap-eyebrow">منوی پیش‌فرض</span><h2>شروع فروش</h2><div className="ap-menu-preview"><span>🛍 محصولات</span><span>🛒 سبد خرید</span><span>📦 سفارش‌های من</span><span>☎️ پشتیبانی</span></div><p className="ap-muted">این منو هنگام اتصال ربات ساخته می‌شود. Catalog از Commerce Core همین Workspace تغذیه می‌شود.</p></article>
    </section>
    <section className="ap-card ap-panel"><div className="ap-panel-head"><div><span className="ap-eyebrow">Connected Bots</span><h2>ربات‌های متصل</h2></div><span className="ap-pill live">{count(bots.length)} فعال</span></div>{!dashboard ? <Skeleton compact /> : bots.length === 0 ? <Empty text="هنوز رباتی به این Workspace متصل نشده است." /> : <div className="ap-bot-grid">{bots.map((bot) => <div className="ap-bot-card" key={bot.id}><i>TG</i><span><b>{bot.displayName || 'Telegram Bot'}</b><small>{bot.username ? `@${bot.username}` : bot.telegramBotId}</small></span><em>{bot.status}</em></div>)}</div>}</section>
  </>;
}

function AdminDashboard({ user, go }: { user: SessionUser; go: (route: Route) => void }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState('');
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    void api<AdminDashboardData>('/api/admin/dashboard').then(({ response, data }) => {
      if (!response.ok) throw new Error(data.message ?? 'خطا');
      setData(data);
    }).catch(() => setError('آمار مدیریت دریافت نشد.'));
  }, [isAdmin]);

  if (!isAdmin) return <section className="ap-card ap-denied"><h2>دسترسی غیرمجاز</h2><p>این صفحه فقط برای ADMIN و SUPER_ADMIN است.</p><button className="ap-btn ghost" onClick={() => go('/app')}>بازگشت به داشبورد</button></section>;

  return <>
    <PageHeader eyebrow="Business Control Center" title="داشبورد مدیر" description="این آمار از کل پلتفرم خوانده می‌شود و از پنل مشتری جداست." />
    {error && <div className="ap-notice error">{error}</div>}
    {!data ? <Skeleton /> : <>
      <section className="ap-metrics admin"><Metric label="مشتری" value={count(data.summary.customerCount)} note="حساب‌های CUSTOMER" /><Metric label="فروشگاه" value={count(data.summary.storeCount)} note="Commerce Workspaceها" /><Metric label="اشتراک فعال" value={count(data.summary.activeSubscriptions)} note="ACTIVE / TRIALING" /><Metric label="ربات تلگرام" value={count(data.summary.activeTelegramBots)} note="ربات‌های ACTIVE" /><Metric label="درآمد فروشگاه‌ها" value={money(data.summary.commerceRevenue)} note={`${count(data.summary.commercePaidOrders)} سفارش پرداخت‌شده`} /><Metric label="درآمد اشتراک" value={money(data.summary.billingRevenue)} note="سفارش‌های PAID پلتفرم" /></section>
      <section className="ap-two-col"><article className="ap-card ap-panel"><span className="ap-eyebrow">Commerce</span><h2>سفارش‌های اخیر فروشگاه‌ها</h2>{data.recentStoreOrders.length === 0 ? <Empty text="هنوز سفارش فروشگاهی ثبت نشده است." /> : <div className="ap-list">{data.recentStoreOrders.slice(0, 12).map((order) => <div key={order.id}><span><b>#{order.id.slice(0, 8)}</b><small>{order.status}</small></span><strong>{money(order.totalAmount, order.currency)}</strong></div>)}</div>}</article><article className="ap-card ap-panel"><span className="ap-eyebrow">Platform</span><h2>وضعیت عملیاتی</h2><div className="ap-status-stack"><div><span>سفارش در انتظار پرداخت</span><b>{count(data.summary.pendingOrders)}</b></div><div><span>اینستاگرام فعال</span><b>{count(data.summary.activeInstagramAccounts)}</b></div><div><span>تلگرام فعال</span><b>{count(data.summary.activeTelegramBots)}</b></div></div></article></section>
    </>}
  </>;
}

function Empty({ text }: { text: string }) { return <div className="ap-empty">{text}</div>; }
function Skeleton({ compact = false }: { compact?: boolean }) { return <div className={`ap-skeleton ${compact ? 'compact' : ''}`}><i /><i /><i /></div>; }

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f4f7fb;background:#070a0f}*{box-sizing:border-box}body{margin:0;background:#070a0f;color:#f4f7fb}button,input,select,textarea{font:inherit}button{cursor:pointer}.ap-page,.ap-auth-page,.ap-shell,.ap-loading{min-height:100vh;background:#070a0f;color:#f4f7fb}.ap-btn{border:1px solid transparent;border-radius:12px;padding:10px 15px;font-weight:800}.ap-btn.primary{background:#f4f7fb;color:#080c12}.ap-btn.primary:hover{background:#fff}.ap-btn.ghost{background:#101620;border-color:#293347;color:#cfd7e4}.ap-btn:disabled{opacity:.48;cursor:not-allowed}.ap-btn.large{padding:14px 19px}.ap-btn.full{width:100%}.ap-brand{display:flex;align-items:center;gap:10px;border:0;background:none;color:#fff;text-align:right;padding:0}.ap-brand>i{font-style:normal;width:40px;height:40px;border:1px solid #354157;border-radius:12px;display:grid;place-items:center;background:#111824;font-weight:950;font-size:11px}.ap-brand>span{display:grid;gap:2px}.ap-brand b{font-size:14px;letter-spacing:1.2px}.ap-brand small{color:#77839a;font-size:9px}.ap-public-header{height:78px;padding:0 clamp(20px,6vw,80px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1d2533;background:rgba(7,10,15,.86);position:sticky;top:0;z-index:5;backdrop-filter:blur(18px)}.ap-public-header nav,.ap-actions{display:flex;gap:9px}.ap-hero{max-width:1320px;min-height:610px;margin:auto;padding:70px clamp(20px,5vw,64px);display:grid;grid-template-columns:1.1fr .9fr;gap:60px;align-items:center}.ap-hero-copy h1{font-size:clamp(39px,5.6vw,72px);line-height:1.16;letter-spacing:-2.3px;margin:4px 0 22px;max-width:760px}.ap-hero-copy>p{font-size:17px;line-height:2;color:#98a4b6;max-width:690px}.ap-eyebrow{color:#7f8ca0;font-size:11px;font-weight:800;letter-spacing:.2px}.ap-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:24px}.ap-chips span,.ap-pill{border:1px solid #2b3547;border-radius:999px;padding:6px 9px;color:#8490a3;background:#0d131c;font-size:9px}.ap-pill.live{border-color:#245744;color:#8be2bd;background:#0b211a}.ap-product-preview{border:1px solid #283246;background:linear-gradient(145deg,#111925,#0a0f17);border-radius:22px;padding:18px;box-shadow:0 28px 80px rgba(0,0,0,.34)}.ap-preview-head{display:flex;justify-content:space-between;color:#8190a4;font-size:11px;padding-bottom:15px;border-bottom:1px solid #222b3a}.ap-preview-head b{color:#61ddb0}.ap-preview-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:14px 0}.ap-preview-stats div{padding:15px;background:#0a1018;border:1px solid #222c3d;border-radius:14px}.ap-preview-stats small{display:block;color:#7a879a}.ap-preview-stats strong{display:block;font-size:26px;margin-top:9px}.ap-preview-flow{display:grid;gap:8px}.ap-preview-flow span{padding:11px 13px;border:1px solid #222c3b;border-radius:11px;color:#aeb8c8;font-size:11px}.ap-section{max-width:1320px;margin:auto;padding:25px clamp(20px,5vw,64px) 90px}.ap-section-title h2{font-size:28px;margin:5px 0 22px}.ap-service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ap-card{background:linear-gradient(145deg,#101620,#0b1017);border:1px solid #222c3b;border-radius:17px}.ap-service{padding:17px;min-height:170px}.ap-service>div{display:flex;justify-content:space-between}.ap-service i{font-style:normal;width:39px;height:39px;display:grid;place-items:center;background:#18212e;border:1px solid #2e394d;border-radius:11px;font-size:9px;font-weight:900}.ap-service h3{margin:16px 0 7px}.ap-service p{color:#7f8b9e;font-size:12px;line-height:1.8}.ap-auth-page{display:grid;place-items:center;padding:80px 20px;position:relative}.auth-brand{position:absolute;top:25px;right:28px}.ap-auth-card{width:min(440px,100%);padding:28px;border:1px solid #273246;background:#0d131c;border-radius:20px;box-shadow:0 32px 90px rgba(0,0,0,.34)}.ap-auth-card h1{margin:7px 0;font-size:30px}.ap-auth-card>p,.ap-muted{color:#8491a4;line-height:1.85;font-size:12px}.ap-auth-card label,.ap-connect-form label,.ap-form-grid label{display:grid;gap:7px;margin-top:15px;color:#aab4c3;font-size:11px}.ap-auth-card input,.ap-connect-form input,.ap-onboarding input,.ap-inline-form input,.ap-form-grid input,.ap-form-grid select,.ap-form-grid textarea{width:100%;border:1px solid #2a3548;background:#090e15;color:#fff;border-radius:11px;padding:12px;outline:none}.ap-auth-card input:focus,.ap-connect-form input:focus,.ap-form-grid input:focus,.ap-form-grid select:focus,.ap-form-grid textarea:focus{border-color:#6b7e9f}.ap-auth-card .full{margin-top:18px}.ap-auth-switch{text-align:center;color:#7e899b;font-size:11px;margin-top:17px}.ap-auth-switch button{border:0;background:none;color:#fff;font-weight:800}.ap-notice{border-radius:11px;padding:11px 13px;margin:12px 0;font-size:11px;line-height:1.7}.ap-notice.error{background:#261418;border:1px solid #63313b;color:#ffb6c2}.ap-notice.success{background:#0d251d;border:1px solid #275e49;color:#9be7c7}.ap-loading{display:grid;place-items:center;align-content:center;gap:9px}.ap-loading span{color:#7e8a9d;font-size:11px}.ap-spinner{width:34px;height:34px;border-radius:50%;border:3px solid #242d3e;border-top-color:#fff;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.ap-shell{display:grid;grid-template-columns:245px 1fr}.ap-sidebar{position:sticky;top:0;height:100vh;border-left:1px solid #202938;background:#090e15;padding:22px 14px;display:flex;flex-direction:column;z-index:5}.ap-account{border:1px solid #222d3e;border-radius:13px;background:#0d141e;padding:12px;margin:20px 0 12px;display:grid;gap:5px}.ap-account small,.ap-account span{font-size:9px;color:#778499}.ap-account b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-nav{display:grid;gap:5px}.ap-nav button{border:1px solid transparent;background:none;color:#8793a6;border-radius:10px;padding:10px 11px;display:flex;align-items:center;gap:10px;text-align:right}.ap-nav button i{font-style:normal;width:23px;text-align:center}.ap-nav button:hover,.ap-nav button.active{background:#141c28;border-color:#2a3548;color:#fff}.ap-nav-label{font-size:9px;color:#596579;margin:17px 10px 5px}.ap-signout{margin-top:auto;border:1px solid #283347;background:#101620;color:#aab4c2;border-radius:10px;padding:10px}.ap-main{min-width:0;padding:34px clamp(20px,4vw,54px) 70px;max-width:1500px;width:100%;margin:0 auto}.ap-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:25px}.ap-page-header h1{font-size:32px;margin:6px 0 4px}.ap-page-header p{color:#818ea1;margin:0;line-height:1.8;font-size:12px}.ap-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}.ap-metrics.admin{grid-template-columns:repeat(3,1fr)}.ap-metric{padding:16px}.ap-metric>span{font-size:10px;color:#8390a3}.ap-metric strong{font-size:25px;display:block;margin:9px 0 6px}.ap-metric small{color:#69768a;font-size:9px}.ap-two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ap-panel{padding:18px}.ap-panel h2{font-size:20px;margin:6px 0 14px}.ap-panel-head{display:flex;align-items:flex-start;justify-content:space-between}.ap-channel-list{display:grid;gap:8px}.ap-channel-list button{border:1px solid #273245;background:#0a1018;border-radius:12px;color:#fff;padding:11px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;text-align:right}.ap-channel-list button:disabled{opacity:.55}.ap-channel-list i,.ap-bot-card>i{font-style:normal;width:38px;height:38px;display:grid;place-items:center;background:#192331;border-radius:10px;font-size:9px;font-weight:900}.ap-channel-list span,.ap-bot-card span{display:grid;gap:3px}.ap-channel-list small,.ap-bot-card small{color:#778499;font-size:9px}.ap-channel-list em,.ap-bot-card em{font-style:normal;color:#96a2b4;font-size:9px}.ap-list{display:grid}.ap-list>div{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 2px;border-bottom:1px solid #1d2634}.ap-list>div:last-child{border-bottom:0}.ap-list span{display:grid;gap:3px}.ap-list b{font-size:11px}.ap-list small{color:#727f92;font-size:9px}.ap-list strong{font-size:11px;white-space:nowrap}.ap-empty{padding:24px;border:1px dashed #2b3546;border-radius:12px;text-align:center;color:#687588;font-size:10px}.ap-skeleton{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ap-skeleton i{height:112px;border-radius:15px;background:linear-gradient(90deg,#0f1620,#161f2c,#0f1620);background-size:200% 100%;animation:shimmer 1.3s infinite}@keyframes shimmer{to{background-position:-200% 0}}.ap-skeleton.compact i{height:58px}.ap-onboarding{padding:28px;max-width:680px}.ap-onboarding h2{font-size:25px;margin:7px 0}.ap-onboarding p{color:#8390a3;line-height:1.8}.ap-onboarding form{display:flex;gap:8px;margin-top:18px}.ap-store-banner{padding:18px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}.ap-store-banner h2{margin:8px 0 3px}.ap-store-banner p,.ap-store-banner>span{font-size:10px;color:#738096}.ap-store-banner code{color:#aab5c5}.ap-store-grid{display:grid;grid-template-columns:1.35fr .65fr;gap:12px;margin-bottom:12px}.ap-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ap-form-grid label{margin-top:0}.ap-form-grid .wide{grid-column:1/-1}.ap-form-grid textarea{resize:vertical}.ap-inline-form{display:flex;gap:7px;margin-bottom:12px}.ap-tag-list{display:flex;flex-wrap:wrap;gap:6px}.ap-tag-list span{font-size:10px;padding:7px 9px;border:1px solid #2a3547;background:#0b1119;border-radius:999px}.store-lists{margin-top:12px}.ap-connect-form{margin-top:18px}.ap-menu-preview{display:grid;grid-template-columns:1fr 1fr;gap:7px}.ap-menu-preview span{border:1px solid #293447;background:#0a1018;border-radius:10px;padding:12px;text-align:center;font-size:11px}.ap-bot-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ap-bot-card{border:1px solid #283347;background:#0a1018;border-radius:12px;padding:11px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px}.ap-status-stack{display:grid;gap:8px}.ap-status-stack div{display:flex;justify-content:space-between;border:1px solid #283347;background:#0a1018;border-radius:11px;padding:12px;font-size:11px}.ap-denied{padding:30px;max-width:600px}.ap-denied p{color:#8390a3}
@media(max-width:1050px){.ap-hero{grid-template-columns:1fr}.ap-product-preview{max-width:650px}.ap-service-grid{grid-template-columns:repeat(2,1fr)}.ap-metrics{grid-template-columns:repeat(2,1fr)}.ap-store-grid{grid-template-columns:1fr}.ap-bot-grid{grid-template-columns:1fr 1fr}}
@media(max-width:760px){.ap-public-header{padding:0 15px}.ap-brand small{display:none}.ap-public-header .ghost{display:none}.ap-hero{padding:45px 18px;gap:35px}.ap-hero-copy h1{font-size:39px;letter-spacing:-1.3px}.ap-service-grid,.ap-two-col,.ap-metrics,.ap-metrics.admin{grid-template-columns:1fr}.ap-section{padding-inline:18px}.ap-shell{display:block}.ap-sidebar{position:sticky;height:auto;top:0;border-left:0;border-bottom:1px solid #202938;padding:10px 12px;display:grid;grid-template-columns:auto 1fr auto;align-items:center}.ap-sidebar>.ap-account{display:none}.ap-nav{display:flex;overflow:auto;margin:0 9px;gap:3px}.ap-nav button{white-space:nowrap;padding:8px}.ap-nav button i,.ap-nav-label{display:none}.ap-signout{margin:0;padding:8px;font-size:10px}.ap-main{padding:24px 15px 60px}.ap-page-header{display:grid}.ap-page-header h1{font-size:27px}.ap-page-header .ap-btn{width:max-content}.ap-form-grid{grid-template-columns:1fr}.ap-form-grid .wide{grid-column:auto}.ap-onboarding form,.ap-inline-form{display:grid}.ap-store-banner{align-items:flex-start;gap:8px}.ap-bot-grid{grid-template-columns:1fr}.telegram{grid-template-columns:1fr}.ap-auth-page{padding-top:100px}}
`;
