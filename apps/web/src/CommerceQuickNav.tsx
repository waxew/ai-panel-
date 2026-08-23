const links = [
  ['/app', 'داشبورد'],
  ['/app/store', 'فروشگاه'],
  ['/app/orders', 'سفارش‌ها'],
  ['/app/telegram', 'تلگرام'],
  ['/app/telegram-builder', 'منوی ربات'],
  ['/app/instagram', 'اینستاگرام'],
] as const;

export default function CommerceQuickNav() {
  const path = window.location.pathname;
  if (!path.startsWith('/app')) return null;

  return (
    <nav className="commerce-quick-nav" dir="rtl" aria-label="Commerce navigation">
      <style>{styles}</style>
      {links.map(([href, label]) => (
        <a key={href} href={href} className={path === href ? 'active' : ''}>{label}</a>
      ))}
    </nav>
  );
}

const styles = `
.commerce-quick-nav{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:100;display:flex;gap:5px;padding:6px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.94);box-shadow:0 16px 50px rgba(0,0,0,.4);backdrop-filter:blur(16px)}
.commerce-quick-nav a{color:#8f9bad;text-decoration:none;font:700 10px/1.2 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:9px 11px;border-radius:9px;white-space:nowrap}
.commerce-quick-nav a:hover,.commerce-quick-nav a.active{background:#eef3f9;color:#090e15}
@media(max-width:640px){.commerce-quick-nav{left:8px;right:8px;bottom:8px;transform:none;overflow:auto;justify-content:flex-start}.commerce-quick-nav a{padding:8px 10px}}
`;
