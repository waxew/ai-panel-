/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { botCommerceActionDefinitions, defaultBotCommerceTemplate, getBotCom… را از ماژول «@ai-panel/shared» وارد می‌کند تا در این فایل قابل استفاده باشد.
import {
  botCommerceActionDefinitions,
  defaultBotCommerceTemplate,
  getBotCommerceAction,
  type BotCommerceActionType,
  type BotCommerceMenuNode,
  type BotCommerceProvider,
  type BotCommerceTemplate,
} from '@ai-panel/shared';
// راهنما: این دستور { useCallback, useEffect, useMemo, useState, type FormEvent } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

// راهنما: این Type با نام «ProviderBot» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ProviderBot = { id: string; externalId: string; username?: string | null; displayName?: string | null; status: string };
// راهنما: این Type با نام «Engine» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Engine = { draft?: BotCommerceTemplate | null; published?: BotCommerceTemplate | null; version?: number };
// راهنما: این Type با نام «ApiData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ApiData = {
  ok: boolean;
  message?: string;
  store: { id: string; name: string } | null;
  botCommerce: Engine | null;
  providers: Record<BotCommerceProvider, ProviderBot[]>;
};

// راهنما: این دستور متغیر/ثابت «providerLabels» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const providerLabels: Record<BotCommerceProvider, string> = { telegram: 'تلگرام', bale: 'بله', rubika: 'روبیکا' };
// راهنما: این دستور متغیر/ثابت «liveActions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const liveActions = botCommerceActionDefinitions.filter((action) => action.runtime === 'live');
// راهنما: این دستور متغیر/ثابت «customTitleActions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const customTitleActions = new Set<BotCommerceActionType>(['TEXT', 'URL', 'SUBMENU']);
// راهنما: این دستور متغیر/ثابت «fixedTitles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
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

// راهنما: این تابع «cloneTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cloneTemplate(template: BotCommerceTemplate): BotCommerceTemplate { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «JSON.parse(JSON.stringify(template))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return JSON.parse(JSON.stringify(template)); }
// راهنما: این تابع «cleanTitle» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanTitle(value: string) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/[^\p{L}\…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/[^\p{L}\p{N}]+/gu, '').toLocaleLowerCase('fa-IR'); }
// راهنما: این دستور متغیر/ثابت «reservedTitles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const reservedTitles = new Set([
  ...Object.values(fixedTitles).filter(Boolean).map((value) => cleanTitle(value!)),
  ...botCommerceActionDefinitions.filter((action) => !customTitleActions.has(action.key)).map((action) => cleanTitle(action.labelFa)),
]);
// راهنما: این تابع «sortNodes» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function sortNodes(nodes: BotCommerceMenuNode[]) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[...nodes].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompa…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [...nodes].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)); }

// راهنما: این تابع «normalizeForSimpleUi» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeForSimpleUi(source: BotCommerceTemplate) {
  // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const next = cloneTemplate(source);
  // راهنما: این دستور متغیر/ثابت «changed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let changed = false;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «next.menu = next.menu.map((node) => { const action = getBotCommerceAction(node.actionType…».
  next.menu = next.menu.map((node) => {
    // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const action = getBotCommerceAction(node.actionType);
    // راهنما: این دستور متغیر/ثابت «fixed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const fixed = fixedTitles[node.actionType];
    // راهنما: این دستور متغیر/ثابت «updated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let updated = node;
    // راهنما: این شرط بررسی می‌کند آیا «fixed && node.title !== fixed» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (fixed && node.title !== fixed) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «updated = { ...updated, title: fixed }». */ updated = { ...updated, title: fixed }; /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «changed = true». */ changed = true; }
    // راهنما: این شرط بررسی می‌کند آیا «action?.runtime === 'foundation' && node.enabled» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action?.runtime === 'foundation' && node.enabled) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «updated = { ...updated, enabled: false }». */ updated = { ...updated, enabled: false }; /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «changed = true». */ changed = true; }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «updated» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return updated;
  });
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ template: next, changed }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { template: next, changed };
}

// راهنما: این تابع «request» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function request<T>(init?: RequestInit) {
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch('/api/bot-commerce', { ...init, cache: 'no-store', headers: { accept: 'application/json', ...(init?.headers ?? {}) } });
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ response, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { response, data };
}

// راهنما: این تابع «SimpleBotCommerceBuilder» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function SimpleBotCommerceBuilder() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<ApiData | null>(null);
  // راهنما: این دستور متغیر/ثابت «[template, setTemplate]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [template, setTemplate] = useState<BotCommerceTemplate>(() => cloneTemplate(defaultBotCommerceTemplate));
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[dirty, setDirty]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [dirty, setDirty] = useState(false);
  // راهنما: این دستور State محلی React برای «[notice, setNotice]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [notice, setNotice] = useState('');
  // راهنما: این دستور State محلی React برای «[noticeOk, setNoticeOk]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [noticeOk, setNoticeOk] = useState(false);
  // راهنما: این دستور متغیر/ثابت «[form, setForm]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [form, setForm] = useState<{ actionType: BotCommerceActionType; title: string; value: string; parentId: string }>({ actionType: 'CATALOG', title: '', value: '', parentId: '' });

  // راهنما: این دستور تابع «load» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.
  const load = useCallback(async () => {
    // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { response, data: next } = await request<ApiData>();
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.assign('/login')». */ window.location.assign('/login'); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(next.message || 'load_failed');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
    setData(next);
    // راهنما: این دستور متغیر/ثابت «loaded» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const loaded = next.botCommerce?.draft ?? next.botCommerce?.published ?? defaultBotCommerceTemplate;
    // راهنما: این دستور متغیر/ثابت «normalized» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const normalized = normalizeForSimpleUi(loaded);
    // راهنما: این دستور متغیر/ثابت «totalBots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const totalBots = Object.values(next.providers ?? {}).flat().filter((bot) => bot.status === 'ACTIVE');
    // راهنما: این شرط بررسی می‌کند آیا «!normalized.template.targets.some((target) => target.enabled) && totalBots.leng…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!normalized.template.targets.some((target) => target.enabled) && totalBots.length === 1) {
      // راهنما: این دستور متغیر/ثابت «provider» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const provider = (Object.keys(next.providers) as BotCommerceProvider[]).find((key) => next.providers[key].some((bot) => bot.id === totalBots[0].id));
      // راهنما: این شرط بررسی می‌کند آیا «provider» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (provider) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «normalized.template.targets = [{ provider, botId: totalBots[0].id, enabled: true }]».
        normalized.template.targets = [{ provider, botId: totalBots[0].id, enabled: true }];
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «normalized.changed = true».
        normalized.changed = true;
      }
    }
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(normalized.template)».
    setTemplate(normalized.template);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(normalized.changed)».
    setDirty(normalized.changed);
    // راهنما: این شرط بررسی می‌کند آیا «normalized.changed» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (normalized.changed) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('چند تنظیم قدیمی برای جلوگیری از رفتار اشتباه منو اصلاح شد.')».
      setNotice('چند تنظیم قدیمی برای جلوگیری از رفتار اشتباه منو اصلاح شد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(true)».
      setNoticeOk(true);
    }
  }, []);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch(() => { setNotice('اطلاعات ربات فروش دریافت نشد.'); setNoticeOk(false);…». */ void load().catch(() => { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('اطلاعات ربات فروش دریافت نشد.')». */ setNotice('اطلاعات ربات فروش دریافت نشد.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); }); }, [load]);

  // راهنما: این تابع «update» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function update(next: BotCommerceTemplate) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(next)». */ setTemplate(next); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(true)». */ setDirty(true); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')». */ setNotice(''); }
  // راهنما: این تابع «patchNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function patchNode(id: string, patch: Partial<BotCommerceMenuNode>) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: template.menu.map((node) => node.id === id ? { ...node, ...pa…». */ update({ ...template, menu: template.menu.map((node) => node.id === id ? { ...node, ...patch } : node) }); }

  // راهنما: این تابع «changeNodeAction» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function changeNodeAction(node: BotCommerceMenuNode, actionType: BotCommerceActionType) {
    // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const action = getBotCommerceAction(actionType);
    // راهنما: این دستور متغیر/ثابت «fixed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const fixed = fixedTitles[actionType];
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patchNode(node.id, { actionType, title: fixed ?? (customTitleActions.has(actionType) ? no…».
    patchNode(node.id, {
      actionType,
      title: fixed ?? (customTitleActions.has(actionType) ? node.title : action?.labelFa ?? node.title),
      actionValue: action?.valueKind === 'none' ? null : node.actionValue,
      enabled: action?.runtime === 'live',
    });
  }

  // راهنما: این تابع «removeNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function removeNode(id: string) {
    // راهنما: این دستور متغیر/ثابت «node» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const node = template.menu.find((item) => item.id === id);
    // راهنما: این شرط بررسی می‌کند آیا «!node || !window.confirm(`گزینه «${node.title}» حذف شود؟`)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!node || !window.confirm(`گزینه «${node.title}» حذف شود؟`)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: template.menu.filter((item) => item.id !== id).map((item) => …».
    update({ ...template, menu: template.menu.filter((item) => item.id !== id).map((item) => item.parentId === id ? { ...item, parentId: null } : item) });
  }

  // راهنما: این دستور مقدار «visibleMenu» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const visibleMenu = useMemo(() => template.menu.filter((node) => getBotCommerceAction(node.actionType)?.runtime === 'live'), [template.menu]);
  // راهنما: این دستور مقدار «roots» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const roots = useMemo(() => sortNodes(visibleMenu.filter((node) => !node.parentId)), [visibleMenu]);
  // راهنما: این دستور مقدار «children» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const children = useMemo(() => {
    // راهنما: این دستور متغیر/ثابت «map» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const map = new Map<string, BotCommerceMenuNode[]>();
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const node of visibleMenu) /* راهنما: این شرط بررسی می‌کند آیا «node.parentId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (node.parentId) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(node.parentId, [...(map.get(node.parentId) ?? []), node])». */ map.set(node.parentId, [...(map.get(node.parentId) ?? []), node]);
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const [key, rows] of map) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(key, sortNodes(rows))». */ map.set(key, sortNodes(rows));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «map» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return map;
  }, [visibleMenu]);
  // راهنما: این دستور متغیر/ثابت «selectedTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const selectedTargets = template.targets.filter((target) => target.enabled).length;
  // راهنما: این دستور متغیر/ثابت «currentAction» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const currentAction = getBotCommerceAction(form.actionType);

  // راهنما: این تابع «toggleTarget» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function toggleTarget(provider: BotCommerceProvider, bot: ProviderBot, enabled: boolean) {
    // راهنما: این دستور متغیر/ثابت «found» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const found = template.targets.some((target) => target.provider === provider && target.botId === bot.id);
    // راهنما: این دستور متغیر/ثابت «targets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const targets = found
      ? template.targets.map((target) => target.provider === provider && target.botId === bot.id ? { ...target, enabled } : target)
      : [...template.targets, { provider, botId: bot.id, enabled }];
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, targets })».
    update({ ...template, targets });
  }

  // راهنما: این تابع «validateCustomTitle» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function validateCustomTitle(actionType: BotCommerceActionType, title: string) {
    // راهنما: این شرط بررسی می‌کند آیا «!customTitleActions.has(actionType)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!customTitleActions.has(actionType)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return true;
    // راهنما: این دستور متغیر/ثابت «clean» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const clean = cleanTitle(title);
    // راهنما: این شرط بررسی می‌کند آیا «!clean» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!clean) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('نام دکمه را وارد کن.')». */ setNotice('نام دکمه را وارد کن.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
    // راهنما: این شرط بررسی می‌کند آیا «reservedTitles.has(clean)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (reservedTitles.has(clean)) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('این عنوان برای یک عملکرد آماده رزرو شده است. برای جلوگیری از اشتباه، نام دیگری…».
      setNotice('این عنوان برای یک عملکرد آماده رزرو شده است. برای جلوگیری از اشتباه، نام دیگری انتخاب کن.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)».
      setNoticeOk(false);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return false;
    }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return true;
  }

  // راهنما: این تابع «addNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function addNode(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const action = getBotCommerceAction(form.actionType);
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = fixedTitles[form.actionType] ?? form.title.trim();
    // راهنما: این شرط بررسی می‌کند آیا «!title || !validateCustomTitle(form.actionType, title)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title || !validateCustomTitle(form.actionType, title)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این شرط بررسی می‌کند آیا «action?.valueKind === 'url' && !form.value.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action?.valueKind === 'url' && !form.value.trim()) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('آدرس لینک را وارد کن.')». */ setNotice('آدرس لینک را وارد کن.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این شرط بررسی می‌کند آیا «form.actionType === 'TEXT' && !form.value.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (form.actionType === 'TEXT' && !form.value.trim()) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('متن این دکمه را وارد کن.')». */ setNotice('متن این دکمه را وارد کن.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این دستور متغیر/ثابت «parentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const parentId = form.parentId || null;
    // راهنما: این دستور متغیر/ثابت «siblings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const siblings = template.menu.filter((node) => node.parentId === parentId);
    // راهنما: این دستور متغیر/ثابت «node» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const node: BotCommerceMenuNode = {
      id: crypto.randomUUID(), parentId, title: title.slice(0, 64), actionType: form.actionType,
      actionValue: action?.valueKind === 'none' ? null : (form.value.trim() || null),
      sortOrder: Math.max(0, ...siblings.map((item) => item.sortOrder)) + 10, enabled: true,
    };
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: [...template.menu, node] })».
    update({ ...template, menu: [...template.menu, node] });
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setForm({ actionType: 'CATALOG', title: '', value: '', parentId: '' })».
    setForm({ actionType: 'CATALOG', title: '', value: '', parentId: '' });
  }

  // راهنما: این تابع «validateTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function validateTemplate() {
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const node of template.menu) {
      // راهنما: این شرط بررسی می‌کند آیا «customTitleActions.has(node.actionType) && reservedTitles.has(cleanTitle(node.t…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (customTitleActions.has(node.actionType) && reservedTitles.has(cleanTitle(node.title))) {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(`عنوان «${node.title}» با عملکردش هماهنگ نیست. نام دکمه را تغییر بده.`)».
        setNotice(`عنوان «${node.title}» با عملکردش هماهنگ نیست. نام دکمه را تغییر بده.`); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
      }
      // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const action = getBotCommerceAction(node.actionType);
      // راهنما: این شرط بررسی می‌کند آیا «node.enabled && action?.runtime !== 'live'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (node.enabled && action?.runtime !== 'live') { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(`گزینه «${node.title}» هنوز آماده انتشار نیست.`)». */ setNotice(`گزینه «${node.title}» هنوز آماده انتشار نیست.`); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
      // راهنما: این شرط بررسی می‌کند آیا «node.enabled && node.actionType === 'URL' && !node.actionValue?.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (node.enabled && node.actionType === 'URL' && !node.actionValue?.trim()) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(`برای «${node.title}» لینک وارد کن.`)». */ setNotice(`برای «${node.title}» لینک وارد کن.`); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
      // راهنما: این شرط بررسی می‌کند آیا «node.enabled && node.actionType === 'TEXT' && !node.actionValue?.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (node.enabled && node.actionType === 'TEXT' && !node.actionValue?.trim()) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(`برای «${node.title}» متن وارد کن.`)». */ setNotice(`برای «${node.title}» متن وارد کن.`); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
    }
    // راهنما: این شرط بررسی می‌کند آیا «selectedTargets === 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (selectedTargets === 0) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('حداقل یک ربات را برای انتشار انتخاب کن.')». */ setNotice('حداقل یک ربات را برای انتشار انتخاب کن.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return true;
  }

  // راهنما: این تابع «save» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function save(publish: boolean) {
    // راهنما: این شرط بررسی می‌کند آیا «publish && !validateTemplate()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (publish && !validateTemplate()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')». */ setNotice(''); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)». */ setNoticeOk(false);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: next } = await request<ApiData>({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: publish ? 'publish' : 'save_draft', template }) });
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(next.message || 'ذخیره انجام نشد.')». */ setNotice(next.message || 'ذخیره انجام نشد.'); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این دستور متغیر/ثابت «saved» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const saved = next.botCommerce?.draft ?? template;
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(cloneTemplate(saved))».
      setTemplate(cloneTemplate(saved));
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
      setDirty(false);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(publish ? 'منو ذخیره و روی ربات‌های انتخاب‌شده منتشر شد.' : 'تغییرات ذخیره شد.')».
      setNotice(publish ? 'منو ذخیره و روی ربات‌های انتخاب‌شده منتشر شد.' : 'تغییرات ذخیره شد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(true)».
      setNoticeOk(true);
    } catch { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('ارتباط با بخش ربات فروش برقرار نشد.')». */ setNotice('ارتباط با بخش ربات فروش برقرار نشد.'); }
    finally { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)». */ setBusy(false); }
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="simple-bot" dir="rtl"><style>{styles}</style><main> <heade…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="simple-bot" dir="rtl"><style>{styles}</style><main>
    <header><div><a href="/app">← داشبورد</a><h1>ربات فروش</h1><p>منو را ساده بساز: انتخاب کن هر دکمه چه کاری انجام دهد؛ عنوان عملکردهای اصلی خودکار تنظیم می‌شود تا اشتباه نشود.</p></div><a className="store-link" href="/app/store">محصولات</a></header>
    {notice && <div className={`notice ${noticeOk ? 'ok' : ''}`}>{notice}</div>}

    <section className="card targets"><div className="section-title"><div><span>مرحله ۱</span><h2>کدام ربات؟</h2></div><b>{selectedTargets.toLocaleString('fa-IR')} انتخاب</b></div><div className="target-list">{(['telegram','bale','rubika'] as BotCommerceProvider[]).map((provider) => (data?.providers?.[provider] ?? []).filter((bot) => bot.status === 'ACTIVE').map((bot) => { /* راهنما: این دستور متغیر/ثابت «checked» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const checked = template.targets.some((target) => target.provider === provider && target.botId === bot.id && target.enabled); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<label key={`${provider}:${bot.id}`}><input type="checkbox" checked={check…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <label key={`${provider}:${bot.id}`}><input type="checkbox" checked={checked} onChange={(event) => toggleTarget(provider, bot, event.target.checked)} /><span><b>{bot.displayName || bot.username || bot.externalId}</b><small>{providerLabels[provider]}{bot.username ? ` · @${bot.username}` : ''}</small></span></label>; }))}</div>{data && Object.values(data.providers).flat().filter((bot) => bot.status === 'ACTIVE').length === 0 && <div className="empty">اول یک ربات را متصل کن.</div>}</section>

    <section className="card welcome"><div className="section-title"><div><span>مرحله ۲</span><h2>پیام شروع</h2></div></div><textarea rows={4} maxLength={4000} value={template.welcomeMessage} onChange={(event) => update({ ...template, welcomeMessage: event.target.value })} placeholder="مثلاً: سلام! خوش آمدید. از منوی زیر انتخاب کنید." /></section>

    <section className="menu-layout">
      <article className="card menu-card"><div className="section-title"><div><span>مرحله ۳</span><h2>دکمه‌های منو</h2></div><b>{visibleMenu.length.toLocaleString('fa-IR')}</b></div>
        <div className="menu-list">{roots.length === 0 ? <div className="empty">هنوز دکمه‌ای نداری.</div> : roots.map((node) => <div className="menu-node" key={node.id}><div className="node-row"><span className="node-name"><b>{node.title}</b><small>{getBotCommerceAction(node.actionType)?.descriptionFa}</small></span><select value={node.actionType} onChange={(event) => changeNodeAction(node, event.target.value as BotCommerceActionType)}>{liveActions.map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select><button className="danger" onClick={() => removeNode(node.id)}>حذف</button></div>{customTitleActions.has(node.actionType) && <div className="node-extra"><label>نام دکمه<input value={node.title} maxLength={64} onChange={(event) => patchNode(node.id, { title: event.target.value })} /></label>{getBotCommerceAction(node.actionType)?.valueKind !== 'none' && <label>{node.actionType === 'URL' ? 'لینک' : 'متن'}<textarea rows={2} value={node.actionValue ?? ''} onChange={(event) => patchNode(node.id, { actionValue: event.target.value })} /></label>}</div>}{node.actionType === 'SUPPORT' && <div className="node-extra"><label>متن پشتیبانی<textarea rows={2} value={node.actionValue ?? ''} onChange={(event) => patchNode(node.id, { actionValue: event.target.value })} /></label></div>}{node.actionType === 'SUBMENU' && <button className="child-add" onClick={() => setForm({ actionType: 'CATALOG', title: '', value: '', parentId: node.id })}>+ افزودن زیرگزینه</button>}{(children.get(node.id) ?? []).map((child) => <div className="child-row" key={child.id}><span><b>{child.title}</b><small>زیر «{node.title}»</small></span><select value={child.actionType} onChange={(event) => changeNodeAction(child, event.target.value as BotCommerceActionType)}>{liveActions.filter((action) => action.key !== 'SUBMENU').map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select><button className="danger" onClick={() => removeNode(child.id)}>حذف</button></div>)}</div>)}</div>
      </article>

      <article className="card add-card" id="add-button"><div className="section-title"><div><span>{form.parentId ? 'زیرگزینه جدید' : 'دکمه جدید'}</span><h2>{form.parentId ? `زیر «${template.menu.find((node) => node.id === form.parentId)?.title ?? 'منو'}»` : 'چه کاری انجام دهد؟'}</h2></div>{form.parentId && <button className="cancel-parent" onClick={() => setForm({ ...form, parentId: '' })}>لغو</button>}</div><form onSubmit={addNode}><label>عملکرد<select value={form.actionType} onChange={(event) => setForm({ actionType: event.target.value as BotCommerceActionType, title: '', value: '', parentId: form.parentId })}>{liveActions.filter((action) => !form.parentId || action.key !== 'SUBMENU').map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select></label>{!customTitleActions.has(form.actionType) && <div className="auto-title"><small>نام دکمه خودکار</small><b>{fixedTitles[form.actionType] ?? currentAction?.labelFa}</b></div>}{customTitleActions.has(form.actionType) && <label>نام دکمه<input value={form.title} maxLength={64} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={form.actionType === 'URL' ? 'مثلاً سایت ما' : form.actionType === 'SUBMENU' ? 'مثلاً راهنما' : 'مثلاً درباره ما'} required /></label>}{currentAction && currentAction.valueKind !== 'none' && <label>{currentAction.valueKind === 'url' ? 'آدرس لینک' : 'متن'}<textarea rows={3} value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} /></label>}<button className="primary" disabled={busy}>افزودن دکمه</button></form></article>
    </section>

    <section className="save-bar"><span>{dirty ? 'تغییرات ذخیره‌نشده داری' : 'همه تغییرات ذخیره شده'}</span><div><button disabled={busy || !dirty} onClick={() => void save(false)}>فقط ذخیره</button><button className="primary" disabled={busy || selectedTargets === 0} onClick={() => void save(true)}>{busy ? 'در حال انجام...' : 'ذخیره و انتشار'}</button></div></section>
  </main></div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
.simple-bot{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.simple-bot *{box-sizing:border-box}.simple-bot main{max-width:1120px;margin:auto;padding:34px 20px 120px}.simple-bot header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:20px}.simple-bot header>a:first-child{color:#7f8c9f;text-decoration:none;font-size:11px}.simple-bot header h1{font-size:32px;margin:8px 0 6px}.simple-bot header p{margin:0;color:#8592a5;line-height:1.9;max-width:720px}.store-link{background:#141b25;border:1px solid #293447;color:#dce3ed;text-decoration:none;border-radius:11px;padding:10px 13px;font-size:11px;font-weight:800}.card{border:1px solid #232d3c;background:#0d131c;border-radius:17px;padding:18px}.notice{margin-bottom:13px;padding:12px 14px;border-radius:12px;background:#25151a;border:1px solid #60323b;color:#ffc1cb;font-size:12px}.notice.ok{background:#0d241b;border-color:#245b46;color:#9de5c7}.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:13px}.section-title span{font-size:10px;color:#788599}.section-title h2{font-size:20px;margin:4px 0}.section-title>b{font-size:10px;color:#95a2b4}.targets{margin-bottom:12px}.target-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.target-list label{display:flex;align-items:center;gap:9px;border:1px solid #273245;background:#090f17;border-radius:12px;padding:11px;cursor:pointer}.target-list span{display:grid;gap:3px}.target-list b{font-size:11px}.target-list small{font-size:9px;color:#758296}.welcome{margin-bottom:12px}.welcome textarea,.node-extra textarea,.node-extra input,.node-row select,.child-row select,.add-card input,.add-card select,.add-card textarea{width:100%;border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:11px;outline:none}.menu-layout{display:grid;grid-template-columns:1.35fr .65fr;gap:12px}.menu-list{display:grid;gap:8px}.menu-node{border:1px solid #253043;background:#090f17;border-radius:13px;padding:10px}.node-row{display:grid;grid-template-columns:1fr 170px auto;gap:8px;align-items:center}.node-name{display:grid;gap:4px}.node-name b,.child-row b{font-size:12px}.node-name small,.child-row small{color:#748195;font-size:9px;line-height:1.5}.simple-bot button{border:0;border-radius:10px;padding:10px 12px;background:#17202d;color:#d9e0ea;font:800 10px inherit;cursor:pointer}.simple-bot button:disabled{opacity:.48;cursor:not-allowed}.simple-bot .primary{background:#f4f6fa;color:#080b10}.danger{color:#ffb4c0!important}.node-extra{margin-top:8px;padding-top:8px;border-top:1px solid #202938;display:grid;grid-template-columns:180px 1fr;gap:8px}.node-extra label,.add-card label{display:grid;gap:6px;color:#a6b1c0;font-size:10px}.child-add{margin-top:8px}.child-row{margin-top:7px;margin-right:22px;padding:8px;border-right:2px solid #344159;display:grid;grid-template-columns:1fr 150px auto;gap:7px;align-items:center}.child-row span{display:grid;gap:3px}.add-card{align-self:start;position:sticky;top:18px}.add-card form{display:grid;gap:10px}.auto-title{padding:11px;border:1px solid #273245;background:#101722;border-radius:10px;display:grid;gap:4px}.auto-title small{color:#7b8799;font-size:9px}.auto-title b{font-size:12px}.cancel-parent{padding:7px 9px!important}.empty{padding:22px;text-align:center;color:#6e7b8e;border:1px dashed #2a3445;border-radius:11px}.save-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(900px,calc(100vw - 24px));z-index:80;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #2a3548;border-radius:14px;background:rgba(9,14,21,.97);box-shadow:0 16px 50px rgba(0,0,0,.42)}.save-bar>span{font-size:10px;color:#8996a8}.save-bar>div{display:flex;gap:7px}
@media(max-width:820px){.menu-layout{grid-template-columns:1fr}.add-card{position:static}.target-list{grid-template-columns:1fr 1fr}}@media(max-width:600px){.simple-bot main{padding:24px 13px 120px}.simple-bot header{display:grid}.target-list{grid-template-columns:1fr}.node-row,.child-row{grid-template-columns:1fr}.child-row{margin-right:10px}.node-extra{grid-template-columns:1fr}.save-bar{align-items:stretch;flex-direction:column}.save-bar>div{display:grid;grid-template-columns:1fr 1fr}.save-bar button{width:100%}}
`;
