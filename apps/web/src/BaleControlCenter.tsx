import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type BaleBot = {
  id: string;
  baleBotId: string;
  username?: string | null;
  displayName?: string | null;
  description?: string | null;
  status: string;
  welcomeMessage: string;
  createdAt?: string;
  updatedAt?: string;
};

type BaleButton = {
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
  bots: BaleBot[];
  bot: BaleBot | null;
  buttons: BaleButton[];
  message?: string;
};

type ConnectResponse = {
  ok?: boolean;
  message?: string;
  webhookConfigured?: boolean;
  bot?: BaleBot;
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

export default function BaleControlCenter() {
  const [data, setData] = useState<BuilderData | null>(null);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [token, setToken] = useState('');
  const [welcome, setWelcome] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [form, setForm] = useState({ title: '', actionType: 'TEXT', actionValue: '', parentId: '' });

  const load = useCallback(async (botId?: string) => {
    const suffix = botId ? `?botId=${encodeURIComponent(botId)}` : '';
    const { response, data } = await request<BuilderData>(`/api/bale/manage${suffix}`);
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
    void load().catch(() => {
      setNotice('اطلاعات ربات بله دریافت نشد.');
      setNoticeOk(false);
    });
  }, [load]);

  const selectedBot = data?.bot ?? null;
  const buttons = data?.buttons ?? [];
  const roots = useMemo(
    () => buttons.filter((button) => !button.parentId).sort((a, b) => a.sortOrder - b.sortOrder),
    [buttons],
  );
  const byParent = useMemo(() => {
    const map = new Map<string, BaleButton[]>();
    for (const button of buttons) {
      if (!button.parentId) continue;
      const list = map.get(button.parentId) ?? [];
      list.push(button);
      map.set(button.parentId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
    return map;
  }, [buttons]);

  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    setNoticeOk(false);
    try {
      const { response, data: result } = await request<ConnectResponse>('/api/bale/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok || !result.bot) {
        setNotice(result.message ?? 'اتصال بازوی بله انجام نشد.');
        return;
      }
      setToken('');
      setNotice(result.webhookConfigured ? 'بازوی بله متصل شد و Webhook فعال است.' : 'بازوی بله متصل شد.');
      setNoticeOk(true);
      await load(result.bot.id);
    } catch {
      setNotice('ارتباط با سرویس اتصال بله برقرار نشد.');
    } finally {
      setBusy(false);
    }
  }

  async function mutate(body: Record<string, unknown>) {
    if (!selectedBot) return false;
    setBusy(true);
    setNotice('');
    setNoticeOk(false);
    try {
      const { response, data: next } = await request<BuilderData>('/api/bale/manage', {
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
      setNoticeOk(true);
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
    if (!window.confirm('این دکمه حذف شود؟ زیرگزینه‌های مستقیم آن به منوی اصلی منتقل می‌شوند.')) return;
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
    setNoticeOk(false);
    await load(botId).catch(() => setNotice('اطلاعات بازوی انتخاب‌شده دریافت نشد.'));
  }

  const conditionalValue = form.actionType === 'TEXT' || form.actionType === 'SUPPORT' || form.actionType === 'SUBMENU';

  return (
    <div className="bale-center" dir="rtl">
      <style>{styles}</style>
      <aside>
        <a className="brand" href="/app"><i>AP</i><span><b>AI PANEL</b><small>Bale Bot Builder</small></span></a>
        <div className="provider"><i>BA</i><span><b>پیام‌رسان بله</b><small>Bot API + Commerce Core</small></span></div>
        <div className="nav-card">
          <span>بازوی فعال</span>
          <select value={selectedBotId} onChange={(event) => void chooseBot(event.target.value)} disabled={!data?.bots?.length}>
            {data?.bots?.length
              ? data.bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.displayName || bot.username || bot.baleBotId}</option>)
              : <option>بازویی متصل نیست</option>}
          </select>
        </div>
        <nav>
          <a className="active" href="#connection">اتصال و وضعیت</a>
          <a href="#welcome">پیام شروع</a>
          <a href="#menu">منو و دکمه‌ها</a>
          <a href="/app/store">محصولات و فروشگاه</a>
          <a href="/app/orders">سفارش‌ها</a>
        </nav>
        <a className="back" href="/app">← بازگشت به داشبورد</a>
      </aside>

      <main>
        <header>
          <div><span className="eyebrow">Bale Automation</span><h1>ربات‌ساز بله</h1><p>توکن BotFather بله را وصل کنید، منوی ربات را بسازید و همان فروشگاه مرکزی AI Panel را داخل بله بفروشید.</p></div>
          <div className="api-pill"><i>API</i><span><b>tapi.bale.ai</b><small>Webhook mode</small></span><em>آماده</em></div>
        </header>

        {notice && <div className={`notice ${noticeOk ? 'ok' : ''}`}>{notice}</div>}

        <section className="stats">
          <div><small>بازوی متصل</small><strong>{(data?.bots?.length ?? 0).toLocaleString('fa-IR')}</strong><span>در Workspace</span></div>
          <div><small>دکمه فعال</small><strong>{buttons.length.toLocaleString('fa-IR')}</strong><span>برای بازوی انتخاب‌شده</span></div>
          <div><small>وضعیت Webhook</small><strong>{selectedBot?.status === 'ACTIVE' ? 'فعال' : '—'}</strong><span>دریافت پیام لحظه‌ای</span></div>
        </section>

        <section id="connection" className="grid connection-grid">
          <article className="card connect-card">
            <span className="eyebrow">BotFather Token</span><h2>{data?.bots?.length ? 'اتصال بازوی دیگر' : 'اتصال اولین بازو'}</h2>
            <p>توکن فقط در بک‌اند اعتبارسنجی و رمزنگاری می‌شود و بعد از اتصال دوباره در مرورگر نمایش داده نمی‌شود.</p>
            <form onSubmit={connect}>
              <label>توکن بازوی بله<input type="password" dir="ltr" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="123456789:AA..." required /></label>
              <button className="primary" disabled={busy || !token.trim()}>{busy ? 'در حال اتصال...' : 'اتصال امن به بله'}</button>
            </form>
            <div className="steps"><span><i>۱</i>ساخت بازو در BotFather بله</span><span><i>۲</i>کپی توکن و اتصال در این صفحه</span><span><i>۳</i>تنظیم خودکار Webhook</span><span><i>۴</i>شروع کار با /start</span></div>
          </article>

          <article className="card status-card">
            <span className="eyebrow">Connection Status</span><h2>وضعیت بازو</h2>
            {!data ? <div className="loading">در حال دریافت وضعیت...</div> : !selectedBot ? <div className="empty-mini"><b>هنوز بازویی متصل نیست</b><span>بعد از اتصال، مشخصات بازو و وضعیت اینجا نمایش داده می‌شود.</span></div> : <>
              <div className="bot-identity"><i>BA</i><span><b>{selectedBot.displayName || 'Bale Bot'}</b><small>{selectedBot.username ? `@${selectedBot.username}` : `ID: ${selectedBot.baleBotId}`}</small></span><em>{selectedBot.status}</em></div>
              <dl><div><dt>Bot ID</dt><dd>{selectedBot.baleBotId}</dd></div><div><dt>دریافت پیام</dt><dd>Webhook</dd></div><div><dt>فروشگاه</dt><dd>Commerce Core مشترک</dd></div><div><dt>امنیت توکن</dt><dd>AES-GCM</dd></div></dl>
              <a className="ghost-button" href="/app/store">مدیریت محصولات مشترک ←</a>
            </>}
          </article>
        </section>

        {!data ? null : !selectedBot ? <section className="card onboarding"><h2>بعد از اتصال چه چیزی آماده می‌شود؟</h2><div><span>🛍 محصولات</span><span>🛒 سبد خرید</span><span>📦 سفارش‌های من</span><span>☎️ پشتیبانی</span></div><p>چهار دکمهٔ پایه به‌صورت خودکار ساخته می‌شوند و بعد می‌توانید متن، لینک، زیرمنو یا دکمه‌های بیشتری اضافه کنید.</p></section> : <>
          <section id="welcome" className="grid welcome-grid">
            <article className="card">
              <span className="eyebrow">/start Message</span><h2>پیام شروع</h2>
              <form onSubmit={saveWelcome}><textarea rows={7} value={welcome} maxLength={4000} onChange={(event) => setWelcome(event.target.value)} /><div className="form-foot"><small>{welcome.length.toLocaleString('fa-IR')} / ۴۰۰۰</small><button className="primary" disabled={busy}>ذخیره پیام شروع</button></div></form>
            </article>
            <article className="card preview">
              <span className="eyebrow">Live Preview</span><h2>پیش‌نمایش داخل بله</h2>
              <div className="phone"><div className="phone-head"><i>BA</i><span><b>{selectedBot.displayName || 'فروشگاه بله'}</b><small>{selectedBot.username ? `@${selectedBot.username}` : 'bot'}</small></span></div><div className="chat"><p>{welcome || 'پیام خوش‌آمد اینجا نمایش داده می‌شود.'}</p></div><div className="keyboard">{roots.map((button) => <span key={button.id}>{button.title}</span>)}</div></div>
            </article>
          </section>

          <section id="menu" className="grid builder-grid">
            <article className="card">
              <div className="section-head"><div><span className="eyebrow">Menu Tree</span><h2>دکمه‌ها و زیرمنوها</h2></div><span className="count">{buttons.length.toLocaleString('fa-IR')} دکمه</span></div>
              {roots.length === 0 ? <div className="empty-mini"><b>منو خالی است</b><span>از فرم کنار صفحه اولین دکمه را بسازید.</span></div> : <div className="tree">{roots.map((button, index) => <div className="tree-node" key={button.id}><div className="node-main"><span className="drag">⋮⋮</span><div><b>{button.title}</b><small>{actionLabels[button.actionType] ?? button.actionType}{button.actionValue ? ` · ${button.actionValue.slice(0, 48)}` : ''}</small></div><div className="node-actions"><button disabled={busy || index === 0} onClick={() => void moveRoot(button.id, -1)}>↑</button><button disabled={busy || index === roots.length - 1} onClick={() => void moveRoot(button.id, 1)}>↓</button><button className="danger" disabled={busy} onClick={() => void removeButton(button.id)}>حذف</button></div></div>{(byParent.get(button.id) ?? []).length > 0 && <div className="children">{(byParent.get(button.id) ?? []).map((child) => <div key={child.id}><span>↳</span><div><b>{child.title}</b><small>{actionLabels[child.actionType] ?? child.actionType}</small></div><button className="danger" disabled={busy} onClick={() => void removeButton(child.id)}>حذف</button></div>)}</div>}</div>)}</div>}
            </article>

            <article className="card create-card">
              <span className="eyebrow">New Button</span><h2>افزودن دکمه</h2>
              <form onSubmit={createButton}>
                <label>عنوان<input value={form.title} maxLength={64} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="مثلاً محصولات ویژه" required /></label>
                <label>عملکرد<select value={form.actionType} onChange={(event) => setForm({ ...form, actionType: event.target.value })}>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>محل نمایش<select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}><option value="">منوی اصلی</option>{roots.map((button) => <option key={button.id} value={button.id}>زیر «{button.title}»</option>)}</select></label>
                {conditionalValue && <label>متن / توضیح<textarea rows={4} value={form.actionValue} onChange={(event) => setForm({ ...form, actionValue: event.target.value })} placeholder="متنی که بعد از انتخاب نمایش داده می‌شود" /></label>}
                {form.actionType === 'URL' && <label>آدرس لینک<input dir="ltr" type="url" value={form.actionValue} onChange={(event) => setForm({ ...form, actionValue: event.target.value })} placeholder="https://..." required /></label>}
                <button className="primary" disabled={busy || !form.title.trim()}>{busy ? 'در حال ذخیره...' : 'افزودن دکمه'}</button>
              </form>
              <div className="tips"><b>اتصال به Commerce Core</b><span>CATALOG: محصولات واقعی فروشگاه</span><span>CART: سبد خرید اختصاصی کاربر بله</span><span>ORDERS: سفارش‌های همان کاربر</span><span>SUBMENU: منوی چندسطحی</span></div>
            </article>
          </section>
        </>}
      </main>
    </div>
  );
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#070a0f;color:#eef3f9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#070a0f}.bale-center{min-height:100vh;display:grid;grid-template-columns:244px 1fr;background:radial-gradient(circle at 72% 0,#142433 0,transparent 30%),#070a0f;color:#eef3f9}.bale-center aside{height:100vh;position:sticky;top:0;padding:20px 14px;border-left:1px solid #202a39;background:#090e15;display:flex;flex-direction:column}.brand{display:flex;gap:10px;align-items:center;text-decoration:none;color:#fff}.brand>i{font-style:normal;width:40px;height:40px;display:grid;place-items:center;border:1px solid #364258;background:#121a26;border-radius:12px;font-size:10px;font-weight:900}.brand>span{display:grid}.brand b{font-size:13px;letter-spacing:1px}.brand small{color:#728096;font-size:9px}.provider{display:flex;align-items:center;gap:10px;margin:20px 0 10px;padding:11px;border:1px solid #184a59;border-radius:13px;background:linear-gradient(135deg,#0d222a,#0d151e)}.provider>i{font-style:normal;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#00a7c7;color:#00161d;font-weight:900;font-size:10px}.provider span{display:grid}.provider b{font-size:11px}.provider small{font-size:8px;color:#76a9b4}.nav-card{margin:0 0 14px;padding:12px;border:1px solid #263246;border-radius:13px;background:#0d141e}.nav-card span{display:block;color:#6f7c91;font-size:9px;margin-bottom:7px}.nav-card select{width:100%;background:#080d14;color:#fff;border:1px solid #2c394d;border-radius:9px;padding:9px;font-size:10px}.bale-center nav{display:grid;gap:4px}.bale-center nav a,.back{text-decoration:none;color:#8995a7;padding:10px;border-radius:10px;font-size:11px}.bale-center nav a:hover,.bale-center nav a.active{background:#151e2b;color:#fff}.back{margin-top:auto;border:1px solid #283347;text-align:center}.bale-center main{padding:34px clamp(20px,4vw,55px) 92px;max-width:1480px;width:100%;margin:auto}.bale-center header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}.eyebrow{font-size:10px;color:#77859b;font-weight:800;text-transform:uppercase;letter-spacing:.8px}.bale-center h1{font-size:35px;margin:7px 0 8px}.bale-center h2{font-size:18px;margin:7px 0 13px}.bale-center p{color:#91a0b4;line-height:1.9;font-size:12px;margin:0}.api-pill,.bot-identity{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #29364a;border-radius:14px;background:#0c131d;min-width:220px}.api-pill>i,.bot-identity>i{font-style:normal;width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#0f3039;color:#37d4f3;font-weight:900;font-size:10px}.api-pill span,.bot-identity span{display:grid;flex:1}.api-pill b,.bot-identity b{font-size:11px}.api-pill small,.bot-identity small{font-size:9px;color:#708097}.api-pill em,.bot-identity em{font-style:normal;font-size:8px;padding:5px 7px;border-radius:20px;background:#123225;color:#62e59c}.notice{margin:0 0 18px;padding:12px 14px;border:1px solid #6e3434;border-radius:12px;background:#241315;color:#ffb6b6;font-size:11px}.notice.ok{border-color:#245c43;background:#10231a;color:#72e4a5}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.stats>div{padding:15px 16px;border:1px solid #202b3d;border-radius:14px;background:#0b111a;display:grid}.stats small{font-size:9px;color:#738198}.stats strong{font-size:22px;margin:5px 0}.stats span{font-size:9px;color:#526075}.grid{display:grid;gap:14px}.connection-grid{grid-template-columns:1.15fr .85fr;margin-bottom:14px}.welcome-grid{grid-template-columns:1fr .82fr;margin-bottom:14px}.builder-grid{grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr)}.card{border:1px solid #202b3d;border-radius:17px;background:linear-gradient(180deg,#0c131d,#0a1018);padding:20px;box-shadow:0 18px 50px rgba(0,0,0,.18)}label{display:grid;gap:7px;color:#8795a9;font-size:10px}input,select,textarea{width:100%;border:1px solid #29364a;border-radius:10px;background:#080d14;color:#eef3f9;padding:11px 12px;font:inherit;outline:none}textarea{resize:vertical;line-height:1.8}input:focus,select:focus,textarea:focus{border-color:#21778a}.connect-card form,.create-card form{display:grid;gap:12px;margin-top:15px}.primary,.ghost-button{border:0;border-radius:10px;padding:11px 14px;font:800 10px/1.2 inherit;text-decoration:none;text-align:center;cursor:pointer}.primary{background:#e9f4f8;color:#071016}.primary:disabled{opacity:.5;cursor:wait}.ghost-button{display:block;border:1px solid #2a394e;color:#cbd7e5;background:#101823;margin-top:14px}.steps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.steps span{display:flex;align-items:center;gap:7px;padding:8px;border:1px solid #1f2b3b;border-radius:9px;color:#8593a5;font-size:9px}.steps i{font-style:normal;width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:#0e3039;color:#46d8f3;font-weight:900}.status-card dl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 0}.status-card dl div{padding:9px;border:1px solid #1e2939;border-radius:9px;background:#090f17}.status-card dt{font-size:8px;color:#607087}.status-card dd{margin:3px 0 0;font-size:10px;font-weight:800;word-break:break-all}.empty-mini,.loading{min-height:150px;display:grid;place-content:center;text-align:center;gap:7px;color:#69798f}.empty-mini b{color:#c7d2df;font-size:12px}.empty-mini span,.loading{font-size:10px}.onboarding{margin-bottom:14px;text-align:center}.onboarding>div{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:15px}.onboarding>div span{padding:9px 12px;border:1px solid #263449;border-radius:10px;background:#0a111a;font-size:10px}.form-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px}.form-foot small{color:#617086;font-size:9px}.preview{overflow:hidden}.phone{max-width:360px;margin:8px auto 0;border:1px solid #2a3a50;border-radius:23px;background:#101923;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.25)}.phone-head{padding:12px 14px;border-bottom:1px solid #1e2a3b;display:flex;align-items:center;gap:9px;background:#0b131c}.phone-head>i{font-style:normal;width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:#00a7c7;color:#00181e;font-weight:900;font-size:8px}.phone-head span{display:grid}.phone-head b{font-size:10px}.phone-head small{font-size:8px;color:#718096}.chat{padding:17px;min-height:125px;background:radial-gradient(circle at 80% 20%,#122934,#0d151f 58%)}.chat p{display:inline-block;background:#142330;color:#dce8ef!important;padding:10px 12px;border-radius:14px 14px 4px 14px;max-width:90%;font-size:10px!important}.keyboard{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:9px;background:#0a1118}.keyboard span{padding:9px 7px;border:1px solid #27364a;border-radius:7px;background:#121d28;text-align:center;font-size:9px;color:#c7d4e0}.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.count{font-size:9px;color:#8898ad;border:1px solid #253246;border-radius:20px;padding:6px 9px}.tree{display:grid;gap:8px}.tree-node{border:1px solid #202c3d;border-radius:12px;overflow:hidden}.node-main{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:9px;align-items:center;padding:11px;background:#0b121b}.drag{color:#4c5b6e}.node-main>div:nth-child(2),.children>div>div{display:grid;min-width:0}.node-main b,.children b{font-size:10px}.node-main small,.children small{font-size:8px;color:#708096;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.node-actions{display:flex;gap:4px}.node-actions button,.children button{border:1px solid #2b394c;background:#111a25;color:#aebdce;border-radius:7px;padding:6px 8px;font-size:9px;cursor:pointer}.node-actions button:disabled{opacity:.3}.node-actions .danger,.children .danger{border-color:#553238;color:#e89595}.children{padding:7px 10px 10px 34px;background:#080e15;display:grid;gap:5px}.children>div{display:grid;grid-template-columns:20px minmax(0,1fr) auto;align-items:center;gap:7px;padding:7px;border:1px solid #1d2837;border-radius:8px}.children>div>span{color:#536579}.tips{margin-top:16px;padding:12px;border:1px solid #1e2a3a;border-radius:11px;background:#080f16;display:grid;gap:6px}.tips b{font-size:9px;color:#b7c5d4}.tips span{font-size:8px;color:#66768a}.create-card{height:max-content;position:sticky;top:18px}@media(max-width:1050px){.bale-center{grid-template-columns:1fr}.bale-center aside{height:auto;position:relative;border-left:0;border-bottom:1px solid #202a39}.bale-center aside nav{grid-template-columns:repeat(3,1fr)}.back{margin-top:12px}.connection-grid,.welcome-grid,.builder-grid{grid-template-columns:1fr}.create-card{position:relative;top:auto}}@media(max-width:680px){.bale-center main{padding:22px 12px 88px}.bale-center header{display:grid}.api-pill{width:100%}.stats{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.bale-center aside nav{grid-template-columns:1fr 1fr}.status-card dl{grid-template-columns:1fr}.node-main{grid-template-columns:18px 1fr}.node-actions{grid-column:2}.children{padding-right:12px}.form-foot{align-items:stretch;flex-direction:column}.form-foot button{width:100%}}
`;
