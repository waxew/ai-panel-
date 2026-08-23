import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type DiscordBot = {
  id: string;
  workspaceId: string;
  applicationId: string;
  botUserId: string;
  username?: string | null;
  displayName?: string | null;
  description?: string | null;
  status: string;
  defaultGuildId?: string | null;
  defaultChannelId?: string | null;
  settings?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  installUrl: string;
  interactionsEndpoint?: string;
};

type DiscordCommand = {
  id: string;
  botId: string;
  name: string;
  description: string;
  responseText: string;
  responseEphemeral: boolean;
  isActive: boolean;
  executions: number;
  lastUsedAt?: string | null;
  sortOrder: number;
};

type DiscordData = {
  ok: boolean;
  bots: DiscordBot[];
  commands: DiscordCommand[];
  message?: string;
};

type ConnectResponse = {
  ok?: boolean;
  message?: string;
  bot?: DiscordBot;
  installUrl?: string;
  interactionsEndpoint?: string;
};

type ActionResponse = { ok?: boolean; message?: string; synced?: number };

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  return { response, data };
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return '—';
  }
}

export default function DiscordControlCenter() {
  const [data, setData] = useState<DiscordData | null>(null);
  const [activeBotId, setActiveBotId] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [commandForm, setCommandForm] = useState({ name: '', description: '', responseText: '', responseEphemeral: false });
  const [botForm, setBotForm] = useState({ displayName: '', description: '', defaultGuildId: '', defaultChannelId: '' });

  const load = useCallback(async () => {
    const { response, data: next } = await request<DiscordData>('/api/discord/manage');
    if (!response.ok) throw new Error(next.message ?? 'اطلاعات Discord دریافت نشد.');
    setData(next);
    setActiveBotId((current) => next.bots.some((bot) => bot.id === current) ? current : next.bots[0]?.id ?? '');
  }, []);

  useEffect(() => {
    void load().catch((error: unknown) => {
      if (error instanceof Error && error.message === 'unauthorized') return;
      setNotice('اطلاعات Discord دریافت نشد.');
      setNoticeOk(false);
    });
  }, [load]);

  const activeBot = useMemo(
    () => data?.bots.find((bot) => bot.id === activeBotId) ?? null,
    [data, activeBotId],
  );
  const activeCommands = useMemo(
    () => (data?.commands ?? []).filter((command) => command.botId === activeBotId),
    [data, activeBotId],
  );
  const totalExecutions = useMemo(
    () => activeCommands.reduce((sum, command) => sum + Number(command.executions || 0), 0),
    [activeCommands],
  );

  useEffect(() => {
    setBotForm({
      displayName: activeBot?.displayName ?? '',
      description: activeBot?.description ?? '',
      defaultGuildId: activeBot?.defaultGuildId ?? '',
      defaultChannelId: activeBot?.defaultChannelId ?? '',
    });
  }, [activeBot]);

  function show(message: string, ok = true) {
    setNotice(message);
    setNoticeOk(ok);
  }

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const { response, data: result } = await request<ConnectResponse>('/api/discord/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok || !result.bot) {
        show(result.message ?? 'اتصال ربات Discord انجام نشد.', false);
        return;
      }
      setToken('');
      setActiveBotId(result.bot.id);
      show('ربات Discord متصل شد و فرمان‌های پیش‌فرض همگام شدند.');
      await load();
    } catch (error) {
      if (error instanceof Error && error.message !== 'unauthorized') show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function action(body: Record<string, unknown>, successMessage?: string) {
    const { response, data: result } = await request<ActionResponse>('/api/discord/manage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(result.message ?? 'عملیات Discord انجام نشد.');
    await load();
    if (successMessage) show(successMessage);
    return result;
  }

  async function saveBot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeBot) return;
    setBusy(true);
    try {
      await action({
        action: 'update_bot',
        botId: activeBot.id,
        displayName: botForm.displayName,
        description: botForm.description,
        defaultGuildId: botForm.defaultGuildId,
        defaultChannelId: botForm.defaultChannelId,
      }, 'تنظیمات ربات ذخیره شد.');
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function createCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeBot) return show('ابتدا یک ربات Discord متصل کنید.', false);
    setBusy(true);
    try {
      await action({ action: 'create_command', botId: activeBot.id, ...commandForm }, 'فرمان ساخته و با Discord همگام شد.');
      setCommandForm({ name: '', description: '', responseText: '', responseEphemeral: false });
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function syncCommands() {
    if (!activeBot) return;
    setBusy(true);
    try {
      const result = await action({ action: 'sync_commands', botId: activeBot.id });
      show(`${Number(result.synced ?? 0).toLocaleString('fa-IR')} فرمان با Discord همگام شد.`);
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function toggleCommand(command: DiscordCommand) {
    if (!activeBot) return;
    setBusy(true);
    try {
      await action({ action: 'update_command', botId: activeBot.id, commandId: command.id, isActive: !command.isActive }, 'وضعیت فرمان تغییر کرد.');
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function deleteCommand(command: DiscordCommand) {
    if (!activeBot || !window.confirm(`فرمان /${command.name} حذف شود؟`)) return;
    setBusy(true);
    try {
      await action({ action: 'delete_command', botId: activeBot.id, commandId: command.id }, 'فرمان حذف شد.');
    } catch (error) {
      if (error instanceof Error) show(error.message, false);
    } finally {
      setBusy(false);
    }
  }

  async function copyEndpoint() {
    if (!activeBot) return;
    const endpoint = `${window.location.origin}/api/public/discord/interactions/${encodeURIComponent(activeBot.applicationId)}`;
    try {
      await navigator.clipboard.writeText(endpoint);
      show('Interaction Endpoint کپی شد.');
    } catch {
      show('کپی خودکار انجام نشد؛ آدرس را دستی کپی کنید.', false);
    }
  }

  const interactionEndpoint = activeBot
    ? `${window.location.origin}/api/public/discord/interactions/${encodeURIComponent(activeBot.applicationId)}`
    : '';

  return (
    <div className="dc-react" dir="rtl">
      <style>{styles}</style>
      <aside className="dc-side">
        <a className="dc-brand" href="/app"><i>AP</i><span><b>AI PANEL</b><small>Discord Bot Builder</small></span></a>
        <div className="dc-provider"><i>DC</i><span><b>دیسکورد</b><small>Bot + Interactions</small></span></div>
        <div className="dc-picker"><span>ربات فعال</span><select value={activeBotId} onChange={(event) => setActiveBotId(event.target.value)} disabled={!data?.bots.length}>{data?.bots.length ? data.bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.displayName || bot.username || bot.applicationId}</option>) : <option value="">رباتی متصل نیست</option>}</select></div>
        <nav><a className="active" href="#connection">اتصال و نصب</a><a href="#settings">تنظیمات ربات</a><a href="#commands">Slash Commands</a><a href="/app/account">حساب و کیف پول</a></nav>
        <a className="dc-back" href="/app">← بازگشت به داشبورد</a>
      </aside>

      <main className="dc-main">
        <header className="dc-header"><div><span className="dc-eyebrow">Discord Automation</span><h1>مرکز کنترل ربات Discord</h1><p>Bot Token، نصب روی Server، Interaction Endpoint و Slash Commandها در یک صفحه React یکپارچه.</p></div><a className="dc-ghost" href="https://discord.com/developers/applications" target="_blank" rel="noreferrer">Developer Portal ↗</a></header>
        {notice && <div className={`dc-notice ${noticeOk ? 'ok' : 'error'}`}>{notice}</div>}

        <section className="dc-metrics"><div><small>ربات متصل</small><strong>{(data?.bots.length ?? 0).toLocaleString('fa-IR')}</strong><span>Workspace</span></div><div><small>فرمان فعال</small><strong>{activeCommands.filter((command) => command.isActive).length.toLocaleString('fa-IR')}</strong><span>Slash Command</span></div><div><small>کل اجرا</small><strong>{totalExecutions.toLocaleString('fa-IR')}</strong><span>فرمان‌ها</span></div></section>

        <section id="connection" className="dc-grid">
          <article className="dc-card"><span className="dc-eyebrow">Connection</span><h2>{data?.bots.length ? 'اتصال ربات دیگر' : 'اتصال اولین ربات'}</h2><p className="dc-muted">Token از Discord Developer Portal دریافت می‌شود. Application ID و Public Key به‌صورت خودکار شناسایی و Token در Backend رمزنگاری می‌شود.</p><form onSubmit={connect}><label>Bot Token<input dir="ltr" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Discord Bot Token" required /></label><button className="dc-primary" disabled={busy || token.trim().length < 30}>{busy ? 'در حال اتصال...' : 'اتصال ربات'}</button></form></article>
          <article className="dc-card"><span className="dc-eyebrow">Status</span><h2>ربات انتخاب‌شده</h2>{!data ? <div className="dc-empty">در حال دریافت اطلاعات...</div> : !activeBot ? <div className="dc-empty">هنوز ربات Discord متصل نشده است.</div> : <><div className="dc-identity"><i>DC</i><span><b>{activeBot.displayName || activeBot.username || 'Discord Bot'}</b><small>@{activeBot.username || 'bot'} · App {activeBot.applicationId}</small></span><em className={activeBot.status === 'ACTIVE' ? 'good' : ''}>{activeBot.status}</em></div><dl><div><dt>Application ID</dt><dd>{activeBot.applicationId}</dd></div><div><dt>Bot User ID</dt><dd>{activeBot.botUserId}</dd></div><div><dt>آخرین تغییر</dt><dd>{formatDate(activeBot.updatedAt)}</dd></div><div><dt>Interactions</dt><dd>Ed25519 verified</dd></div></dl></>}</article>
        </section>

        {activeBot && <section className="dc-card dc-setup"><div className="dc-card-head"><div><span className="dc-eyebrow">Discord Setup</span><h2>نصب و Interaction Endpoint</h2></div><button className="dc-ghost" type="button" onClick={() => void syncCommands()} disabled={busy}>Sync فرمان‌ها</button></div><div className="dc-actions"><a className="dc-primary" href={activeBot.installUrl} target="_blank" rel="noreferrer">افزودن ربات به Server</a><button className="dc-ghost" type="button" onClick={() => void copyEndpoint()}>کپی Interaction Endpoint</button></div><p className="dc-muted">در Developer Portal → General Information، مقدار Interactions Endpoint URL را روی آدرس زیر قرار دهید. Discord هنگام ذخیره امضای Endpoint را بررسی می‌کند.</p><div className="dc-code" dir="ltr">{interactionEndpoint}</div></section>}

        <section id="settings" className="dc-grid">
          <article className="dc-card"><span className="dc-eyebrow">Bot Settings</span><h2>مشخصات ربات</h2><form onSubmit={saveBot}><label>نام نمایشی<input value={botForm.displayName} onChange={(event) => setBotForm({ ...botForm, displayName: event.target.value })} disabled={!activeBot} /></label><label>توضیحات<textarea rows={4} maxLength={500} value={botForm.description} onChange={(event) => setBotForm({ ...botForm, description: event.target.value })} disabled={!activeBot} /></label><button className="dc-primary" disabled={busy || !activeBot}>ذخیره مشخصات</button></form></article>
          <article className="dc-card"><span className="dc-eyebrow">Defaults</span><h2>Server و Channel پیش‌فرض</h2><form onSubmit={saveBot}><label>Guild / Server ID<input dir="ltr" value={botForm.defaultGuildId} onChange={(event) => setBotForm({ ...botForm, defaultGuildId: event.target.value })} disabled={!activeBot} placeholder="اختیاری" /></label><label>Channel ID<input dir="ltr" value={botForm.defaultChannelId} onChange={(event) => setBotForm({ ...botForm, defaultChannelId: event.target.value })} disabled={!activeBot} placeholder="اختیاری" /></label><button className="dc-primary" disabled={busy || !activeBot}>ذخیره مقصد پیش‌فرض</button></form></article>
        </section>

        <section id="commands" className="dc-grid dc-command-grid">
          <article className="dc-card"><span className="dc-eyebrow">Slash Commands</span><h2>ساخت فرمان جدید</h2><form onSubmit={createCommand}><label>نام فرمان<input dir="ltr" pattern="[a-z0-9_-]{1,32}" value={commandForm.name} onChange={(event) => setCommandForm({ ...commandForm, name: event.target.value.toLowerCase() })} placeholder="status" required /></label><label>توضیح کوتاه<input maxLength={100} value={commandForm.description} onChange={(event) => setCommandForm({ ...commandForm, description: event.target.value })} required /></label><label>پاسخ ربات<textarea rows={5} maxLength={1900} value={commandForm.responseText} onChange={(event) => setCommandForm({ ...commandForm, responseText: event.target.value })} required /></label><label className="dc-check"><input type="checkbox" checked={commandForm.responseEphemeral} onChange={(event) => setCommandForm({ ...commandForm, responseEphemeral: event.target.checked })} /> پاسخ فقط برای اجراکننده دیده شود (Ephemeral)</label><button className="dc-primary" disabled={busy || !activeBot}>ساخت و Sync</button></form></article>
          <article className="dc-card"><div className="dc-card-head"><div><span className="dc-eyebrow">Commands</span><h2>فرمان‌های ربات</h2></div><span className="dc-muted">{activeCommands.length.toLocaleString('fa-IR')} فرمان</span></div>{activeCommands.length ? <div className="dc-list">{activeCommands.map((command) => <div className="dc-command" key={command.id}><div><code dir="ltr">/{command.name}</code><small>{Number(command.executions || 0).toLocaleString('fa-IR')} اجرا · {command.responseEphemeral ? 'Ephemeral' : 'Public'}</small></div><div><b>{command.description}</b><p>{command.responseText}</p></div><div className="dc-command-actions"><button className={command.isActive ? 'dc-ghost' : 'dc-primary'} type="button" onClick={() => void toggleCommand(command)} disabled={busy}>{command.isActive ? 'غیرفعال' : 'فعال'}</button><button className="dc-danger" type="button" onClick={() => void deleteCommand(command)} disabled={busy}>حذف</button></div></div>)}</div> : <div className="dc-empty">برای این ربات فرمانی وجود ندارد.</div>}</article>
        </section>
      </main>
    </div>
  );
}

const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.dc-react{min-height:100vh;background:#f5f7fb;color:#111827;display:grid;grid-template-columns:260px minmax(0,1fr)}.dc-side{background:#111827;color:#fff;padding:26px 18px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh}.dc-brand,.dc-provider{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.dc-brand i,.dc-provider i{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#1f2937;font-style:normal;font-weight:900}.dc-provider i{background:#5865f2}.dc-brand span,.dc-provider span{display:grid;gap:3px}.dc-brand small,.dc-provider small{color:#94a3b8}.dc-picker{display:grid;gap:8px;font-size:12px;color:#94a3b8}.dc-picker select{width:100%;background:#1f2937;color:#fff;border:1px solid #334155;border-radius:12px;padding:10px}.dc-side nav{display:grid;gap:4px}.dc-side nav a,.dc-back{color:#cbd5e1;text-decoration:none;padding:11px 12px;border-radius:11px}.dc-side nav a:hover,.dc-side nav a.active{background:#1f2937;color:#fff}.dc-back{margin-top:auto}.dc-main{padding:34px;max-width:1400px;width:100%;margin:0 auto}.dc-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.dc-header h1{margin:7px 0;font-size:31px}.dc-header p{margin:0;color:#64748b;line-height:1.8;max-width:760px}.dc-eyebrow{text-transform:uppercase;color:#5865f2;font-weight:900;font-size:11px;letter-spacing:.08em}.dc-notice{border-radius:13px;padding:12px 14px;margin-bottom:18px;font-size:13px}.dc-notice.ok{background:#eff6ff;color:#1d4ed8}.dc-notice.error{background:#fff1f2;color:#be123c}.dc-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:18px}.dc-metrics>div,.dc-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 8px 30px rgba(15,23,42,.04)}.dc-metrics>div{padding:17px}.dc-metrics small,.dc-metrics span{color:#64748b;font-size:12px}.dc-metrics strong{display:block;font-size:27px;margin:7px 0}.dc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:18px}.dc-card{padding:20px}.dc-card h2{margin:5px 0 13px;font-size:19px}.dc-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.dc-muted{color:#64748b;font-size:13px;line-height:1.8}.dc-card form{display:grid;gap:11px}.dc-card label{display:grid;gap:6px;font-weight:750;font-size:12px}.dc-card input,.dc-card textarea{width:100%;box-sizing:border-box;border:1px solid #d7dce3;border-radius:12px;padding:11px 12px;font:inherit;background:#fff}.dc-card input:focus,.dc-card textarea:focus{outline:2px solid #c7d2fe;border-color:#818cf8}.dc-primary,.dc-ghost,.dc-danger{border:0;border-radius:12px;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.dc-primary{background:#5865f2;color:#fff}.dc-ghost{background:#eef2ff;color:#3730a3}.dc-danger{background:#fff1f2;color:#be123c}.dc-primary:disabled,.dc-ghost:disabled,.dc-danger:disabled{opacity:.55;cursor:not-allowed}.dc-identity{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #edf0f4;border-radius:14px}.dc-identity i{width:42px;height:42px;display:grid;place-items:center;background:#eef2ff;color:#3730a3;border-radius:12px;font-style:normal;font-weight:900}.dc-identity span{display:grid;gap:4px;flex:1}.dc-identity small{color:#64748b}.dc-identity em{font-style:normal;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#fff7ed;color:#c2410c}.dc-identity em.good{background:#dcfce7;color:#166534}.dc-card dl{display:grid;grid-template-columns:1fr 1fr;gap:9px}.dc-card dl div{border:1px solid #edf0f4;border-radius:12px;padding:10px}.dc-card dt{font-size:10px;color:#94a3b8}.dc-card dd{margin:4px 0 0;font-weight:750;font-size:12px;overflow-wrap:anywhere}.dc-setup{margin-bottom:18px}.dc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}.dc-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:12px;overflow:auto;font-size:12px}.dc-check{display:flex!important;grid-template-columns:auto 1fr!important;align-items:center;justify-content:start}.dc-check input{width:auto}.dc-command-grid{grid-template-columns:minmax(300px,.8fr) minmax(0,1.4fr);align-items:start}.dc-list{display:grid}.dc-command{display:grid;grid-template-columns:120px minmax(0,1fr) auto;gap:12px;padding:14px 0;border-bottom:1px solid #edf0f4;align-items:start}.dc-command:last-child{border-bottom:0}.dc-command>div:first-child{display:grid;gap:6px}.dc-command code{justify-self:start;background:#f1f5f9;padding:5px 8px;border-radius:8px}.dc-command small,.dc-command p{color:#64748b;font-size:11px}.dc-command p{margin:5px 0 0;line-height:1.7;white-space:pre-wrap}.dc-command-actions{display:flex;gap:7px}.dc-command-actions .dc-primary,.dc-command-actions .dc-ghost,.dc-command-actions .dc-danger{padding:7px 9px}.dc-empty{border:1px dashed #d7dce3;border-radius:13px;padding:26px;text-align:center;color:#94a3b8}@media(max-width:980px){.dc-react{display:block}.dc-side{height:auto;position:static}.dc-side nav{display:flex;overflow:auto}.dc-back{margin-top:0}.dc-main{padding:20px}.dc-grid,.dc-metrics,.dc-command-grid{grid-template-columns:1fr}.dc-header{display:grid}.dc-card dl{grid-template-columns:1fr}.dc-command{grid-template-columns:1fr}.dc-command-actions{justify-content:flex-start}.dc-actions{display:grid}}`;
