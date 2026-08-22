import { useState } from 'react';

const modules = [
  { title: 'ربات تلگرام', description: 'اتصال توکن، تنظیم ربات، دکمه‌ها، محصولات و سفارش‌ها', status: 'فاز اول' },
  { title: 'دایرکت هوشمند اینستاگرام', description: 'اتوماسیون دایرکت و کامنت برای پست‌ها', status: 'بعدی' },
  { title: 'انتشار زمان‌بندی‌شده', description: 'زمان‌بندی پست، استوری و پیام‌ها', status: 'زیرساخت آماده' },
  { title: 'آنالیز شبکه‌های اجتماعی', description: 'آمار پست‌ها، تعامل، مقایسه و پیشنهاد بهبود', status: 'بعدی' },
];

const stats = [
  ['ربات‌های فعال', '0'],
  ['کاربران', '0'],
  ['سفارش امروز', '0'],
  ['کارهای زمان‌بندی‌شده', '0'],
];

type ConnectedBot = {
  id: string;
  telegramBotId: string;
  username?: string;
  displayName?: string;
  description?: string;
  status: string;
};

export default function App() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bot, setBot] = useState<ConnectedBot | null>(null);

  async function connectBot() {
    setLoading(true);
    setMessage('');
    setBot(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');
      const workspaceId = import.meta.env.VITE_DEFAULT_WORKSPACE_ID ?? 'local-workspace';
      const response = await fetch(`${apiUrl}/api/telegram/connect`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, workspaceId }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? 'اتصال ربات انجام نشد.');
        return;
      }

      setBot(data.bot);
      setMessage(data.demoMode
        ? 'ربات توسط Telegram تأیید شد. نسخه فعلی آزمایشی است و ذخیره دائمی هنوز فعال نیست.'
        : 'ربات با موفقیت توسط Telegram تأیید و متصل شد.');
      setToken('');
    } catch {
      setMessage('ارتباط با API برقرار نشد. سرویس بک‌اند را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">AI PANEL</div>
        <nav>
          <a className="active">داشبورد</a>
          <a>تلگرام</a>
          <a>اینستاگرام</a>
          <a>انتشار زمان‌بندی‌شده</a>
          <a>آنالیز</a>
          <a>مشتریان</a>
          <a>اشتراک‌ها</a>
          <a>مدیریت</a>
        </nav>
      </aside>

      <main className="content">
        <header>
          <div>
            <p className="eyebrow">مرکز مدیریت اتوماسیون</p>
            <h1>داشبورد ربات‌ساز</h1>
          </div>
          <button>+ ساخت ربات جدید</button>
        </header>

        <section className="stats">
          {stats.map(([label, value]) => (
            <article className="stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="section-head">
          <div>
            <h2>ماژول‌های پلتفرم</h2>
            <p>از تلگرام شروع می‌کنیم و قابلیت‌های دیگر را روی همین هسته اضافه می‌کنیم.</p>
          </div>
        </section>

        <section className="grid">
          {modules.map((module) => (
            <article className="card" key={module.title}>
              <span className="pill">{module.status}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <a>ورود به ماژول ←</a>
            </article>
          ))}
        </section>

        <section className="telegram-start">
          <div>
            <span className="pill">Telegram MVP</span>
            <h2>مرحله ۱: اتصال ربات</h2>
            <p>توکن با Telegram API بررسی می‌شود و فقط در صورت تأیید پذیرفته خواهد شد.</p>
            {message && <p className={bot ? 'status success' : 'status error'}>{message}</p>}
            {bot && (
              <div className="bot-result">
                <strong>{bot.displayName ?? 'Telegram Bot'}</strong>
                <span>{bot.username ? `@${bot.username}` : `ID: ${bot.telegramBotId}`}</span>
                <span>وضعیت: {bot.status}</span>
              </div>
            )}
          </div>
          <div className="token-box">
            <label>توکن ربات BotFather</label>
            <input
              placeholder="123456789:AA..."
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoComplete="off"
            />
            <button disabled={loading || !token.trim()} onClick={connectBot}>
              {loading ? 'در حال بررسی...' : 'بررسی و اتصال ربات'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
