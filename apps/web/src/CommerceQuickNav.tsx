import { useState } from 'react';

const coreLinks = [
  ['/app', 'خانه'],
  ['/app/store', 'فروشگاه'],
  ['/app/bot-commerce', 'ربات فروش'],
  ['/app/orders', 'سفارش‌ها'],
] as const;

const moreLinks = [
  ['/app/account', 'حساب کاربری'],
  ['/app/telegram', 'تلگرام'],
  ['/app/instagram', 'اینستاگرام'],
  ['/app/whatsapp', 'واتساپ'],
  ['/app/bale', 'بله'],
  ['/app/rubika', 'روبیکا'],
  ['/app/discord', 'دیسکورد'],
  ['/app/analytics', 'گزارش‌ها'],
  ['/app/store/templates', 'قالب فروشگاه'],
  ['/app/booking', 'رزرو و نوبت'],
] as const;

export default function CommerceQuickNav() {
  const path = window.location.pathname;
  const [open, setOpen] = useState(false);
  if (!path.startsWith('/app')) return null;

  const botActive = path === '/app/bot-commerce' || path === '/app/telegram-builder';

  return <div className="quick-shell" dir="rtl"><style>{styles}</style>
    {open && <div className="quick-more">
      <div><b>بخش‌های دیگر</b><button type="button" onClick={() => setOpen(false)}>بستن</button></div>
      <nav>{moreLinks.map(([href, label]) => <a key={href} href={href} className={path === href || (href === '/app/booking' && path.startsWith('/app/booking')) ? 'active' : ''}>{label}</a>)}</nav>
    </div>}
    <nav className="quick-nav" aria-label="منوی اصلی">
      {coreLinks.map(([href, label]) => <a key={href} href={href} className={path === href || (href === '/app/bot-commerce' && botActive) ? 'active' : ''}>{label}</a>)}
      <button type="button" className={open ? 'active' : ''} onClick={() => setOpen((value) => !value)}>بیشتر</button>
    </nav>
  </div>;
}

const styles = `
.quick-shell{position:fixed;z-index:120;left:50%;bottom:10px;transform:translateX(-50%);font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.quick-nav{display:flex;align-items:center;gap:4px;padding:5px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.97);box-shadow:0 14px 45px rgba(0,0,0,.42);backdrop-filter:blur(16px)}.quick-nav a,.quick-nav button{border:0;background:transparent;color:#8f9bad;text-decoration:none;padding:9px 12px;border-radius:9px;white-space:nowrap;font:800 10px inherit;cursor:pointer}.quick-nav a:hover,.quick-nav a.active,.quick-nav button.active{background:#eef3f9;color:#090e15}.quick-more{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);width:min(460px,calc(100vw - 20px));padding:12px;border:1px solid #2a3548;border-radius:14px;background:#0b1119;box-shadow:0 20px 60px rgba(0,0,0,.55)}.quick-more>div{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;color:#dce3ed;font-size:11px}.quick-more>div button{border:0;background:#17202d;color:#aeb8c6;border-radius:8px;padding:6px 8px;font-size:9px;cursor:pointer}.quick-more nav{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.quick-more a{padding:10px;border:1px solid #222c3a;border-radius:10px;color:#aeb8c6;text-decoration:none;font-size:10px}.quick-more a.active,.quick-more a:hover{border-color:#52617a;color:#fff;background:#111923}
@media(max-width:520px){.quick-shell{left:8px;right:8px;transform:none}.quick-nav{justify-content:space-between}.quick-nav a,.quick-nav button{padding:9px 8px;font-size:9px}.quick-more{left:0;right:0;transform:none;width:auto}.quick-more nav{grid-template-columns:1fr 1fr}}
`;
