import { useState } from 'react';

const links = [
  ['/app', 'داشبورد'],
  ['/app/store', 'فروشگاه'],
  ['/app/orders', 'سفارش‌ها'],
  ['/app/telegram', 'تلگرام'],
  ['/app/telegram-builder', 'منوی ربات'],
  ['/app/instagram', 'اینستاگرام'],
  ['/app/booking', 'نوبت‌دهی'],
  ['/app/booking/customers', 'پرونده مشتری'],
  ['/app/booking/staff', 'پرسنل و ظرفیت'],
  ['/app/booking/finance', 'مالی'],
  ['/app/booking/reports', 'گزارش'],
  ['/app/booking/tools', 'ابزار کسب‌وکار'],
] as const;

type ConnectResponse = {
  ok?: boolean;
  code?: string;
  authorizationUrl?: string;
  message?: string;
};

type ManageResponse = {
  ok?: boolean;
  message?: string;
};

export default function CommerceQuickNav() {
  const path = window.location.pathname;
  const [connecting, setConnecting] = useState(false);
  if (!path.startsWith('/app')) return null;

  async function saveMetaConfig() {
    const appId = window.prompt('Meta App ID را وارد کنید:')?.trim() ?? '';
    if (!appId) return false;
    const appSecret = window.prompt('Meta App Secret را وارد کنید:')?.trim() ?? '';
    if (!appSecret) return false;

    const response = await fetch('/api/instagram/manage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'save_platform_config', appId, appSecret }),
    });
    const data = (await response.json().catch(() => ({}))) as ManageResponse;
    if (!response.ok) {
      window.alert(data.message || 'ذخیره تنظیمات Meta انجام نشد.');
      return false;
    }
    window.alert('تنظیمات Meta ذخیره شد. حالا اتصال Instagram شروع می‌شود.');
    return true;
  }

  async function startConnection() {
    const response = await fetch('/api/instagram/connect', { method: 'POST' });
    const data = (await response.json().catch(() => ({}))) as ConnectResponse;
    if (response.ok && data.authorizationUrl) {
      window.location.assign(data.authorizationUrl);
      return true;
    }
    if (data.code === 'META_NOT_CONFIGURED') return false;
    window.alert(data.message || 'شروع اتصال Meta انجام نشد.');
    return true;
  }

  async function connectInstagram() {
    if (connecting) return;
    setConnecting(true);
    try {
      const handled = await startConnection();
      if (handled) return;
      const saved = await saveMetaConfig();
      if (!saved) return;
      await startConnection();
    } catch {
      window.alert('ارتباط با سرویس اتصال Meta برقرار نشد.');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <nav className="commerce-quick-nav" dir="rtl" aria-label="Commerce navigation">
      <style>{styles}</style>
      {links.map(([href, label]) => (
        <a key={href} href={href} className={path === href ? 'active' : ''}>{label}</a>
      ))}
      {path === '/app/instagram' && (
        <button className="meta-connect" type="button" disabled={connecting} onClick={() => void connectInstagram()}>
          {connecting ? 'در حال اتصال…' : 'اتصال Meta'}
        </button>
      )}
    </nav>
  );
}

const styles = `
.commerce-quick-nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:100;display:flex;gap:5px;padding:6px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.94);box-shadow:0 16px 50px rgba(0,0,0,.4);backdrop-filter:blur(16px);max-width:calc(100vw - 16px);overflow:auto}
.commerce-quick-nav a,.commerce-quick-nav button{font:700 10px/1.2 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:9px 11px;border-radius:9px;white-space:nowrap}
.commerce-quick-nav a{color:#8f9bad;text-decoration:none}
.commerce-quick-nav a:hover,.commerce-quick-nav a.active{background:#eef3f9;color:#090e15}
.commerce-quick-nav .meta-connect{border:1px solid #a855f7;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;cursor:pointer}
.commerce-quick-nav .meta-connect:disabled{opacity:.6;cursor:wait}
@media(max-width:640px){.commerce-quick-nav{left:8px;right:8px;bottom:8px;transform:none;overflow:auto;justify-content:flex-start}.commerce-quick-nav a,.commerce-quick-nav button{padding:8px 10px}}
`;
