import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type WhatsAppAccount = {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string | null;
  verifiedName?: string | null;
  status: string;
  webhookSubscribed: boolean;
  qualityRating?: string | null;
  lastSyncedAt?: string | null;
};

type WhatsAppConversation = {
  id: string;
  whatsappAccountId: string;
  waUserId: string;
  customerPhone?: string | null;
  customerName?: string | null;
  status: string;
  lastMessageAt?: string | null;
  customerServiceWindowExpiresAt?: string | null;
  unreadCount: number;
};

type WhatsAppTemplate = {
  id: string;
  whatsappAccountId: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components?: unknown[];
  qualityScore?: string | null;
  lastSyncedAt?: string | null;
};

type WhatsAppRule = {
  id: string;
  whatsappAccountId?: string | null;
  name: string;
  triggerType: string;
  triggerConfig?: { keywords?: string[] };
  actionConfig?: { message?: string };
  isActive: boolean;
  executions: number;
  lastTriggeredAt?: string | null;
};

type WhatsAppMessage = {
  id: string;
  whatsappAccountId: string;
  conversationId: string;
  direction: string;
  messageType: string;
  body?: string | null;
  templateName?: string | null;
  status: string;
  pricingCategory?: string | null;
  isTemplate: boolean;
  providerTimestamp?: string | null;
  createdAt?: string | null;
};

type DashboardData = {
  ok: boolean;
  accounts: WhatsAppAccount[];
  conversations: WhatsAppConversation[];
  templates: WhatsAppTemplate[];
  rules: WhatsAppRule[];
  messages: WhatsAppMessage[];
  summary: {
    accountCount: number;
    activeAccounts: number;
    openConversations: number;
    unreadMessages: number;
    approvedTemplates?: number;
    activeRules?: number;
  };
  message?: string;
};

type ConnectResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  webhookReady?: boolean;
  webhookSubscribed?: boolean;
  account?: WhatsAppAccount;
};

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  return { response, data };
}

function count(value: number | undefined) {
  return Number(value ?? 0).toLocaleString('fa-IR');
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return '—';
  }
}

function serviceWindowOpen(conversation?: WhatsAppConversation | null) {
  return Boolean(
    conversation?.customerServiceWindowExpiresAt
      && new Date(conversation.customerServiceWindowExpiresAt).getTime() > Date.now(),
  );
}

export default function WhatsAppControlCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeAccountId, setActiveAccountId] = useState('');
  const [activeConversationId, setActiveConversationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [connectForm, setConnectForm] = useState({ wabaId: '', phoneNumberId: '', accessToken: '' });
  const [ruleForm, setRuleForm] = useState({ name: '', keywords: '', replyText: '' });
  const [templateForm, setTemplateForm] = useState({ to: '', templateId: '', components: '' });
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async () => {
    const { response, data: next } = await request<DashboardData>('/api/whatsapp/manage');
    if (!response.ok) throw new Error(next.message ?? 'اطلاعات واتساپ دریافت نشد.');
    setData(next);
    setActiveAccountId((current) => next.accounts.some((account) => account.id === current)
      ? current
      : next.accounts[0]?.id ?? '');
    setActiveConversationId((current) => next.conversations.some((conversation) => conversation.id === current)
      ? current
      : '');
  }, []);

  useEffect(() => {
    void load().catch((error: unknown) => {
      if (error instanceof Error && error.message === 'unauthorized') return;
      setNotice('اطلاعات واتساپ دریافت نشد.');
      setNoticeOk(false);
    });
  }, [load]);

  const activeAccount = useMemo(
    () => data?.accounts.find((account) => account.id === activeAccountId) ?? null,
    [data, activeAccountId],
  );
  const accountTemplates = useMemo(
    () => (data?.templates ?? []).filter((template) => template.whatsappAccountId === activeAccountId),
    [data, activeAccountId],
  );
  const approvedTemplates = useMemo(
    () => accountTemplates.filter((template) => template.status === 'APPROVED'),
    [accountTemplates],
  );
  const accountRules = useMemo(
    () => (data?.rules ?? []).filter((rule) => !rule.whatsappAccountId || rule.whatsappAccountId === activeAccountId),
    [data, activeAccountId],
  );
  const accountConversations = useMemo(
    () => (data?.conversations ?? []).filter((conversation) => conversation.whatsappAccountId === activeAccountId),
    [data, activeAccountId],
  );
  const activeConversation = useMemo(
    () => accountConversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [accountConversations, activeConversationId],
  );
  const conversationMessages = useMemo(
    () => (data?.messages ?? [])
      .filter((message) => message.conversationId === activeConversationId)
      .slice()
      .reverse(),
    [data, activeConversationId],
  );

  function show(message: string, ok = true) {
    setNotice(message);
    setNoticeOk(ok);
  }

  async function mutate(body: Record<string, unknown>) {
    const { response, data: next } = await request<DashboardData>('/api/whatsapp/manage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(next.message ?? 'عملیات انجام نشد.');
    setData(next);
    if (next.message) show(next.message);
    return next;
  }

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const { response, data: result } = await request<ConnectResponse>('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(connectForm),
      });
      if (!response.ok || !result.account) {
        show(result.message ?? 'اتصال واتساپ انجام نشد.', false);
        return;
      }
      setConnectForm((current) => ({ ...current, accessToken: '' }));
      setActiveAccountId(result.account.id);
      show(result.message ?? 'شماره واتساپ متصل شد.', true);
      await load();
    } catch (error) {
      if (error instanceof Error && error.message !== 'unauthorized') show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function syncTemplates() {
    if (!activeAccount) return;
    setBusy(true);
    try {
      await mutate({ action: 'sync_templates', accountId: activeAccount.id });
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAccount) return show('ابتدا یک حساب واتساپ انتخاب کنید.', false);
    const keywords = ruleForm.keywords.split(/[،,\n]/).map((item) => item.trim()).filter(Boolean);
    setBusy(true);
    try {
      await mutate({
        action: 'create_rule',
        accountId: activeAccount.id,
        name: ruleForm.name,
        keywords,
        replyText: ruleForm.replyText,
        isActive: true,
      });
      setRuleForm({ name: '', keywords: '', replyText: '' });
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function toggleRule(rule: WhatsAppRule) {
    setBusy(true);
    try {
      await mutate({ action: 'toggle_rule', ruleId: rule.id, isActive: !rule.isActive });
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function sendTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAccount) return show('ابتدا یک حساب واتساپ انتخاب کنید.', false);
    const template = approvedTemplates.find((item) => item.id === templateForm.templateId);
    if (!template) return show('یک Template تأییدشده انتخاب کنید.', false);
    let components: unknown[] | undefined;
    if (templateForm.components.trim()) {
      try {
        const parsed: unknown = JSON.parse(templateForm.components);
        if (!Array.isArray(parsed)) throw new Error('invalid');
        components = parsed;
      } catch {
        return show('Components JSON باید یک آرایه JSON معتبر باشد.', false);
      }
    }
    setBusy(true);
    try {
      await mutate({
        action: 'send_template',
        accountId: activeAccount.id,
        to: templateForm.to,
        templateName: template.name,
        language: template.language,
        components,
      });
      setTemplateForm((current) => ({ ...current, components: '' }));
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAccount || !activeConversation || !replyText.trim()) return;
    setBusy(true);
    try {
      await mutate({
        action: 'send_message',
        accountId: activeAccount.id,
        conversationId: activeConversation.id,
        text: replyText.trim(),
      });
      setReplyText('');
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  function chooseAccount(accountId: string) {
    setActiveAccountId(accountId);
    setActiveConversationId('');
    setTemplateForm((current) => ({ ...current, templateId: '' }));
  }

  function chooseConversation(conversation: WhatsAppConversation) {
    setActiveConversationId(conversation.id);
    setTemplateForm((current) => ({ ...current, to: conversation.customerPhone || conversation.waUserId }));
  }

  const windowOpen = serviceWindowOpen(activeConversation);

  return (
    <div className="wa-react" dir="rtl">
      <style>{styles}</style>
      <aside className="wa-side">
        <a className="wa-brand" href="/app"><i>AP</i><span><b>AI PANEL</b><small>WhatsApp Business</small></span></a>
        <div className="wa-provider"><i>WA</i><span><b>واتساپ</b><small>Cloud API + Inbox</small></span></div>
        <div className="wa-account-picker">
          <span>شماره فعال</span>
          <select value={activeAccountId} onChange={(event) => chooseAccount(event.target.value)} disabled={!data?.accounts.length}>
            {data?.accounts.length
              ? data.accounts.map((account) => <option key={account.id} value={account.id}>{account.verifiedName || account.displayPhoneNumber || account.phoneNumberId}</option>)
              : <option value="">شماره‌ای متصل نیست</option>}
          </select>
        </div>
        <nav>
          <a className="active" href="#connection">اتصال و وضعیت</a>
          <a href="#templates">Templateها</a>
          <a href="#automation">پاسخ خودکار</a>
          <a href="#inbox">Inbox</a>
          <a href="/app/account">حساب و کیف پول</a>
        </nav>
        <a className="wa-back" href="/app">← بازگشت به داشبورد</a>
      </aside>

      <main className="wa-main">
        <header className="wa-header">
          <div><span className="wa-eyebrow">WhatsApp Business Platform</span><h1>مرکز کنترل واتساپ</h1><p>اتصال امن WhatsApp Business، Templateهای Meta، پاسخ خودکار و Inbox در یک صفحه React مشترک.</p></div>
          <a className="wa-link" href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">Meta Developer ↗</a>
        </header>

        {notice && <div className={`wa-notice ${noticeOk ? 'ok' : 'error'}`}>{notice}</div>}

        <section className="wa-metrics">
          <div><small>شماره متصل</small><strong>{count(data?.summary.accountCount)}</strong><span>در Workspace</span></div>
          <div><small>حساب فعال</small><strong>{count(data?.summary.activeAccounts)}</strong><span>Webhook فعال</span></div>
          <div><small>گفتگوی باز</small><strong>{count(data?.summary.openConversations)}</strong><span>Inbox</span></div>
          <div><small>خوانده‌نشده</small><strong>{count(data?.summary.unreadMessages)}</strong><span>پیام</span></div>
        </section>

        <section id="connection" className="wa-grid">
          <article className="wa-card">
            <span className="wa-eyebrow">Connection</span><h2>اتصال WhatsApp Business</h2>
            <p className="wa-muted">WABA ID، Phone Number ID و System User Access Token را وارد کنید. Token فقط در Backend اعتبارسنجی و رمزنگاری می‌شود.</p>
            <form onSubmit={connect}>
              <label>WABA ID<input dir="ltr" inputMode="numeric" value={connectForm.wabaId} onChange={(event) => setConnectForm({ ...connectForm, wabaId: event.target.value })} required /></label>
              <label>Phone Number ID<input dir="ltr" inputMode="numeric" value={connectForm.phoneNumberId} onChange={(event) => setConnectForm({ ...connectForm, phoneNumberId: event.target.value })} required /></label>
              <label>System User Access Token<input dir="ltr" type="password" autoComplete="off" value={connectForm.accessToken} onChange={(event) => setConnectForm({ ...connectForm, accessToken: event.target.value })} placeholder="EAAG..." required /></label>
              <button className="wa-primary" disabled={busy}> {busy ? 'در حال اتصال...' : 'اعتبارسنجی و اتصال'} </button>
            </form>
          </article>

          <article className="wa-card">
            <span className="wa-eyebrow">Status</span><h2>وضعیت شماره</h2>
            {!data ? <div className="wa-empty">در حال دریافت اطلاعات...</div> : !activeAccount ? <div className="wa-empty">هنوز شماره واتساپی متصل نشده است.</div> : <>
              <div className="wa-identity"><i>WA</i><span><b>{activeAccount.verifiedName || 'WhatsApp Business'}</b><small dir="ltr">{activeAccount.displayPhoneNumber || activeAccount.phoneNumberId}</small></span><em className={activeAccount.status === 'ACTIVE' ? 'good' : ''}>{activeAccount.status}</em></div>
              <dl><div><dt>WABA ID</dt><dd>{activeAccount.wabaId}</dd></div><div><dt>Webhook</dt><dd>{activeAccount.webhookSubscribed ? 'فعال' : 'در انتظار'}</dd></div><div><dt>Quality</dt><dd>{activeAccount.qualityRating || '—'}</dd></div><div><dt>آخرین Sync</dt><dd>{formatDate(activeAccount.lastSyncedAt)}</dd></div></dl>
              {!activeAccount.webhookSubscribed && <div className="wa-warning">شماره ذخیره شده اما Webhook هنوز فعال نیست. Meta App Secret باید در تنظیمات امن پلتفرم موجود باشد و سپس اتصال دوباره انجام شود.</div>}
            </>}
          </article>
        </section>

        <section id="templates" className="wa-grid">
          <article className="wa-card">
            <div className="wa-card-head"><div><span className="wa-eyebrow">Meta Templates</span><h2>Templateهای واتساپ</h2></div><button className="wa-ghost" type="button" onClick={() => void syncTemplates()} disabled={busy || !activeAccount}>همگام‌سازی</button></div>
            {!activeAccount ? <div className="wa-empty">ابتدا یک شماره انتخاب کنید.</div> : accountTemplates.length ? <div className="wa-list">{accountTemplates.map((template) => <div className="wa-list-item" key={template.id}><span><b>{template.name}</b><small>{template.language} · {template.category}</small></span><em className={template.status === 'APPROVED' ? 'good' : ''}>{template.status}</em></div>)}</div> : <div className="wa-empty">Template همگام‌شده‌ای وجود ندارد.</div>}
          </article>

          <article className="wa-card">
            <span className="wa-eyebrow">Template Message</span><h2>ارسال Template تأییدشده</h2>
            <form onSubmit={sendTemplate}>
              <label>شماره گیرنده<input dir="ltr" inputMode="tel" value={templateForm.to} onChange={(event) => setTemplateForm({ ...templateForm, to: event.target.value })} placeholder="491701234567" required /></label>
              <label>Template<select value={templateForm.templateId} onChange={(event) => setTemplateForm({ ...templateForm, templateId: event.target.value })} required><option value="">انتخاب Template</option>{approvedTemplates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.language}</option>)}</select></label>
              <label>Components JSON <small>اختیاری</small><textarea dir="ltr" rows={4} value={templateForm.components} onChange={(event) => setTemplateForm({ ...templateForm, components: event.target.value })} placeholder='[{"type":"body","parameters":[{"type":"text","text":"Ali"}]}]' /></label>
              <button className="wa-primary" disabled={busy || !activeAccount}>ارسال Template</button>
            </form>
          </article>
        </section>

        <section id="automation" className="wa-grid">
          <article className="wa-card">
            <span className="wa-eyebrow">Automation</span><h2>پاسخ خودکار با کلیدواژه</h2>
            <form onSubmit={createRule}>
              <label>نام Rule<input value={ruleForm.name} onChange={(event) => setRuleForm({ ...ruleForm, name: event.target.value })} placeholder="مثلاً قیمت محصول" required /></label>
              <label>کلیدواژه‌ها<input value={ruleForm.keywords} onChange={(event) => setRuleForm({ ...ruleForm, keywords: event.target.value })} placeholder="قیمت، خرید، تعرفه" required /></label>
              <label>متن پاسخ<textarea rows={5} maxLength={4000} value={ruleForm.replyText} onChange={(event) => setRuleForm({ ...ruleForm, replyText: event.target.value })} required /></label>
              <button className="wa-primary" disabled={busy || !activeAccount}>ساخت Rule</button>
            </form>
          </article>

          <article className="wa-card">
            <span className="wa-eyebrow">Rules</span><h2>Ruleهای حساب</h2>
            {accountRules.length ? <div className="wa-list">{accountRules.map((rule) => <div className="wa-rule" key={rule.id}><div><b>{rule.name}</b><small>{rule.triggerConfig?.keywords?.join('، ') || rule.triggerType}</small><p>{rule.actionConfig?.message || '—'}</p></div><div><em className={rule.isActive ? 'good' : ''}>{rule.isActive ? 'فعال' : 'خاموش'}</em><button type="button" className="wa-mini" onClick={() => void toggleRule(rule)} disabled={busy}>{rule.isActive ? 'خاموش' : 'فعال'}</button></div></div>)}</div> : <div className="wa-empty">هنوز Rule ساخته نشده است.</div>}
          </article>
        </section>

        <section id="inbox" className="wa-card wa-inbox">
          <div className="wa-card-head"><div><span className="wa-eyebrow">Inbox</span><h2>گفتگوهای واتساپ</h2></div><span className="wa-muted">پاسخ آزاد فقط داخل پنجره ۲۴ ساعته</span></div>
          <div className="wa-inbox-grid">
            <div className="wa-conversations">
              {accountConversations.length ? accountConversations.map((conversation) => <button type="button" key={conversation.id} className={conversation.id === activeConversationId ? 'active' : ''} onClick={() => chooseConversation(conversation)}><span><b>{conversation.customerName || conversation.customerPhone || conversation.waUserId}</b><small>{formatDate(conversation.lastMessageAt)}</small></span>{conversation.unreadCount > 0 && <em>{count(conversation.unreadCount)}</em>}</button>) : <div className="wa-empty">هنوز گفتگویی ثبت نشده است.</div>}
            </div>
            <div className="wa-chat-panel">
              {!activeConversation ? <div className="wa-empty">یک گفتگو را انتخاب کنید.</div> : <>
                <div className="wa-chat-head"><div><b>{activeConversation.customerName || activeConversation.customerPhone || activeConversation.waUserId}</b><small dir="ltr">{activeConversation.customerPhone || activeConversation.waUserId}</small></div><em className={windowOpen ? 'good' : ''}>{windowOpen ? 'پنجره باز' : 'پنجره بسته'}</em></div>
                <div className="wa-chat">{conversationMessages.length ? conversationMessages.map((message) => <div key={message.id} className={`wa-bubble ${message.direction === 'OUTBOUND' ? 'out' : ''}`}><p>{message.body || message.templateName || `[${message.messageType}]`}</p><small>{message.status}{message.pricingCategory ? ` · ${message.pricingCategory}` : ''} · {formatDate(message.providerTimestamp || message.createdAt)}</small></div>) : <div className="wa-empty">پیامی ثبت نشده است.</div>}</div>
                <form className="wa-reply" onSubmit={sendReply}><textarea rows={3} maxLength={4000} value={replyText} onChange={(event) => setReplyText(event.target.value)} disabled={!windowOpen} placeholder={windowOpen ? 'پیام خود را بنویسید...' : 'پنجره بسته است؛ از Template استفاده کنید.'} /><div><small>{windowOpen ? `تا ${formatDate(activeConversation.customerServiceWindowExpiresAt)} باز است.` : 'برای شروع دوباره از Template تأییدشده استفاده کنید.'}</small><button className="wa-primary" disabled={busy || !windowOpen || !replyText.trim()}>ارسال پیام</button></div></form>
              </>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wa-react{min-height:100vh;background:#f5f7fb;color:#111827;display:grid;grid-template-columns:260px minmax(0,1fr)}.wa-side{background:#111827;color:#fff;padding:26px 18px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh}.wa-brand,.wa-provider{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.wa-brand i,.wa-provider i{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#1f2937;font-style:normal;font-weight:900}.wa-provider i{background:#128c7e}.wa-brand span,.wa-provider span{display:grid;gap:3px}.wa-brand small,.wa-provider small{color:#94a3b8}.wa-account-picker{display:grid;gap:8px;font-size:12px;color:#94a3b8}.wa-account-picker select{width:100%;background:#1f2937;color:#fff;border:1px solid #334155;border-radius:12px;padding:10px}.wa-side nav{display:grid;gap:4px}.wa-side nav a,.wa-back{color:#cbd5e1;text-decoration:none;padding:11px 12px;border-radius:11px}.wa-side nav a:hover,.wa-side nav a.active{background:#1f2937;color:#fff}.wa-back{margin-top:auto}.wa-main{padding:34px;max-width:1400px;width:100%;margin:0 auto}.wa-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.wa-header h1{margin:7px 0;font-size:31px}.wa-header p{margin:0;color:#64748b;line-height:1.8;max-width:760px}.wa-eyebrow{text-transform:uppercase;color:#128c7e;font-weight:900;font-size:11px;letter-spacing:.08em}.wa-link,.wa-ghost,.wa-mini,.wa-primary{border:0;border-radius:12px;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer;text-decoration:none}.wa-link,.wa-ghost{background:#ecfdf5;color:#047857}.wa-primary{background:#128c7e;color:#fff;margin-top:12px}.wa-mini{padding:7px 10px;background:#f1f5f9;color:#334155}.wa-link:disabled,.wa-ghost:disabled,.wa-primary:disabled,.wa-mini:disabled{opacity:.55;cursor:not-allowed}.wa-notice{border-radius:13px;padding:12px 14px;margin-bottom:18px;font-size:13px}.wa-notice.ok{background:#ecfdf5;color:#047857}.wa-notice.error{background:#fff1f2;color:#be123c}.wa-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:18px}.wa-metrics>div,.wa-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 8px 30px rgba(15,23,42,.04)}.wa-metrics>div{padding:17px}.wa-metrics small,.wa-metrics span{color:#64748b;font-size:12px}.wa-metrics strong{display:block;font-size:27px;margin:7px 0}.wa-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:18px}.wa-card{padding:20px}.wa-card h2{margin:5px 0 13px;font-size:19px}.wa-card-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.wa-muted{color:#64748b;font-size:13px;line-height:1.8}.wa-card form{display:grid;gap:11px}.wa-card label{display:grid;gap:6px;font-weight:750;font-size:12px}.wa-card label small{font-weight:500;color:#94a3b8}.wa-card input,.wa-card textarea,.wa-card select,.wa-reply textarea{width:100%;box-sizing:border-box;border:1px solid #d7dce3;border-radius:12px;padding:11px 12px;font:inherit;background:#fff}.wa-card input:focus,.wa-card textarea:focus,.wa-card select:focus,.wa-reply textarea:focus{outline:2px solid #bbf7d0;border-color:#22c55e}.wa-identity{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #edf0f4;border-radius:14px}.wa-identity i{width:42px;height:42px;display:grid;place-items:center;background:#dcfce7;color:#047857;border-radius:12px;font-style:normal;font-weight:900}.wa-identity span{display:grid;gap:4px;flex:1}.wa-identity small{color:#64748b}.wa-identity em,.wa-list-item em,.wa-rule em,.wa-chat-head em{font-style:normal;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#fff7ed;color:#c2410c}.wa-identity em.good,.wa-list-item em.good,.wa-rule em.good,.wa-chat-head em.good{background:#dcfce7;color:#166534}.wa-card dl{display:grid;grid-template-columns:1fr 1fr;gap:9px}.wa-card dl div{border:1px solid #edf0f4;border-radius:12px;padding:10px}.wa-card dt{font-size:10px;color:#94a3b8}.wa-card dd{margin:4px 0 0;font-weight:750;font-size:12px;overflow-wrap:anywhere}.wa-warning{background:#fff7ed;color:#9a3412;border-radius:12px;padding:11px;font-size:12px;line-height:1.8}.wa-list{display:grid;gap:9px}.wa-list-item,.wa-rule{border:1px solid #edf0f4;border-radius:13px;padding:12px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.wa-list-item span,.wa-rule>div:first-child{display:grid;gap:4px}.wa-list-item small,.wa-rule small{color:#64748b}.wa-rule p{margin:4px 0 0;color:#475569;font-size:12px;line-height:1.7}.wa-rule>div:last-child{display:grid;justify-items:end;gap:8px}.wa-empty{border:1px dashed #d7dce3;border-radius:13px;padding:26px;text-align:center;color:#94a3b8}.wa-inbox{margin-bottom:20px}.wa-inbox-grid{display:grid;grid-template-columns:minmax(260px,.75fr) minmax(0,1.6fr);gap:14px}.wa-conversations{display:grid;gap:8px;align-content:start;max-height:520px;overflow:auto}.wa-conversations button{border:1px solid #e5e7eb;background:#fff;border-radius:13px;padding:11px;text-align:right;display:flex;justify-content:space-between;gap:10px;cursor:pointer}.wa-conversations button.active{border-color:#34d399;background:#f0fdf4}.wa-conversations button span{display:grid;gap:3px}.wa-conversations button small{color:#94a3b8}.wa-conversations button em{font-style:normal;align-self:center;background:#128c7e;color:#fff;border-radius:999px;min-width:22px;padding:3px 6px;text-align:center;font-size:10px}.wa-chat-panel{min-width:0}.wa-chat-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:9px}.wa-chat-head>div{display:grid;gap:3px}.wa-chat-head small{color:#64748b}.wa-chat{min-height:260px;max-height:420px;overflow:auto;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:12px}.wa-bubble{max-width:78%;background:#fff;border:1px solid #e5e7eb;border-radius:13px;padding:10px 12px;margin:7px 0}.wa-bubble.out{margin-right:auto;background:#dcfce7}.wa-bubble p{margin:0;line-height:1.7}.wa-bubble small{display:block;color:#94a3b8;font-size:10px;margin-top:4px}.wa-reply{margin-top:10px}.wa-reply>div{display:flex;justify-content:space-between;gap:10px;align-items:center}.wa-reply small{color:#64748b}.wa-reply .wa-primary{margin-top:0;white-space:nowrap}@media(max-width:980px){.wa-react{display:block}.wa-side{height:auto;position:static}.wa-side nav{display:flex;overflow:auto}.wa-back{margin-top:0}.wa-main{padding:20px}.wa-grid,.wa-metrics,.wa-inbox-grid{grid-template-columns:1fr}.wa-header{display:grid}.wa-card dl{grid-template-columns:1fr}.wa-inbox-grid{display:grid}.wa-chat{max-height:360px}}`;
