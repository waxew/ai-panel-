/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useEffect, useMemo, useState } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useEffect, useMemo, useState } from 'react';

// راهنما: این Type با نام «StoreOrderItem» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreOrderItem = {
  id: string;
  titleSnapshot: string;
  quantity: number;
  unitPriceAmount: number | string;
  lineTotalAmount: number | string;
};

// راهنما: این Type با نام «StoreCustomer» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreCustomer = {
  id: string;
  platform: string;
  externalUserId: string;
  username?: string | null;
  displayName?: string | null;
  phone?: string | null;
};

// راهنما: این Type با نام «StoreOrder» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreOrder = {
  id: string;
  customerId?: string | null;
  sourcePlatform: string;
  status: string;
  subtotalAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  currency: string;
  note?: string | null;
  createdAt: string;
  paidAt?: string | null;
  customer?: StoreCustomer | null;
  items: StoreOrderItem[];
  inventoryReservation?: { status: string; expiresAt?: string | null; quantity: number } | null;
};

// راهنما: این Type با نام «OrdersData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type OrdersData = {
  ok: boolean;
  store: null | { id: string; name: string; currency: string; status: string };
  orders: StoreOrder[];
  summary: {
    total: number;
    awaitingPayment: number;
    paid: number;
    processing: number;
    completed: number;
    cancelled: number;
    refunded: number;
  };
  message?: string;
};

// راهنما: این دستور متغیر/ثابت «statusLabel» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const statusLabel: Record<string, string> = {
  NEW: 'جدید',
  AWAITING_PAYMENT: 'در انتظار پرداخت',
  PAID: 'پرداخت‌شده',
  PROCESSING: 'در حال پردازش',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  REFUNDED: 'بازپرداخت‌شده',
};

// راهنما: این تابع «money» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function money(value: number | string, currency = 'IRR') {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${new Intl.NumberFormat('fa-IR').format(Number(value ?? 0))} ${currency =…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${new Intl.NumberFormat('fa-IR').format(Number(value ?? 0))} ${currency === 'IRR' ? 'ریال' : currency}`;
}

// راهنما: این تابع «shortDate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function shortDate(value: string) {
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short'…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return value; }
}

// راهنما: این تابع «StoreOrders» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function StoreOrders() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<OrdersData | null>(null);
  // راهنما: این دستور متغیر/ثابت «[selectedId, setSelectedId]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[message, setMessage]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [message, setMessage] = useState('');
  // راهنما: این دستور State محلی React برای «[filter, setFilter]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [filter, setFilter] = useState('ALL');
  // راهنما: این دستور State محلی React برای «[note, setNote]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [note, setNote] = useState('');

  // راهنما: این تابع «load» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function load() {
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch('/api/store/orders');
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'». */ window.location.href = '/login'; /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const body = await response.json().catch(() => ({})) as OrdersData;
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(body.message || 'دریافت سفارش‌ها انجام نشد.');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(body)».
    setData(body);
    // راهنما: این شرط بررسی می‌کند آیا «!selectedId && body.orders[0]» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!selectedId && body.orders[0]) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedId(body.orders[0].id)». */ setSelectedId(body.orders[0].id);
  }

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch((error) => setMessage(error.message))». */ void load().catch((error) => setMessage(error.message)); }, []);

  // راهنما: این دستور مقدار «selected» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const selected = useMemo(() => data?.orders.find((order) => order.id === selectedId) ?? null, [data, selectedId]);
  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => setNote(selected?.note ?? ''), [selected?.id]);

  // راهنما: این دستور مقدار «filtered» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const filtered = useMemo(() => {
    // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!data) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [];
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «filter === 'ALL' ? data.orders : data.orders.filter((order) => order.statu…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return filter === 'ALL' ? data.orders : data.orders.filter((order) => order.status === filter);
  }, [data, filter]);

  // راهنما: این تابع «mutate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function mutate(body: Record<string, unknown>) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')». */ setMessage('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
      const response = await fetch('/api/store/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const next = await response.json().catch(() => ({})) as OrdersData;
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(next.message || 'عملیات انجام نشد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('تغییرات ذخیره شد.')».
      setMessage('تغییرات ذخیره شد.');
    } catch (error) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(error instanceof Error ? error.message : 'عملیات انجام نشد.')».
      setMessage(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    } finally { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)». */ setBusy(false); }
  }

  // راهنما: این تابع «transition» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function transition(status: string) {
    // راهنما: این شرط بررسی می‌کند آیا «!selected» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!selected) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await mutate({ action: 'transition', orderId: selected.id, status })».
    await mutate({ action: 'transition', orderId: selected.id, status });
  }

  // راهنما: این تابع «saveNote» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function saveNote() {
    // راهنما: این شرط بررسی می‌کند آیا «!selected» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!selected) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await mutate({ action: 'update_note', orderId: selected.id, note })».
    await mutate({ action: 'update_note', orderId: selected.id, note });
  }

  // راهنما: این دستور متغیر/ثابت «nextActions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const nextActions = selected?.status === 'PAID'
    ? [{ status: 'PROCESSING', label: 'شروع پردازش' }]
    : selected?.status === 'PROCESSING'
      ? [{ status: 'COMPLETED', label: 'تکمیل سفارش' }]
      : selected?.status === 'AWAITING_PAYMENT' || selected?.status === 'NEW'
        ? [{ status: 'CANCELLED', label: 'لغو سفارش' }]
        : [];

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «( <div className="orders-page" dir="rtl"> <style>{styles}</style> <header …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (
    <div className="orders-page" dir="rtl">
      <style>{styles}</style>
      <header className="topbar">
        <div><b>AI PANEL</b><span>مدیریت سفارش فروشگاه</span></div>
        <nav><a href="/app">داشبورد</a><a href="/app/store">فروشگاه</a><a href="/app/telegram-builder">منوی تلگرام</a></nav>
      </header>

      <main>
        <section className="hero">
          <div><small>Commerce Operations</small><h1>سفارش‌ها</h1><p>سفارش، مشتری و وضعیت ارسال را مدیریت کن. موجودی سفارش‌های در انتظار پرداخت خودکار رزرو و در صورت لغو یا پایان مهلت آزاد می‌شود.</p></div>
          <button onClick={() => void load()} disabled={busy}>بروزرسانی</button>
        </section>

        {message && <div className="notice">{message}</div>}
        {!data ? <div className="loading">در حال دریافت سفارش‌ها...</div> : !data.store ? <div className="empty">ابتدا در بخش فروشگاه، فروشگاه Workspace را ایجاد کنید.</div> : <>
          <section className="stats">
            <article><span>کل سفارش‌ها</span><strong>{data.summary.total}</strong></article>
            <article><span>در انتظار پرداخت</span><strong>{data.summary.awaitingPayment}</strong></article>
            <article><span>پرداخت‌شده</span><strong>{data.summary.paid}</strong></article>
            <article><span>در حال پردازش</span><strong>{data.summary.processing}</strong></article>
            <article><span>تکمیل‌شده</span><strong>{data.summary.completed}</strong></article>
          </section>

          <section className="workspace">
            <aside>
              <div className="filters">
                {['ALL', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value === 'ALL' ? 'همه' : statusLabel[value]}</button>)}
              </div>
              <div className="order-list">
                {filtered.length === 0 ? <div className="empty small">سفارشی در این وضعیت نیست.</div> : filtered.map((order) => <button key={order.id} className={selectedId === order.id ? 'selected' : ''} onClick={() => setSelectedId(order.id)}>
                  <div><b>#{order.id.slice(0, 8)}</b><span>{statusLabel[order.status] || order.status}</span></div>
                  <small>{order.customer?.displayName || order.customer?.username || order.sourcePlatform}</small>
                  <strong>{money(order.totalAmount, order.currency)}</strong>
                  <em>{shortDate(order.createdAt)}{order.inventoryReservation?.status === 'RESERVED' ? ' · موجودی رزرو' : ''}</em>
                </button>)}
              </div>
            </aside>

            <article className="detail">
              {!selected ? <div className="empty">یک سفارش را انتخاب کنید.</div> : <>
                <div className="detail-head"><div><small>Order</small><h2>#{selected.id.slice(0, 12)}</h2></div><span className={`status ${selected.status.toLowerCase()}`}>{statusLabel[selected.status] || selected.status}</span></div>
                <div className="meta">
                  <div><span>کانال</span><b>{selected.sourcePlatform}</b></div>
                  <div><span>مشتری</span><b>{selected.customer?.displayName || selected.customer?.username || selected.customer?.externalUserId || '—'}</b></div>
                  <div><span>مبلغ</span><b>{money(selected.totalAmount, selected.currency)}</b></div>
                  <div><span>زمان ثبت</span><b>{shortDate(selected.createdAt)}</b></div>
                </div>

                {selected.inventoryReservation?.status === 'RESERVED' && <div className="reservation"><b>موجودی رزرو شده</b><span>{selected.inventoryReservation.quantity.toLocaleString('fa-IR')} واحد{selected.inventoryReservation.expiresAt ? ` · تا ${shortDate(selected.inventoryReservation.expiresAt)}` : ''}</span></div>}

                <h3>اقلام سفارش</h3>
                <div className="items">{selected.items.map((item) => <div key={item.id}><span><b>{item.titleSnapshot}</b><small>{item.quantity} × {money(item.unitPriceAmount, selected.currency)}</small></span><strong>{money(item.lineTotalAmount, selected.currency)}</strong></div>)}</div>

                <div className="totals"><span>جمع جزء <b>{money(selected.subtotalAmount, selected.currency)}</b></span><span>تخفیف <b>{money(selected.discountAmount, selected.currency)}</b></span><span className="grand">مبلغ نهایی <b>{money(selected.totalAmount, selected.currency)}</b></span></div>

                <label className="note">یادداشت داخلی<textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="یادداشت برای تیم فروش..." /></label>
                <div className="actions"><button className="secondary" disabled={busy} onClick={() => void saveNote()}>ذخیره یادداشت</button>{nextActions.map((action) => <button key={action.status} className={action.status === 'CANCELLED' ? 'danger' : 'primary'} disabled={busy} onClick={() => void transition(action.status)}>{action.label}</button>)}</div>
                {selected.status === 'AWAITING_PAYMENT' && <p className="warning">این سفارش هنوز پرداخت نشده است.{selected.inventoryReservation?.status === 'RESERVED' ? ' موجودی تا پایان مهلت بالا برای مشتری کنار گذاشته شده و بعد از آن خودکار آزاد می‌شود.' : ''} وضعیت «پرداخت‌شده» فقط باید توسط تأیید معتبر درگاه پرداخت ثبت شود.</p>}
              </>}
            </article>
          </section>
        </>}
      </main>
    </div>
  );
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
*{box-sizing:border-box}body{margin:0;background:#070a0f;color:#eef3fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.orders-page{min-height:100vh;background:#070a0f}.topbar{height:72px;border-bottom:1px solid #202938;background:#090e15;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(18px,4vw,58px);position:sticky;top:0;z-index:5}.topbar>div{display:grid;gap:2px}.topbar span,.topbar a{font-size:10px;color:#7e8b9f}.topbar nav{display:flex;gap:8px}.topbar a{text-decoration:none;border:1px solid #293447;padding:8px 10px;border-radius:10px;color:#b9c3d3}main{max-width:1450px;margin:auto;padding:36px clamp(16px,4vw,58px) 70px}.hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:20px}.hero small{color:#7d899c}.hero h1{font-size:36px;margin:4px 0}.hero p{color:#8390a3;line-height:1.8;max-width:780px;font-size:12px}.hero button,.actions button,.filters button{border:1px solid #2c3749;border-radius:10px;background:#101721;color:#d8dfeb;padding:9px 12px}.notice,.warning{border:1px solid #5d512d;background:#211d0f;color:#e7d99c;border-radius:11px;padding:11px 13px;margin-bottom:14px;font-size:11px}.loading,.empty{border:1px dashed #303b4d;border-radius:14px;padding:34px;color:#788599;text-align:center}.empty.small{padding:18px}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-bottom:12px}.stats article{border:1px solid #242f40;background:#0d141e;border-radius:14px;padding:14px}.stats span{display:block;color:#7f8b9e;font-size:9px}.stats strong{font-size:24px;display:block;margin-top:8px}.workspace{display:grid;grid-template-columns:360px 1fr;gap:12px}.workspace aside,.detail{border:1px solid #242f40;background:#0d131c;border-radius:16px;padding:13px;min-width:0}.filters{display:flex;gap:5px;overflow:auto;padding-bottom:10px}.filters button{font-size:9px;white-space:nowrap}.filters button.active{background:#e9eef6;color:#0b1018}.order-list{display:grid;gap:7px;max-height:720px;overflow:auto}.order-list>button{text-align:right;border:1px solid #273245;background:#090f17;color:#fff;border-radius:12px;padding:11px;display:grid;gap:7px}.order-list>button.selected{border-color:#7183a1;background:#111a27}.order-list>button>div{display:flex;justify-content:space-between}.order-list span,.order-list small,.order-list em{font-size:9px;color:#758297;font-style:normal}.order-list strong{font-size:12px}.detail{padding:20px}.detail-head{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #222c3b;padding-bottom:14px}.detail-head small{color:#738096}.detail-head h2{margin:4px 0}.status{border:1px solid #334057;padding:6px 9px;border-radius:999px;font-size:9px}.status.paid,.status.completed{border-color:#29634e;color:#9ce5c6}.status.awaiting_payment{border-color:#65562b;color:#e9d992}.status.cancelled{border-color:#6b333b;color:#f4a8b3}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.meta div{background:#090f17;border:1px solid #242e3f;border-radius:11px;padding:11px}.meta span{display:block;color:#758196;font-size:9px}.meta b{font-size:10px;display:block;margin-top:6px;overflow:hidden;text-overflow:ellipsis}.reservation{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #365b4c;background:#0b1c16;border-radius:11px;padding:10px 12px;margin:0 0 14px}.reservation b{font-size:10px;color:#a5e0c8}.reservation span{font-size:9px;color:#7fac99}.detail h3{font-size:13px;margin:20px 0 8px}.items{display:grid}.items>div{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #202938;padding:10px 2px}.items span{display:grid;gap:4px}.items small{color:#758297;font-size:9px}.items strong{font-size:11px}.totals{margin:14px 0;display:grid;gap:6px;padding:12px;background:#090f17;border:1px solid #242e3f;border-radius:12px}.totals span{display:flex;justify-content:space-between;color:#8490a2;font-size:10px}.totals .grand{color:#fff;border-top:1px solid #263143;padding-top:8px}.note{display:grid;gap:7px;color:#9aa5b5;font-size:10px}.note textarea{resize:vertical;border:1px solid #2b3547;background:#090f17;color:#fff;border-radius:11px;padding:11px}.actions{display:flex;gap:7px;margin-top:10px}.actions .primary{background:#eef3fa;color:#090e15;font-weight:800}.actions .danger{border-color:#683540;color:#f2a9b4;background:#241319}.warning{margin-top:14px;margin-bottom:0}@media(max-width:980px){.stats{grid-template-columns:repeat(2,1fr)}.workspace{grid-template-columns:1fr}.order-list{max-height:360px}}@media(max-width:620px){.topbar{height:auto;padding:12px;display:grid;gap:10px}.topbar nav{overflow:auto}.hero{display:grid}.stats,.meta{grid-template-columns:1fr 1fr}.actions{flex-wrap:wrap}.reservation{display:grid}}
`;
