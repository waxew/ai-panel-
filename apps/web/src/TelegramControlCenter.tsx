import { useCallback, useEffect, useState, type FormEvent } from 'react';

type ConnectedBot = {
  id: string;
  telegramBotId: string;
  username?: string | null;
  displayName?: string | null;
  status: string;
};

type DashboardResponse = {
  ok?: boolean;
  message?: string;
  telegramBots?: ConnectedBot[];
};

type ConnectResponse = {
  ok?: boolean;
  message?: string;
  bot?: ConnectedBot;
  webhookConfigured?: boolean;
};

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

export default function TelegramControlCenter() {
  const [bots, setBots] = useState<ConnectedBot[]>([]);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const loadBots = useCallback(async () => {
    const response = await fetch('/api/customer/dashboard', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await readJson<DashboardResponse>(response);
    if (response.status === 401) {
      window.location.assign('/login');
      return false;
    }
    if (!response.ok) throw new Error(data.message || `dashboard_${response.status}`);
    setBots(data.telegramBots ?? []);
    return true;
  }, []);

  useEffect(() => {
    void loadBots()
      .catch(() => {
        setSuccess(false);
        setMessage('فهرست ربات‌ها فعلاً دریافت نشد؛ اتصال ربات همچنان قابل انجام است.');
      })
      .finally(() => setLoading(false));
  }, [loadBots]);

  async function connect(event: FormEvent) {
    event.preventDefault();
    if (!token.trim() || busy) return;

    setBusy(true);
    setMessage('');
    setSuccess(false);

    try {
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await readJson<ConnectResponse>(response);

      if (response.status === 401 && !data.bot) {
        setMessage(data.message || 'نشست حساب معتبر نیست؛ دوباره وارد حساب شوید.');
        return;
      }
      if (!response.ok || !data.bot) {
        setMessage(data.message || `اتصال ربات انجام نشد (HTTP ${response.status}).`);
        return;
      }

      const connectedBot = data.bot;
      setBots((current) => {
        const rest = current.filter((bot) => bot.id !== connectedBot.id && bot.telegramBotId !== connectedBot.telegramBotId);
        return [connectedBot, ...rest];
      });
      setToken('');
      setSuccess(true);
      setMessage(data.webhookConfigured === false ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده است.' : 'ربات با موفقیت متصل شد و Webhook فعال است.');

      // Dashboard refresh is deliberately best-effort. It must never turn a
      // successful Telegram connection into a misleading network error.
      try {
        await loadBots();
      } catch {
        setMessage(data.webhookConfigured === false
          ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده است. فهرست پنل هم فعلاً بروزرسانی نشد.'
          : 'ربات با موفقیت متصل شد و Webhook فعال است. فهرست پنل فعلاً بروزرسانی نشد.');
      }
    } catch {
      setSuccess(false);
      setMessage('درخواست اتصال ربات به /api/telegram/connect نرسید. این خطا مربوط به مسیر شبکه یا نسخه قدیمی پنل است، نه اعتبار توکن BotFather.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">AI PANEL</div>
        <nav>
          <a href="/app">داشبورد</a>
          <a href="/app/store">فروشگاه</a>
          <a className="active" href="/app/telegram">ربات تلگرام</a>
          <a href="/app/telegram-builder">سازنده منو</a>
          <a href="/app/orders">سفارش‌ها</a>
        </nav>
      </aside>

      <main className="content">
        <header>
          <div>
            <div className="eyebrow">Telegram Commerce</div>
            <h1>اتصال ربات تلگرام</h1>
          </div>
          <a className="pill" href="/app/telegram-builder">Menu Builder</a>
        </header>

        <section className="telegram-start">
          <div>
            <h2>توکن BotFather</h2>
            <p>توکن فقط در بک‌اند اعتبارسنجی و رمزنگاری می‌شود. نتیجه اتصال و نتیجه بروزرسانی داشبورد جداگانه مدیریت می‌شوند تا خطای نمایشی اشتباه ایجاد نشود.</p>
            {message && <div className={`status ${success ? 'success' : 'error'}`}>{message}</div>}
          </div>

          <form className="token-box" onSubmit={connect}>
            <label htmlFor="telegram-token">Bot Token</label>
            <input
              id="telegram-token"
              type="password"
              autoComplete="off"
              inputMode="text"
              placeholder="123456789:AA..."
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
            <button disabled={busy || !token.trim()}>{busy ? 'در حال اتصال...' : 'اتصال امن ربات'}</button>
          </form>
        </section>

        <div className="section-head">
          <div>
            <div className="eyebrow">Connected Bots</div>
            <h2>ربات‌های متصل</h2>
          </div>
          <span className="pill">{loading ? '...' : `${bots.length} ربات`}</span>
        </div>

        <section className="grid">
          {bots.length === 0 && !loading ? (
            <article className="card"><h3>هنوز رباتی در فهرست نیست</h3><p>توکن BotFather را در فرم بالا وارد کنید.</p></article>
          ) : bots.map((bot) => (
            <article className="card" key={bot.id}>
              <span className="pill">{bot.status}</span>
              <h3>{bot.displayName || 'Telegram Bot'}</h3>
              <p dir="ltr" style={{ textAlign: 'right' }}>{bot.username ? `@${bot.username}` : bot.telegramBotId}</p>
              <a href="/app/telegram-builder">ویرایش منو ←</a>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
