import {
  botCommerceActionDefinitions,
  defaultBotCommerceTemplate,
  getBotCommerceAction,
  type BotCommerceActionType,
  type BotCommerceMenuNode,
  type BotCommerceProvider,
  type BotCommerceTemplate,
} from '@ai-panel/shared';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type ProviderBot = { id: string; externalId: string; username?: string | null; displayName?: string | null; status: string };
type Engine = { draft?: BotCommerceTemplate | null; published?: BotCommerceTemplate | null; version?: number };
type ApiData = {
  ok: boolean;
  message?: string;
  store: { id: string; name: string } | null;
  botCommerce: Engine | null;
  providers: Record<BotCommerceProvider, ProviderBot[]>;
};

const providerLabels: Record<BotCommerceProvider, string> = { telegram: 'تلگرام', bale: 'بله', rubika: 'روبیکا' };
const liveActions = botCommerceActionDefinitions.filter((action) => action.runtime === 'live');
const customTitleActions = new Set<BotCommerceActionType>(['TEXT', 'URL', 'SUBMENU']);
const fixedTitles: Partial<Record<BotCommerceActionType, string>> = {
  CATALOG: '🛍 محصولات',
  SEARCH: '🔎 جستجوی محصول',
  CART: '🛒 سبد خرید',
  ORDERS: '📦 سفارش‌های من',
  TRACK_ORDER: '🚚 پیگیری سفارش',
  ACCOUNT: '👤 حساب کاربری',
  WALLET: '💳 کیف پول',
  MY_SERVICES: '📦 سرویس‌های من',
  PRICING: '💰 تعرفه‌ها',
  REFERRAL: '👥 زیرمجموعه‌گیری',
  TUTORIAL: '📚 آموزش',
  SUPPORT: '☎️ پشتیبانی',
};

function cloneTemplate(template: BotCommerceTemplate): BotCommerceTemplate { return JSON.parse(JSON.stringify(template)); }
function cleanTitle(value: string) { return value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/[^\p{L}\p{N}]+/gu, '').toLocaleLowerCase('fa-IR'); }
const reservedTitles = new Set([
  ...Object.values(fixedTitles).filter(Boolean).map((value) => cleanTitle(value!)),
  ...botCommerceActionDefinitions.filter((action) => !customTitleActions.has(action.key)).map((action) => cleanTitle(action.labelFa)),
]);
function sortNodes(nodes: BotCommerceMenuNode[]) { return [...nodes].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)); }

function normalizeForSimpleUi(source: BotCommerceTemplate) {
  const next = cloneTemplate(source);
  let changed = false;
  next.menu = next.menu.map((node) => {
    const action = getBotCommerceAction(node.actionType);
    const fixed = fixedTitles[node.actionType];
    let updated = node;
    if (fixed && node.title !== fixed) { updated = { ...updated, title: fixed }; changed = true; }
    if (action?.runtime === 'foundation' && node.enabled) { updated = { ...updated, enabled: false }; changed = true; }
    return updated;
  });
  return { template: next, changed };
}

async function request<T>(init?: RequestInit) {
  const response = await fetch('/api/bot-commerce', { ...init, cache: 'no-store', headers: { accept: 'application/json', ...(init?.headers ?? {}) } });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  return { response, data };
}

export default function SimpleBotCommerceBuilder() {
  const [data, setData] = useState<ApiData | null>(null);
  const [template, setTemplate] = useState<BotCommerceTemplate>(() => cloneTemplate(defaultBotCommerceTemplate));
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeOk, setNoticeOk] = useState(false);
  const [form, setForm] = useState<{ actionType: BotCommerceActionType; title: string; value: string; parentId: string }>({ actionType: 'CATALOG', title: '', value: '', parentId: '' });

  const load = useCallback(async () => {
    const { response, data: next } = await request<ApiData>();
    if (response.status === 401) { window.location.assign('/login'); return; }
    if (!response.ok) throw new Error(next.message || 'load_failed');
    setData(next);
    const loaded = next.botCommerce?.draft ?? next.botCommerce?.published ?? defaultBotCommerceTemplate;
    const normalized = normalizeForSimpleUi(loaded);
    const totalBots = Object.values(next.providers ?? {}).flat().filter((bot) => bot.status === 'ACTIVE');
    if (!normalized.template.targets.some((target) => target.enabled) && totalBots.length === 1) {
      const provider = (Object.keys(next.providers) as BotCommerceProvider[]).find((key) => next.providers[key].some((bot) => bot.id === totalBots[0].id));
      if (provider) {
        normalized.template.targets = [{ provider, botId: totalBots[0].id, enabled: true }];
        normalized.changed = true;
      }
    }
    setTemplate(normalized.template);
    setDirty(normalized.changed);
    if (normalized.changed) {
      setNotice('چند تنظیم قدیمی برای جلوگیری از رفتار اشتباه منو اصلاح شد.');
      setNoticeOk(true);
    }
  }, []);

  useEffect(() => { void load().catch(() => { setNotice('اطلاعات ربات فروش دریافت نشد.'); setNoticeOk(false); }); }, [load]);

  function update(next: BotCommerceTemplate) { setTemplate(next); setDirty(true); setNotice(''); }
  function patchNode(id: string, patch: Partial<BotCommerceMenuNode>) { update({ ...template, menu: template.menu.map((node) => node.id === id ? { ...node, ...patch } : node) }); }

  function changeNodeAction(node: BotCommerceMenuNode, actionType: BotCommerceActionType) {
    const action = getBotCommerceAction(actionType);
    const fixed = fixedTitles[actionType];
    patchNode(node.id, {
      actionType,
      title: fixed ?? (customTitleActions.has(actionType) ? node.title : action?.labelFa ?? node.title),
      actionValue: action?.valueKind === 'none' ? null : node.actionValue,
      enabled: action?.runtime === 'live',
    });
  }

  function removeNode(id: string) {
    const node = template.menu.find((item) => item.id === id);
    if (!node || !window.confirm(`گزینه «${node.title}» حذف شود؟`)) return;
    update({ ...template, menu: template.menu.filter((item) => item.id !== id).map((item) => item.parentId === id ? { ...item, parentId: null } : item) });
  }

  const visibleMenu = useMemo(() => template.menu.filter((node) => getBotCommerceAction(node.actionType)?.runtime === 'live'), [template.menu]);
  const roots = useMemo(() => sortNodes(visibleMenu.filter((node) => !node.parentId)), [visibleMenu]);
  const children = useMemo(() => {
    const map = new Map<string, BotCommerceMenuNode[]>();
    for (const node of visibleMenu) if (node.parentId) map.set(node.parentId, [...(map.get(node.parentId) ?? []), node]);
    for (const [key, rows] of map) map.set(key, sortNodes(rows));
    return map;
  }, [visibleMenu]);
  const selectedTargets = template.targets.filter((target) => target.enabled).length;
  const currentAction = getBotCommerceAction(form.actionType);

  function toggleTarget(provider: BotCommerceProvider, bot: ProviderBot, enabled: boolean) {
    const found = template.targets.some((target) => target.provider === provider && target.botId === bot.id);
    const targets = found
      ? template.targets.map((target) => target.provider === provider && target.botId === bot.id ? { ...target, enabled } : target)
      : [...template.targets, { provider, botId: bot.id, enabled }];
    update({ ...template, targets });
  }

  function validateCustomTitle(actionType: BotCommerceActionType, title: string) {
    if (!customTitleActions.has(actionType)) return true;
    const clean = cleanTitle(title);
    if (!clean) { setNotice('نام دکمه را وارد کن.'); setNoticeOk(false); return false; }
    if (reservedTitles.has(clean)) {
      setNotice('این عنوان برای یک عملکرد آماده رزرو شده است. برای جلوگیری از اشتباه، نام دیگری انتخاب کن.');
      setNoticeOk(false);
      return false;
    }
    return true;
  }

  function addNode(event: FormEvent) {
    event.preventDefault();
    const action = getBotCommerceAction(form.actionType);
    const title = fixedTitles[form.actionType] ?? form.title.trim();
    if (!title || !validateCustomTitle(form.actionType, title)) return;
    if (action?.valueKind === 'url' && !form.value.trim()) { setNotice('آدرس لینک را وارد کن.'); setNoticeOk(false); return; }
    if (form.actionType === 'TEXT' && !form.value.trim()) { setNotice('متن این دکمه را وارد کن.'); setNoticeOk(false); return; }
    const parentId = form.parentId || null;
    const siblings = template.menu.filter((node) => node.parentId === parentId);
    const node: BotCommerceMenuNode = {
      id: crypto.randomUUID(), parentId, title: title.slice(0, 64), actionType: form.actionType,
      actionValue: action?.valueKind === 'none' ? null : (form.value.trim() || null),
      sortOrder: Math.max(0, ...siblings.map((item) => item.sortOrder)) + 10, enabled: true,
    };
    update({ ...template, menu: [...template.menu, node] });
    setForm({ actionType: 'CATALOG', title: '', value: '', parentId: '' });
  }

  function validateTemplate() {
    for (const node of template.menu) {
      if (customTitleActions.has(node.actionType) && reservedTitles.has(cleanTitle(node.title))) {
        setNotice(`عنوان «${node.title}» با عملکردش هماهنگ نیست. نام دکمه را تغییر بده.`); setNoticeOk(false); return false;
      }
      const action = getBotCommerceAction(node.actionType);
      if (node.enabled && action?.runtime !== 'live') { setNotice(`گزینه «${node.title}» هنوز آماده انتشار نیست.`); setNoticeOk(false); return false; }
      if (node.enabled && node.actionType === 'URL' && !node.actionValue?.trim()) { setNotice(`برای «${node.title}» لینک وارد کن.`); setNoticeOk(false); return false; }
      if (node.enabled && node.actionType === 'TEXT' && !node.actionValue?.trim()) { setNotice(`برای «${node.title}» متن وارد کن.`); setNoticeOk(false); return false; }
    }
    if (selectedTargets === 0) { setNotice('حداقل یک ربات را برای انتشار انتخاب کن.'); setNoticeOk(false); return false; }
    return true;
  }

  async function save(publish: boolean) {
    if (publish && !validateTemplate()) return;
    setBusy(true); setNotice(''); setNoticeOk(false);
    try {
      const { response, data: next } = await request<ApiData>({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: publish ? 'publish' : 'save_draft', template }) });
      if (!response.ok) { setNotice(next.message || 'ذخیره انجام نشد.'); return; }
      setData(next);
      const saved = next.botCommerce?.draft ?? template;
      setTemplate(cloneTemplate(saved));
      setDirty(false);
      setNotice(publish ? 'منو ذخیره و روی ربات‌های انتخاب‌شده منتشر شد.' : 'تغییرات ذخیره شد.');
      setNoticeOk(true);
    } catch { setNotice('ارتباط با بخش ربات فروش برقرار نشد.'); }
    finally { setBusy(false); }
  }

  return <div className="simple-bot" dir="rtl"><style>{styles}</style><main>
    <header><div><a href="/app">← داشبورد</a><h1>ربات فروش</h1><p>منو را ساده بساز: انتخاب کن هر دکمه چه کاری انجام دهد؛ عنوان عملکردهای اصلی خودکار تنظیم می‌شود تا اشتباه نشود.</p></div><a className="store-link" href="/app/store">محصولات</a></header>
    {notice && <div className={`notice ${noticeOk ? 'ok' : ''}`}>{notice}</div>}

    <section className="card targets"><div className="section-title"><div><span>مرحله ۱</span><h2>کدام ربات؟</h2></div><b>{selectedTargets.toLocaleString('fa-IR')} انتخاب</b></div><div className="target-list">{(['telegram','bale','rubika'] as BotCommerceProvider[]).map((provider) => (data?.providers?.[provider] ?? []).filter((bot) => bot.status === 'ACTIVE').map((bot) => { const checked = template.targets.some((target) => target.provider === provider && target.botId === bot.id && target.enabled); return <label key={`${provider}:${bot.id}`}><input type="checkbox" checked={checked} onChange={(event) => toggleTarget(provider, bot, event.target.checked)} /><span><b>{bot.displayName || bot.username || bot.externalId}</b><small>{providerLabels[provider]}{bot.username ? ` · @${bot.username}` : ''}</small></span></label>; }))}</div>{data && Object.values(data.providers).flat().filter((bot) => bot.status === 'ACTIVE').length === 0 && <div className="empty">اول یک ربات را متصل کن.</div>}</section>

    <section className="card welcome"><div className="section-title"><div><span>مرحله ۲</span><h2>پیام شروع</h2></div></div><textarea rows={4} maxLength={4000} value={template.welcomeMessage} onChange={(event) => update({ ...template, welcomeMessage: event.target.value })} placeholder="مثلاً: سلام! خوش آمدید. از منوی زیر انتخاب کنید." /></section>

    <section className="menu-layout">
      <article className="card menu-card"><div className="section-title"><div><span>مرحله ۳</span><h2>دکمه‌های منو</h2></div><b>{visibleMenu.length.toLocaleString('fa-IR')}</b></div>
        <div className="menu-list">{roots.length === 0 ? <div className="empty">هنوز دکمه‌ای نداری.</div> : roots.map((node) => <div className="menu-node" key={node.id}><div className="node-row"><span className="node-name"><b>{node.title}</b><small>{getBotCommerceAction(node.actionType)?.descriptionFa}</small></span><select value={node.actionType} onChange={(event) => changeNodeAction(node, event.target.value as BotCommerceActionType)}>{liveActions.map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select><button className="danger" onClick={() => removeNode(node.id)}>حذف</button></div>{customTitleActions.has(node.actionType) && <div className="node-extra"><label>نام دکمه<input value={node.title} maxLength={64} onChange={(event) => patchNode(node.id, { title: event.target.value })} /></label>{getBotCommerceAction(node.actionType)?.valueKind !== 'none' && <label>{node.actionType === 'URL' ? 'لینک' : 'متن'}<textarea rows={2} value={node.actionValue ?? ''} onChange={(event) => patchNode(node.id, { actionValue: event.target.value })} /></label>}</div>}{node.actionType === 'SUPPORT' && <div className="node-extra"><label>متن پشتیبانی<textarea rows={2} value={node.actionValue ?? ''} onChange={(event) => patchNode(node.id, { actionValue: event.target.value })} /></label></div>}{node.actionType === 'SUBMENU' && <button className="child-add" onClick={() => setForm({ actionType: 'CATALOG', title: '', value: '', parentId: node.id })}>+ افزودن زیرگزینه</button>}{(children.get(node.id) ?? []).map((child) => <div className="child-row" key={child.id}><span><b>{child.title}</b><small>زیر «{node.title}»</small></span><select value={child.actionType} onChange={(event) => changeNodeAction(child, event.target.value as BotCommerceActionType)}>{liveActions.filter((action) => action.key !== 'SUBMENU').map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select><button className="danger" onClick={() => removeNode(child.id)}>حذف</button></div>)}</div>)}</div>
      </article>

      <article className="card add-card" id="add-button"><div className="section-title"><div><span>{form.parentId ? 'زیرگزینه جدید' : 'دکمه جدید'}</span><h2>{form.parentId ? `زیر «${template.menu.find((node) => node.id === form.parentId)?.title ?? 'منو'}»` : 'چه کاری انجام دهد؟'}</h2></div>{form.parentId && <button className="cancel-parent" onClick={() => setForm({ ...form, parentId: '' })}>لغو</button>}</div><form onSubmit={addNode}><label>عملکرد<select value={form.actionType} onChange={(event) => setForm({ actionType: event.target.value as BotCommerceActionType, title: '', value: '', parentId: form.parentId })}>{liveActions.filter((action) => !form.parentId || action.key !== 'SUBMENU').map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select></label>{!customTitleActions.has(form.actionType) && <div className="auto-title"><small>نام دکمه خودکار</small><b>{fixedTitles[form.actionType] ?? currentAction?.labelFa}</b></div>}{customTitleActions.has(form.actionType) && <label>نام دکمه<input value={form.title} maxLength={64} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={form.actionType === 'URL' ? 'مثلاً سایت ما' : form.actionType === 'SUBMENU' ? 'مثلاً راهنما' : 'مثلاً درباره ما'} required /></label>}{currentAction?.valueKind !== 'none' && <label>{currentAction.valueKind === 'url' ? 'آدرس لینک' : 'متن'}<textarea rows={3} value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} /></label>}<button className="primary" disabled={busy}>افزودن دکمه</button></form></article>
    </section>

    <section className="save-bar"><span>{dirty ? 'تغییرات ذخیره‌نشده داری' : 'همه تغییرات ذخیره شده'}</span><div><button disabled={busy || !dirty} onClick={() => void save(false)}>فقط ذخیره</button><button className="primary" disabled={busy || selectedTargets === 0} onClick={() => void save(true)}>{busy ? 'در حال انجام...' : 'ذخیره و انتشار'}</button></div></section>
  </main></div>;
}

const styles = `
.simple-bot{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.simple-bot *{box-sizing:border-box}.simple-bot main{max-width:1120px;margin:auto;padding:34px 20px 120px}.simple-bot header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:20px}.simple-bot header>a:first-child{color:#7f8c9f;text-decoration:none;font-size:11px}.simple-bot header h1{font-size:32px;margin:8px 0 6px}.simple-bot header p{margin:0;color:#8592a5;line-height:1.9;max-width:720px}.store-link{background:#141b25;border:1px solid #293447;color:#dce3ed;text-decoration:none;border-radius:11px;padding:10px 13px;font-size:11px;font-weight:800}.card{border:1px solid #232d3c;background:#0d131c;border-radius:17px;padding:18px}.notice{margin-bottom:13px;padding:12px 14px;border-radius:12px;background:#25151a;border:1px solid #60323b;color:#ffc1cb;font-size:12px}.notice.ok{background:#0d241b;border-color:#245b46;color:#9de5c7}.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:13px}.section-title span{font-size:10px;color:#788599}.section-title h2{font-size:20px;margin:4px 0}.section-title>b{font-size:10px;color:#95a2b4}.targets{margin-bottom:12px}.target-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.target-list label{display:flex;align-items:center;gap:9px;border:1px solid #273245;background:#090f17;border-radius:12px;padding:11px;cursor:pointer}.target-list span{display:grid;gap:3px}.target-list b{font-size:11px}.target-list small{font-size:9px;color:#758296}.welcome{margin-bottom:12px}.welcome textarea,.node-extra textarea,.node-extra input,.node-row select,.child-row select,.add-card input,.add-card select,.add-card textarea{width:100%;border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:11px;outline:none}.menu-layout{display:grid;grid-template-columns:1.35fr .65fr;gap:12px}.menu-list{display:grid;gap:8px}.menu-node{border:1px solid #253043;background:#090f17;border-radius:13px;padding:10px}.node-row{display:grid;grid-template-columns:1fr 170px auto;gap:8px;align-items:center}.node-name{display:grid;gap:4px}.node-name b,.child-row b{font-size:12px}.node-name small,.child-row small{color:#748195;font-size:9px;line-height:1.5}.simple-bot button{border:0;border-radius:10px;padding:10px 12px;background:#17202d;color:#d9e0ea;font:800 10px inherit;cursor:pointer}.simple-bot button:disabled{opacity:.48;cursor:not-allowed}.simple-bot .primary{background:#f4f6fa;color:#080b10}.danger{color:#ffb4c0!important}.node-extra{margin-top:8px;padding-top:8px;border-top:1px solid #202938;display:grid;grid-template-columns:180px 1fr;gap:8px}.node-extra label,.add-card label{display:grid;gap:6px;color:#a6b1c0;font-size:10px}.child-add{margin-top:8px}.child-row{margin-top:7px;margin-right:22px;padding:8px;border-right:2px solid #344159;display:grid;grid-template-columns:1fr 150px auto;gap:7px;align-items:center}.child-row span{display:grid;gap:3px}.add-card{align-self:start;position:sticky;top:18px}.add-card form{display:grid;gap:10px}.auto-title{padding:11px;border:1px solid #273245;background:#101722;border-radius:10px;display:grid;gap:4px}.auto-title small{color:#7b8799;font-size:9px}.auto-title b{font-size:12px}.cancel-parent{padding:7px 9px!important}.empty{padding:22px;text-align:center;color:#6e7b8e;border:1px dashed #2a3445;border-radius:11px}.save-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(900px,calc(100vw - 24px));z-index:80;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.97);box-shadow:0 16px 50px rgba(0,0,0,.42)}.save-bar>span{font-size:10px;color:#8996a8}.save-bar>div{display:flex;gap:7px}
@media(max-width:820px){.menu-layout{grid-template-columns:1fr}.add-card{position:static}.target-list{grid-template-columns:1fr 1fr}}@media(max-width:600px){.simple-bot main{padding:24px 13px 120px}.simple-bot header{display:grid}.target-list{grid-template-columns:1fr}.node-row,.child-row{grid-template-columns:1fr}.child-row{margin-right:10px}.node-extra{grid-template-columns:1fr}.save-bar{align-items:stretch;flex-direction:column}.save-bar>div{display:grid;grid-template-columns:1fr 1fr}.save-bar button{width:100%}}
`;
