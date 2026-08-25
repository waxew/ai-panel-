/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useCallback, useEffect, useMemo, useState, type FormEvent } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

// راهنما: این Type با نام «ProductType» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ProductType = { id: string; title: string; itemType: 'DIGITAL' | 'PHYSICAL' | 'SERVICE'; sortOrder: number };
// راهنما: این Type با نام «Category» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Category = { id: string; title: string; slug: string; isActive: boolean };
// راهنما: این Type با نام «StoreItem» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreItem = {
  id: string;
  categoryId?: string | null;
  title: string;
  description?: string | null;
  itemType: string;
  priceAmount: number | string;
  currency: string;
  inventoryCount?: number | null;
  isActive: boolean;
  metadata?: { productTypeId?: string } | null;
};
// راهنما: این Type با نام «StoreData» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreData = {
  ok: boolean;
  message?: string;
  store: null | { id: string; name: string; currency: string; status: string };
  productTypes: ProductType[];
  categories: Category[];
  items: StoreItem[];
  orders: Array<{ id: string; status: string; totalAmount: number | string; currency: string; createdAt: string }>;
  shareTargets?: { telegram?: Array<{ id: string; username: string; displayName?: string | null }> };
  summary: { itemCount: number; categoryCount: number; orderCount: number; paidOrderCount: number; customerCount: number };
};
// راهنما: این Type با نام «ProductForm» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ProductForm = { title: string; description: string; priceAmount: string; inventoryCount: string; productTypeId: string; categoryId: string };
// راهنما: این Type با نام «DeliveryType» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DeliveryType = ProductType['itemType'];

// راهنما: این تابع «api» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function api(body?: Record<string, unknown>) {
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch('/api/store', body ? {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  } : { headers: { accept: 'application/json' }, cache: 'no-store' });
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = (await response.json().catch(() => ({}))) as StoreData;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ response, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { response, data };
}

// راهنما: این تابع «money» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function money(value: number | string, currency = 'IRR') {
  // راهنما: این دستور متغیر/ثابت «amount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const amount = Number(value ?? 0);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${new Intl.NumberFormat('fa-IR').format(Number.isFinite(amount) ? amount …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${new Intl.NumberFormat('fa-IR').format(Number.isFinite(amount) ? amount : 0)} ${currency === 'IRR' ? 'ریال' : currency}`;
}

// راهنما: این دستور متغیر/ثابت «deliveryLabels» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const deliveryLabels: Record<string, string> = {
  DIGITAL: 'آنلاین / دیجیتال',
  PHYSICAL: 'ارسال فیزیکی',
  SERVICE: 'خدمت',
};

// راهنما: این دستور متغیر/ثابت «blankProduct» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const blankProduct: ProductForm = { title: '', description: '', priceAmount: '', inventoryCount: '', productTypeId: '', categoryId: '' };

// راهنما: این تابع «StoreManagerV2» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function StoreManagerV2() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<StoreData | null>(null);
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[message, setMessage]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [message, setMessage] = useState('');
  // راهنما: این دستور State محلی React برای «[messageOk, setMessageOk]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [messageOk, setMessageOk] = useState(false);
  // راهنما: این دستور State محلی React برای «[storeName, setStoreName]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [storeName, setStoreName] = useState('فروشگاه من');
  // راهنما: این دستور State محلی React برای «[categoryTitle, setCategoryTitle]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [categoryTitle, setCategoryTitle] = useState('');
  // راهنما: این دستور State محلی React برای «[typeTitle, setTypeTitle]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [typeTitle, setTypeTitle] = useState('');
  // راهنما: این دستور متغیر/ثابت «[typeDelivery, setTypeDelivery]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [typeDelivery, setTypeDelivery] = useState<DeliveryType>('DIGITAL');
  // راهنما: این دستور State محلی React برای «[showCategories, setShowCategories]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showCategories, setShowCategories] = useState(false);
  // راهنما: این دستور State محلی React برای «[showTypes, setShowTypes]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showTypes, setShowTypes] = useState(false);
  // راهنما: این دستور State محلی React برای «[showBulkPricing, setShowBulkPricing]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showBulkPricing, setShowBulkPricing] = useState(false);
  // راهنما: این دستور State محلی React برای «[bulkCategoryId, setBulkCategoryId]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  // راهنما: این دستور State محلی React برای «[bulkPrice, setBulkPrice]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [bulkPrice, setBulkPrice] = useState('');
  // راهنما: این دستور متغیر/ثابت «[product, setProduct]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [product, setProduct] = useState<ProductForm>(blankProduct);
  // راهنما: این دستور متغیر/ثابت «[editingId, setEditingId]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [editingId, setEditingId] = useState<string | null>(null);
  // راهنما: این دستور متغیر/ثابت «[editing, setEditing]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [editing, setEditing] = useState<ProductForm>(blankProduct);
  // راهنما: این دستور متغیر/ثابت «[editingTypeId, setEditingTypeId]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  // راهنما: این دستور State محلی React برای «[editingTypeTitle, setEditingTypeTitle]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [editingTypeTitle, setEditingTypeTitle] = useState('');
  // راهنما: این دستور متغیر/ثابت «[editingTypeDelivery, setEditingTypeDelivery]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [editingTypeDelivery, setEditingTypeDelivery] = useState<DeliveryType>('DIGITAL');

  // راهنما: این دستور تابع «load» را با useCallback نگه می‌دارد تا مرجع تابع بین Renderها بی‌دلیل عوض نشود.
  const load = useCallback(async () => {
    // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { response, data: next } = await api();
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.assign('/login')». */ window.location.assign('/login'); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(next.message || 'load_failed');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
    setData(next);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setProduct((current) => ({ ...current, productTypeId: current.productTypeId || next.produ…».
    setProduct((current) => ({ ...current, productTypeId: current.productTypeId || next.productTypes?.[0]?.id || '' }));
  }, []);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch(() => setMessage('اطلاعات فروشگاه دریافت نشد.'))». */ void load().catch(() => setMessage('اطلاعات فروشگاه دریافت نشد.')); }, [load]);

  // راهنما: این تابع «action» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function action(body: Record<string, unknown>, successMessage?: string) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')». */ setMessage(''); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessageOk(false)». */ setMessageOk(false);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ response, data: next }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { response, data: next } = await api(body);
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(next.message || 'عملیات انجام نشد.')». */ setMessage(next.message || 'عملیات انجام نشد.'); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(next)».
      setData(next);
      // راهنما: این شرط بررسی می‌کند آیا «successMessage» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (successMessage) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(successMessage)». */ setMessage(successMessage); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessageOk(true)». */ setMessageOk(true); }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return true;
    } catch {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('ارتباط با فروشگاه برقرار نشد.')».
      setMessage('ارتباط با فروشگاه برقرار نشد.');
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return false;
    } finally { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)». */ setBusy(false); }
  }

  // راهنما: این تابع «createStore» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createStore(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await action({ action: 'ensure_store', name: storeName }, 'فروشگاه ساخته شد.')».
    await action({ action: 'ensure_store', name: storeName }, 'فروشگاه ساخته شد.');
  }

  // راهنما: این تابع «createProduct» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createProduct(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await action({
      action: 'create_item',
      title: product.title,
      description: product.description,
      priceAmount: Number(product.priceAmount),
      inventoryCount: product.inventoryCount === '' ? null : Number(product.inventoryCount),
      productTypeId: product.productTypeId || null,
      categoryId: product.categoryId || null,
    }, 'محصول اضافه شد.');
    // راهنما: این شرط بررسی می‌کند آیا «ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setProduct((current) => ({ ...blankProduct, productTypeId: current.productTypeId, categor…». */ setProduct((current) => ({ ...blankProduct, productTypeId: current.productTypeId, categoryId: current.categoryId }));
  }

  // راهنما: این تابع «startEdit» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function startEdit(item: StoreItem) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingId(item.id)».
    setEditingId(item.id);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditing({ title: item.title, description: item.description ?? '', priceAmount: String(…».
    setEditing({
      title: item.title,
      description: item.description ?? '',
      priceAmount: String(item.priceAmount ?? ''),
      inventoryCount: item.inventoryCount == null ? '' : String(item.inventoryCount),
      productTypeId: item.metadata?.productTypeId ?? '',
      categoryId: item.categoryId ?? '',
    });
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')».
    setMessage('');
  }

  // راهنما: این تابع «saveEdit» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function saveEdit(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «!editingId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!editingId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await action({
      action: 'update_item',
      itemId: editingId,
      title: editing.title,
      description: editing.description,
      priceAmount: Number(editing.priceAmount),
      inventoryCount: editing.inventoryCount === '' ? null : Number(editing.inventoryCount),
      productTypeId: editing.productTypeId || null,
      categoryId: editing.categoryId || null,
    }, 'محصول ویرایش شد.');
    // راهنما: این شرط بررسی می‌کند آیا «ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingId(null)». */ setEditingId(null);
  }

  // راهنما: این تابع «toggleProduct» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function toggleProduct(item: StoreItem) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await action({ action: 'toggle_item', itemId: item.id, isActive: !item.isActive }, item.i…».
    await action({ action: 'toggle_item', itemId: item.id, isActive: !item.isActive }, item.isActive ? 'محصول غیرفعال شد.' : 'محصول فعال شد.');
  }

  // راهنما: این تابع «deleteProduct» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function deleteProduct(item: StoreItem) {
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm(`محصول «${item.title}» حذف شود؟ سوابق سفارش‌ها حفظ می‌شوند.`)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm(`محصول «${item.title}» حذف شود؟ سوابق سفارش‌ها حفظ می‌شوند.`)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await action({ action: 'delete_item', itemId: item.id }, 'محصول حذف شد.');
    // راهنما: این شرط بررسی می‌کند آیا «ok && editingId === item.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok && editingId === item.id) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingId(null)». */ setEditingId(null);
  }

  // راهنما: این تابع «copyProductLink» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function copyProductLink(item: StoreItem) {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = data?.shareTargets?.telegram?.[0];
    // راهنما: این شرط بررسی می‌کند آیا «!bot?.username» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot?.username) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('برای ساخت لینک مستقیم محصول، ابتدا یک ربات تلگرام فعال متصل کن.')».
      setMessage('برای ساخت لینک مستقیم محصول، ابتدا یک ربات تلگرام فعال متصل کن.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessageOk(false)».
      setMessageOk(false);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return;
    }
    // راهنما: این دستور متغیر/ثابت «username» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const username = bot.username.replace(/^@/, '');
    // راهنما: این دستور متغیر/ثابت «link» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const link = `https://t.me/${username}?start=${encodeURIComponent(`p_${item.id}`)}`;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این شرط بررسی می‌کند آیا «!navigator.clipboard?.writeText» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!navigator.clipboard?.writeText) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error('clipboard_unavailable');
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await navigator.clipboard.writeText(link)».
      await navigator.clipboard.writeText(link);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(`لینک «${item.title}» کپی شد.`)».
      setMessage(`لینک «${item.title}» کپی شد.`);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessageOk(true)».
      setMessageOk(true);
    } catch {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.prompt('لینک مستقیم محصول:', link)».
      window.prompt('لینک مستقیم محصول:', link);
    }
  }

  // راهنما: این تابع «bulkSetPrice» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function bulkSetPrice(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این دستور متغیر/ثابت «price» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const price = Number(bulkPrice);
    // راهنما: این شرط بررسی می‌کند آیا «!Number.isSafeInteger(price) || price < 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!Number.isSafeInteger(price) || price < 0) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('قیمت جدید معتبر نیست.')». */ setMessage('قیمت جدید معتبر نیست.'); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessageOk(false)». */ setMessageOk(false); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این دستور متغیر/ثابت «category» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const category = bulkCategoryId ? data?.categories.find((item) => item.id === bulkCategoryId) : null;
    // راهنما: این دستور متغیر/ثابت «target» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const target = category ? `محصولات دسته «${category.title}»` : 'همه محصولات';
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm(`قیمت ${target} روی ${money(price, data?.store?.currency ?? 'IR…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm(`قیمت ${target} روی ${money(price, data?.store?.currency ?? 'IRR')} تنظیم شود؟`)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await action({ action: 'bulk_set_price', categoryId: bulkCategoryId || null, priceAmount: price }, 'قیمت محصولات هدف به‌روزرسانی شد.');
    // راهنما: این شرط بررسی می‌کند آیا «ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBulkPrice('')». */ setBulkPrice('');
  }

  // راهنما: این تابع «createCategory» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createCategory(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «await action({ action: 'create_category', title: categoryTitle }, 'دسته‌بندی اض…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (await action({ action: 'create_category', title: categoryTitle }, 'دسته‌بندی اضافه شد.')) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setCategoryTitle('')». */ setCategoryTitle('');
  }

  // راهنما: این تابع «renameCategory» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function renameCategory(category: Category) {
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = window.prompt('نام جدید دسته‌بندی:', category.title)?.trim();
    // راهنما: این شرط بررسی می‌کند آیا «!title || title === category.title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title || title === category.title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await action({ action: 'update_category', categoryId: category.id, title }, 'دسته‌بندی وی…».
    await action({ action: 'update_category', categoryId: category.id, title }, 'دسته‌بندی ویرایش شد.');
  }

  // راهنما: این تابع «deleteCategory» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function deleteCategory(category: Category) {
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm(`دسته «${category.title}» حذف شود؟ محصولات حذف نمی‌شوند و فقط ب…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm(`دسته «${category.title}» حذف شود؟ محصولات حذف نمی‌شوند و فقط بدون دسته خواهند شد.`)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این شرط بررسی می‌کند آیا «await action({ action: 'delete_category', categoryId: category.id }, 'دسته‌بندی…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (await action({ action: 'delete_category', categoryId: category.id }, 'دسته‌بندی حذف شد.')) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setProduct((current) => current.categoryId === category.id ? { ...current, categoryId: ''…».
      setProduct((current) => current.categoryId === category.id ? { ...current, categoryId: '' } : current);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditing((current) => current.categoryId === category.id ? { ...current, categoryId: ''…».
      setEditing((current) => current.categoryId === category.id ? { ...current, categoryId: '' } : current);
      // راهنما: این شرط بررسی می‌کند آیا «bulkCategoryId === category.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (bulkCategoryId === category.id) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBulkCategoryId('')». */ setBulkCategoryId('');
    }
  }

  // راهنما: این تابع «createProductType» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createProductType(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «await action({ action: 'create_product_type', title: typeTitle, itemType: typeD…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (await action({ action: 'create_product_type', title: typeTitle, itemType: typeDelivery }, 'نوع محصول اضافه شد.')) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTypeTitle('')». */ setTypeTitle('');
  }

  // راهنما: این تابع «startProductTypeEdit» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function startProductTypeEdit(productType: ProductType) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingTypeId(productType.id)».
    setEditingTypeId(productType.id);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingTypeTitle(productType.title)».
    setEditingTypeTitle(productType.title);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingTypeDelivery(productType.itemType)».
    setEditingTypeDelivery(productType.itemType);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')».
    setMessage('');
  }

  // راهنما: این تابع «saveProductTypeEdit» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function saveProductTypeEdit(event: FormEvent) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «event.preventDefault()».
    event.preventDefault();
    // راهنما: این شرط بررسی می‌کند آیا «!editingTypeId || !editingTypeTitle.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!editingTypeId || !editingTypeTitle.trim()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = await action({ action: 'update_product_type', productTypeId: editingTypeId, title: editingTypeTitle, itemType: editingTypeDelivery }, 'نوع محصول ویرایش شد.');
    // راهنما: این شرط بررسی می‌کند آیا «ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (ok) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingTypeId(null)». */ setEditingTypeId(null);
  }

  // راهنما: این تابع «deleteProductType» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function deleteProductType(productType: ProductType) {
    // راهنما: این شرط بررسی می‌کند آیا «!window.confirm(`نوع «${productType.title}» حذف شود؟ محصولات قبلی حذف نمی‌شوند …» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!window.confirm(`نوع «${productType.title}» حذف شود؟ محصولات قبلی حذف نمی‌شوند و فقط از این نوع جدا خواهند شد.`)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این شرط بررسی می‌کند آیا «await action({ action: 'delete_product_type', productTypeId: productType.id }, …» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (await action({ action: 'delete_product_type', productTypeId: productType.id }, 'نوع محصول حذف شد.')) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setProduct((current) => current.productTypeId === productType.id ? { ...current, productT…».
      setProduct((current) => current.productTypeId === productType.id ? { ...current, productTypeId: '' } : current);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditing((current) => current.productTypeId === productType.id ? { ...current, productT…».
      setEditing((current) => current.productTypeId === productType.id ? { ...current, productTypeId: '' } : current);
      // راهنما: این شرط بررسی می‌کند آیا «editingTypeId === productType.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (editingTypeId === productType.id) /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setEditingTypeId(null)». */ setEditingTypeId(null);
    }
  }

  // راهنما: این دستور مقدار «typeMap» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const typeMap = useMemo(() => new Map((data?.productTypes ?? []).map((item) => [item.id, item])), [data?.productTypes]);
  // راهنما: این دستور مقدار «categoryMap» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const categoryMap = useMemo(() => new Map((data?.categories ?? []).map((item) => [item.id, item])), [data?.categories]);
  // راهنما: این دستور متغیر/ثابت «canShareTelegram» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const canShareTelegram = Boolean(data?.shareTargets?.telegram?.[0]?.username);

  // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!data) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="store-simple loading" dir="rtl"><style>{styles}</style><sp…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="store-simple loading" dir="rtl"><style>{styles}</style><span>در حال بارگذاری فروشگاه...</span></div>;

  // راهنما: این شرط بررسی می‌کند آیا «!data.store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!data.store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="store-simple" dir="rtl"><style>{styles}</style><main class…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="store-simple" dir="rtl"><style>{styles}</style><main className="narrow"><a className="back" href="/app">← داشبورد</a><section className="hero"><span>شروع فروش</span><h1>فروشگاهت را بساز</h1><p>فقط یک نام لازم است. دسته‌بندی و محصول را بعداً اضافه می‌کنی.</p></section><form className="setup card" onSubmit={createStore}><label>نام فروشگاه<input value={storeName} onChange={(event) => setStoreName(event.target.value)} required /></label><button disabled={busy}>{busy ? 'در حال ساخت...' : 'ساخت فروشگاه'}</button></form></main></div>;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="store-simple" dir="rtl"><style>{styles}</style><main> <hea…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="store-simple" dir="rtl"><style>{styles}</style><main>
    <header className="top"><div><a className="back" href="/app">← داشبورد</a><h1>{data.store.name}</h1><p>محصول، نوع و دسته را از همین صفحه مدیریت کن.</p></div><a className="orders" href="/app/orders">سفارش‌ها</a></header>

    {message && <div className={`notice ${messageOk ? 'ok' : ''}`}>{message}</div>}

    <section className="summary">
      <article><b>{data.summary.itemCount.toLocaleString('fa-IR')}</b><span>محصول</span></article>
      <article><b>{data.summary.orderCount.toLocaleString('fa-IR')}</b><span>سفارش</span></article>
      <article><b>{data.summary.customerCount.toLocaleString('fa-IR')}</b><span>مشتری</span></article>
    </section>

    <section className="layout">
      <article className="card add-product">
        <div className="section-title"><div><span>محصول جدید</span><h2>افزودن محصول</h2></div></div>
        <form onSubmit={createProduct}>
          <label>نام محصول<input value={product.title} onChange={(event) => setProduct({ ...product, title: event.target.value })} required /></label>
          <label>قیمت<input type="number" min="0" inputMode="numeric" value={product.priceAmount} onChange={(event) => setProduct({ ...product, priceAmount: event.target.value })} required /></label>
          <label>نوع محصول<select value={product.productTypeId} onChange={(event) => setProduct({ ...product, productTypeId: event.target.value })}><option value="">نوع عمومی</option>{data.productTypes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>دسته‌بندی<select value={product.categoryId} onChange={(event) => setProduct({ ...product, categoryId: event.target.value })}><option value="">بدون دسته</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          <label>موجودی <small>اختیاری</small><input type="number" min="0" inputMode="numeric" value={product.inventoryCount} onChange={(event) => setProduct({ ...product, inventoryCount: event.target.value })} /></label>
          <label className="wide">توضیح <small>اختیاری</small><textarea rows={3} value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /></label>
          <button className="primary wide" disabled={busy}>{busy ? 'در حال ثبت...' : 'ثبت محصول'}</button>
        </form>
      </article>

      <div className="side">
        <article className="card manager">
          <button className="manager-head" type="button" onClick={() => setShowTypes((value) => !value)}><span><b>نوع محصول</b><small>{data.productTypes.length.toLocaleString('fa-IR')} نوع</small></span><em>{showTypes ? 'بستن' : 'مدیریت'}</em></button>
          {showTypes && <div className="manager-body"><form className="inline-add" onSubmit={createProductType}><input placeholder="مثلاً دوره آموزشی" value={typeTitle} onChange={(event) => setTypeTitle(event.target.value)} required /><select value={typeDelivery} onChange={(event) => setTypeDelivery(event.target.value as DeliveryType)}><option value="DIGITAL">آنلاین</option><option value="PHYSICAL">ارسال فیزیکی</option><option value="SERVICE">خدمت</option></select><button disabled={busy}>افزودن</button></form>{editingTypeId && <form className="type-edit" onSubmit={saveProductTypeEdit}><label>نام نوع<input value={editingTypeTitle} onChange={(event) => setEditingTypeTitle(event.target.value)} required /></label><label>روش ارائه<select value={editingTypeDelivery} onChange={(event) => setEditingTypeDelivery(event.target.value as DeliveryType)}><option value="DIGITAL">آنلاین / دیجیتال</option><option value="PHYSICAL">ارسال فیزیکی</option><option value="SERVICE">خدمت</option></select></label><div><button className="primary" disabled={busy}>ذخیره</button><button type="button" onClick={() => setEditingTypeId(null)}>لغو</button></div></form>}<div className="rows">{data.productTypes.map((item) => <div key={item.id}><span><b>{item.title}</b><small>{deliveryLabels[item.itemType]}</small></span><button type="button" onClick={() => startProductTypeEdit(item)}>ویرایش</button><button className="danger" type="button" onClick={() => void deleteProductType(item)}>حذف</button></div>)}</div></div>}
        </article>

        <article className="card manager">
          <button className="manager-head" type="button" onClick={() => setShowCategories((value) => !value)}><span><b>دسته‌بندی</b><small>{data.categories.length.toLocaleString('fa-IR')} دسته</small></span><em>{showCategories ? 'بستن' : 'مدیریت'}</em></button>
          {showCategories && <div className="manager-body"><form className="inline-add category" onSubmit={createCategory}><input placeholder="مثلاً آموزش" value={categoryTitle} onChange={(event) => setCategoryTitle(event.target.value)} required /><button disabled={busy}>افزودن</button></form><div className="rows">{data.categories.map((item) => <div key={item.id}><span><b>{item.title}</b></span><button type="button" onClick={() => void renameCategory(item)}>ویرایش</button><button className="danger" type="button" onClick={() => void deleteCategory(item)}>حذف</button></div>)}</div></div>}
        </article>

        <article className="card manager">
          <button className="manager-head" type="button" onClick={() => setShowBulkPricing((value) => !value)}><span><b>تغییر گروهی قیمت</b><small>همه یا یک دسته</small></span><em>{showBulkPricing ? 'بستن' : 'باز کردن'}</em></button>
          {showBulkPricing && <div className="manager-body"><p className="manager-help">یک قیمت جدید را یک‌جا روی همه محصولات یا فقط یک دسته اعمال کن.</p><form className="bulk-form" onSubmit={bulkSetPrice}><label>محصولات<select value={bulkCategoryId} onChange={(event) => setBulkCategoryId(event.target.value)}><option value="">همه محصولات</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>قیمت جدید<input type="number" min="0" inputMode="numeric" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} placeholder="مثلاً 250000" required /></label><button className="primary" disabled={busy}>اعمال قیمت</button></form></div>}
        </article>
      </div>
    </section>

    <section className="products card">
      <div className="section-title"><div><span>محصولات</span><h2>فهرست محصولات</h2></div><b>{data.items.length.toLocaleString('fa-IR')}</b></div>
      {canShareTelegram && <p className="share-hint">لینک مستقیم هر محصول، مشتری را داخل ربات تلگرام مستقیماً روی همان محصول باز می‌کند.</p>}
      {editingId && <form className="edit-product" onSubmit={saveEdit}><div className="edit-head"><b>ویرایش محصول</b><button type="button" onClick={() => setEditingId(null)}>بستن</button></div><label>نام<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></label><label>قیمت<input type="number" min="0" value={editing.priceAmount} onChange={(event) => setEditing({ ...editing, priceAmount: event.target.value })} required /></label><label>نوع<select value={editing.productTypeId} onChange={(event) => setEditing({ ...editing, productTypeId: event.target.value })}><option value="">نوع عمومی</option>{data.productTypes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>دسته<select value={editing.categoryId} onChange={(event) => setEditing({ ...editing, categoryId: event.target.value })}><option value="">بدون دسته</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>موجودی<input type="number" min="0" value={editing.inventoryCount} onChange={(event) => setEditing({ ...editing, inventoryCount: event.target.value })} placeholder="نامحدود" /></label><label className="edit-wide">توضیح<textarea rows={3} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><button className="primary edit-wide" disabled={busy}>{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></form>}
      {data.items.length === 0 ? <div className="empty">هنوز محصولی ثبت نشده.</div> : <div className="product-list">{data.items.map((item) => { /* راهنما: این دستور متغیر/ثابت «customType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const customType = item.metadata?.productTypeId ? typeMap.get(item.metadata.productTypeId) : undefined; /* راهنما: این دستور متغیر/ثابت «category» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const category = item.categoryId ? categoryMap.get(item.categoryId) : undefined; /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div key={item.id} className={!item.isActive ? 'inactive' : ''}><span><b>{…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div key={item.id} className={!item.isActive ? 'inactive' : ''}><span><b>{item.title}</b><small>{customType?.title || deliveryLabels[item.itemType] || 'محصول'}{category ? ` · ${category.title}` : ''}{!item.isActive ? ' · غیرفعال' : ''}</small></span><strong>{money(item.priceAmount, item.currency)}</strong><div className="product-actions">{canShareTelegram && item.isActive && <button type="button" onClick={() => void copyProductLink(item)}>کپی لینک</button>}<button type="button" onClick={() => startEdit(item)}>ویرایش</button><button type="button" onClick={() => void toggleProduct(item)}>{item.isActive ? 'غیرفعال' : 'فعال'}</button><button className="danger" type="button" onClick={() => void deleteProduct(item)}>حذف</button></div></div>; })}</div>}
    </section>
  </main></div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
.store-simple{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.store-simple *{box-sizing:border-box}.store-simple main{max-width:1180px;margin:auto;padding:34px 20px 110px}.store-simple .narrow{max-width:720px}.back{color:#8290a4;text-decoration:none;font-size:12px}.top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}.top h1,.hero h1{font-size:32px;margin:8px 0 6px}.top p,.hero p{color:#8592a5;margin:0;line-height:1.8}.orders,.primary,.store-simple button{border:0;border-radius:11px;padding:11px 14px;font:800 12px inherit;cursor:pointer}.orders,.primary{background:#f4f6fa;color:#080b10;text-decoration:none}.store-simple button:disabled{opacity:.5;cursor:wait}.card{border:1px solid #232c3b;background:#0d131c;border-radius:17px}.notice{margin:0 0 14px;padding:12px 14px;border:1px solid #60323b;background:#25151a;color:#ffc1cb;border-radius:12px;font-size:12px}.notice.ok{border-color:#245b46;background:#0d241b;color:#9de5c7}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.summary article{border:1px solid #222c3a;background:#0d131c;border-radius:14px;padding:15px}.summary b{font-size:24px;display:block}.summary span{font-size:11px;color:#7f8c9f}.layout{display:grid;grid-template-columns:1.3fr .7fr;gap:12px}.add-product{padding:18px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.section-title span{font-size:10px;color:#7f8c9f}.section-title h2{margin:4px 0;font-size:20px}.add-product form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.add-product label,.edit-product label,.type-edit label,.bulk-form label{display:grid;gap:6px;color:#a9b3c1;font-size:11px}.add-product label small{color:#687588}.add-product input,.add-product select,.add-product textarea,.inline-add input,.inline-add select,.edit-product input,.edit-product select,.edit-product textarea,.type-edit input,.type-edit select,.bulk-form input,.bulk-form select{width:100%;border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:11px;outline:none}.wide{grid-column:1/-1}.side{display:grid;align-content:start;gap:12px}.manager{overflow:hidden}.manager-head{width:100%;background:transparent;color:#fff;display:flex;align-items:center;justify-content:space-between;text-align:right;padding:16px}.manager-head span{display:grid;gap:4px}.manager-head small{font-size:9px;color:#738095}.manager-head em{font-style:normal;color:#9eabba;font-size:10px}.manager-body{padding:0 14px 14px;border-top:1px solid #202938}.manager-help,.share-hint{margin:12px 0;color:#7f8c9f;font-size:10px;line-height:1.8}.inline-add{display:grid;grid-template-columns:1fr 105px auto;gap:6px;padding:13px 0}.inline-add.category{grid-template-columns:1fr auto}.bulk-form{display:grid;gap:9px}.type-edit{display:grid;grid-template-columns:1fr 130px;gap:8px;padding:12px;margin-bottom:8px;border:1px solid #334056;background:#0a1018;border-radius:12px}.type-edit>div{grid-column:1/-1;display:flex;gap:6px}.inline-add button,.rows button,.product-actions button,.edit-head button,.type-edit button{background:#17202d;color:#d9e0ea}.rows{display:grid}.rows>div{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;padding:9px 0;border-top:1px solid #1d2633}.rows span{display:grid;gap:3px}.rows b{font-size:11px}.rows small{font-size:9px;color:#758297}.danger{color:#ffb4c0!important}.products{margin-top:12px;padding:18px}.edit-product{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px;padding:14px;border:1px solid #334056;background:#0a1018;border-radius:13px}.edit-head{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between}.edit-wide{grid-column:1/-1}.product-list{display:grid}.product-list>div{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:14px;padding:12px 2px;border-top:1px solid #1d2633}.product-list>div.inactive{opacity:.58}.product-list span{display:grid;gap:4px}.product-list b,.product-list strong{font-size:12px}.product-list small{font-size:10px;color:#778499}.product-actions{display:flex;gap:5px;flex-wrap:wrap}.product-actions button{padding:8px 9px;font-size:10px}.empty{padding:28px;text-align:center;color:#6d7a8d;border:1px dashed #2a3444;border-radius:12px}.setup{padding:20px;margin-top:24px;display:grid;gap:12px}.setup label{display:grid;gap:7px;color:#9faaba;font-size:11px}.setup input{border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:12px}.setup button{background:#f4f6fa;color:#080b10}.loading{display:grid;place-items:center;color:#8290a4}
@media(max-width:820px){.layout{grid-template-columns:1fr}.summary{grid-template-columns:repeat(3,1fr)}.product-list>div{grid-template-columns:1fr auto}.product-actions{grid-column:1/-1}}@media(max-width:560px){.store-simple main{padding:24px 13px 90px}.top{display:grid}.summary{grid-template-columns:repeat(3,1fr)}.summary article{padding:11px}.summary b{font-size:19px}.add-product form,.edit-product,.type-edit{grid-template-columns:1fr}.wide,.edit-head,.edit-wide,.type-edit>div{grid-column:auto}.inline-add,.inline-add.category{grid-template-columns:1fr}.rows>div{grid-template-columns:1fr auto auto}.product-list>div{grid-template-columns:1fr}.product-actions{grid-column:auto}.top h1,.hero h1{font-size:27px}}
`;
