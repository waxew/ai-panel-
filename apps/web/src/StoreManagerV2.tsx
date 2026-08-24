import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

type ProductType = { id: string; title: string; itemType: 'DIGITAL' | 'PHYSICAL' | 'SERVICE'; sortOrder: number };
type Category = { id: string; title: string; slug: string; isActive: boolean };
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
type StoreData = {
  ok: boolean;
  message?: string;
  store: null | { id: string; name: string; currency: string; status: string };
  productTypes: ProductType[];
  categories: Category[];
  items: StoreItem[];
  orders: Array<{ id: string; status: string; totalAmount: number | string; currency: string; createdAt: string }>;
  summary: { itemCount: number; categoryCount: number; orderCount: number; paidOrderCount: number; customerCount: number };
};
type ProductForm = { title: string; description: string; priceAmount: string; inventoryCount: string; productTypeId: string; categoryId: string };
type DeliveryType = ProductType['itemType'];

async function api(body?: Record<string, unknown>) {
  const response = await fetch('/api/store', body ? {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  } : { headers: { accept: 'application/json' }, cache: 'no-store' });
  const data = (await response.json().catch(() => ({}))) as StoreData;
  return { response, data };
}

function money(value: number | string, currency = 'IRR') {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat('fa-IR').format(Number.isFinite(amount) ? amount : 0)} ${currency === 'IRR' ? 'ریال' : currency}`;
}

const deliveryLabels: Record<string, string> = {
  DIGITAL: 'آنلاین / دیجیتال',
  PHYSICAL: 'ارسال فیزیکی',
  SERVICE: 'خدمت',
};

const blankProduct: ProductForm = { title: '', description: '', priceAmount: '', inventoryCount: '', productTypeId: '', categoryId: '' };

export default function StoreManagerV2() {
  const [data, setData] = useState<StoreData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageOk, setMessageOk] = useState(false);
  const [storeName, setStoreName] = useState('فروشگاه من');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [typeTitle, setTypeTitle] = useState('');
  const [typeDelivery, setTypeDelivery] = useState<DeliveryType>('DIGITAL');
  const [showCategories, setShowCategories] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [product, setProduct] = useState<ProductForm>(blankProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductForm>(blankProduct);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeTitle, setEditingTypeTitle] = useState('');
  const [editingTypeDelivery, setEditingTypeDelivery] = useState<DeliveryType>('DIGITAL');

  const load = useCallback(async () => {
    const { response, data: next } = await api();
    if (response.status === 401) { window.location.assign('/login'); return; }
    if (!response.ok) throw new Error(next.message || 'load_failed');
    setData(next);
    setProduct((current) => ({ ...current, productTypeId: current.productTypeId || next.productTypes?.[0]?.id || '' }));
  }, []);

  useEffect(() => { void load().catch(() => setMessage('اطلاعات فروشگاه دریافت نشد.')); }, [load]);

  async function action(body: Record<string, unknown>, successMessage?: string) {
    setBusy(true); setMessage(''); setMessageOk(false);
    try {
      const { response, data: next } = await api(body);
      if (!response.ok) { setMessage(next.message || 'عملیات انجام نشد.'); return false; }
      setData(next);
      if (successMessage) { setMessage(successMessage); setMessageOk(true); }
      return true;
    } catch {
      setMessage('ارتباط با فروشگاه برقرار نشد.');
      return false;
    } finally { setBusy(false); }
  }

  async function createStore(event: FormEvent) {
    event.preventDefault();
    await action({ action: 'ensure_store', name: storeName }, 'فروشگاه ساخته شد.');
  }

  async function createProduct(event: FormEvent) {
    event.preventDefault();
    const ok = await action({
      action: 'create_item',
      title: product.title,
      description: product.description,
      priceAmount: Number(product.priceAmount),
      inventoryCount: product.inventoryCount === '' ? null : Number(product.inventoryCount),
      productTypeId: product.productTypeId || null,
      categoryId: product.categoryId || null,
    }, 'محصول اضافه شد.');
    if (ok) setProduct((current) => ({ ...blankProduct, productTypeId: current.productTypeId, categoryId: current.categoryId }));
  }

  function startEdit(item: StoreItem) {
    setEditingId(item.id);
    setEditing({
      title: item.title,
      description: item.description ?? '',
      priceAmount: String(item.priceAmount ?? ''),
      inventoryCount: item.inventoryCount == null ? '' : String(item.inventoryCount),
      productTypeId: item.metadata?.productTypeId ?? '',
      categoryId: item.categoryId ?? '',
    });
    setMessage('');
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
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
    if (ok) setEditingId(null);
  }

  async function toggleProduct(item: StoreItem) {
    await action({ action: 'toggle_item', itemId: item.id, isActive: !item.isActive }, item.isActive ? 'محصول غیرفعال شد.' : 'محصول فعال شد.');
  }

  async function deleteProduct(item: StoreItem) {
    if (!window.confirm(`محصول «${item.title}» حذف شود؟ سوابق سفارش‌ها حفظ می‌شوند.`)) return;
    const ok = await action({ action: 'delete_item', itemId: item.id }, 'محصول حذف شد.');
    if (ok && editingId === item.id) setEditingId(null);
  }

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    if (await action({ action: 'create_category', title: categoryTitle }, 'دسته‌بندی اضافه شد.')) setCategoryTitle('');
  }

  async function renameCategory(category: Category) {
    const title = window.prompt('نام جدید دسته‌بندی:', category.title)?.trim();
    if (!title || title === category.title) return;
    await action({ action: 'update_category', categoryId: category.id, title }, 'دسته‌بندی ویرایش شد.');
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`دسته «${category.title}» حذف شود؟ محصولات حذف نمی‌شوند و فقط بدون دسته خواهند شد.`)) return;
    if (await action({ action: 'delete_category', categoryId: category.id }, 'دسته‌بندی حذف شد.')) {
      setProduct((current) => current.categoryId === category.id ? { ...current, categoryId: '' } : current);
      setEditing((current) => current.categoryId === category.id ? { ...current, categoryId: '' } : current);
    }
  }

  async function createProductType(event: FormEvent) {
    event.preventDefault();
    if (await action({ action: 'create_product_type', title: typeTitle, itemType: typeDelivery }, 'نوع محصول اضافه شد.')) setTypeTitle('');
  }

  function startProductTypeEdit(productType: ProductType) {
    setEditingTypeId(productType.id);
    setEditingTypeTitle(productType.title);
    setEditingTypeDelivery(productType.itemType);
    setMessage('');
  }

  async function saveProductTypeEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingTypeId || !editingTypeTitle.trim()) return;
    const ok = await action({ action: 'update_product_type', productTypeId: editingTypeId, title: editingTypeTitle, itemType: editingTypeDelivery }, 'نوع محصول ویرایش شد.');
    if (ok) setEditingTypeId(null);
  }

  async function deleteProductType(productType: ProductType) {
    if (!window.confirm(`نوع «${productType.title}» حذف شود؟ محصولات قبلی حذف نمی‌شوند و فقط از این نوع جدا خواهند شد.`)) return;
    if (await action({ action: 'delete_product_type', productTypeId: productType.id }, 'نوع محصول حذف شد.')) {
      setProduct((current) => current.productTypeId === productType.id ? { ...current, productTypeId: '' } : current);
      setEditing((current) => current.productTypeId === productType.id ? { ...current, productTypeId: '' } : current);
      if (editingTypeId === productType.id) setEditingTypeId(null);
    }
  }

  const typeMap = useMemo(() => new Map((data?.productTypes ?? []).map((item) => [item.id, item])), [data?.productTypes]);
  const categoryMap = useMemo(() => new Map((data?.categories ?? []).map((item) => [item.id, item])), [data?.categories]);

  if (!data) return <div className="store-simple loading" dir="rtl"><style>{styles}</style><span>در حال بارگذاری فروشگاه...</span></div>;

  if (!data.store) return <div className="store-simple" dir="rtl"><style>{styles}</style><main className="narrow"><a className="back" href="/app">← داشبورد</a><section className="hero"><span>شروع فروش</span><h1>فروشگاهت را بساز</h1><p>فقط یک نام لازم است. دسته‌بندی و محصول را بعداً اضافه می‌کنی.</p></section><form className="setup card" onSubmit={createStore}><label>نام فروشگاه<input value={storeName} onChange={(event) => setStoreName(event.target.value)} required /></label><button disabled={busy}>{busy ? 'در حال ساخت...' : 'ساخت فروشگاه'}</button></form></main></div>;

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
      </div>
    </section>

    <section className="products card">
      <div className="section-title"><div><span>محصولات</span><h2>فهرست محصولات</h2></div><b>{data.items.length.toLocaleString('fa-IR')}</b></div>
      {editingId && <form className="edit-product" onSubmit={saveEdit}><div className="edit-head"><b>ویرایش محصول</b><button type="button" onClick={() => setEditingId(null)}>بستن</button></div><label>نام<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></label><label>قیمت<input type="number" min="0" value={editing.priceAmount} onChange={(event) => setEditing({ ...editing, priceAmount: event.target.value })} required /></label><label>نوع<select value={editing.productTypeId} onChange={(event) => setEditing({ ...editing, productTypeId: event.target.value })}><option value="">نوع عمومی</option>{data.productTypes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>دسته<select value={editing.categoryId} onChange={(event) => setEditing({ ...editing, categoryId: event.target.value })}><option value="">بدون دسته</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>موجودی<input type="number" min="0" value={editing.inventoryCount} onChange={(event) => setEditing({ ...editing, inventoryCount: event.target.value })} placeholder="نامحدود" /></label><label className="edit-wide">توضیح<textarea rows={3} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><button className="primary edit-wide" disabled={busy}>{busy ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></form>}
      {data.items.length === 0 ? <div className="empty">هنوز محصولی ثبت نشده.</div> : <div className="product-list">{data.items.map((item) => { const customType = item.metadata?.productTypeId ? typeMap.get(item.metadata.productTypeId) : undefined; const category = item.categoryId ? categoryMap.get(item.categoryId) : undefined; return <div key={item.id} className={!item.isActive ? 'inactive' : ''}><span><b>{item.title}</b><small>{customType?.title || deliveryLabels[item.itemType] || 'محصول'}{category ? ` · ${category.title}` : ''}{!item.isActive ? ' · غیرفعال' : ''}</small></span><strong>{money(item.priceAmount, item.currency)}</strong><div className="product-actions"><button type="button" onClick={() => startEdit(item)}>ویرایش</button><button type="button" onClick={() => void toggleProduct(item)}>{item.isActive ? 'غیرفعال' : 'فعال'}</button><button className="danger" type="button" onClick={() => void deleteProduct(item)}>حذف</button></div></div>; })}</div>}
    </section>
  </main></div>;
}

const styles = `
.store-simple{min-height:100vh;background:#080b10;color:#f4f6fa;font-family:Inter,Vazirmatn,system-ui,-apple-system,sans-serif}.store-simple *{box-sizing:border-box}.store-simple main{max-width:1180px;margin:auto;padding:34px 20px 110px}.store-simple .narrow{max-width:720px}.back{color:#8290a4;text-decoration:none;font-size:12px}.top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px}.top h1,.hero h1{font-size:32px;margin:8px 0 6px}.top p,.hero p{color:#8592a5;margin:0;line-height:1.8}.orders,.primary,.store-simple button{border:0;border-radius:11px;padding:11px 14px;font:800 12px inherit;cursor:pointer}.orders,.primary{background:#f4f6fa;color:#080b10;text-decoration:none}.store-simple button:disabled{opacity:.5;cursor:wait}.card{border:1px solid #232c3b;background:#0d131c;border-radius:17px}.notice{margin:0 0 14px;padding:12px 14px;border:1px solid #60323b;background:#25151a;color:#ffc1cb;border-radius:12px;font-size:12px}.notice.ok{border-color:#245b46;background:#0d241b;color:#9de5c7}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.summary article{border:1px solid #222c3a;background:#0d131c;border-radius:14px;padding:15px}.summary b{font-size:24px;display:block}.summary span{font-size:11px;color:#7f8c9f}.layout{display:grid;grid-template-columns:1.3fr .7fr;gap:12px}.add-product{padding:18px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.section-title span{font-size:10px;color:#7f8c9f}.section-title h2{margin:4px 0;font-size:20px}.add-product form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.add-product label,.edit-product label,.type-edit label{display:grid;gap:6px;color:#a9b3c1;font-size:11px}.add-product label small{color:#687588}.add-product input,.add-product select,.add-product textarea,.inline-add input,.inline-add select,.edit-product input,.edit-product select,.edit-product textarea,.type-edit input,.type-edit select{width:100%;border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:11px;outline:none}.wide{grid-column:1/-1}.side{display:grid;align-content:start;gap:12px}.manager{overflow:hidden}.manager-head{width:100%;background:transparent;color:#fff;display:flex;align-items:center;justify-content:space-between;text-align:right;padding:16px}.manager-head span{display:grid;gap:4px}.manager-head small{font-size:9px;color:#738095}.manager-head em{font-style:normal;color:#9eabba;font-size:10px}.manager-body{padding:0 14px 14px;border-top:1px solid #202938}.inline-add{display:grid;grid-template-columns:1fr 105px auto;gap:6px;padding:13px 0}.inline-add.category{grid-template-columns:1fr auto}.type-edit{display:grid;grid-template-columns:1fr 130px;gap:8px;padding:12px;margin-bottom:8px;border:1px solid #334056;background:#0a1018;border-radius:12px}.type-edit>div{grid-column:1/-1;display:flex;gap:6px}.inline-add button,.rows button,.product-actions button,.edit-head button,.type-edit button{background:#17202d;color:#d9e0ea}.rows{display:grid}.rows>div{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;padding:9px 0;border-top:1px solid #1d2633}.rows span{display:grid;gap:3px}.rows b{font-size:11px}.rows small{font-size:9px;color:#758297}.danger{color:#ffb4c0!important}.products{margin-top:12px;padding:18px}.edit-product{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px;padding:14px;border:1px solid #334056;background:#0a1018;border-radius:13px}.edit-head{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between}.edit-wide{grid-column:1/-1}.product-list{display:grid}.product-list>div{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:14px;padding:12px 2px;border-top:1px solid #1d2633}.product-list>div.inactive{opacity:.58}.product-list span{display:grid;gap:4px}.product-list b,.product-list strong{font-size:12px}.product-list small{font-size:10px;color:#778499}.product-actions{display:flex;gap:5px}.product-actions button{padding:8px 9px;font-size:10px}.empty{padding:28px;text-align:center;color:#6d7a8d;border:1px dashed #2a3444;border-radius:12px}.setup{padding:20px;margin-top:24px;display:grid;gap:12px}.setup label{display:grid;gap:7px;color:#9faaba;font-size:11px}.setup input{border:1px solid #293447;background:#080d14;color:#fff;border-radius:10px;padding:12px}.setup button{background:#f4f6fa;color:#080b10}.loading{display:grid;place-items:center;color:#8290a4}
@media(max-width:820px){.layout{grid-template-columns:1fr}.summary{grid-template-columns:repeat(3,1fr)}.product-list>div{grid-template-columns:1fr auto}.product-actions{grid-column:1/-1}}@media(max-width:560px){.store-simple main{padding:24px 13px 90px}.top{display:grid}.summary{grid-template-columns:repeat(3,1fr)}.summary article{padding:11px}.summary b{font-size:19px}.add-product form,.edit-product,.type-edit{grid-template-columns:1fr}.wide,.edit-head,.edit-wide,.type-edit>div{grid-column:auto}.inline-add,.inline-add.category{grid-template-columns:1fr}.rows>div{grid-template-columns:1fr auto auto}.product-list>div{grid-template-columns:1fr}.product-actions{grid-column:auto;flex-wrap:wrap}.top h1,.hero h1{font-size:27px}}
`;
