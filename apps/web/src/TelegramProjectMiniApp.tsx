import { customerNavigationModules } from '@ai-panel/shared';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

type SessionUser = {
  id: string;
  email: string;
  displayName?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
};

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  colorScheme?: 'light' | 'dark';
  ready?: () => void;
  expand?: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

type TelegramValidation = {
  ok?: boolean;
  configured?: boolean;
  user?: TelegramUser;
  message?: string;
};

const coreLinks = [
  { code: 'DB', title: 'داشبورد', description: 'خلاصه حساب، سرویس‌ها و وضعیت کانال‌ها', href: '/app' },
  { code: 'AC', title: 'حساب و کیف پول', description: 'مشخصات حساب، موجودی و تراکنش‌ها', href: '/app/account' },
  { code: 'ST', title: 'فروشگاه', description: 'محصول، دسته‌بندی و مدیریت فروشگاه', href: '/app/store' },
  { code: 'OR', title: 'سفارش‌ها', description: 'مشاهده و مدیریت سفارش‌های فروشگاه', href: '/app/orders' },
  { code: 'BC', title: 'ربات‌ساز فروش', description: 'منو و Commerce مشترک ربات‌ها', href: '/app/bot-commerce' },
  { code: 'UI', title: 'قالب فروشگاه', description: 'قالب، رنگ‌ها و پیش‌نمایش فروشگاه', href: '/app/store/templates' },
] as const;

function go(href: string) {
  window.location.assign(href);
}

async function readSession() {
  const response = await fetch('/api/session', { headers: { accept: 'application/json' } });
  if (!response.ok) return null;
  const data = (await response.json().catch(() => ({}))) as { authenticated?: boolean; user?: SessionUser };
  return data.authenticated && data.user ? data.user : null;
}

export default function TelegramProjectMiniApp() {
  const telegram = window.Telegram?.WebApp;
  const previewTelegramUser = telegram?.initDataUnsafe?.user ?? null;
  const [session, setSession] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(previewTelegramUser);
  const [telegramState, setTelegramState] = useState<'preview' | 'checking' | 'verified' | 'unconfigured' | 'invalid'>(telegram?.initData ? 'checking' : 'preview');
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    telegram?.ready?.();
    telegram?.expand?.();
    try {
      telegram?.setHeaderColor?.('#090d16');
      telegram?.setBackgroundColor?.('#090d16');
    } catch {
      // Older Telegram clients can ignore theme setters.
    }

    let cancelled = false;
    void readSession().then((user) => {
      if (!cancelled) setSession(user);
    }).finally(() => {
      if (!cancelled) setBooting(false);
    });

    if (telegram?.initData) {
      void fetch('/api/telegram-miniapp/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ initData: telegram.initData }),
      }).then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as TelegramValidation;
        if (cancelled) return;
        if (response.ok && data.ok && data.user) {
          setTelegramUser(data.user);
          setTelegramState('verified');
          return;
        }
        if (response.status === 503 || data.configured === false) {
          setTelegramState('unconfigured');
          return;
        }
        setTelegramState('invalid');
      }).catch(() => {
        if (!cancelled) setTelegramState('invalid');
      });
    }

    return () => { cancelled = true; };
  }, [telegram]);

  const displayName = useMemo(() => {
    if (telegramUser) return [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ');
    return session?.displayName || session?.email || 'کاربر AI Panel';
  }, [session, telegramUser]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setSigningIn(true);
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setAuthMessage(data.message ?? 'ورود انجام نشد.');
        return;
      }
      const user = await readSession();
      if (!user) {
        setAuthMessage('نشست حساب ساخته نشد. دوباره تلاش کنید.');
        return;
      }
      setSession(user);
    } catch {
      setAuthMessage('ارتباط با سرور برقرار نشد.');
    } finally {
      setSigningIn(false);
    }
  }

  if (booting) {
    return <div className="tgapp-loading" dir="rtl"><style>{styles}</style><div className="tgapp-spinner"/><b>AI PANEL</b><span>در حال آماده‌سازی Mini App...</span></div>;
  }

  return <div className="tgapp" dir="rtl">
    <style>{styles}</style>
    <header className="tgapp-header">
      <div className="tgapp-brand"><i>AP</i><div><b>AI PANEL</b><span>Telegram Mini App</span></div></div>
      <span className={`tgapp-state ${telegramState}`}>
        {telegramState === 'verified' ? 'Telegram ✓' : telegramState === 'checking' ? 'در حال بررسی' : telegramState === 'unconfigured' ? 'توکن در انتظار اتصال' : telegramState === 'invalid' ? 'Telegram نامعتبر' : 'Preview'}
      </span>
    </header>

    <main>
      <section className="tgapp-hero">
        <div>
          <span className="tgapp-kicker">پروژه داخل تلگرام</span>
          <h1>{displayName ? `سلام ${displayName}` : 'AI Panel'}</h1>
          <p>همان حساب، فروشگاه، ربات‌ها، کانال‌ها و ابزارهای سایت؛ این بار داخل Telegram WebView.</p>
        </div>
        {telegramUser?.photo_url ? <img src={telegramUser.photo_url} alt="Telegram profile"/> : <div className="tgapp-avatar">{(displayName || 'AP').slice(0, 1).toUpperCase()}</div>}
      </section>

      {!session ? <section className="tgapp-login">
        <div className="tgapp-section-title"><div><span>ورود به حساب اصلی</span><h2>برای دسترسی به اطلاعات واقعی وارد شوید</h2></div></div>
        <p className="tgapp-muted">نسخه اول Mini App همین حساب سایت را استفاده می‌کند. بعد از اتصال توکن ربات پروژه، احراز هویت Telegram را به حساب AI Panel لینک می‌کنیم تا ورود خودکار شود.</p>
        <form onSubmit={signIn}>
          <label>ایمیل<input type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required/></label>
          <label>رمز عبور<input type="password" dir="ltr" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={8} required/></label>
          <button disabled={signingIn}>{signingIn ? 'در حال ورود...' : 'ورود به AI Panel'}</button>
          {authMessage && <div className="tgapp-error">{authMessage}</div>}
        </form>
      </section> : <>
        <section>
          <div className="tgapp-section-title"><div><span>هسته پروژه</span><h2>مدیریت اصلی</h2></div><button onClick={() => go('/app')}>پنل کامل ←</button></div>
          <div className="tgapp-grid core">{coreLinks.map((item) => <button key={item.href} className="tgapp-card" onClick={() => go(item.href)}>
            <i>{item.code}</i><div><b>{item.title}</b><span>{item.description}</span></div><em>←</em>
          </button>)}</div>
        </section>

        <section>
          <div className="tgapp-section-title"><div><span>ماژول‌ها</span><h2>شبکه‌ها و ابزارها</h2></div></div>
          <div className="tgapp-grid modules">{customerNavigationModules.map((module) => <button key={module.key} className="tgapp-card module" onClick={() => module.customerRoute && go(module.customerRoute)}>
            <i>{module.shortCode}</i><div><b>{module.labelFa}</b><span>{module.descriptionFa}</span><small className={`status ${module.status}`}>{module.status === 'live' ? 'فعال' : 'در توسعه'}</small></div><em>←</em>
          </button>)}</div>
        </section>
      </>}

      <section className="tgapp-note">
        <b>ساختار این نسخه</b>
        <span>Mini App فایل جداگانه‌ای داخل Telegram نیست. Telegram آدرس HTTPS ما را باز می‌کند؛ کد و دیتابیس همچنان در AI Panel می‌مانند.</span>
      </section>
    </main>

    {session && <nav className="tgapp-bottom">
      <button onClick={() => go('/app')}><i>⌂</i><span>داشبورد</span></button>
      <button onClick={() => go('/app/store')}><i>▦</i><span>فروشگاه</span></button>
      <button className="active" onClick={() => go('/miniapp')}><i>AP</i><span>پروژه</span></button>
      <button onClick={() => go('/app/analytics')}><i>↗</i><span>آنالیز</span></button>
      <button onClick={() => go('/app/account')}><i>◎</i><span>حساب</span></button>
    </nav>}
  </div>;
}

const styles = `
:root{color-scheme:dark}.tgapp,.tgapp-loading{--bg:#090d16;--panel:#111827;--panel2:#151e2e;--line:#263249;--text:#f5f7fb;--muted:#91a0b7;--accent:#50a8ff;--good:#4fd1a5;min-height:100vh;background:radial-gradient(circle at 20% 0%,#15243d 0,transparent 34%),var(--bg);color:var(--text);font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif;box-sizing:border-box}.tgapp *{box-sizing:border-box}.tgapp{padding-bottom:86px}.tgapp-loading{display:grid;place-content:center;justify-items:center;gap:10px}.tgapp-loading span{color:var(--muted);font-size:13px}.tgapp-spinner{width:34px;height:34px;border-radius:50%;border:3px solid #263249;border-top-color:#50a8ff;animation:tgspin .8s linear infinite}@keyframes tgspin{to{transform:rotate(360deg)}}
.tgapp-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:rgba(9,13,22,.86);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.06)}.tgapp-brand{display:flex;align-items:center;gap:9px}.tgapp-brand>i{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(145deg,#168cff,#6bbcff);font-style:normal;font-weight:900;font-size:12px}.tgapp-brand div{display:flex;flex-direction:column}.tgapp-brand b{font-size:13px;letter-spacing:.08em}.tgapp-brand span{font-size:10px;color:var(--muted)}.tgapp-state{font-size:10px;padding:6px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}.tgapp-state.verified{color:var(--good);border-color:rgba(79,209,165,.35);background:rgba(79,209,165,.07)}.tgapp-state.invalid{color:#ff8d99}.tgapp-state.unconfigured{color:#ffc86b}
.tgapp main{display:flex;flex-direction:column;gap:22px;padding:16px;max-width:860px;margin:0 auto}.tgapp-hero{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(145deg,rgba(22,140,255,.13),rgba(17,24,39,.92))}.tgapp-kicker,.tgapp-section-title span{display:block;color:#72b9ff;font-size:11px;font-weight:800;margin-bottom:5px}.tgapp-hero h1,.tgapp-section-title h2{margin:0}.tgapp-hero h1{font-size:24px}.tgapp-hero p{margin:8px 0 0;color:var(--muted);font-size:13px;line-height:1.8}.tgapp-avatar,.tgapp-hero img{width:58px;height:58px;border-radius:18px;flex:0 0 58px}.tgapp-avatar{display:grid;place-items:center;background:#1d2b42;border:1px solid #33445e;font-weight:900;font-size:20px}.tgapp-hero img{object-fit:cover}
.tgapp-section-title{display:flex;align-items:end;justify-content:space-between;gap:10px;margin:0 2px 10px}.tgapp-section-title h2{font-size:17px}.tgapp-section-title button{border:0;background:transparent;color:#7bbcff;font:inherit;font-size:11px}.tgapp-grid{display:grid;gap:9px}.tgapp-grid.core{grid-template-columns:1fr 1fr}.tgapp-grid.modules{grid-template-columns:1fr}.tgapp-card{display:flex;align-items:center;text-align:right;gap:10px;width:100%;padding:13px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,var(--panel2),var(--panel));color:var(--text);font:inherit;cursor:pointer;min-width:0}.tgapp-card>i{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:11px;background:#1d2b42;color:#8ec7ff;font-size:10px;font-style:normal;font-weight:900}.tgapp-card>div{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}.tgapp-card b{font-size:13px}.tgapp-card span{font-size:10px;line-height:1.45;color:var(--muted)}.tgapp-card>em{font-style:normal;color:#6d7b91}.tgapp-card.module{padding:14px}.tgapp-card.module>i{width:42px;height:42px;flex-basis:42px}.status{align-self:flex-start;margin-top:3px;padding:3px 6px;border-radius:999px;background:#222e40;color:#a9b8cc;font-size:9px}.status.live{background:rgba(79,209,165,.08);color:var(--good)}
.tgapp-login{padding:17px;border:1px solid var(--line);border-radius:20px;background:rgba(17,24,39,.92)}.tgapp-muted{color:var(--muted);font-size:12px;line-height:1.8}.tgapp-login form{display:grid;gap:10px;margin-top:14px}.tgapp-login label{display:grid;gap:6px;color:#b8c3d3;font-size:11px}.tgapp-login input{width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:12px;background:#0b111d;color:var(--text);outline:none}.tgapp-login input:focus{border-color:#3b93ea}.tgapp-login form>button{padding:12px;border:0;border-radius:12px;background:#168cff;color:white;font:inherit;font-weight:800}.tgapp-login form>button:disabled{opacity:.6}.tgapp-error{padding:10px;border-radius:10px;background:rgba(255,96,111,.09);color:#ff9ba5;font-size:11px;line-height:1.7}.tgapp-note{display:flex;flex-direction:column;gap:5px;padding:14px;border-radius:16px;border:1px dashed #30415d;color:var(--muted);font-size:11px;line-height:1.7}.tgapp-note b{color:#dbe5f2}
.tgapp-bottom{position:fixed;z-index:12;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(5,1fr);padding:7px max(8px,env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));background:rgba(9,13,22,.94);backdrop-filter:blur(18px);border-top:1px solid rgba(255,255,255,.07)}.tgapp-bottom button{display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:none;color:#78869b;font:inherit;font-size:9px}.tgapp-bottom button i{font-style:normal;font-size:15px}.tgapp-bottom button.active{color:#65b4ff}.tgapp-bottom button.active i{display:grid;place-items:center;width:31px;height:25px;border-radius:9px;background:#168cff;color:white;font-size:9px;font-weight:900}
@media(min-width:640px){.tgapp-grid.modules{grid-template-columns:1fr 1fr}.tgapp-grid.core{grid-template-columns:repeat(3,1fr)}}
`;
