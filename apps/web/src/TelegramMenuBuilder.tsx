import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type Bot = {
  id: string;
  telegramBotId: string;
  username?: string | null;
  displayName?: string | null;
  status: string;
  welcomeMessage: string;
};

type Button = {
  id: string;
  botId: string;
  parentId?: string | null;
  title: string;
  actionType: string;
  actionValue?: string | null;
  sortOrder: number;
};

type BuilderData = {
  ok: boolean;
  bots: Bot[];
  bot: Bot | null;
  buttons: Button[];
  message?: string;
};

const actionLabels: Record<string, string> = {
  CATALOG: 'فروشگاه / محصولات',
  CART: 'سبد خرید',
  ORDERS: 'سفارش‌های من',
  SUPPORT: 'پشتیبانی',
  TEXT: 'پیام متنی',
  URL: 'لینک',
  SUBMENU: 'زیرمنو',
};

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  return { response, data };
}

export default function TelegramMenuBuilder() {
  const [data, setData] = useState<BuilderData | null>(null);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [welcome, setWelcome] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ title: '', actionType: 'TEXT', actionValue: '', parentId: '' });

  const load = useCallback(async (botId?: string) => {
    const suffix = botId ? `?botId=${encodeURIComponent(botId)}` : '';
    const { response, data } = await request<BuilderData>(`/api/telegram/manage${suffix}`);
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    if (!response.ok) throw new Error(data.message ?? 'خطا');
    setData(data);
    const nextBotId = data.bot?.id ?? data.bots?.[0]?.id ?? '';
    setSelectedBotId(nextBotId);
    setWelcome(data.bot?.welcomeMessage ?? '');
  }, []);

  useEffect(() => {
    void load().catch(() => setNotice('اطلاعات Menu Builder دریافت نشد.'));
  }, [load]);

  const selectedBot = data?.bot ?? null;
  const buttons = data?.buttons ?? [];
  const roots = useMemo(() => buttons.filter((button) => !button.parentId).sort((a, b) => a.sortOrder - b.sortOrder), [buttons]);
  const byParent = useMemo(() => {
    const map = new Map<string, Button[]>();
    for (const button of buttons) {
      if (!button.parentId) continue;
      const list = map.get(button.parentId) ?? [];
      list.push(button);
      map.set(button.parentId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [buttons]);

  async function mutate(body: Record<string, unknown>) {
    if (!selectedBot) return false;
    setBusy(true);
    setNotice('');
    try {
      const { response, data: next } = await request<BuilderData>('/api/telegram/manage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ botId: selectedBot.id, ...body }),
      });
      if (!response.ok) {
        setNotice(next.message ?? 'ذخیره انجام نشد.');
        return false;
      }
      setData(next);
      setWelcome(next.bot?.welcomeMessage ?? '');
      setNotice('تغییرات ذخیره شد.');
      return true;
    } catch {
      setNotice('ارتباط با سرور برقرار نشد.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveWelcome(event: FormEvent) {
    event.preventDefault();
    await mutate({ action: 'update_welcome', welcomeMessage: welcome });
  }

  async function createButton(event: FormEvent) {
    event.preventDefault();
    const ok = await mutate({
      action: 'create_button',
      title: form.title,
      actionType: form.actionType,
      actionValue: form.actionValue || null,
      parentId: form.parentId || null,
    });
    if (ok) setForm({ title: '', actionType: 'TEXT', actionValue: '', parentId: '' });
  }

  async function removeButton(buttonId: string) {
    if (!window.confirm('این دکمه حذف شود؟ زیرگزینه‌های مستقیم آن به سطح اصلی منتقل می‌شوند.')) return;
    await mutate({ action: 'delete_button', buttonId });
  }

  async function moveRoot(buttonId: string, direction: -1 | 1) {
    const index = roots.findIndex((button) => button.id === buttonId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= roots.length) return;
    const next = [...roots];
    [next[index], next[target]] = [next[target], next[index]];
    await mutate({ action: 'reorder', buttonIds: next.map((button) => button.id) });
  }

  async function chooseBot(botId: string) {
    setSelectedBotId(botId);
    setNotice('');
    await load(botId).catch(() => setNotice('اطلاعات ربات دریافت نشد.'));
  }

  return (
    <div className="tmb" dir="rtl">
      <style>{styles}</style>
      <aside>
        <a className="brand" href="/app/telegram"><i>AP</i><span><b>AI PANEL</b><small>Telegram Store Builder</small></span></a>
        <div className="nav-card"><span>ربات</span><select value={selectedBotId} onChange={(event) => void chooseBot(event.target.value)} disabled={!data?.bots?.length}>{data?.bots?.length ? data.bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.displayName || bot.username || bot.telegramBotId}</option>) : <option>رباتی متصل نیست</option>}</select></div>
        <nav><a href="/app/telegram">اتصال و وضعیت</a><a className="active" href="/app/telegram-builder">منو و صفحات</a><a href="/app/store">محصولات و سفارش‌ها</a><a href="/app">داشبورد</a></nav>
        <a className="back" href="/app/telegram">← بازگشت به پنل تلگرام</a>
      </aside>

      <main>
        <header><div><span className="eyebrow">Babba-style Menu Builder</span><h1>منوی ربات تلگرام</h1><p>دکمه‌های اصلی، زیرمنو، متن، لینک، فروشگاه، سبد خرید و سفارش‌ها را از اینجا مدیریت کنید.</p></div>{selectedBot && <div className="bot-pill"><i>TG</i><span><b>{selectedBot.displayName || 'Telegram Bot'}</b><small>{selectedBot.username ? `@${selectedBot.username}` : selectedBot.telegramBotId}</small></span><em>{selectedBot.status}</em></div>}</header>

        {notice && <div className={`notice ${notice.includes('ذخیره شد') ? 'ok' : ''}`}>{notice}</div>}
        {!data ? <div className="loading">در حال دریافت تنظیمات...</div> : !selectedBot ? <section className="empty"><h2>ربات متصل نیست</h2><p>اول یک ربات BotFather به Workspace وصل کنید.</p><a href="/app/telegram">اتصال ربات</a></section> : <>
          <section className="grid top-grid">
            <article className="card">
              <span className="eyebrow">Welcome Message</span><h2>پیام شروع</h2><form onSubmit={saveWelcome}><textarea rows={6} value={welcome} maxLength={4000} onChange={(event) => setWelcome(event.target.value)} /><div className="form-foot"><small>{welcome.length.toLocaleString('fa-IR')} / ۴۰۰۰</small><button disabled={busy}>ذخیره پیام خوش‌آمد</button></div></form>
            </article>
            <article className="card preview"><span className="eyebrow">Live Structure</span><h2>نمای ساختار منو</h2><div className="phone"><div className="phone-head"><b>{selectedBot.displayName || 'فروشگاه تلگرام'}</b><small>bot</small></div><div className="chat"><p>{welcome || 'پیام خوش‌آمد اینجا نمایش داده می‌شود.'}</p></div><div className="keyboard">{roots.map((button) => <span key={button.id}>{button.title}</span>)}</div></div></article>
          </section>

          <section className="grid builder-grid">
            <article className="card">
              <div className="section-head"><div><span className="eyebrow">Menu Tree</span><h2>دکمه‌ها</h2></div><span className="count">{buttons.length.toLocaleString('fa-IR')} دکمه</span></div>
              {roots.length === 0 ? <div className="mini-empty">هنوز دکمه‌ای ساخته نشده است.</div> : <div className="tree">{roots.map((button, index) => <div className="tree-node" key={button.id}><div className="node-main"><span className="drag">⋮⋮</span><div><b>{button.title}</b><small>{actionLabels[button.actionType] ?? button.actionType}{button.actionValue ? ` · ${button.actionValue.slice(0, 45)}` : ''}</small></div><div className="node-actions"><button disabled={busy || index === 0} onClick={() => void moveRoot(button.id, -1)}>↑</button><button disabled={busy || index === roots.length - 1} onClick={() => void moveRoot(button.id, 1)}>↓</button><button className="danger" disabled={busy} onClick={() => void removeButton(button.id)}>حذف</button></div></div>{(byParent.get(button.id) ?? []).length > 0 && <div className="children">{(byParent.get(button.id) ?? []).map((child) => <div key={child.id}><span>↳</span><div><b>{child.title}</b><small>{actionLabels[child.actionType] ?? child.actionType}</small></div><button className="danger" disabled={busy} onClick={() => void removeButton(child.id)}>حذف</button></div>)}</div>}</div>)}</div>}
            </article>

            <article className="card create-card"><span className="eyebrow">New Button</span><h2>افزودن دکمه</h2><form onSubmit={createButton}><label>عنوان<input value={form.title} maxLength={64} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="مثلاً محصولات ویژه" required /></label><label>عملکرد<select value={form.actionType} onChange={(event) => setForm({ ...form, actionType: event.target.value })}>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>محل نمایش<select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}><option value="">منوی اصلی</option>{roots.map((button) => <option key={button.id} value={button.id}>زیر «{button.title}»</option>)}</select></label>{(form.actionType === 'TEXT' || form.actionType === 'SUPPORT' || form.actionType === 'SUBMENU') && <label>متن / توضیح<textarea rows={4} value={form.actionValue} onChange={(event) => setForm({ ...form, actionValue: event.target.value })} placeholder="متنی که بعد از انتخاب نمایش داده می‌شود" /></label>}{form.actionType === 'URL' && <label>آدرس لینک<input dir="ltr" type="url" value={form.actionValue} onChange={(event) => setForm({ ...form, actionValue: event.target.value })} placeholder="https://..." required /></label>}<button className="primary" disabled={busy || !form.title.trim()}>{busy ? 'در حال ذخیره...' : 'افزودن دکمه'}</button></form>
              <div className="tips"><b>عملکردهای متصل به Commerce Core</b><span>CATALOG: کاتالوگ واقعی فروشگاه</span><span>CART: سبد خرید کاربر</span><span>ORDERS: سفارش‌های همان کاربر</span><span>SUBMENU: ساخت منوی چندسطحی</span></div>
            </article>
          </section>
        </>}
      </main>
    </div>
  );
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#070a0f;color:#eef3f9}*{box-sizing:border-box}body{margin:0;background:#070a0f}.tmb{min-height:100vh;display:grid;grid-template-columns:238px 1fr;background:#070a0f;color:#eef3f9}.tmb aside{height:100vh;position:sticky;top:0;padding:20px 14px;border-left:1px solid #202a39;background:#090e15;display:flex;flex-direction:column}.brand{display:flex;gap:10px;align-items:center;text-decoration:none;color:#fff}.brand>i{font-style:normal;width:40px;height:40px;display:grid;place-items:center;border:1px solid #364258;background:#121a26;border-radius:12px;font-size:10px;font-weight:900}.brand>span{display:grid}.brand b{font-size:13px;letter-spacing:1px}.brand small{color:#728096;font-size:9px}.nav-card{margin:20px 0 14px;padding:12px;border:1px solid #263246;border-radius:13px;background:#0d141e}.nav-card span{display:block;color:#6f7c91;font-size:9px;margin-bottom:7px}.nav-card select{width:100%;background:#080d14;color:#fff;border:1px solid #2c394d;border-radius:9px;padding:9px;font-size:10px}.tmb nav{display:grid;gap:4px}.tmb nav a,.back{text-decoration:none;color:#8995a7;padding:10px;border-radius:10px;font-size:11px}.tmb nav a:hover,.tmb nav a.active{background:#151e2b;color:#fff}.back{margin-top:auto;border:1px solid #283347;text-align:center}.tmb main{padding:34px clamp(20px,4vw,55px) 70px;max-width:1450px;width:100%;margin:auto}.tmb header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}.eyebrow{font-size:10px;color:#77859b;font-weight:800}.tmb h1{font-size:34px;margin:6px 0}.tmb header p{color:#8290a3;font-size:12px;line-height:1.8;margin:0}.bot-pill{display:grid;grid-template-columns:38px 1fr auto;gap:9px;align-items:center;border:1px solid #29364a;background:#0e151f;border-radius:14px;padding:10px 12px;min-width:240px}.bot-pill>i{font-style:normal;width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#182333;font-size:9px;font-weight:900}.bot-pill>span{display:grid}.bot-pill b{font-size:11px}.bot-pill small{font-size:9px;color:#7b889b}.bot-pill em{font-style:normal;font-size:8px;color:#8ee5bf}.grid{display:grid;gap:12px}.top-grid{grid-template-columns:1.2fr .8fr;margin-bottom:12px}.builder-grid{grid-template-columns:1.35fr .65fr}.card{background:linear-gradient(145deg,#101720,#0b1017);border:1px solid #222d3d;border-radius:17px;padding:18px}.card h2{font-size:20px;margin:6px 0 15px}.card textarea,.card input,.card select{width:100%;background:#080d14;color:#fff;border:1px solid #2b374b;border-radius:10px;padding:11px;outline:none;resize:vertical}.card textarea:focus,.card input:focus,.card select:focus{border-color:#607492}.card label{display:grid;gap:7px;font-size:10px;color:#a4afbf;margin-bottom:12px}.form-foot,.section-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px}.form-foot small{color:#657287;font-size:9px}.card button{border:1px solid #314058;background:#141d2a;color:#dce4ef;border-radius:9px;padding:8px 10px;font-size:10px;font-weight:750}.card button.primary{width:100%;background:#f3f6fa;color:#080d13;border-color:#fff;padding:11px}.card button:disabled{opacity:.42}.phone{max-width:330px;margin:auto;border:1px solid #344157;border-radius:22px;background:#0a111a;padding:10px}.phone-head{display:flex;justify-content:space-between;padding:9px;color:#bdc7d4;font-size:10px}.phone-head small{color:#4fcda0}.chat{min-height:130px;background:#0d151f;border-radius:12px;padding:12px}.chat p{font-size:10px;line-height:1.8;background:#182231;border-radius:10px;padding:10px;margin:0;color:#cfd7e2}.keyboard{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px}.keyboard span{background:#192432;border:1px solid #2c394b;border-radius:8px;padding:8px;text-align:center;font-size:9px}.count{font-size:9px;color:#758296;border:1px solid #2a3547;border-radius:999px;padding:5px 8px}.tree{display:grid;gap:8px}.tree-node{border:1px solid #283447;background:#0a1018;border-radius:12px;overflow:hidden}.node-main{display:grid;grid-template-columns:24px 1fr auto;gap:8px;align-items:center;padding:10px}.drag{color:#59677b}.node-main>div:nth-child(2),.children>div>div{display:grid}.node-main b,.children b{font-size:10px}.node-main small,.children small{font-size:8px;color:#748196;margin-top:3px}.node-actions{display:flex;gap:4px}.node-actions button{padding:5px 7px}.card button.danger{border-color:#57303a;color:#e79eab;background:#1d1116}.children{border-top:1px solid #222d3e;background:#0c131c;padding:6px 10px 9px;margin-right:30px}.children>div{display:grid;grid-template-columns:20px 1fr auto;gap:7px;align-items:center;padding:7px 0;border-bottom:1px solid #1c2532}.children>div:last-child{border-bottom:0}.create-card form{margin-top:4px}.tips{display:grid;gap:6px;margin-top:18px;border-top:1px solid #222d3c;padding-top:15px}.tips b{font-size:10px}.tips span{color:#758297;font-size:9px}.notice{padding:10px 13px;border:1px solid #61303b;background:#211219;color:#f0a8b5;border-radius:10px;font-size:10px;margin-bottom:12px}.notice.ok{border-color:#285b49;background:#0d211a;color:#95e4c3}.loading,.empty,.mini-empty{border:1px dashed #2a3548;border-radius:14px;padding:28px;text-align:center;color:#768499;font-size:11px}.empty h2{color:#fff}.empty a{color:#fff}.mini-empty{padding:20px}
@media(max-width:950px){.top-grid,.builder-grid{grid-template-columns:1fr}.bot-pill{min-width:0}.tmb header{display:grid}}
@media(max-width:720px){.tmb{display:block}.tmb aside{height:auto;position:sticky;z-index:5;border-left:0;border-bottom:1px solid #202a39;padding:9px 12px;display:grid;grid-template-columns:auto 1fr}.nav-card{margin:0 10px}.tmb nav,.back{display:none}.tmb main{padding:22px 14px 60px}.tmb h1{font-size:28px}.phone{max-width:none}.node-main{grid-template-columns:18px 1fr}.node-actions{grid-column:2;justify-content:flex-start}.children{margin-right:12px}}
`;
