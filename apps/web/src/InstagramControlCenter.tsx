import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type InstagramAccount = {
  id: string;
  username: string;
  displayName?: string | null;
  followersCount: number | string;
  postsCount: number | string;
  engagementRate?: number | string | null;
  status: string;
  metaAccountId?: string | null;
  webhookSubscribed: boolean;
  lastSyncedAt?: string | null;
};

type InstagramRule = {
  id: string;
  instagramAccountId?: string | null;
  name: string;
  triggerType: 'COMMENT_KEYWORD' | 'DM_KEYWORD' | 'STORY_REPLY';
  triggerConfig: { keywords?: string[] };
  actionConfig: { message?: string };
  isActive: boolean;
  executions: number;
  lastTriggeredAt?: string | null;
};

type InstagramEvent = {
  id: string;
  eventType: string;
  sourceUsername?: string | null;
  sourceText?: string | null;
  outcome: string;
  createdAt: string;
};

type Dashboard = {
  ok: boolean;
  accounts: InstagramAccount[];
  rules: InstagramRule[];
  events: InstagramEvent[];
  connection: { configured: boolean; webhookReady: boolean; provider: string };
  summary: { accounts: number; activeAccounts: number; rules: number; activeRules: number; executions: number; sent: number; failed: number };
  activationDeferred?: boolean;
  message?: string;
};

const emptyDashboard: Dashboard = {
  ok: true,
  accounts: [],
  rules: [],
  events: [],
  connection: { configured: false, webhookReady: false, provider: 'META_INSTAGRAM_GRAPH_API' },
  summary: { accounts: 0, activeAccounts: 0, rules: 0, activeRules: 0, executions: 0, sent: 0, failed: 0 },
};

async function requestDashboard(init?: RequestInit) {
  const response = await fetch('/api/instagram/manage', init);
  const data = (await response.json().catch(() => ({}))) as Dashboard;
  if (!response.ok) throw new Error(data.message || 'خطا در دریافت اطلاعات اینستاگرام');
  return data;
}

function faNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat('fa-IR').format(Number(value ?? 0));
}

function triggerLabel(type: InstagramRule['triggerType']) {
  if (type === 'COMMENT_KEYWORD') return 'کامنت → دایرکت';
  if (type === 'DM_KEYWORD') return 'کلمه در دایرکت';
  return 'پاسخ به استوری';
}

function outcomeLabel(value: string) {
  const map: Record<string, string> = { RECEIVED: 'دریافت شد', MATCHED: 'Match شد', SENT: 'ارسال شد', SKIPPED: 'رد شد', FAILED: 'خطا' };
  return map[value] ?? value;
}

export default function InstagramControlCenter() {
  const [data, setData] = useState<Dashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [accountId, setAccountId] = useState('');
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<InstagramRule['triggerType']>('COMMENT_KEYWORD');
  const [keywords, setKeywords] = useState('1');
  const [message, setMessage] = useState('سلام 👋 اطلاعاتی که خواسته بودید اینجاست.');

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await requestDashboard();
      setData(result);
      if (!accountId && result.accounts[0]?.id) setAccountId(result.accounts[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'اطلاعات اینستاگرام دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { void load(); }, []);

  const selectedAccount = useMemo(() => data.accounts.find((item) => item.id === accountId) ?? null, [data.accounts, accountId]);
  const connectionReady = Boolean(selectedAccount?.metaAccountId && selectedAccount.webhookSubscribed && selectedAccount.status === 'ACTIVE');

  async function submitRule(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await requestDashboard({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'create_rule',
          instagramAccountId: accountId || null,
          name,
          triggerType,
          keywords,
          message,
          isActive: connectionReady,
        }),
      });
      setData(result);
      setName('');
      setNotice(result.activationDeferred ? 'Rule ذخیره شد؛ بعد از اتصال Meta می‌توان آن را فعال کرد.' : 'Rule ذخیره شد.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره Rule انجام نشد.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: InstagramRule) {
    setError('');
    setNotice('');
    try {
      const result = await requestDashboard({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_rule', ruleId: rule.id, isActive: !rule.isActive }),
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تغییر وضعیت Rule انجام نشد.');
    }
  }

  async function deleteRule(ruleId: string) {
    setError('');
    try {
      const result = await requestDashboard({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'delete_rule', ruleId }),
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حذف Rule انجام نشد.');
    }
  }

  return (
    <div className="ig-page" dir="rtl">
      <style>{styles}</style>
      <header className="ig-topbar">
        <a className="ig-brand" href="/app"><span>IG</span><div><b>Instagram Automation</b><small>AI Panel / Meta Graph API</small></div></a>
        <div className="ig-top-actions"><a href="/app">داشبورد</a><button onClick={() => void load()}>بروزرسانی</button></div>
      </header>

      <main className="ig-shell">
        <section className="ig-hero">
          <div><span className="ig-kicker">CONTROL CENTER</span><h1>ربات و دایرکت هوشمند اینستاگرام</h1><p>Ruleهای کامنت، دایرکت و پاسخ استوری را از یک جا مدیریت کن. اولین جریان اجرایی پروژه «کامنت با کلمه/عدد مشخص → ارسال DM» است.</p></div>
          <div className={`ig-status ${data.connection.webhookReady ? 'ready' : ''}`}><b>{data.connection.webhookReady ? 'Webhook آماده است' : 'Meta هنوز متصل نشده'}</b><small>{data.connection.webhookReady ? 'Ruleها می‌توانند فعال شوند.' : 'Ruleها ذخیره می‌شوند، اما تا تکمیل OAuth و Webhook فعال نمی‌شوند.'}</small></div>
        </section>

        {error && <div className="ig-alert error">{error}{error.includes('وارد') && <a href="/login">ورود</a>}</div>}
        {notice && <div className="ig-alert success">{notice}</div>}

        <section className="ig-stats">
          <article><small>اکانت متصل</small><strong>{faNumber(data.summary.activeAccounts)}</strong></article>
          <article><small>Rule فعال</small><strong>{faNumber(data.summary.activeRules)}</strong></article>
          <article><small>اجرای اتوماسیون</small><strong>{faNumber(data.summary.executions)}</strong></article>
          <article><small>DM ارسال‌شده</small><strong>{faNumber(data.summary.sent)}</strong></article>
        </section>

        <div className="ig-grid">
          <section className="ig-card">
            <div className="ig-card-head"><div><span>01</span><h2>اتصال حساب Instagram</h2></div><b className={data.connection.configured ? 'ok' : ''}>{data.connection.configured ? 'پیکربندی شده' : 'نیازمند Meta App'}</b></div>
            {loading ? <p className="ig-muted">در حال دریافت حساب‌ها...</p> : data.accounts.length ? (
              <div className="ig-account-list">{data.accounts.map((account) => <button key={account.id} className={accountId === account.id ? 'selected' : ''} onClick={() => setAccountId(account.id)}><div><strong>@{account.username}</strong><small>{account.displayName || 'Instagram Business / Creator'}</small></div><span>{account.webhookSubscribed ? 'Webhook ✓' : account.status}</span></button>)}</div>
            ) : (
              <div className="ig-empty"><b>هنوز اکانتی وصل نشده است.</b><p>برای اتصال واقعی، Meta App ID / App Secret، OAuth و مجوزهای Instagram Messaging باید تنظیم شوند. این بخش عمداً اتصال ساختگی نمی‌سازد.</p><button disabled>اتصال با Meta — مرحله بعد</button></div>
            )}
          </section>

          <section className="ig-card ig-builder">
            <div className="ig-card-head"><div><span>02</span><h2>ساخت Rule جدید</h2></div><b>{connectionReady ? 'قابل فعال‌سازی' : 'Draft mode'}</b></div>
            <form onSubmit={submitRule}>
              <label>نام Rule<input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً ارسال قیمت با کامنت 2" required /></label>
              <label>Trigger<select value={triggerType} onChange={(e) => setTriggerType(e.target.value as InstagramRule['triggerType'])}><option value="COMMENT_KEYWORD">کامنت روی پست با کلمه / عدد</option><option value="DM_KEYWORD">کلمه در دایرکت</option><option value="STORY_REPLY">پاسخ به استوری</option></select></label>
              {triggerType !== 'STORY_REPLY' && <label>کلمات یا اعداد Trigger<input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="1, 2, قیمت" /><small>با ویرگول یا خط جدید جدا کن.</small></label>}
              <label>متن دایرکت<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required /></label>
              <button className="ig-primary" disabled={saving}>{saving ? 'در حال ذخیره...' : connectionReady ? 'ذخیره و فعال‌سازی Rule' : 'ذخیره Rule به‌صورت Draft'}</button>
            </form>
          </section>
        </div>

        <section className="ig-card ig-rules">
          <div className="ig-card-head"><div><span>03</span><h2>Ruleهای اتوماسیون</h2></div><b>{faNumber(data.rules.length)} Rule</b></div>
          {data.rules.length ? <div className="ig-rule-list">{data.rules.map((rule) => <article key={rule.id}><div className="ig-rule-main"><div><span className={`ig-dot ${rule.isActive ? 'on' : ''}`} /><strong>{rule.name}</strong><small>{triggerLabel(rule.triggerType)} · {(rule.triggerConfig.keywords ?? []).join('، ') || 'هر پاسخ'}</small></div><div className="ig-rule-metrics"><span>{faNumber(rule.executions)} اجرا</span><b>{rule.isActive ? 'فعال' : 'Draft'}</b></div></div><p>{rule.actionConfig.message}</p><footer><button onClick={() => void toggleRule(rule)}>{rule.isActive ? 'غیرفعال کردن' : 'فعال کردن'}</button><button className="danger" onClick={() => void deleteRule(rule.id)}>حذف</button></footer></article>)}</div> : <div className="ig-empty compact"><b>هنوز Ruleای ساخته نشده است.</b><p>از فرم بالا اولین «کامنت → DM» را بساز.</p></div>}
        </section>

        <section className="ig-card ig-events">
          <div className="ig-card-head"><div><span>04</span><h2>لاگ اجرا و Webhook</h2></div><b>{faNumber(data.events.length)} رویداد اخیر</b></div>
          {data.events.length ? <div className="ig-event-list">{data.events.map((event) => <div key={event.id}><span>{outcomeLabel(event.outcome)}</span><strong>{event.sourceUsername ? `@${event.sourceUsername}` : event.eventType}</strong><p>{event.sourceText || 'بدون متن'}</p><time>{new Date(event.createdAt).toLocaleString('fa-IR')}</time></div>)}</div> : <div className="ig-empty compact"><b>هنوز Webhook واقعی دریافت نشده است.</b><p>بعد از اتصال Meta، کامنت‌ها و پیام‌ها با نتیجه‌ی Match / Sent / Failed اینجا ثبت می‌شوند.</p></div>}
        </section>
      </main>
    </div>
  );
}

const styles = `
*{box-sizing:border-box}.ig-page{min-height:100vh;background:#090e15;color:#edf2f7;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding-bottom:90px}.ig-topbar{height:72px;border-bottom:1px solid #202b3b;display:flex;align-items:center;justify-content:space-between;padding:0 max(22px,calc((100vw - 1180px)/2));position:sticky;top:0;background:rgba(9,14,21,.92);backdrop-filter:blur(18px);z-index:20}.ig-brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.ig-brand>span{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b);font-weight:900}.ig-brand div{display:flex;flex-direction:column}.ig-brand small,.ig-muted{color:#8290a5}.ig-top-actions{display:flex;gap:8px}.ig-top-actions a,.ig-top-actions button{border:1px solid #2b374a;background:#111925;color:#d8e0ea;padding:9px 13px;border-radius:9px;text-decoration:none;font:inherit;cursor:pointer}.ig-shell{width:min(1180px,calc(100% - 28px));margin:0 auto}.ig-hero{padding:54px 0 30px;display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:end}.ig-kicker{font-size:11px;letter-spacing:.16em;color:#b095ff;font-weight:900}.ig-hero h1{font-size:clamp(29px,4vw,48px);margin:8px 0 12px}.ig-hero p{max-width:720px;color:#98a6ba;line-height:2;margin:0}.ig-status{border:1px solid #4a3541;background:#1a1218;border-radius:16px;padding:18px}.ig-status.ready{border-color:#1f5949;background:#0c1b17}.ig-status b,.ig-status small{display:block}.ig-status small{color:#9ba8b9;line-height:1.7;margin-top:6px}.ig-alert{padding:13px 16px;border-radius:10px;margin-bottom:16px}.ig-alert.error{background:#2b1318;border:1px solid #71303e}.ig-alert.success{background:#0d211b;border:1px solid #285f4e}.ig-alert a{color:#fff;margin-right:10px}.ig-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.ig-stats article,.ig-card{border:1px solid #202b3b;background:#0f1621;border-radius:16px}.ig-stats article{padding:18px}.ig-stats small{display:block;color:#8290a5;margin-bottom:10px}.ig-stats strong{font-size:25px}.ig-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:18px;margin-bottom:18px}.ig-card{padding:22px}.ig-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.ig-card-head>div{display:flex;align-items:center;gap:10px}.ig-card-head span{font-size:11px;color:#7d8da3}.ig-card-head h2{font-size:17px;margin:0}.ig-card-head>b{font-size:11px;color:#9aa8ba;border:1px solid #2c394c;border-radius:999px;padding:6px 9px}.ig-card-head>b.ok{color:#69dab5;border-color:#275d4d}.ig-account-list{display:grid;gap:9px}.ig-account-list button{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:right;border:1px solid #293649;background:#0b111a;color:#dfe6ef;padding:14px;border-radius:11px;cursor:pointer}.ig-account-list button.selected{border-color:#7c5ce0;background:#151225}.ig-account-list div{display:flex;flex-direction:column;gap:5px}.ig-account-list small{color:#8390a2}.ig-empty{border:1px dashed #334158;border-radius:13px;padding:20px;background:#0a1018}.ig-empty p{color:#8795a8;line-height:1.8}.ig-empty button{width:100%;padding:11px;border:1px solid #303b4c;background:#121924;color:#727f91;border-radius:9px}.ig-empty.compact{padding:16px}.ig-builder form{display:grid;gap:13px}.ig-builder label{display:grid;gap:7px;color:#b8c3d1;font-size:12px;font-weight:700}.ig-builder input,.ig-builder select,.ig-builder textarea{width:100%;border:1px solid #2a3749;background:#0a111a;color:#edf2f7;border-radius:9px;padding:11px 12px;font:inherit;outline:none}.ig-builder input:focus,.ig-builder select:focus,.ig-builder textarea:focus{border-color:#7958dc}.ig-builder label small{font-weight:400;color:#77869a}.ig-primary{border:0;background:#7656dc;color:#fff;padding:12px 14px;border-radius:9px;font:800 13px inherit;cursor:pointer}.ig-primary:disabled{opacity:.55}.ig-rules,.ig-events{margin-bottom:18px}.ig-rule-list{display:grid;gap:10px}.ig-rule-list article{border:1px solid #263246;background:#0b111a;border-radius:12px;padding:15px}.ig-rule-main{display:flex;justify-content:space-between;gap:12px}.ig-rule-main>div:first-child{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center}.ig-rule-main small{grid-column:2;color:#8290a5;margin-top:4px}.ig-dot{width:8px;height:8px;border-radius:50%;background:#586578}.ig-dot.on{background:#43d39e;box-shadow:0 0 0 4px rgba(67,211,158,.1)}.ig-rule-metrics{display:flex;gap:8px;align-items:center;font-size:11px;color:#8e9bad}.ig-rule-metrics b{color:#d7deea}.ig-rule-list article>p{color:#a8b4c4;line-height:1.8;border-top:1px solid #202a3a;padding-top:11px}.ig-rule-list footer{display:flex;gap:7px}.ig-rule-list footer button{border:1px solid #304057;background:#111a27;color:#d7deea;border-radius:8px;padding:7px 10px;cursor:pointer}.ig-rule-list footer button.danger{color:#f79aab;border-color:#57303a}.ig-event-list{display:grid}.ig-event-list>div{display:grid;grid-template-columns:90px 150px 1fr 150px;gap:10px;padding:12px 5px;border-top:1px solid #202b3b;align-items:center}.ig-event-list span{color:#bba8ff}.ig-event-list strong{font-size:12px}.ig-event-list p{margin:0;color:#95a3b5}.ig-event-list time{color:#758397;font-size:11px}.ig-event-list>div:first-child{border-top:0}@media(max-width:850px){.ig-hero,.ig-grid{grid-template-columns:1fr}.ig-stats{grid-template-columns:repeat(2,1fr)}.ig-event-list>div{grid-template-columns:80px 1fr}.ig-event-list p,.ig-event-list time{grid-column:2}}@media(max-width:520px){.ig-topbar{padding:0 14px}.ig-brand small{display:none}.ig-shell{width:min(100% - 20px,1180px)}.ig-hero{padding-top:30px}.ig-stats{grid-template-columns:1fr 1fr}.ig-card{padding:16px}.ig-rule-main{display:grid}.ig-rule-metrics{padding-right:16px}}
`;
