/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { botCommerceActionDefinitions, botCommercePresets, botCommerceProvid… را از ماژول «@ai-panel/shared» وارد می‌کند تا در این فایل قابل استفاده باشد.
import {
  botCommerceActionDefinitions,
  botCommercePresets,
  botCommerceProviders,
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
type ProviderBot = {
  id: string;
  externalId: string;
  username?: string | null;
  displayName?: string | null;
  description?: string | null;
  status: string;
  createdAt?: string;
};

// راهنما: این Type با نام «Engine» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Engine = {
  draft?: BotCommerceTemplate | null;
  draftSavedAt?: string | null;
  published?: BotCommerceTemplate | null;
  publishedAt?: string | null;
  version?: number;
};

// راهنما: این Type با نام «ApiData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ApiData = {
  ok: boolean;
  store: { id: string; name: string; currency: string; status: string } | null;
  botCommerce: Engine | null;
  providers: Record<BotCommerceProvider, ProviderBot[]>;
  capabilities: { runtimeActions: string[]; foundationActions: string[] };
  message?: string;
};

// راهنما: این دستور متغیر/ثابت «providerLabels» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const providerLabels: Record<BotCommerceProvider, string> = {
  telegram: 'تلگرام',
  bale: 'بله',
  rubika: 'روبیکا',
};

// راهنما: این دستور متغیر/ثابت «cloneTemplate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const cloneTemplate = (template: BotCommerceTemplate): BotCommerceTemplate => JSON.parse(JSON.stringify(template));

// راهنما: این تابع «request» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function request<T>(url: string, init?: RequestInit) {
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(url, init);
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ response, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { response, data };
}

// راهنما: این تابع «sortMenu» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function sortMenu(menu: BotCommerceMenuNode[]) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[...menu].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompar…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return [...menu].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

// راهنما: این تابع «BotCommerceBuilder» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function BotCommerceBuilder() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<ApiData | null>(null);
  // راهنما: این دستور متغیر/ثابت «[template, setTemplate]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [template, setTemplate] = useState<BotCommerceTemplate>(() => cloneTemplate(defaultBotCommerceTemplate));
  // راهنما: این دستور متغیر/ثابت «[previewProvider, setPreviewProvider]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [previewProvider, setPreviewProvider] = useState<BotCommerceProvider>('telegram');
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[notice, setNotice]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [notice, setNotice] = useState('');
  // راهنما: این دستور State محلی React برای «[noticeOk, setNoticeOk]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [noticeOk, setNoticeOk] = useState(false);
  // راهنما: این دستور State محلی React برای «[dirty, setDirty]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [dirty, setDirty] = useState(false);
  // راهنما: این دستور State محلی React برای «[form, setForm]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [form, setForm] = useState({ title: '', actionType: 'TEXT' as BotCommerceActionType, parentId: '', actionValue: '' });

  // راهنما: این دستور تابع «load» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.
  const load = useCallback(async () => {
    // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { response, data: next } = await request<ApiData>('/api/bot-commerce');
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'».
      window.location.href = '/login';
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return;
    }
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(next.message ?? 'load_failed');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
    setData(next);
    // راهنما: این دستور متغیر/ثابت «loaded» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const loaded = next.botCommerce?.draft ?? next.botCommerce?.published ?? defaultBotCommerceTemplate;
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(cloneTemplate(loaded))».
    setTemplate(cloneTemplate(loaded));
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
    setDirty(false);
  }, []);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch(() => { setNotice('اطلاعات Bot Commerce دریافت نشد.'); setNoticeOk(fals…».
    void load().catch(() => {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('اطلاعات Bot Commerce دریافت نشد.')».
      setNotice('اطلاعات Bot Commerce دریافت نشد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)».
      setNoticeOk(false);
    });
  }, [load]);

  // راهنما: این دستور مقدار «roots» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const roots = useMemo(() => sortMenu(template.menu.filter((node) => !node.parentId)), [template.menu]);
  // راهنما: این دستور مقدار «childrenByParent» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const childrenByParent = useMemo(() => {
    // راهنما: این دستور متغیر/ثابت «map» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const map = new Map<string, BotCommerceMenuNode[]>();
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const node of template.menu) {
      // راهنما: این شرط بررسی می‌کند آیا «!node.parentId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!node.parentId) /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
      // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const current = map.get(node.parentId) ?? [];
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «current.push(node)».
      current.push(node);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(node.parentId, current)».
      map.set(node.parentId, current);
    }
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const [key, nodes] of map) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(key, sortMenu(nodes))». */ map.set(key, sortMenu(nodes));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «map» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return map;
  }, [template.menu]);

  // راهنما: این دستور متغیر/ثابت «targetCount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const targetCount = template.targets.filter((target) => target.enabled).length;
  // راهنما: این دستور متغیر/ثابت «enabledFoundation» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const enabledFoundation = template.menu.filter((node) => node.enabled && getBotCommerceAction(node.actionType)?.runtime === 'foundation');

  // راهنما: این تابع «update» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function update(next: BotCommerceTemplate) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(next)».
    setTemplate(next);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(true)».
    setDirty(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
  }

  // راهنما: این تابع «applyPreset» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function applyPreset(key: string) {
    // راهنما: این دستور متغیر/ثابت «preset» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const preset = botCommercePresets.find((item) => item.key === key);
    // راهنما: این شرط بررسی می‌کند آیا «!preset» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!preset) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const next = cloneTemplate(preset.template);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «next.targets = template.targets».
    next.targets = template.targets;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update(next)».
    update(next);
  }

  // راهنما: این تابع «patchNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function patchNode(id: string, patch: Partial<BotCommerceMenuNode>) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: template.menu.map((node) => node.id === id ? { ...node, ...pa…».
    update({ ...template, menu: template.menu.map((node) => node.id === id ? { ...node, ...patch } : node) });
  }

  // راهنما: این تابع «removeNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function removeNode(id: string) {
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm('این گزینه از منوی مشترک حذف شود؟ زیرگزینه‌های مستقیم به سطح اص…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm('این گزینه از منوی مشترک حذف شود؟ زیرگزینه‌های مستقیم به سطح اصلی منتقل می‌شوند.')) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: template.menu.filter((node) => node.id !== id).map((node) => …».
    update({
      ...template,
      menu: template.menu.filter((node) => node.id !== id).map((node) => node.parentId === id ? { ...node, parentId: null } : node),
    });
  }

  // راهنما: این تابع «moveRoot» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function moveRoot(id: string, direction: -1 | 1) {
    // راهنما: این دستور متغیر/ثابت «index» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const index = roots.findIndex((node) => node.id === id);
    // راهنما: این دستور متغیر/ثابت «target» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const target = index + direction;
    // راهنما: این شرط بررسی می‌کند آیا «index < 0 || target < 0 || target >= roots.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (index < 0 || target < 0 || target >= roots.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «reordered» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const reordered = [...roots];
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «[reordered[index], reordered[target]] = [reordered[target], reordered[index]]».
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    // راهنما: این دستور متغیر/ثابت «order» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const order = new Map(reordered.map((node, idx) => [node.id, (idx + 1) * 10]));
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: template.menu.map((node) => order.has(node.id) ? { ...node, s…».
    update({ ...template, menu: template.menu.map((node) => order.has(node.id) ? { ...node, sortOrder: order.get(node.id)! } : node) });
  }

  // راهنما: این تابع «addNode» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function addNode(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «!form.title.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!form.title.trim()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «parentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const parentId = form.parentId || null;
    // راهنما: این دستور متغیر/ثابت «siblings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const siblings = template.menu.filter((node) => node.parentId === parentId);
    // راهنما: این دستور متغیر/ثابت «sortOrder» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const sortOrder = Math.max(0, ...siblings.map((node) => node.sortOrder)) + 10;
    // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const action = getBotCommerceAction(form.actionType);
    // راهنما: این دستور متغیر/ثابت «value» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const value = action?.valueKind === 'none' ? null : (form.actionValue.trim() || null);
    // راهنما: این دستور متغیر/ثابت «nextNode» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const nextNode: BotCommerceMenuNode = {
      id: crypto.randomUUID(),
      parentId,
      title: form.title.trim().slice(0, 64),
      actionType: form.actionType,
      actionValue: value,
      sortOrder,
      enabled: action?.runtime === 'live',
    };
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, menu: [...template.menu, nextNode] })».
    update({ ...template, menu: [...template.menu, nextNode] });
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setForm({ title: '', actionType: 'TEXT', parentId: '', actionValue: '' })».
    setForm({ title: '', actionType: 'TEXT', parentId: '', actionValue: '' });
  }

  // راهنما: این تابع «toggleTarget» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function toggleTarget(provider: BotCommerceProvider, bot: ProviderBot, checked: boolean) {
    // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const key = `${provider}:${bot.id}`;
    // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const existing = template.targets.find((target) => `${target.provider}:${target.botId}` === key);
    // راهنما: این دستور متغیر/ثابت «targets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const targets = existing
      ? template.targets.map((target) => `${target.provider}:${target.botId}` === key ? { ...target, enabled: checked } : target)
      : [...template.targets, { provider, botId: bot.id, enabled: checked }];
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update({ ...template, targets })».
    update({ ...template, targets });
  }

  // راهنما: این تابع «mutate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function mutate(action: 'save_draft' | 'publish' | 'unpublish', body: Record<string, unknown> = {}) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)».
    setNoticeOk(false);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const payload = action === 'unpublish' ? { action } : { action, template, ...body };
      // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: next } = await request<ApiData>('/api/bot-commerce', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(next.message ?? 'ذخیره انجام نشد.')».
        setNotice(next.message ?? 'ذخیره انجام نشد.');
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return false;
      }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این شرط بررسی می‌کند آیا «next.botCommerce?.draft» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (next.botCommerce?.draft) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(cloneTemplate(next.botCommerce.draft))». */ setTemplate(cloneTemplate(next.botCommerce.draft));
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
      setDirty(false);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(action === 'publish' ? 'قالب مشترک منتشر شد و Providerهای انتخاب‌شده از همین نس…».
      setNotice(action === 'publish' ? 'قالب مشترک منتشر شد و Providerهای انتخاب‌شده از همین نسخه استفاده می‌کنند.' : action === 'unpublish' ? 'انتشار مشترک متوقف شد؛ Providerها به تنظیمات Legacy خود برمی‌گردند.' : 'Draft مشترک ذخیره شد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(true)».
      setNoticeOk(true);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return true;
    } catch {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('ارتباط با Backend Bot Commerce برقرار نشد.')».
      setNotice('ارتباط با Backend Bot Commerce برقرار نشد.');
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return false;
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)».
      setBusy(false);
    }
  }

  // راهنما: این تابع «importProvider» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function importProvider(provider: BotCommerceProvider, bot: ProviderBot) {
    // راهنما: این شرط بررسی می‌کند آیا «dirty && !window.confirm('Draft فعلی تغییرات ذخیره‌نشده دارد. منوی این ربات جای…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (dirty && !window.confirm('Draft فعلی تغییرات ذخیره‌نشده دارد. منوی این ربات جایگزین Draft شود؟')) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)».
    setNoticeOk(false);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: next } = await request<ApiData>('/api/bot-commerce', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'import_provider', provider, botId: bot.id }),
      });
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !next.botCommerce?.draft» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok || !next.botCommerce?.draft) {
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(next.message ?? 'انتقال منوی قدیمی انجام نشد.')».
        setNotice(next.message ?? 'انتقال منوی قدیمی انجام نشد.');
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return;
      }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(cloneTemplate(next.botCommerce.draft))».
      setTemplate(cloneTemplate(next.botCommerce.draft));
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
      setDirty(false);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(`منوی ${providerLabels[provider]} به Draft مشترک منتقل شد.`)».
      setNotice(`منوی ${providerLabels[provider]} به Draft مشترک منتقل شد.`);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(true)».
      setNoticeOk(true);
    } catch {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('انتقال منوی قدیمی انجام نشد.')».
      setNotice('انتقال منوی قدیمی انجام نشد.');
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)».
      setBusy(false);
    }
  }

  // راهنما: این دستور متغیر/ثابت «currentAction» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const currentAction = getBotCommerceAction(form.actionType);

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="bot-commerce" dir="rtl"><style>{styles}</style> <aside> <a…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="bot-commerce" dir="rtl"><style>{styles}</style>
    <aside>
      <a className="brand" href="/app"><i>AP</i><span><b>AI PANEL</b><small>Unified Bot Commerce</small></span></a>
      <div className="architecture"><span>یک Core</span><b>Telegram · Bale · Rubika</b><small>Catalog / Menu / Cart / Orders</small></div>
      <nav>
        <a className="active" href="/app/bot-commerce">ربات فروشگاهی</a>
        <a href="/app/store">محصولات و دسته‌بندی</a>
        <a href="/app/store/templates">قالب وب فروشگاه</a>
        <a href="/app/orders">سفارش‌ها</a>
        <a href="/app/telegram">اتصال تلگرام</a>
        <a href="/app/bale">اتصال بله</a>
        <a href="/app/rubika">اتصال روبیکا</a>
      </nav>
      <div className="release"><small>Published</small><b>v{data?.botCommerce?.version ?? 0}</b><span>{data?.botCommerce?.publishedAt ? new Date(data.botCommerce.publishedAt).toLocaleString('fa-IR') : 'هنوز منتشر نشده'}</span></div>
    </aside>

    <main>
      <header>
        <div><span className="eyebrow">Babba feature model × AI Panel architecture</span><h1>فروشگاه‌ساز مشترک پیام‌رسان‌ها</h1><p>فروشگاه، منوی منطقی و جریان خرید یک‌بار ساخته می‌شوند؛ Adapter هر پیام‌رسان فقط آن‌ها را به API و UI همان Provider تبدیل می‌کند.</p></div>
        <div className="actions"><button className="secondary" disabled={busy || !data?.botCommerce?.published} onClick={() => void mutate('unpublish')}>توقف انتشار</button><button className="secondary" disabled={busy || !dirty} onClick={() => void mutate('save_draft')}>ذخیره Draft</button><button className="primary" disabled={busy || targetCount === 0 || enabledFoundation.length > 0} onClick={() => void mutate('publish')}>انتشار روی {targetCount.toLocaleString('fa-IR')} ربات</button></div>
      </header>

      {notice && <div className={`notice ${noticeOk ? 'ok' : ''}`}>{notice}</div>}
      {enabledFoundation.length > 0 && <div className="notice warning">برای Publish، قابلیت‌های Foundation فعال را غیرفعال کنید: {enabledFoundation.map((node) => node.title).join('، ')}</div>}

      <section className="stats">
        <article><small>Store Core</small><b>{data?.store ? data.store.name : 'هنوز ساخته نشده'}</b><span>{data?.store ? data.store.status : 'با اولین ذخیره ساخته می‌شود'}</span></article>
        <article><small>Target Bots</small><b>{targetCount.toLocaleString('fa-IR')}</b><span>از {botCommerceProviders.reduce((sum, provider) => sum + (data?.providers?.[provider]?.length ?? 0), 0).toLocaleString('fa-IR')} ربات متصل</span></article>
        <article><small>Menu Nodes</small><b>{template.menu.length.toLocaleString('fa-IR')}</b><span>{template.menu.filter((node) => node.enabled).length.toLocaleString('fa-IR')} فعال</span></article>
        <article><small>Draft</small><b>{dirty ? 'تغییر کرده' : 'همگام'}</b><span>{data?.botCommerce?.draftSavedAt ? new Date(data.botCommerce.draftSavedAt).toLocaleString('fa-IR') : 'ذخیره نشده'}</span></article>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="section-head"><div><span className="eyebrow">01 / Blueprint</span><h2>قالب پایه</h2></div></div>
          <div className="presets">{botCommercePresets.map((preset) => <button key={preset.key} className={template.presetKey === preset.key ? 'selected' : ''} onClick={() => applyPreset(preset.key)}><b>{preset.labelFa}</b><span>{preset.descriptionFa}</span></button>)}</div>
          <div className="fields"><label>نام جریان<input value={template.name} maxLength={120} onChange={(event) => update({ ...template, name: event.target.value })} /></label><label>پیام /start<textarea rows={5} maxLength={4000} value={template.welcomeMessage} onChange={(event) => update({ ...template, welcomeMessage: event.target.value })} /></label></div>
        </article>

        <article className="card">
          <div className="section-head"><div><span className="eyebrow">02 / Distribution</span><h2>انتشار روی Providerها</h2></div><span className="count">{targetCount.toLocaleString('fa-IR')} انتخاب</span></div>
          <div className="providers">{botCommerceProviders.map((provider) => <div className="provider-block" key={provider}><div className="provider-title"><b>{providerLabels[provider]}</b><span>{data?.providers?.[provider]?.length ?? 0} ربات</span></div>{(data?.providers?.[provider] ?? []).length === 0 ? <p>رباتی متصل نیست.</p> : (data?.providers?.[provider] ?? []).map((bot) => { /* راهنما: این دستور متغیر/ثابت «checked» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const checked = template.targets.some((target) => target.provider === provider && target.botId === bot.id && target.enabled); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="bot-row" key={bot.id}><label><input type="checkbox" checke…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="bot-row" key={bot.id}><label><input type="checkbox" checked={checked} onChange={(event) => toggleTarget(provider, bot, event.target.checked)} /><span><b>{bot.displayName || bot.username || bot.externalId}</b><small>{bot.username ? `@${bot.username}` : bot.externalId} · {bot.status}</small></span></label><button disabled={busy} onClick={() => void importProvider(provider, bot)}>انتقال منوی قدیمی</button></div>; })}</div>)}</div>
        </article>
      </section>

      <section className="grid builder">
        <article className="card">
          <div className="section-head"><div><span className="eyebrow">03 / Shared Menu Tree</span><h2>منوی منطقی مشترک</h2></div><span className="count">Runtime مشترک</span></div>
          <div className="tree">{roots.map((root, index) => <div className={`node ${root.enabled ? '' : 'disabled'}`} key={root.id}><div className="node-main"><label className="switch"><input type="checkbox" checked={root.enabled} onChange={(event) => patchNode(root.id, { enabled: event.target.checked })} /><span /></label><input className="node-title" value={root.title} maxLength={64} onChange={(event) => patchNode(root.id, { title: event.target.value })} /><select value={root.actionType} onChange={(event) => patchNode(root.id, { actionType: event.target.value as BotCommerceActionType })}>{botCommerceActionDefinitions.map((action) => <option key={action.key} value={action.key}>{action.labelFa}{action.runtime === 'foundation' ? ' — Foundation' : ''}</option>)}</select><em className={getBotCommerceAction(root.actionType)?.runtime ?? 'foundation'}>{getBotCommerceAction(root.actionType)?.runtime === 'live' ? 'LIVE' : 'FOUNDATION'}</em><div className="node-actions"><button disabled={index === 0} onClick={() => moveRoot(root.id, -1)}>↑</button><button disabled={index === roots.length - 1} onClick={() => moveRoot(root.id, 1)}>↓</button><button className="danger" onClick={() => removeNode(root.id)}>حذف</button></div></div>{root.actionValue !== null && <textarea rows={2} value={root.actionValue ?? ''} onChange={(event) => patchNode(root.id, { actionValue: event.target.value })} />}{(childrenByParent.get(root.id) ?? []).map((child) => <div className={`child ${child.enabled ? '' : 'disabled'}`} key={child.id}><label className="switch"><input type="checkbox" checked={child.enabled} onChange={(event) => patchNode(child.id, { enabled: event.target.checked })} /><span /></label><input value={child.title} onChange={(event) => patchNode(child.id, { title: event.target.value })} /><select value={child.actionType} onChange={(event) => patchNode(child.id, { actionType: event.target.value as BotCommerceActionType })}>{botCommerceActionDefinitions.map((action) => <option key={action.key} value={action.key}>{action.labelFa}</option>)}</select><em className={getBotCommerceAction(child.actionType)?.runtime ?? 'foundation'}>{getBotCommerceAction(child.actionType)?.runtime === 'live' ? 'LIVE' : 'FOUNDATION'}</em><button className="danger" onClick={() => removeNode(child.id)}>حذف</button></div>)}</div>)}</div>
        </article>

        <article className="card create-card">
          <span className="eyebrow">Add logical action</span><h2>افزودن گزینه</h2>
          <form onSubmit={addNode}><label>عنوان<input required maxLength={64} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>عملکرد<select value={form.actionType} onChange={(event) => setForm({ ...form, actionType: event.target.value as BotCommerceActionType, actionValue: '' })}>{botCommerceActionDefinitions.map((action) => <option key={action.key} value={action.key}>{action.labelFa} · {action.runtime}</option>)}</select></label><label>محل نمایش<select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}><option value="">منوی اصلی</option>{roots.map((root) => <option key={root.id} value={root.id}>زیر «{root.title}»</option>)}</select></label>{currentAction?.valueKind !== 'none' && <label>{currentAction?.valueKind === 'url' ? 'URL' : 'متن / مقدار'}<textarea rows={4} value={form.actionValue} onChange={(event) => setForm({ ...form, actionValue: event.target.value })} /></label>}<div className={`runtime-note ${currentAction?.runtime ?? ''}`}><b>{currentAction?.runtime === 'live' ? 'Runtime آماده' : 'Foundation معماری'}</b><span>{currentAction?.descriptionFa}</span>{currentAction?.runtime === 'foundation' && <small>گزینه جدید به‌صورت غیرفعال ساخته می‌شود و تا تکمیل Backend آن Action قابل Publish نیست.</small>}</div><button className="primary">افزودن به منو</button></form>
        </article>
      </section>

      <section className="card preview-card">
        <div className="section-head"><div><span className="eyebrow">04 / Provider Render Preview</span><h2>یک Flow، سه Renderer</h2></div><div className="tabs">{botCommerceProviders.map((provider) => <button key={provider} className={previewProvider === provider ? 'active' : ''} onClick={() => setPreviewProvider(provider)}>{providerLabels[provider]}</button>)}</div></div>
        <div className="preview"><div className={`phone ${previewProvider}`}><div className="phone-head"><i>{previewProvider === 'telegram' ? 'TG' : previewProvider === 'bale' ? 'BA' : 'RU'}</i><span><b>{template.name}</b><small>{providerLabels[previewProvider]} Adapter</small></span></div><div className="bubble">{template.welcomeMessage}</div><div className="keyboard">{roots.filter((node) => node.enabled).map((node) => <span key={node.id}>{node.title}</span>)}</div></div><div className="preview-info"><b>Provider Adapter چه کاری می‌کند؟</b><p>همین Nodeها را بدون کپی‌کردن Business Logic، به Keyboard/Keypad/Callback مناسب {providerLabels[previewProvider]} تبدیل می‌کند.</p><ul><li>Catalog، Cart و Orders از Commerce Core مشترک خوانده می‌شوند.</li><li>Token، Webhook و API فقط در Adapter همان Provider باقی می‌ماند.</li><li>Draft هرگز اجرا نمی‌شود؛ Runtime فقط Published snapshot را مصرف می‌کند.</li></ul></div></div>
      </section>
    </main>
  </div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#070a0f;color:#eef3f9}*{box-sizing:border-box}body{margin:0;background:#070a0f}.bot-commerce{min-height:100vh;display:grid;grid-template-columns:240px 1fr;background:#070a0f;color:#eef3f9}.bot-commerce aside{position:sticky;top:0;height:100vh;padding:20px 14px;border-left:1px solid #202a39;background:#090e15;display:flex;flex-direction:column;gap:16px}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}.brand>i{width:40px;height:40px;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:900;border:1px solid #354259;border-radius:12px;background:#121a26}.brand span{display:grid}.brand b{font-size:13px;letter-spacing:1px}.brand small{font-size:9px;color:#748198}.architecture,.release{padding:13px;border:1px solid #263246;border-radius:14px;background:#0d141e;display:grid;gap:4px}.architecture span,.release small{font-size:8px;color:#768399;text-transform:uppercase}.architecture b,.release b{font-size:11px}.architecture small,.release span{font-size:9px;color:#8290a4}.bot-commerce aside nav{display:grid;gap:4px}.bot-commerce aside nav a{padding:10px;border-radius:10px;color:#8995a7;text-decoration:none;font-size:11px}.bot-commerce aside nav a:hover,.bot-commerce aside nav a.active{background:#151e2b;color:#fff}.release{margin-top:auto}.release b{font-size:26px}.bot-commerce main{width:100%;max-width:1500px;margin:auto;padding:34px clamp(20px,4vw,58px) 100px}.bot-commerce header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:20px}.eyebrow{font-size:9px;font-weight:900;color:#728097;text-transform:uppercase;letter-spacing:.8px}.bot-commerce h1{font-size:32px;margin:6px 0 8px}.bot-commerce h2{font-size:17px;margin:5px 0 14px}.bot-commerce p{color:#8794a8;font-size:11px;line-height:1.8;max-width:760px}.actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.bot-commerce button{font:inherit;cursor:pointer}.primary,.secondary{border-radius:10px;padding:10px 14px;font-size:10px;font-weight:900}.primary{border:1px solid #5c8dff;background:#366cf4;color:white}.secondary{border:1px solid #334057;background:#111925;color:#b7c3d4}.bot-commerce button:disabled{opacity:.4;cursor:not-allowed}.notice{margin:12px 0;padding:12px 14px;border:1px solid #80393f;border-radius:10px;background:#281216;color:#ffacb3;font-size:10px}.notice.ok{border-color:#235c48;background:#0e251d;color:#82dfbd}.notice.warning{border-color:#705b21;background:#2b240e;color:#f8d36b}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.stats article,.card{border:1px solid #202b3b;border-radius:16px;background:#0b111a}.stats article{padding:14px;display:grid;gap:5px}.stats small{font-size:8px;color:#69778b}.stats b{font-size:16px}.stats span{font-size:9px;color:#8190a5}.grid{display:grid;gap:12px;margin:12px 0}.grid.two{grid-template-columns:1fr 1fr}.grid.builder{grid-template-columns:minmax(0,1.65fr) minmax(300px,.7fr)}.card{padding:18px}.section-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.count{font-size:8px;color:#8d9aae;border:1px solid #2a374a;border-radius:99px;padding:5px 8px}.presets{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.presets button{padding:12px;text-align:right;border:1px solid #28364a;border-radius:11px;background:#0c131d;color:#d8e0eb;display:grid;gap:4px}.presets button.selected{border-color:#4b7eff;background:#101b31}.presets b{font-size:10px}.presets span{font-size:8px;color:#7f8ba0;line-height:1.55}.fields,.create-card form{display:grid;gap:10px;margin-top:14px}.bot-commerce label{font-size:9px;color:#8997aa;display:grid;gap:6px}.bot-commerce input,.bot-commerce textarea,.bot-commerce select{width:100%;border:1px solid #2a374b;border-radius:9px;background:#080d14;color:#edf2f8;padding:9px;font:inherit;font-size:10px;outline:none}.bot-commerce textarea{resize:vertical;line-height:1.65}.providers{display:grid;gap:9px}.provider-block{border:1px solid #263246;border-radius:11px;padding:10px;background:#090f17}.provider-title{display:flex;justify-content:space-between;margin-bottom:7px}.provider-title b{font-size:10px}.provider-title span,.provider-block p{font-size:8px;color:#77859a}.bot-row{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:7px 0;border-top:1px solid #182231}.bot-row label{display:flex;align-items:center;grid-template-columns:auto 1fr;gap:8px;flex:1}.bot-row label input{width:auto}.bot-row label span{display:grid}.bot-row label b{font-size:9px}.bot-row label small{font-size:7px;color:#738196}.bot-row button{border:1px solid #2f3c52;border-radius:7px;background:#111a27;color:#94a3b8;font-size:7px;padding:6px}.tree{display:grid;gap:7px}.node{border:1px solid #263347;border-radius:12px;background:#090f17;overflow:hidden}.node.disabled,.child.disabled{opacity:.55}.node-main,.child{display:grid;grid-template-columns:auto minmax(100px,1fr) minmax(130px,.65fr) auto auto;gap:7px;align-items:center;padding:9px}.node textarea{border:0;border-top:1px solid #1e2a3a;border-radius:0;background:#090f17}.node-title{font-weight:800}.node-main em,.child em{font-style:normal;font-size:6px;border-radius:99px;padding:4px 6px;text-align:center}.node-main em.live,.child em.live{background:#123529;color:#72dcb2}.node-main em.foundation,.child em.foundation{background:#3a3011;color:#f0ca63}.node-actions{display:flex;gap:4px}.node-actions button,.child>button{border:1px solid #2c394d;border-radius:6px;background:#111925;color:#98a5b7;font-size:8px;padding:5px}.node-actions .danger,.child>.danger{color:#f19ca4}.child{margin:0 9px 8px 32px;border:1px solid #1e2a3a;border-radius:8px;background:#0c131d}.switch{display:block!important}.switch input{width:auto}.runtime-note{padding:10px;border:1px solid #2b394e;border-radius:10px;display:grid;gap:4px}.runtime-note b{font-size:9px}.runtime-note span,.runtime-note small{font-size:8px;color:#8492a6;line-height:1.5}.runtime-note.live{border-color:#1e5844}.runtime-note.foundation{border-color:#6a5720}.preview-card{margin-top:12px}.tabs{display:flex;gap:5px}.tabs button{border:1px solid #2b394d;border-radius:8px;background:#0b111a;color:#8794a8;padding:7px 10px;font-size:8px}.tabs button.active{background:#e9eef6;color:#111827}.preview{display:grid;grid-template-columns:340px 1fr;gap:28px;align-items:center;max-width:900px;margin:20px auto}.phone{border:8px solid #202b3a;border-radius:30px;background:#eaf1f7;color:#14202b;min-height:500px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.35)}.phone.bale{background:#edf6ff}.phone.rubika{background:#f5eefc}.phone-head{height:66px;background:#fff;display:flex;align-items:center;gap:9px;padding:12px;border-bottom:1px solid #d9e1e9}.phone-head i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#2468d8;color:#fff;font-style:normal;font-size:8px;font-weight:900}.phone-head span{display:grid}.phone-head b{font-size:10px}.phone-head small{font-size:7px;color:#768495}.bubble{margin:18px 12px;padding:12px;border-radius:14px 14px 4px 14px;background:#fff;font-size:9px;line-height:1.8}.keyboard{margin-top:220px;padding:8px;display:grid;grid-template-columns:1fr 1fr;gap:5px;background:#dce5ed}.keyboard span{background:#fff;border-radius:6px;padding:9px;text-align:center;font-size:8px;font-weight:700}.preview-info b{font-size:15px}.preview-info p,.preview-info li{font-size:10px;color:#8997aa;line-height:1.8}.preview-info ul{padding-right:18px}.create-card .primary{width:100%}
@media(max-width:1050px){.bot-commerce{grid-template-columns:1fr}.bot-commerce aside{position:relative;height:auto;border-left:0;border-bottom:1px solid #202a39}.bot-commerce aside nav{grid-template-columns:repeat(4,1fr)}.release{margin-top:0}.grid.two,.grid.builder{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}.bot-commerce header{flex-direction:column}.actions{justify-content:flex-start}.preview{grid-template-columns:1fr}.phone{max-width:340px;margin:auto;width:100%}}
@media(max-width:640px){.bot-commerce main{padding:24px 12px 100px}.bot-commerce aside nav{grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr 1fr}.presets{grid-template-columns:1fr}.node-main,.child{grid-template-columns:auto 1fr}.node-main select,.node-main em,.node-actions,.child select,.child em,.child>button{grid-column:2}.bot-commerce h1{font-size:25px}}
`;
