import { useEffect, useState } from 'react';

type DashboardData = {
  ok?: boolean;
  message?: string;
  user?: { email?: string; displayName?: string | null };
  telegramBots?: Array<{ id: string; status: string }>;
  instagramAccounts?: Array<{ id: string; status: string }>;
  whatsappAccounts?: Array<{ id: string; status: string }>;
  summary?: { activeSubscriptions?: number; activeTelegramBots?: number; activeInstagramAccounts?: number; activeWhatsAppAccounts?: number };
};

export default function CustomerHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/api/customer/dashboard', { headers: { accept: 'application/json' }, cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as DashboardData;
        if (response.status === 401) { window.location.assign('/login'); return; }
        if (!response.ok) throw new Error(payload.message || 'dashboard_failed');
        setData(payload);
      })
      .catch(() => setError('داشبورد فعلاً دریافت نشد.'));
  }, []);

  return <div className="simple-home" dir="rtl"><style>{styles}</style><main>
    <header>
      <div><span>AI Panel</span><h1>{data?.user?.displayName ? `سلام ${data.user.displayName}` : 'داشبورد'}</h1><p>از اینجا فقط کارهای اصلی را شروع کن. تنظیمات جزئی داخل هر بخش قرار گرفته‌اند.</p></div>
      <a href="/app/account">حساب کاربری</a>
    </header>

    {error && <div className="error">{error}</div>}

    <section className="primary-actions">
      <a href="/app/store"><i>01</i><div><b>فروشگاه</b><span>محصول، نوع محصول و دسته‌بندی</span></div><em>←</em></a>
      <a href="/app/bot-commerce"><i>02</i><div><b>ربات فروش</b><span>منو و جریان خرید مشترک</span></div><em>←</em></a>
      <a href="/app/orders"><i>03</i><div><b>سفارش‌ها</b><span>پیگیری سفارش‌های مشتریان</span></div><em>←</em></a>
    </section>

    <section className="secondary">
      <div className="section-title"><div><span>کانال‌ها</span><h2>اتصال پیام‌رسان‌ها</h2></div></div>
      <div className="channel-grid">
        <a href="/app/telegram"><b>تلگرام</b><span>{data ? `${data.telegramBots?.length ?? 0} ربات متصل` : '...'}</span></a>
        <a href="/app/instagram"><b>اینستاگرام</b><span>{data ? `${data.instagramAccounts?.length ?? 0} حساب` : '...'}</span></a>
        <a href="/app/whatsapp"><b>واتساپ</b><span>{data ? `${data.whatsappAccounts?.length ?? 0} حساب` : '...'}</span></a>
        <a href="/app/analytics"><b>گزارش‌ها</b><span>آمار و عملکرد</span></a>
      </div>
    </section>
  </main></div>;
}

const styles = `
.simple-home{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.simple-home *{box-sizing:border-box}.simple-home main{max-width:1120px;margin:auto;padding:42px 20px 110px}.simple-home header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:28px}.simple-home header span,.section-title span{color:#768397;font-size:10px;font-weight:800}.simple-home header h1{font-size:34px;margin:7px 0}.simple-home header p{color:#8592a5;line-height:1.8;margin:0;max-width:620px}.simple-home header>a{background:#141b25;border:1px solid #293447;color:#dce3ed;text-decoration:none;border-radius:11px;padding:10px 13px;font-size:11px;font-weight:800}.primary-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.primary-actions>a{display:grid;grid-template-columns:42px 1fr auto;gap:12px;align-items:center;padding:20px;border:1px solid #253043;background:#0d131c;border-radius:18px;color:#fff;text-decoration:none;min-height:124px}.primary-actions>a:hover{border-color:#52617a;background:#111923}.primary-actions i{font-style:normal;width:42px;height:42px;border-radius:12px;background:#192231;display:grid;place-items:center;color:#9ba8b9;font-size:10px}.primary-actions div{display:grid;gap:6px}.primary-actions b{font-size:17px}.primary-actions span{color:#7f8c9f;font-size:11px;line-height:1.6}.primary-actions em{font-style:normal;color:#8592a5}.secondary{margin-top:28px}.section-title h2{font-size:20px;margin:5px 0 12px}.channel-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.channel-grid a{display:grid;gap:5px;padding:14px 15px;background:#0d131c;border:1px solid #222c3a;border-radius:13px;color:#fff;text-decoration:none}.channel-grid b{font-size:12px}.channel-grid span{font-size:10px;color:#758296}.error{padding:12px 14px;background:#25151a;border:1px solid #60323b;color:#ffc1cb;border-radius:12px;margin-bottom:14px}
@media(max-width:760px){.simple-home main{padding:28px 13px 90px}.simple-home header{display:grid}.primary-actions{grid-template-columns:1fr}.primary-actions>a{min-height:auto}.channel-grid{grid-template-columns:1fr 1fr}.simple-home header h1{font-size:29px}}@media(max-width:440px){.channel-grid{grid-template-columns:1fr}}
`;
