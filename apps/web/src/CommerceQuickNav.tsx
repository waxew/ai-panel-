import { customerNavigationModules } from '@ai-panel/shared';
import { useState } from 'react';

const coreLinks = [
  ['/app', 'داشبورد'],
  ['/app/store', 'فروشگاه'],
  ['/app/orders', 'سفارش‌ها'],
] as const;

const bookingLinks = [
  ['/app/booking/customers', 'مشتری‌ها'],
  ['/app/booking/staff', 'پرسنل'],
  ['/app/booking/staff-access', 'دسترسی'],
  ['/app/booking/feedback', 'رضایت'],
  ['/app/booking/loyalty', 'باشگاه'],
  ['/app/booking/site', 'سایت'],
  ['/app/booking/finance', 'مالی'],
  ['/app/booking/reports', 'گزارش'],
  ['/app/booking/automations', 'اتوماسیون'],
  ['/app/booking/tools', 'ابزارها'],
] as const;

type ConnectResponse = { ok?: boolean; code?: string; authorizationUrl?: string; message?: string };
type ManageResponse = { ok?: boolean; message?: string };

export default function CommerceQuickNav() {
  const path = window.location.pathname;
  const [connecting, setConnecting] = useState(false);
  if (!path.startsWith('/app')) return null;

  async function saveMetaConfig() {
    const appId = window.prompt('Meta App ID را وارد کنید:')?.trim() ?? '';
    if (!appId) return false;
    const appSecret = window.prompt('Meta App Secret را وارد کنید:')?.trim() ?? '';
    if (!appSecret) return false;
    const response = await fetch('/api/instagram/manage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'save_platform_config', appId, appSecret }) });
    const data = (await response.json().catch(() => ({}))) as ManageResponse;
    if (!response.ok) { window.alert(data.message || 'ذخیره تنظیمات Meta انجام نشد.'); return false; }
    window.alert('تنظیمات Meta ذخیره شد. حالا اتصال Instagram شروع می‌شود.');
    return true;
  }

  async function startConnection() {
    const response = await fetch('/api/instagram/connect', { method: 'POST' });
    const data = (await response.json().catch(() => ({}))) as ConnectResponse;
    if (response.ok && data.authorizationUrl) { window.location.assign(data.authorizationUrl); return true; }
    if (data.code === 'META_NOT_CONFIGURED') return false;
    window.alert(data.message || 'شروع اتصال Meta انجام نشد.');
    return true;
  }

  async function connectInstagram() {
    if (connecting) return;
    setConnecting(true);
    try { const handled = await startConnection(); if (handled) return; const saved = await saveMetaConfig(); if (!saved) return; await startConnection(); }
    catch { window.alert('ارتباط با سرویس اتصال Meta برقرار نشد.'); }
    finally { setConnecting(false); }
  }

  const inBooking = path.startsWith('/app/booking');
  return <nav className="commerce-quick-nav" dir="rtl" aria-label="AI Panel navigation"><style>{styles}</style>
    {coreLinks.map(([href, label]) => <a key={href} href={href} className={path === href ? 'active' : ''}>{label}</a>)}
    <i className="divider" />
    {customerNavigationModules.map((module) => <a key={module.key} href={module.customerRoute!} className={path === module.customerRoute || path.startsWith(`${module.customerRoute}/`) ? 'active module' : 'module'} title={module.descriptionFa}><b>{module.shortCode}</b>{module.labelFa}<em className={module.status}>{module.status === 'live' ? 'فعال' : 'درحال توسعه'}</em></a>)}
    {inBooking && <><i className="divider" />{bookingLinks.map(([href, label]) => <a key={href} href={href} className={path === href ? 'active' : ''}>{label}</a>)}</>}
    {path === '/app/instagram' && <button className="meta-connect" type="button" disabled={connecting} onClick={() => void connectInstagram()}>{connecting ? 'در حال اتصال…' : 'اتصال Meta'}</button>}
  </nav>;
}

const styles = `
.commerce-quick-nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:100;display:flex;align-items:center;gap:5px;padding:6px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.96);box-shadow:0 16px 50px rgba(0,0,0,.4);backdrop-filter:blur(16px);max-width:calc(100vw - 16px);overflow:auto}
.commerce-quick-nav a,.commerce-quick-nav button{font:700 10px/1.2 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:9px 11px;border-radius:9px;white-space:nowrap}
.commerce-quick-nav a{color:#8f9bad;text-decoration:none;display:flex;align-items:center;gap:5px}.commerce-quick-nav a:hover,.commerce-quick-nav a.active{background:#eef3f9;color:#090e15}.commerce-quick-nav a.module b{font-size:8px;border:1px solid currentColor;border-radius:5px;padding:2px 4px}.commerce-quick-nav a.module em{font-style:normal;font-size:6px;padding:3px 5px;border-radius:99px;background:#263245;color:#9aa8bc}.commerce-quick-nav a.module em.live{background:#103429;color:#70d8b1}.commerce-quick-nav a.active em{background:#dce3ec;color:#334155}.commerce-quick-nav .divider{width:1px;height:24px;background:#2a3548;flex:0 0 1px;margin:0 2px}.commerce-quick-nav .meta-connect{border:1px solid #a855f7;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;cursor:pointer}.commerce-quick-nav .meta-connect:disabled{opacity:.6;cursor:wait}
@media(max-width:640px){.commerce-quick-nav{left:8px;right:8px;bottom:8px;transform:none;overflow:auto;justify-content:flex-start}.commerce-quick-nav a,.commerce-quick-nav button{padding:8px 10px}.commerce-quick-nav a.module em{display:none}}
`;
