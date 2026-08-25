/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useCallback, useEffect, useMemo, useState, type FormEvent } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

// راهنما: این Type با نام «RubikaBot» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type RubikaBot = {
  id: string;
  rubikaBotId: string;
  username?: string | null;
  displayName?: string | null;
  description?: string | null;
  status: string;
  welcomeMessage: string;
  createdAt?: string;
};

// راهنما: این Type با نام «RubikaButton» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type RubikaButton = {
  id: string;
  botId: string;
  parentId?: string | null;
  title: string;
  actionType: string;
  actionValue?: string | null;
  sortOrder: number;
};

// راهنما: این Type با نام «RubikaData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type RubikaData = {
  ok: boolean;
  bots: RubikaBot[];
  bot: RubikaBot | null;
  buttons: RubikaButton[];
  message?: string;
};

// راهنما: این Type با نام «ConnectResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ConnectResponse = {
  ok?: boolean;
  message?: string;
  webhookConfigured?: boolean;
  bot?: RubikaBot;
};

// راهنما: این دستور متغیر/ثابت «actionLabels» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const actionLabels: Record<string, string> = {
  CATALOG: 'محصولات فروشگاه',
  CART: 'سبد خرید',
  ORDERS: 'سفارش‌های من',
  SUPPORT: 'پشتیبانی',
  TEXT: 'ارسال متن',
  URL: 'لینک',
  SUBMENU: 'زیرمنو',
};

// راهنما: این تابع «request» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function request<T>(url: string, init?: RequestInit) {
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(url, init);
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (response.status === 401) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'».
    window.location.href = '/login';
    // راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.
    throw new Error('unauthorized');
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ response, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { response, data };
}

// راهنما: این تابع «RubikaControlCenter» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function RubikaControlCenter() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<RubikaData | null>(null);
  // راهنما: این دستور State محلی React برای «[activeBotId, setActiveBotId]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [activeBotId, setActiveBotId] = useState('');
  // راهنما: این دستور State محلی React برای «[token, setToken]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [token, setToken] = useState('');
  // راهنما: این دستور State محلی React برای «[welcome, setWelcome]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [welcome, setWelcome] = useState('');
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[notice, setNotice]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [notice, setNotice] = useState('');
  // راهنما: این دستور State محلی React برای «[noticeOk, setNoticeOk]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [noticeOk, setNoticeOk] = useState(false);
  // راهنما: این دستور State محلی React برای «[buttonForm, setButtonForm]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [buttonForm, setButtonForm] = useState({ title: '', actionType: 'CATALOG', parentId: '', actionValue: '' });

  // راهنما: این دستور تابع «load» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.
  const load = useCallback(async (botId?: string) => {
    // راهنما: این دستور متغیر/ثابت «suffix» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const suffix = botId ? `?botId=${encodeURIComponent(botId)}` : '';
    // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { response, data: next } = await request<RubikaData>(`/api/rubika/manage${suffix}`);
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(next.message ?? 'اطلاعات ربات روبیکا دریافت نشد.');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
    setData(next);
    // راهنما: این دستور متغیر/ثابت «nextBotId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const nextBotId = next.bot?.id ?? next.bots[0]?.id ?? '';
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setActiveBotId(nextBotId)».
    setActiveBotId(nextBotId);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setWelcome(next.bot?.welcomeMessage ?? '')».
    setWelcome(next.bot?.welcomeMessage ?? '');
  }, []);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch((error: unknown) => { if (error instanceof Error && error.message === '…».
    void load().catch((error: unknown) => {
      // راهنما: این شرط بررسی می‌کند آیا «error instanceof Error && error.message === 'unauthorized'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error instanceof Error && error.message === 'unauthorized') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('اطلاعات ربات روبیکا دریافت نشد.')».
      setNotice('اطلاعات ربات روبیکا دریافت نشد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(false)».
      setNoticeOk(false);
    });
  }, [load]);

  // راهنما: این دستور متغیر/ثابت «activeBot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const activeBot = data?.bot ?? null;
  // راهنما: این دستور متغیر/ثابت «buttons» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const buttons = data?.buttons ?? [];
  // راهنما: این دستور مقدار «roots» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const roots = useMemo(
    () => buttons.filter((button) => !button.parentId).sort((a, b) => a.sortOrder - b.sortOrder),
    [buttons],
  );
  // راهنما: این دستور مقدار «childrenByParent» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const childrenByParent = useMemo(() => {
    // راهنما: این دستور متغیر/ثابت «map» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const map = new Map<string, RubikaButton[]>();
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const button of buttons) {
      // راهنما: این شرط بررسی می‌کند آیا «!button.parentId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!button.parentId) /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
      // راهنما: این دستور متغیر/ثابت «list» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const list = map.get(button.parentId) ?? [];
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «list.push(button)».
      list.push(button);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(button.parentId, list)».
      map.set(button.parentId, list);
    }
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const list of map.values()) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «list.sort((a, b) => a.sortOrder - b.sortOrder)». */ list.sort((a, b) => a.sortOrder - b.sortOrder);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «map» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return map;
  }, [buttons]);

  // راهنما: این تابع «show» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function show(message: string, ok = true) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice(message)».
    setNotice(message);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNoticeOk(ok)».
    setNoticeOk(ok);
  }

  // راهنما: این تابع «connect» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function connect(event: FormEvent<HTMLFormElement>) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ response, data: result }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: result } = await request<ConnectResponse>('/api/rubika/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !result.bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok || !result.bot) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(result.message ?? 'اتصال ربات روبیکا انجام نشد.', false)».
        show(result.message ?? 'اتصال ربات روبیکا انجام نشد.', false);
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return;
      }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setToken('')».
      setToken('');
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(result.webhookConfigured ? 'ربات روبیکا متصل شد و Webhook فعال است.' : 'ربات روبیکا …».
      show(result.webhookConfigured ? 'ربات روبیکا متصل شد و Webhook فعال است.' : 'ربات روبیکا متصل شد.');
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await load(result.bot.id)».
      await load(result.bot.id);
    } catch (error) {
      // راهنما: این شرط بررسی می‌کند آیا «error instanceof Error && error.message !== 'unauthorized'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error instanceof Error && error.message !== 'unauthorized') /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(error.message, false)». */ show(error.message, false);
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)».
      setBusy(false);
    }
  }

  // راهنما: این تابع «mutate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function mutate(body: Record<string, unknown>) {
    // راهنما: این شرط بررسی می‌کند آیا «!activeBot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!activeBot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: next } = await request<RubikaData>('/api/rubika/manage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ botId: activeBot.id, ...body }),
      });
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(next.message ?? 'ذخیره تنظیمات روبیکا انجام نشد.', false)».
        show(next.message ?? 'ذخیره تنظیمات روبیکا انجام نشد.', false);
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return false;
      }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setWelcome(next.bot?.welcomeMessage ?? '')».
      setWelcome(next.bot?.welcomeMessage ?? '');
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show('تغییرات ذخیره شد.')».
      show('تغییرات ذخیره شد.');
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return true;
    } catch (error) {
      // راهنما: این شرط بررسی می‌کند آیا «error instanceof Error && error.message !== 'unauthorized'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error instanceof Error && error.message !== 'unauthorized') /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(error.message, false)». */ show(error.message, false);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return false;
    } finally {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)».
      setBusy(false);
    }
  }

  // راهنما: این تابع «saveWelcome» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function saveWelcome(event: FormEvent<HTMLFormElement>) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await mutate({ action: 'update_welcome', welcomeMessage: welcome })».
    await mutate({ action: 'update_welcome', welcomeMessage: welcome });
  }

  // راهنما: این تابع «createButton» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createButton(event: FormEvent<HTMLFormElement>) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await mutate({
      action: 'create_button',
      title: buttonForm.title,
      actionType: buttonForm.actionType,
      parentId: buttonForm.parentId || null,
      actionValue: buttonForm.actionValue || null,
    });
    // راهنما: این شرط بررسی می‌کند آیا «ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setButtonForm({ title: '', actionType: 'CATALOG', parentId: '', actionValue: '' })». */ setButtonForm({ title: '', actionType: 'CATALOG', parentId: '', actionValue: '' });
  }

  // راهنما: این تابع «removeButton» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function removeButton(buttonId: string) {
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm('این دکمه حذف شود؟ زیرگزینه‌های مستقیم آن به منوی اصلی منتقل می…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm('این دکمه حذف شود؟ زیرگزینه‌های مستقیم آن به منوی اصلی منتقل می‌شوند.')) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await mutate({ action: 'delete_button', buttonId })».
    await mutate({ action: 'delete_button', buttonId });
  }

  // راهنما: این تابع «chooseBot» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function chooseBot(botId: string) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setActiveBotId(botId)».
    setActiveBotId(botId);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setNotice('')».
    setNotice('');
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await load(botId).catch((error: unknown) => { if (error instanceof Error && error.message…».
    await load(botId).catch((error: unknown) => {
      // راهنما: این شرط بررسی می‌کند آیا «error instanceof Error && error.message !== 'unauthorized'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error instanceof Error && error.message !== 'unauthorized') /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «show(error.message, false)». */ show(error.message, false);
    });
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «( <div className="ru-react" dir="rtl"> <style>{styles}</style> <aside clas…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (
    <div className="ru-react" dir="rtl">
      <style>{styles}</style>
      <aside className="ru-side">
        <a className="ru-brand" href="/app"><i>AP</i><span><b>AI PANEL</b><small>Rubika Bot Builder</small></span></a>
        <div className="ru-provider"><i>RU</i><span><b>روبیکا</b><small>Bot API v3 + Commerce</small></span></div>
        <div className="ru-picker">
          <span>ربات فعال</span>
          <select value={activeBotId} onChange={(event) => void chooseBot(event.target.value)} disabled={!data?.bots.length}>
            {data?.bots.length
              ? data.bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.displayName || bot.username || bot.rubikaBotId}</option>)
              : <option value="">رباتی متصل نیست</option>}
          </select>
        </div>
        <nav>
          <a className="active" href="#connection">اتصال و وضعیت</a>
          <a href="#welcome">پیام شروع</a>
          <a href="#menu">منو و دکمه‌ها</a>
          <a href="/app/store">محصولات مشترک</a>
          <a href="/app/orders">سفارش‌ها</a>
        </nav>
        <a className="ru-back" href="/app">← بازگشت به داشبورد</a>
      </aside>

      <main className="ru-main">
        <header className="ru-header">
          <div><span className="ru-eyebrow">Rubika Bot API v3</span><h1>مرکز کنترل ربات روبیکا</h1><p>توکن را امن متصل کنید، Webhook را فعال کنید، پیام شروع و منوی ربات را بسازید و از Commerce Core مشترک استفاده کنید.</p></div>
          <div className="ru-api"><i>API</i><span><b>botapi.rubika.ir</b><small>Webhook mode</small></span></div>
        </header>

        {notice && <div className={`ru-notice ${noticeOk ? 'ok' : 'error'}`}>{notice}</div>}

        <section className="ru-metrics">
          <div><small>ربات متصل</small><strong>{(data?.bots.length ?? 0).toLocaleString('fa-IR')}</strong><span>در Workspace</span></div>
          <div><small>ربات فعال</small><strong>{(data?.bots.filter((bot) => bot.status === 'ACTIVE').length ?? 0).toLocaleString('fa-IR')}</strong><span>Webhook</span></div>
          <div><small>دکمه منو</small><strong>{buttons.length.toLocaleString('fa-IR')}</strong><span>ربات انتخاب‌شده</span></div>
        </section>

        <section id="connection" className="ru-grid">
          <article className="ru-card">
            <span className="ru-eyebrow">Connection</span><h2>{data?.bots.length ? 'اتصال ربات دیگر' : 'اتصال اولین ربات'}</h2>
            <p className="ru-muted">توکن ابتدا با Rubika Bot API اعتبارسنجی می‌شود، سپس فقط در Backend رمزنگاری و ذخیره می‌شود.</p>
            <form onSubmit={connect}>
              <label>Bot Token<input dir="ltr" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="توکن BotFather روبیکا" required /></label>
              <button className="ru-primary" disabled={busy || !token.trim()}>{busy ? 'در حال اتصال...' : 'اعتبارسنجی و اتصال'}</button>
            </form>
            <div className="ru-steps"><span><i>۱</i>ساخت ربات و دریافت Token</span><span><i>۲</i>اعتبارسنجی Token در AI Panel</span><span><i>۳</i>فعال‌سازی Webhook</span><span><i>۴</i>ساخت منو و شروع فروش</span></div>
          </article>

          <article className="ru-card">
            <span className="ru-eyebrow">Status</span><h2>وضعیت ربات</h2>
            {!data ? <div className="ru-empty">در حال دریافت اطلاعات...</div> : !activeBot ? <div className="ru-empty">هنوز ربات روبیکا متصل نشده است.</div> : <>
              <div className="ru-identity"><i>RU</i><span><b>{activeBot.displayName || 'Rubika Bot'}</b><small>{activeBot.username ? `@${activeBot.username}` : activeBot.rubikaBotId}</small></span><em className={activeBot.status === 'ACTIVE' ? 'good' : ''}>{activeBot.status}</em></div>
              <dl><div><dt>Bot ID</dt><dd>{activeBot.rubikaBotId}</dd></div><div><dt>دریافت پیام</dt><dd>Webhook</dd></div><div><dt>فروشگاه</dt><dd>Commerce Core</dd></div><div><dt>توکن</dt><dd>AES-GCM</dd></div></dl>
              <a className="ru-ghost" href="/app/store">مدیریت محصولات مشترک ←</a>
            </>}
          </article>
        </section>

        <section id="welcome" className="ru-grid">
          <article className="ru-card">
            <span className="ru-eyebrow">Start Message</span><h2>پیام خوش‌آمد</h2>
            <form onSubmit={saveWelcome}><textarea rows={7} maxLength={4000} value={welcome} onChange={(event) => setWelcome(event.target.value)} disabled={!activeBot} /><div className="ru-form-foot"><small>{welcome.length.toLocaleString('fa-IR')} / ۴۰۰۰</small><button className="ru-primary" disabled={busy || !activeBot}>ذخیره پیام</button></div></form>
          </article>
          <article className="ru-card">
            <span className="ru-eyebrow">Live Preview</span><h2>نمای ربات</h2>
            <div className="ru-preview"><div className="ru-chat-head"><i>RU</i><span><b>{activeBot?.displayName || 'Rubika Bot'}</b><small>{activeBot?.username ? `@${activeBot.username}` : 'bot'}</small></span></div><div className="ru-bubble">{welcome || 'یک ربات را انتخاب کنید.'}</div><div className="ru-keypad">{roots.map((button) => <span key={button.id}>{button.title}</span>)}</div></div>
          </article>
        </section>

        <section id="menu" className="ru-grid ru-menu-grid">
          <article className="ru-card">
            <span className="ru-eyebrow">Menu Builder</span><h2>افزودن دکمه</h2>
            <form onSubmit={createButton}>
              <label>عنوان دکمه<input maxLength={64} value={buttonForm.title} onChange={(event) => setButtonForm({ ...buttonForm, title: event.target.value })} placeholder="مثلاً محصولات" required /></label>
              <label>نوع عملکرد<select value={buttonForm.actionType} onChange={(event) => setButtonForm({ ...buttonForm, actionType: event.target.value })}>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>زیرمجموعه<select value={buttonForm.parentId} onChange={(event) => setButtonForm({ ...buttonForm, parentId: event.target.value })}><option value="">منوی اصلی</option>{buttons.map((button) => <option key={button.id} value={button.id}>{button.title}</option>)}</select></label>
              <label>متن / لینک عملکرد<textarea rows={4} value={buttonForm.actionValue} onChange={(event) => setButtonForm({ ...buttonForm, actionValue: event.target.value })} placeholder="برای متن، پشتیبانی، URL یا زیرمنو" /></label>
              <button className="ru-primary" disabled={busy || !activeBot}>افزودن دکمه</button>
            </form>
          </article>

          <article className="ru-card">
            <span className="ru-eyebrow">Menu Tree</span><h2>ساختار فعلی</h2>
            {buttons.length ? <div className="ru-list">{roots.map((root) => <div className="ru-menu-item" key={root.id}><div className="ru-menu-row"><span><b>{root.title}</b><small>{actionLabels[root.actionType] || root.actionType}</small></span><button className="ru-danger" type="button" onClick={() => void removeButton(root.id)} disabled={busy}>حذف</button></div>{(childrenByParent.get(root.id) ?? []).map((child) => <div className="ru-child" key={child.id}><span><b>{child.title}</b><small>{actionLabels[child.actionType] || child.actionType}</small></span><button className="ru-danger" type="button" onClick={() => void removeButton(child.id)} disabled={busy}>حذف</button></div>)}</div>)}</div> : <div className="ru-empty">هنوز دکمه‌ای ساخته نشده است.</div>}
          </article>
        </section>
      </main>
    </div>
  );
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.ru-react{min-height:100vh;background:#f5f7fb;color:#111827;display:grid;grid-template-columns:260px minmax(0,1fr)}.ru-side{background:#111827;color:#fff;padding:26px 18px;display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh}.ru-brand,.ru-provider{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.ru-brand i,.ru-provider i{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#1f2937;font-style:normal;font-weight:900}.ru-provider i{background:#7c3aed}.ru-brand span,.ru-provider span{display:grid;gap:3px}.ru-brand small,.ru-provider small{color:#94a3b8}.ru-picker{display:grid;gap:8px;font-size:12px;color:#94a3b8}.ru-picker select{width:100%;background:#1f2937;color:#fff;border:1px solid #334155;border-radius:12px;padding:10px}.ru-side nav{display:grid;gap:4px}.ru-side nav a,.ru-back{color:#cbd5e1;text-decoration:none;padding:11px 12px;border-radius:11px}.ru-side nav a:hover,.ru-side nav a.active{background:#1f2937;color:#fff}.ru-back{margin-top:auto}.ru-main{padding:34px;max-width:1400px;width:100%;margin:0 auto}.ru-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.ru-header h1{margin:7px 0;font-size:31px}.ru-header p{margin:0;color:#64748b;line-height:1.8;max-width:760px}.ru-eyebrow{text-transform:uppercase;color:#7c3aed;font-weight:900;font-size:11px;letter-spacing:.08em}.ru-api{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:11px 13px}.ru-api i{font-style:normal;background:#ede9fe;color:#6d28d9;border-radius:10px;padding:7px;font-weight:900}.ru-api span{display:grid}.ru-api small{color:#94a3b8}.ru-notice{border-radius:13px;padding:12px 14px;margin-bottom:18px;font-size:13px}.ru-notice.ok{background:#ecfdf5;color:#047857}.ru-notice.error{background:#fff1f2;color:#be123c}.ru-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:18px}.ru-metrics>div,.ru-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;box-shadow:0 8px 30px rgba(15,23,42,.04)}.ru-metrics>div{padding:17px}.ru-metrics small,.ru-metrics span{color:#64748b;font-size:12px}.ru-metrics strong{display:block;font-size:27px;margin:7px 0}.ru-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:18px}.ru-card{padding:20px}.ru-card h2{margin:5px 0 13px;font-size:19px}.ru-muted{color:#64748b;font-size:13px;line-height:1.8}.ru-card form{display:grid;gap:11px}.ru-card label{display:grid;gap:6px;font-weight:750;font-size:12px}.ru-card input,.ru-card textarea,.ru-card select{width:100%;box-sizing:border-box;border:1px solid #d7dce3;border-radius:12px;padding:11px 12px;font:inherit;background:#fff}.ru-card input:focus,.ru-card textarea:focus,.ru-card select:focus{outline:2px solid #ddd6fe;border-color:#8b5cf6}.ru-primary,.ru-ghost,.ru-danger{border:0;border-radius:12px;padding:10px 14px;font:inherit;font-weight:800;cursor:pointer;text-decoration:none}.ru-primary{background:#7c3aed;color:#fff;margin-top:10px}.ru-ghost{display:inline-block;background:#f5f3ff;color:#6d28d9}.ru-danger{background:#fff1f2;color:#be123c;padding:7px 10px}.ru-primary:disabled,.ru-danger:disabled{opacity:.55;cursor:not-allowed}.ru-steps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.ru-steps span{display:flex;gap:7px;align-items:center;font-size:11px;color:#64748b}.ru-steps i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#ede9fe;color:#6d28d9;font-style:normal;font-weight:900}.ru-identity{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #edf0f4;border-radius:14px}.ru-identity i{width:42px;height:42px;display:grid;place-items:center;background:#ede9fe;color:#6d28d9;border-radius:12px;font-style:normal;font-weight:900}.ru-identity span{display:grid;gap:4px;flex:1}.ru-identity small{color:#64748b}.ru-identity em{font-style:normal;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#fff7ed;color:#c2410c}.ru-identity em.good{background:#dcfce7;color:#166534}.ru-card dl{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ru-card dl div{border:1px solid #edf0f4;border-radius:12px;padding:10px}.ru-card dt{font-size:10px;color:#94a3b8}.ru-card dd{margin:4px 0 0;font-weight:750;font-size:12px;overflow-wrap:anywhere}.ru-form-foot{display:flex;justify-content:space-between;gap:10px;align-items:center}.ru-form-foot small{color:#94a3b8}.ru-preview{background:#111827;color:#fff;border-radius:18px;padding:18px;min-height:260px}.ru-chat-head{display:flex;gap:10px;align-items:center;margin-bottom:18px}.ru-chat-head i{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#7c3aed;font-style:normal;font-weight:900}.ru-chat-head span{display:grid}.ru-chat-head small{color:#cbd5e1}.ru-bubble{background:#fff;color:#111827;border-radius:14px;padding:14px;line-height:1.8}.ru-keypad{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.ru-keypad span{background:#374151;border-radius:10px;padding:10px;text-align:center;font-size:12px}.ru-menu-grid{align-items:start}.ru-list{display:grid;gap:10px}.ru-menu-item{border:1px solid #edf0f4;border-radius:14px;padding:12px}.ru-menu-row,.ru-child{display:flex;justify-content:space-between;gap:12px;align-items:center}.ru-menu-row span,.ru-child span{display:grid;gap:3px}.ru-menu-row small,.ru-child small{color:#64748b}.ru-child{margin:8px 18px 0 0;border-right:2px solid #ddd6fe;padding:8px 10px}.ru-empty{border:1px dashed #d7dce3;border-radius:13px;padding:26px;text-align:center;color:#94a3b8}@media(max-width:980px){.ru-react{display:block}.ru-side{height:auto;position:static}.ru-side nav{display:flex;overflow:auto}.ru-back{margin-top:0}.ru-main{padding:20px}.ru-grid,.ru-metrics{grid-template-columns:1fr}.ru-header{display:grid}.ru-card dl,.ru-steps{grid-template-columns:1fr}.ru-keypad{grid-template-columns:1fr}.ru-menu-row,.ru-child{align-items:flex-start}}`;
