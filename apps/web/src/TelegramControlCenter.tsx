/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useCallback, useEffect, useState, type FormEvent } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useCallback, useEffect, useState, type FormEvent } from 'react';

// راهنما: این Type با نام «ConnectedBot» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ConnectedBot = {
  id: string;
  telegramBotId: string;
  username?: string | null;
  displayName?: string | null;
  status: string;
};

// راهنما: این Type با نام «DashboardResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DashboardResponse = {
  ok?: boolean;
  message?: string;
  telegramBots?: ConnectedBot[];
};

// راهنما: این Type با نام «ConnectResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ConnectResponse = {
  ok?: boolean;
  message?: string;
  bot?: ConnectedBot;
  webhookConfigured?: boolean;
};

// راهنما: این تابع «readJson» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readJson<T>(response: Response): Promise<T> {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(await response.json().catch(() => ({}))) as T» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (await response.json().catch(() => ({}))) as T;
}

// راهنما: این تابع «TelegramControlCenter» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function TelegramControlCenter() {
  // راهنما: این دستور متغیر/ثابت «[bots, setBots]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [bots, setBots] = useState<ConnectedBot[]>([]);
  // راهنما: این دستور State محلی React برای «[token, setToken]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [token, setToken] = useState('');
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[loading, setLoading]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [loading, setLoading] = useState(true);
  // راهنما: این دستور State محلی React برای «[message, setMessage]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [message, setMessage] = useState('');
  // راهنما: این دستور State محلی React برای «[success, setSuccess]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [success, setSuccess] = useState(false);

  // راهنما: این دستور تابع «loadBots» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.
  const loadBots = useCallback(async () => {
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch('/api/customer/dashboard', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const data = await readJson<DashboardResponse>(response);
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.assign('/login')».
      window.location.assign('/login');
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return false;
    }
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(data.message || `dashboard_${response.status}`);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBots(data.telegramBots ?? [])».
    setBots(data.telegramBots ?? []);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return true;
  }, []);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void loadBots() .catch(() => { setSuccess(false); setMessage('فهرست ربات‌ها فعلاً دریافت …».
    void loadBots()
      .catch(() => {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSuccess(false)».
        setSuccess(false);
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('فهرست ربات‌ها فعلاً دریافت نشد؛ اتصال ربات همچنان قابل انجام است.')».
        setMessage('فهرست ربات‌ها فعلاً دریافت نشد؛ اتصال ربات همچنان قابل انجام است.');
      })
      .finally(() => setLoading(false));
  }, [loadBots]);

  // راهنما: این تابع «connect» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function connect(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «!token.trim() || busy» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!token.trim() || busy) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')».
    setMessage('');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSuccess(false)».
    setSuccess(false);

    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token: token.trim() }),
      });
      // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const data = await readJson<ConnectResponse>(response);

      // راهنما: این شرط بررسی می‌کند آیا «response.status === 401 && !data.bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (response.status === 401 && !data.bot) {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(data.message || 'نشست حساب معتبر نیست؛ دوباره وارد حساب شوید.')».
        setMessage(data.message || 'نشست حساب معتبر نیست؛ دوباره وارد حساب شوید.');
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return;
      }
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !data.bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok || !data.bot) {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(data.message || `اتصال ربات انجام نشد (HTTP ${response.status}).`)».
        setMessage(data.message || `اتصال ربات انجام نشد (HTTP ${response.status}).`);
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return;
      }

      // راهنما: این دستور متغیر/ثابت «connectedBot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const connectedBot = data.bot;
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBots((current) => { const rest = current.filter((bot) => bot.id !== connectedBot.id &&…».
      setBots((current) => {
        // راهنما: این دستور متغیر/ثابت «rest» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const rest = current.filter((bot) => bot.id !== connectedBot.id && bot.telegramBotId !== connectedBot.telegramBotId);
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[connectedBot, ...rest]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return [connectedBot, ...rest];
      });
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setToken('')».
      setToken('');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSuccess(true)».
      setSuccess(true);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(data.webhookConfigured === false ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده …».
      setMessage(data.webhookConfigured === false ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده است.' : 'ربات با موفقیت متصل شد و Webhook فعال است.');

      // Dashboard refresh is deliberately best-effort. It must never turn a
      // successful Telegram connection into a misleading network error.
      // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
      try {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await loadBots()».
        await loadBots();
      } catch {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(data.webhookConfigured === false ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده …».
        setMessage(data.webhookConfigured === false
          ? 'ربات ذخیره شد، اما Webhook هنوز فعال نشده است. فهرست پنل هم فعلاً بروزرسانی نشد.'
          : 'ربات با موفقیت متصل شد و Webhook فعال است. فهرست پنل فعلاً بروزرسانی نشد.');
      }
    } catch {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSuccess(false)».
      setSuccess(false);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('درخواست اتصال ربات به /api/telegram/connect نرسید. این خطا مربوط به مسیر شبکه…».
      setMessage('درخواست اتصال ربات به /api/telegram/connect نرسید. این خطا مربوط به مسیر شبکه یا نسخه قدیمی پنل است، نه اعتبار توکن BotFather.');
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)».
      setBusy(false);
    }
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «( <div className="shell" dir="rtl"> <aside className="sidebar"> <div class…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
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
