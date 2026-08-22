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

export default function App() {
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
            <p>کاربر ابتدا توکن BotFather را وارد می‌کند. در نسخه نهایی توکن قبل از ذخیره‌سازی رمزنگاری می‌شود.</p>
          </div>
          <div className="token-box">
            <label>توکن ربات</label>
            <input placeholder="123456789:AA..." type="password" />
            <button>بررسی و اتصال ربات</button>
          </div>
        </section>
      </main>
    </div>
  );
}
