/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useEffect, useMemo, useState, type CSSProperties } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

// راهنما: این Type با نام «TemplateKey» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type TemplateKey = 'minimal' | 'showcase' | 'catalog';
// راهنما: این Type با نام «SectionType» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type SectionType = 'hero' | 'categories' | 'products' | 'promo';
// راهنما: این Type با نام «PreviewDevice» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type PreviewDevice = 'desktop' | 'mobile';

// راهنما: این Type با نام «StoreTheme» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreTheme = {
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: number;
  fontScale: number;
  logoUrl: string;
};

// راهنما: این Type با نام «StoreSection» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreSection = {
  id: string;
  type: SectionType;
  enabled: boolean;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  limit: number;
  columns: 2 | 3 | 4;
};

// راهنما: این Type با نام «StoreTemplate» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreTemplate = {
  schemaVersion: 1;
  templateKey: TemplateKey;
  theme: StoreTheme;
  sections: StoreSection[];
};

// راهنما: این Type با نام «TemplateEngineState» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type TemplateEngineState = {
  draft?: StoreTemplate;
  published?: StoreTemplate;
  draftSavedAt?: string;
  publishedAt?: string;
  version?: number;
};

// راهنما: این Type با نام «StoreDashboard» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type StoreDashboard = {
  ok: boolean;
  store: null | {
    id: string;
    name: string;
    currency: string;
    status: string;
    settings?: Record<string, unknown> | null;
  };
  categories: Array<{ id: string; title: string; slug: string; isActive: boolean }>;
  items: Array<{
    id: string;
    categoryId?: string | null;
    title: string;
    description?: string | null;
    priceAmount: number | string;
    currency: string;
    inventoryCount?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
  }>;
  message?: string;
};

// راهنما: این Type با نام «PreviewItem» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type PreviewItem = StoreDashboard['items'][number];
// راهنما: این Type با نام «PreviewCategory» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type PreviewCategory = StoreDashboard['categories'][number];

// راهنما: این دستور متغیر/ثابت «sectionLabels» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const sectionLabels: Record<SectionType, string> = {
  hero: 'هدر اصلی',
  categories: 'دسته‌بندی‌ها',
  products: 'شبکه محصولات',
  promo: 'بنر تبلیغاتی',
};

// راهنما: این دستور متغیر/ثابت «presetDescriptions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const presetDescriptions: Record<TemplateKey, string> = {
  minimal: 'تم مینیمال برای فروشگاه‌های عمومی و خدماتی',
  showcase: 'تمرکز روی معرفی برند، کمپین و محصولات منتخب',
  catalog: 'چیدمان متراکم برای فروشگاه‌های محصول‌محور',
};

// راهنما: این تابع «section» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function section(type: SectionType, values: Partial<StoreSection> = {}): StoreSection {
  // راهنما: این دستور متغیر/ثابت «defaults» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const defaults: Record<SectionType, Omit<StoreSection, 'id' | 'type'>> = {
    hero: { enabled: true, eyebrow: 'فروشگاه آنلاین', title: 'خرید ساده، سریع و مطمئن', body: 'محصولات و خدمات را مستقیم از فروشگاه ما انتخاب کنید.', ctaLabel: 'مشاهده محصولات', limit: 6, columns: 3 },
    categories: { enabled: true, eyebrow: '', title: 'دسته‌بندی‌ها', body: 'سریع‌تر به چیزی که می‌خواهید برسید.', ctaLabel: '', limit: 6, columns: 3 },
    products: { enabled: true, eyebrow: '', title: 'محصولات منتخب', body: 'جدیدترین محصولات فروشگاه', ctaLabel: 'مشاهده همه', limit: 6, columns: 3 },
    promo: { enabled: true, eyebrow: 'پیشنهاد ویژه', title: 'یک پیشنهاد برای مشتری‌های ویژه', body: 'متن کمپین، تخفیف یا مزیت اصلی فروشگاه را اینجا نمایش دهید.', ctaLabel: 'مشاهده پیشنهاد', limit: 1, columns: 2 },
  };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ id: crypto.randomUUID(), type, ...defaults[type], ...values }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { id: crypto.randomUUID(), type, ...defaults[type], ...values };
}

// راهنما: این دستور متغیر/ثابت «presetTemplates» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const presetTemplates: Record<TemplateKey, StoreTemplate> = {
  minimal: {
    schemaVersion: 1,
    templateKey: 'minimal',
    theme: { accent: '#111827', background: '#f7f7f5', surface: '#ffffff', text: '#111827', muted: '#6b7280', radius: 18, fontScale: 100, logoUrl: '' },
    sections: [
      section('hero', { title: 'انتخاب‌های خوب، بدون شلوغی', body: 'فروشگاه شما با یک تجربه خرید ساده و حرفه‌ای.' }),
      section('categories'),
      section('products', { columns: 3 }),
    ],
  },
  showcase: {
    schemaVersion: 1,
    templateKey: 'showcase',
    theme: { accent: '#7c3aed', background: '#0b0b10', surface: '#15141b', text: '#f8fafc', muted: '#a1a1aa', radius: 24, fontScale: 104, logoUrl: '' },
    sections: [
      section('hero', { eyebrow: 'New Collection', title: 'فروشگاهی که خودش بخشی از برند است', body: 'محصولات شاخص، کمپین‌ها و داستان برند را با تمرکز بصری بیشتر نمایش دهید.' }),
      section('promo', { title: 'کمپین این هفته', body: 'یک پیام قوی برای پیشنهاد، کالکشن یا رویداد فروش.' }),
      section('products', { title: 'منتخب این هفته', columns: 3 }),
      section('categories', { title: 'کشف بر اساس دسته‌بندی' }),
    ],
  },
  catalog: {
    schemaVersion: 1,
    templateKey: 'catalog',
    theme: { accent: '#0f766e', background: '#f1f5f4', surface: '#ffffff', text: '#10231f', muted: '#64748b', radius: 12, fontScale: 96, logoUrl: '' },
    sections: [
      section('categories', { title: 'دسته‌بندی محصولات', limit: 8, columns: 4 }),
      section('products', { title: 'همه محصولات', limit: 8, columns: 4 }),
      section('promo', { eyebrow: 'فروش ویژه', title: 'پیشنهاد محدود فروشگاه' }),
    ],
  },
};

// راهنما: این تابع «cloneTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cloneTemplate(template: StoreTemplate): StoreTemplate {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «JSON.parse(JSON.stringify(template)) as StoreTemplate» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return JSON.parse(JSON.stringify(template)) as StoreTemplate;
}

// راهنما: این تابع «isRecord» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function isRecord(value: unknown): value is Record<string, unknown> {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Boolean(value) && typeof value === 'object' && !Array.isArray(value)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// راهنما: این تابع «cleanColor» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanColor(value: unknown, fallback: string) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fal…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

// راهنما: این تابع «cleanText» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanText(value: unknown, fallback = '', max = 240) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === 'string' ? value.slice(0, max) : fallback» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return typeof value === 'string' ? value.slice(0, max) : fallback;
}

// راهنما: این تابع «cleanNumber» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanNumber(value: unknown, fallback: number, min: number, max: number) {
  // راهنما: این دستور متغیر/ثابت «number» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const number = Number(value);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number)))…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

// راهنما: این تابع «normalizeTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeTemplate(value: unknown): StoreTemplate | null {
  // راهنما: این شرط بررسی می‌کند آیا «!isRecord(value)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!isRecord(value)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «templateKey» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const templateKey: TemplateKey = value.templateKey === 'showcase' || value.templateKey === 'catalog' ? value.templateKey : 'minimal';
  // راهنما: این دستور متغیر/ثابت «fallback» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const fallback = presetTemplates[templateKey];
  // راهنما: این دستور متغیر/ثابت «rawTheme» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rawTheme = isRecord(value.theme) ? value.theme : {};
  // راهنما: این دستور متغیر/ثابت «rawSections» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rawSections = Array.isArray(value.sections) ? value.sections.slice(0, 12) : [];
  // راهنما: این دستور متغیر/ثابت «sections» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const sections = rawSections.flatMap((raw) => {
    // راهنما: این شرط بررسی می‌کند آیا «!isRecord(raw) || !['hero', 'categories', 'products', 'promo'].includes(String(…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!isRecord(raw) || !['hero', 'categories', 'products', 'promo'].includes(String(raw.type))) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [];
    // راهنما: این دستور متغیر/ثابت «type» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const type = raw.type as SectionType;
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[{ id: typeof raw.id === 'string' && raw.id.length <= 80 ? raw.id : crypto…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return [{
      id: typeof raw.id === 'string' && raw.id.length <= 80 ? raw.id : crypto.randomUUID(),
      type,
      enabled: raw.enabled !== false,
      eyebrow: cleanText(raw.eyebrow, '', 80),
      title: cleanText(raw.title, sectionLabels[type], 160),
      body: cleanText(raw.body, '', 500),
      ctaLabel: cleanText(raw.ctaLabel, '', 80),
      limit: cleanNumber(raw.limit, 6, 1, 12),
      columns: [2, 3, 4].includes(Number(raw.columns)) ? Number(raw.columns) as 2 | 3 | 4 : 3,
    }];
  });
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ schemaVersion: 1, templateKey, theme: { accent: cleanColor(rawTheme.acce…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    schemaVersion: 1,
    templateKey,
    theme: {
      accent: cleanColor(rawTheme.accent, fallback.theme.accent),
      background: cleanColor(rawTheme.background, fallback.theme.background),
      surface: cleanColor(rawTheme.surface, fallback.theme.surface),
      text: cleanColor(rawTheme.text, fallback.theme.text),
      muted: cleanColor(rawTheme.muted, fallback.theme.muted),
      radius: cleanNumber(rawTheme.radius, fallback.theme.radius, 0, 40),
      fontScale: cleanNumber(rawTheme.fontScale, fallback.theme.fontScale, 85, 120),
      logoUrl: cleanText(rawTheme.logoUrl, '', 500),
    },
    sections: sections.length ? sections : cloneTemplate(fallback).sections,
  };
}

// راهنما: این تابع «readTemplateEngine» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function readTemplateEngine(settings: StoreDashboard['store'] extends infer _T ? Record<string, unknown> | null | undefined : never): TemplateEngineState {
  // راهنما: این شرط بررسی می‌کند آیا «!isRecord(settings) || !isRecord(settings.templateEngine)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!isRecord(settings) || !isRecord(settings.templateEngine)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{}» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return {};
  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = settings.templateEngine;
  // راهنما: این دستور متغیر/ثابت «draft» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const draft = normalizeTemplate(raw.draft);
  // راهنما: این دستور متغیر/ثابت «published» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const published = normalizeTemplate(raw.published);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ draft: draft ?? undefined, published: published ?? undefined, draftSaved…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    draft: draft ?? undefined,
    published: published ?? undefined,
    draftSavedAt: typeof raw.draftSavedAt === 'string' ? raw.draftSavedAt : undefined,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : undefined,
    version: Number.isFinite(Number(raw.version)) ? Number(raw.version) : undefined,
  };
}

// راهنما: این تابع «money» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function money(value: number | string, currency = 'IRR') {
  // راهنما: این دستور متغیر/ثابت «amount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const amount = Number(value ?? 0);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${new Intl.NumberFormat('fa-IR').format(Number.isFinite(amount) ? amount …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${new Intl.NumberFormat('fa-IR').format(Number.isFinite(amount) ? amount : 0)} ${currency === 'IRR' ? 'ریال' : currency}`;
}

// راهنما: این تابع «formatDate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function formatDate(value?: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'هنوز منتشر نشده'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'هنوز منتشر نشده';
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short'…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return value; }
}

// راهنما: این دستور متغیر/ثابت «placeholderCategories» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const placeholderCategories: PreviewCategory[] = [
  { id: 'demo-cat-1', title: 'محصولات جدید', slug: 'new', isActive: true },
  { id: 'demo-cat-2', title: 'پرفروش‌ها', slug: 'popular', isActive: true },
  { id: 'demo-cat-3', title: 'پیشنهاد ویژه', slug: 'offers', isActive: true },
  { id: 'demo-cat-4', title: 'خدمات', slug: 'services', isActive: true },
];

// راهنما: این دستور متغیر/ثابت «placeholderItems» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const placeholderItems: PreviewItem[] = [
  { id: 'demo-1', title: 'محصول نمونه یک', description: 'توضیح کوتاه محصول برای نمایش در قالب', priceAmount: 1290000, currency: 'IRR', inventoryCount: 12, imageUrl: null, isActive: true },
  { id: 'demo-2', title: 'محصول نمونه دو', description: 'کارت محصول واقعی بعد از افزودن کالا جایگزین می‌شود', priceAmount: 2490000, currency: 'IRR', inventoryCount: 8, imageUrl: null, isActive: true },
  { id: 'demo-3', title: 'محصول نمونه سه', description: 'پیش‌نمایش برای تست چیدمان و رنگ‌ها', priceAmount: 890000, currency: 'IRR', inventoryCount: 4, imageUrl: null, isActive: true },
  { id: 'demo-4', title: 'محصول نمونه چهار', description: 'این داده فقط در Preview نمایش داده می‌شود', priceAmount: 3190000, currency: 'IRR', inventoryCount: null, imageUrl: null, isActive: true },
];

// راهنما: این تابع «StoreTemplateEngine» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function StoreTemplateEngine() {
  // راهنما: این دستور متغیر/ثابت «[data, setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data, setData] = useState<StoreDashboard | null>(null);
  // راهنما: این دستور متغیر/ثابت «[template, setTemplate]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [template, setTemplate] = useState<StoreTemplate>(() => cloneTemplate(presetTemplates.minimal));
  // راهنما: این دستور متغیر/ثابت «[selectedSectionId, setSelectedSectionId]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  // راهنما: این دستور متغیر/ثابت «[device, setDevice]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  // راهنما: این دستور State محلی React برای «[busy, setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy, setBusy] = useState(false);
  // راهنما: این دستور State محلی React برای «[dirty, setDirty]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [dirty, setDirty] = useState(false);
  // راهنما: این دستور State محلی React برای «[message, setMessage]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [message, setMessage] = useState('');
  // راهنما: این دستور متغیر/ثابت «[publishedAt, setPublishedAt]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [publishedAt, setPublishedAt] = useState<string | undefined>();
  // راهنما: این دستور متغیر/ثابت «[publishedVersion, setPublishedVersion]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [publishedVersion, setPublishedVersion] = useState<number | undefined>();

  // راهنما: این تابع «load» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function load() {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')».
    setMessage('');
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch('/api/store');
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'». */ window.location.href = '/login'; /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const body = await response.json().catch(() => ({})) as StoreDashboard;
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(body.message || 'اطلاعات فروشگاه دریافت نشد.');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(body)».
    setData(body);
    // راهنما: این دستور متغیر/ثابت «engine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const engine = readTemplateEngine(body.store?.settings);
    // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const next = engine.draft ?? engine.published ?? cloneTemplate(presetTemplates.minimal);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(next)».
    setTemplate(next);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedSectionId(next.sections[0]?.id ?? null)».
    setSelectedSectionId(next.sections[0]?.id ?? null);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setPublishedAt(engine.publishedAt)».
    setPublishedAt(engine.publishedAt);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setPublishedVersion(engine.version)».
    setPublishedVersion(engine.version);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
    setDirty(false);
  }

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(() => { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load().catch((error) => setMessage(error instanceof Error ? error.message : 'خطا در …». */ void load().catch((error) => setMessage(error instanceof Error ? error.message : 'خطا در دریافت فروشگاه.')); }, []);

  // راهنما: این دستور مقدار «selectedSection» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const selectedSection = useMemo(() => template.sections.find((item) => item.id === selectedSectionId) ?? null, [template.sections, selectedSectionId]);
  // راهنما: این دستور مقدار «liveCategories» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const liveCategories = useMemo(() => (data?.categories ?? []).filter((item) => item.isActive), [data?.categories]);
  // راهنما: این دستور مقدار «liveItems» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const liveItems = useMemo(() => (data?.items ?? []).filter((item) => item.isActive), [data?.items]);
  // راهنما: این دستور متغیر/ثابت «previewCategories» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const previewCategories = liveCategories.length ? liveCategories : placeholderCategories;
  // راهنما: این دستور متغیر/ثابت «previewItems» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const previewItems = liveItems.length ? liveItems : placeholderItems;

  // راهنما: این تابع «mutate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function mutate(updater: (current: StoreTemplate) => StoreTemplate) {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate((current) => updater(current))».
    setTemplate((current) => updater(current));
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(true)».
    setDirty(true);
  }

  // راهنما: این تابع «updateTheme» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function updateTheme<K extends keyof StoreTheme>(key: K, value: StoreTheme[K]) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => ({ ...current, theme: { ...current.theme, [key]: value } }))».
    mutate((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  }

  // راهنما: این تابع «choosePreset» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function choosePreset(key: TemplateKey) {
    // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const next = cloneTemplate(presetTemplates[key]);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(next)».
    setTemplate(next);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedSectionId(next.sections[0]?.id ?? null)».
    setSelectedSectionId(next.sections[0]?.id ?? null);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(true)».
    setDirty(true);
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(`قالب «${key === 'minimal' ? 'مینیمال' : key === 'showcase' ? 'ویترینی' : 'کات…».
    setMessage(`قالب «${key === 'minimal' ? 'مینیمال' : key === 'showcase' ? 'ویترینی' : 'کاتالوگ'}» روی پیش‌نویس اعمال شد.`);
  }

  // راهنما: این تابع «updateSection» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function updateSection(values: Partial<StoreSection>) {
    // راهنما: این شرط بررسی می‌کند آیا «!selectedSectionId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!selectedSectionId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => ({ ...current, sections: current.sections.map((item) => item.id === s…».
    mutate((current) => ({ ...current, sections: current.sections.map((item) => item.id === selectedSectionId ? { ...item, ...values } : item) }));
  }

  // راهنما: این تابع «moveSection» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function moveSection(index: number, delta: -1 | 1) {
    // راهنما: این دستور متغیر/ثابت «target» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const target = index + delta;
    // راهنما: این شرط بررسی می‌کند آیا «target < 0 || target >= template.sections.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (target < 0 || target >= template.sections.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => { const sections = [...current.sections]; [sections[index], sections[…».
    mutate((current) => {
      // راهنما: این دستور متغیر/ثابت «sections» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const sections = [...current.sections];
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «[sections[index], sections[target]] = [sections[target], sections[index]]».
      [sections[index], sections[target]] = [sections[target], sections[index]];
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ...current, sections }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return { ...current, sections };
    });
  }

  // راهنما: این تابع «removeSection» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function removeSection(id: string) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => ({ ...current, sections: current.sections.filter((item) => item.id !=…».
    mutate((current) => ({ ...current, sections: current.sections.filter((item) => item.id !== id) }));
    // راهنما: این شرط بررسی می‌کند آیا «selectedSectionId === id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (selectedSectionId === id) {
      // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const next = template.sections.find((item) => item.id !== id);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedSectionId(next?.id ?? null)».
      setSelectedSectionId(next?.id ?? null);
    }
  }

  // راهنما: این تابع «addSection» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function addSection(type: SectionType) {
    // راهنما: این شرط بررسی می‌کند آیا «template.sections.length >= 12» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (template.sections.length >= 12) { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('حداکثر ۱۲ سکشن در نسخه اول پشتیبانی می‌شود.')». */ setMessage('حداکثر ۱۲ سکشن در نسخه اول پشتیبانی می‌شود.'); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
    // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const next = section(type);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => ({ ...current, sections: [...current.sections, next] }))».
    mutate((current) => ({ ...current, sections: [...current.sections, next] }));
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedSectionId(next.id)».
    setSelectedSectionId(next.id);
  }

  // راهنما: این تابع «ensureStore» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function ensureStore() {
    // راهنما: این شرط بررسی می‌کند آیا «data?.store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (data?.store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return true;
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch('/api/store', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'ensure_store', name: 'فروشگاه من' }) });
    // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const body = await response.json().catch(() => ({})) as StoreDashboard;
    // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'». */ window.location.href = '/login'; /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false; }
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(body.message || 'ساخت فروشگاه انجام نشد.');
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(body)».
    setData(body);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Boolean(body.store)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return Boolean(body.store);
  }

  // راهنما: این تابع «persist» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function persist(action: 'save_template_draft' | 'publish_template') {
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true); /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage('')». */ setMessage('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «ready» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ready = await ensureStore();
      // راهنما: این شرط بررسی می‌کند آیا «!ready» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!ready) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
      // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
      const response = await fetch('/api/store', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, template }) });
      // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const body = await response.json().catch(() => ({})) as StoreDashboard;
      // راهنما: این شرط بررسی می‌کند آیا «response.status === 401» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (response.status === 401) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «window.location.href = '/login'». */ window.location.href = '/login'; /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return; }
      // راهنما: این شرط بررسی می‌کند آیا «!response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!response.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(body.message || 'ذخیره قالب انجام نشد.');
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(body)».
      setData(body);
      // راهنما: این دستور متغیر/ثابت «engine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const engine = readTemplateEngine(body.store?.settings);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTemplate(engine.draft ?? template)».
      setTemplate(engine.draft ?? template);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setPublishedAt(engine.publishedAt)».
      setPublishedAt(engine.publishedAt);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setPublishedVersion(engine.version)».
      setPublishedVersion(engine.version);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setDirty(false)».
      setDirty(false);
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(action === 'publish_template' ? 'قالب منتشر شد و Snapshot جدید فروشگاه ساخته ش…».
      setMessage(action === 'publish_template' ? 'قالب منتشر شد و Snapshot جدید فروشگاه ساخته شد.' : 'پیش‌نویس قالب ذخیره شد.');
    } catch (error) {
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setMessage(error instanceof Error ? error.message : 'ذخیره قالب انجام نشد.')».
      setMessage(error instanceof Error ? error.message : 'ذخیره قالب انجام نشد.');
    } finally { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)». */ setBusy(false); }
  }

  // راهنما: این دستور متغیر/ثابت «previewStyle» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const previewStyle = {
    '--st-accent': template.theme.accent,
    '--st-bg': template.theme.background,
    '--st-surface': template.theme.surface,
    '--st-text': template.theme.text,
    '--st-muted': template.theme.muted,
    '--st-radius': `${template.theme.radius}px`,
    '--st-font': `${template.theme.fontScale}%`,
  } as CSSProperties;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «( <div className="template-page" dir="rtl"> <style>{styles}</style> <heade…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (
    <div className="template-page" dir="rtl">
      <style>{styles}</style>
      <header className="topbar">
        <div className="brand"><b>AI PANEL</b><span>Store Template Engine</span></div>
        <nav><a href="/app">داشبورد</a><a href="/app/store">محصولات</a><a href="/app/orders">سفارش‌ها</a></nav>
        <div className="publish-actions">
          <span className={dirty ? 'dirty' : 'saved'}>{dirty ? '● تغییرات ذخیره‌نشده' : '✓ ذخیره‌شده'}</span>
          <button className="secondary" disabled={busy || !dirty} onClick={() => void persist('save_template_draft')}>ذخیره پیش‌نویس</button>
          <button className="primary" disabled={busy} onClick={() => void persist('publish_template')}>{busy ? 'در حال ذخیره…' : 'انتشار قالب'}</button>
        </div>
      </header>

      <main>
        <section className="intro">
          <div><small>Commerce / Storefront</small><h1>طراحی قالب فروشگاه</h1><p>ظاهر فروشگاه را بدون تغییر در محصول، سبد خرید و سفارش‌ها بسازید. Draft مستقل نگه داشته می‌شود و Publish یک Snapshot قابل استفاده برای Storefront ایجاد می‌کند.</p></div>
          <div className="release"><span>نسخه منتشرشده</span><b>{publishedVersion ? `v${publishedVersion}` : '—'}</b><small>{formatDate(publishedAt)}</small></div>
        </section>

        {message && <div className="notice">{message}</div>}
        {!data ? <div className="loading">در حال آماده‌سازی Template Engine…</div> : <section className="builder">
          <aside className="left-panel panel">
            <div className="panel-title"><div><small>Templates</small><h2>قالب پایه</h2></div><span>{template.templateKey}</span></div>
            <div className="presets">
              {(Object.keys(presetTemplates) as TemplateKey[]).map((key) => <button key={key} className={template.templateKey === key ? 'active' : ''} onClick={() => choosePreset(key)}>
                <i className={`preset-preview ${key}`}><em /><em /><em /></i>
                <span><b>{key === 'minimal' ? 'مینیمال' : key === 'showcase' ? 'ویترینی' : 'کاتالوگ'}</b><small>{presetDescriptions[key]}</small></span>
              </button>)}
            </div>

            <div className="subhead"><h3>هویت بصری</h3><span>Global theme</span></div>
            <div className="theme-grid">
              {([
                ['accent', 'رنگ اصلی'], ['background', 'پس‌زمینه'], ['surface', 'کارت‌ها'], ['text', 'متن'], ['muted', 'متن فرعی'],
              ] as Array<[keyof Pick<StoreTheme, 'accent' | 'background' | 'surface' | 'text' | 'muted'>, string]>).map(([key, label]) => <label className="color-field" key={key}><span>{label}</span><div><input type="color" value={template.theme[key]} onChange={(event) => updateTheme(key, event.target.value)} /><code>{template.theme[key]}</code></div></label>)}
              <label><span>گردی کارت‌ها: {template.theme.radius}px</span><input type="range" min="0" max="40" value={template.theme.radius} onChange={(event) => updateTheme('radius', Number(event.target.value))} /></label>
              <label><span>مقیاس تایپوگرافی: {template.theme.fontScale}%</span><input type="range" min="85" max="120" value={template.theme.fontScale} onChange={(event) => updateTheme('fontScale', Number(event.target.value))} /></label>
              <label className="full"><span>آدرس لوگو</span><input dir="ltr" type="url" value={template.theme.logoUrl} onChange={(event) => updateTheme('logoUrl', event.target.value.slice(0, 500))} placeholder="https://…" /></label>
            </div>
          </aside>

          <section className="preview-panel panel">
            <div className="preview-toolbar"><div><small>Live Preview</small><b>{data.store?.name ?? 'فروشگاه جدید'}</b></div><div className="device-switch"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')}>Desktop</button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')}>Mobile</button></div></div>
            <div className="preview-stage">
              <div className={`storefront-frame ${device}`} style={previewStyle}>
                <StorefrontPreview template={template} storeName={data.store?.name ?? 'فروشگاه من'} categories={previewCategories} items={previewItems} demoCatalog={!liveItems.length} />
              </div>
            </div>
          </section>

          <aside className="right-panel panel">
            <div className="panel-title"><div><small>Sections</small><h2>ساختار صفحه</h2></div><span>{template.sections.length}/12</span></div>
            <div className="section-list">{template.sections.map((item, index) => <div key={item.id} className={selectedSectionId === item.id ? 'selected' : ''}>
              <button className="section-main" onClick={() => setSelectedSectionId(item.id)}><i>{String(index + 1).padStart(2, '0')}</i><span><b>{sectionLabels[item.type]}</b><small>{item.enabled ? 'نمایش داده می‌شود' : 'مخفی'}</small></span></button>
              <div className="section-actions"><button title="بالا" disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button><button title="پایین" disabled={index === template.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button><button className={item.enabled ? 'on' : ''} title="نمایش/مخفی" onClick={() => { /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setSelectedSectionId(item.id)». */ setSelectedSectionId(item.id); /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «mutate((current) => ({ ...current, sections: current.sections.map((row) => row.id === ite…». */ mutate((current) => ({ ...current, sections: current.sections.map((row) => row.id === item.id ? { ...row, enabled: !row.enabled } : row) })); }}>●</button></div>
            </div>)}</div>

            <div className="add-row">{(['hero', 'categories', 'products', 'promo'] as SectionType[]).map((type) => <button key={type} onClick={() => addSection(type)}>+ {sectionLabels[type]}</button>)}</div>

            {selectedSection && <div className="section-editor">
              <div className="subhead"><h3>{sectionLabels[selectedSection.type]}</h3><button className="delete" onClick={() => removeSection(selectedSection.id)}>حذف</button></div>
              {selectedSection.type !== 'categories' && <label><span>Eyebrow</span><input value={selectedSection.eyebrow} onChange={(event) => updateSection({ eyebrow: event.target.value.slice(0, 80) })} /></label>}
              <label><span>عنوان</span><input value={selectedSection.title} onChange={(event) => updateSection({ title: event.target.value.slice(0, 160) })} /></label>
              <label><span>توضیح</span><textarea rows={3} value={selectedSection.body} onChange={(event) => updateSection({ body: event.target.value.slice(0, 500) })} /></label>
              {(selectedSection.type === 'hero' || selectedSection.type === 'promo' || selectedSection.type === 'products') && <label><span>متن دکمه</span><input value={selectedSection.ctaLabel} onChange={(event) => updateSection({ ctaLabel: event.target.value.slice(0, 80) })} /></label>}
              {(selectedSection.type === 'categories' || selectedSection.type === 'products') && <div className="inline-fields"><label><span>تعداد</span><input type="number" min="1" max="12" value={selectedSection.limit} onChange={(event) => updateSection({ limit: cleanNumber(event.target.value, 6, 1, 12) })} /></label><label><span>ستون</span><select value={selectedSection.columns} onChange={(event) => updateSection({ columns: Number(event.target.value) as 2 | 3 | 4 })}><option value="2">۲</option><option value="3">۳</option><option value="4">۴</option></select></label></div>}
            </div>}
          </aside>
        </section>}
      </main>
    </div>
  );
}

// راهنما: این تابع «StorefrontPreview» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function StorefrontPreview({ template, storeName, categories, items, demoCatalog }: { template: StoreTemplate; storeName: string; categories: PreviewCategory[]; items: PreviewItem[]; demoCatalog: boolean }) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="storefront" dir="rtl"> <header className="sf-header"><div …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="storefront" dir="rtl">
    <header className="sf-header"><div className="sf-brand">{template.theme.logoUrl ? <img src={template.theme.logoUrl} alt="" /> : <i>{storeName.slice(0, 1)}</i>}<b>{storeName}</b></div><nav><span>خانه</span><span>محصولات</span><span>درباره ما</span></nav><button>سبد خرید <b>۰</b></button></header>
    {demoCatalog && <div className="demo-badge">داده نمونه برای Preview — پس از افزودن محصول، اطلاعات واقعی نمایش داده می‌شود.</div>}
    <main className="sf-content">{template.sections.filter((item) => item.enabled).map((item) => {
      // راهنما: این شرط بررسی می‌کند آیا «item.type === 'hero'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (item.type === 'hero') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="sf-hero" key={item.id}><div><small>{item.eyebrow}</sma…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <section className="sf-hero" key={item.id}><div><small>{item.eyebrow}</small><h1>{item.title}</h1><p>{item.body}</p>{item.ctaLabel && <button>{item.ctaLabel}</button>}</div><div className="hero-art"><span>01</span><i /><b>STORE</b></div></section>;
      // راهنما: این شرط بررسی می‌کند آیا «item.type === 'categories'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (item.type === 'categories') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="sf-section" key={item.id}><SectionHeading item={item} …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <section className="sf-section" key={item.id}><SectionHeading item={item} /><div className="category-grid" style={{ gridTemplateColumns: `repeat(${Math.min(item.columns, 4)}, minmax(0, 1fr))` }}>{categories.slice(0, item.limit).map((category, index) => <article key={category.id}><i>{String(index + 1).padStart(2, '0')}</i><b>{category.title}</b><span>مشاهده ←</span></article>)}</div></section>;
      // راهنما: این شرط بررسی می‌کند آیا «item.type === 'products'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (item.type === 'products') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="sf-section" key={item.id}><SectionHeading item={item} …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <section className="sf-section" key={item.id}><SectionHeading item={item} /><div className="product-grid" style={{ gridTemplateColumns: `repeat(${Math.min(item.columns, 4)}, minmax(0, 1fr))` }}>{items.slice(0, item.limit).map((product, index) => <article key={product.id}><div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <><span>{String(index + 1).padStart(2, '0')}</span><i /></>}</div><div className="product-info"><small>{product.inventoryCount === 0 ? 'ناموجود' : 'موجود'}</small><b>{product.title}</b><p>{product.description || 'توضیحات محصول'}</p><div><strong>{money(product.priceAmount, product.currency)}</strong><button>+</button></div></div></article>)}</div>{item.ctaLabel && <button className="sf-outline">{item.ctaLabel}</button>}</section>;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="sf-promo" key={item.id}><div><small>{item.eyebrow}</sm…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return <section className="sf-promo" key={item.id}><div><small>{item.eyebrow}</small><h2>{item.title}</h2><p>{item.body}</p></div>{item.ctaLabel && <button>{item.ctaLabel}</button>}</section>;
    })}</main>
    <footer className="sf-footer"><b>{storeName}</b><span>ساخته‌شده با AI Panel Store Engine</span></footer>
  </div>;
}

// راهنما: این تابع «SectionHeading» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function SectionHeading({ item }: { item: StoreSection }) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="sf-heading"><div><h2>{item.title}</h2>{item.body && <p>{it…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="sf-heading"><div><h2>{item.title}</h2>{item.body && <p>{item.body}</p>}</div>{item.ctaLabel && <span>{item.ctaLabel} ←</span>}</div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;background:#070a0f}.template-page{min-height:100vh;background:#070a0f;color:#ecf2fa;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding-bottom:84px}.topbar{height:72px;position:sticky;top:0;z-index:20;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;padding:0 clamp(18px,3vw,46px);border-bottom:1px solid #202938;background:rgba(8,12,18,.94);backdrop-filter:blur(18px)}.brand{display:grid;gap:2px}.brand b{font-size:13px;letter-spacing:.12em}.brand span,.topbar a{font-size:9px;color:#77849a}.topbar nav{display:flex;gap:6px}.topbar a{padding:8px 10px;border:1px solid #263245;border-radius:9px;text-decoration:none;color:#aeb9ca}.publish-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px}.publish-actions>span{font-size:8px}.publish-actions>span.dirty{color:#f4c96b}.publish-actions>span.saved{color:#72d9af}.topbar button,.template-page button{font:inherit;cursor:pointer}.primary,.secondary{border-radius:10px;padding:9px 12px;font-size:9px;font-weight:800}.primary{border:1px solid #edf2f8;background:#edf2f8;color:#0a0f17}.secondary{border:1px solid #2b3648;background:#111823;color:#ced7e4}.topbar button:disabled,.template-page button:disabled{opacity:.45;cursor:not-allowed}.template-page>main{max-width:1740px;margin:auto;padding:30px clamp(14px,2.5vw,42px)}.intro{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px}.intro small{color:#748197;font-size:9px}.intro h1{font-size:30px;margin:5px 0 6px}.intro p{max-width:790px;color:#8592a6;font-size:11px;line-height:1.9;margin:0}.release{min-width:190px;border:1px solid #273244;border-radius:14px;padding:12px 14px;background:#0d141e;display:grid;gap:3px;text-align:left;direction:rtl}.release span,.release small{font-size:8px;color:#748197}.release b{font-size:18px}.notice{border:1px solid #594f2d;background:#1b180e;color:#dfd29a;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:10px}.loading{min-height:340px;border:1px dashed #2c3749;border-radius:16px;display:grid;place-items:center;color:#7c899d}.builder{display:grid;grid-template-columns:300px minmax(520px,1fr) 310px;gap:10px;align-items:start}.panel{background:#0c121b;border:1px solid #222d3e;border-radius:16px;overflow:hidden}.left-panel,.right-panel{position:sticky;top:82px;max-height:calc(100vh - 100px);overflow:auto;padding:14px}.preview-panel{min-height:760px}.panel-title{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px}.panel-title small,.subhead span,.preview-toolbar small{font-size:8px;color:#6f7c91;text-transform:uppercase}.panel-title h2{font-size:15px;margin:3px 0}.panel-title>span{font-size:8px;border:1px solid #2c3749;padding:4px 7px;border-radius:99px;color:#8e9bb0}.presets{display:grid;gap:7px}.presets>button{display:grid;grid-template-columns:74px 1fr;gap:9px;text-align:right;border:1px solid #252f40;background:#090f17;color:#e7edf6;border-radius:12px;padding:7px}.presets>button.active{border-color:#7184a4;background:#101925}.presets>button span{display:grid;align-content:center;gap:4px}.presets>button b{font-size:10px}.presets>button small{font-size:7.5px;line-height:1.6;color:#748197}.preset-preview{height:55px;border-radius:8px;border:1px solid #30394a;padding:5px;display:grid;grid-template-rows:18px 1fr;grid-template-columns:1fr 1fr;gap:3px;background:#f4f4f2}.preset-preview em{display:block;border-radius:3px;background:#cbd1d8}.preset-preview em:first-child{grid-column:1/-1;background:#9ea7b2}.preset-preview.showcase{background:#111117}.preset-preview.showcase em{background:#473b5b}.preset-preview.showcase em:first-child{background:#7c3aed}.preset-preview.catalog{background:#e6eeec;grid-template-columns:repeat(3,1fr)}.preset-preview.catalog em{background:#fff}.preset-preview.catalog em:first-child{grid-column:1/-1;background:#0f766e}.subhead{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #202a39;margin-top:16px;padding-top:14px}.subhead h3{font-size:11px;margin:0}.theme-grid,.section-editor{display:grid;gap:10px;margin-top:10px}.theme-grid label,.section-editor label{display:grid;gap:5px}.theme-grid label>span,.section-editor label>span{font-size:8px;color:#7d899d}.theme-grid input[type="url"],.section-editor input,.section-editor textarea,.section-editor select{width:100%;border:1px solid #2a3547;border-radius:9px;background:#080e15;color:#e6ecf5;padding:8px 9px;font:inherit;font-size:9px;outline:none}.theme-grid input[type="range"]{width:100%;accent-color:#dce6f4}.color-field>div{display:flex;align-items:center;gap:7px;border:1px solid #283346;background:#090f17;border-radius:9px;padding:5px 7px}.color-field input{width:27px;height:27px;border:0;background:transparent;padding:0}.color-field code{font-size:8px;color:#9ca8ba}.preview-toolbar{height:62px;padding:0 15px;border-bottom:1px solid #202a39;display:flex;align-items:center;justify-content:space-between}.preview-toolbar>div:first-child{display:grid;gap:3px}.preview-toolbar b{font-size:11px}.device-switch{display:flex;padding:3px;background:#080d14;border:1px solid #242e3e;border-radius:9px}.device-switch button{border:0;background:transparent;color:#728095;font-size:8px;padding:6px 9px;border-radius:6px}.device-switch button.active{background:#e9eef5;color:#0a0f16}.preview-stage{min-height:697px;padding:20px;background:radial-gradient(circle at 50% -20%,#1a2636 0,transparent 52%),#080d14;display:flex;align-items:flex-start;justify-content:center;overflow:auto}.storefront-frame{width:100%;max-width:1040px;transition:max-width .2s ease}.storefront-frame.mobile{max-width:390px}.storefront{min-height:660px;border-radius:14px;overflow:hidden;background:var(--st-bg);color:var(--st-text);font-size:var(--st-font);box-shadow:0 24px 80px rgba(0,0,0,.35)}.sf-header{min-height:62px;padding:12px clamp(15px,3vw,30px);display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid color-mix(in srgb,var(--st-text) 10%,transparent);background:var(--st-surface)}.sf-brand{display:flex;align-items:center;gap:8px}.sf-brand i{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:var(--st-accent);color:#fff;font-style:normal;font-weight:900}.sf-brand img{width:30px;height:30px;border-radius:8px;object-fit:contain}.sf-brand b{font-size:.78em}.sf-header nav{display:flex;gap:17px;color:var(--st-muted);font-size:.55em}.sf-header>button,.sf-hero button,.sf-promo button{border:0;border-radius:calc(var(--st-radius) * .55);background:var(--st-accent);color:#fff;font-weight:800;padding:9px 12px;font-size:.55em}.sf-header>button b{display:inline-grid;place-items:center;background:rgba(255,255,255,.18);border-radius:99px;min-width:17px;height:17px;margin-right:5px}.demo-badge{background:color-mix(in srgb,var(--st-accent) 12%,var(--st-bg));color:var(--st-muted);text-align:center;font-size:.48em;padding:6px 12px}.sf-content{padding:clamp(15px,3vw,30px);display:grid;gap:34px}.sf-hero{min-height:270px;display:grid;grid-template-columns:1.25fr .75fr;gap:20px;align-items:center;padding:clamp(20px,4vw,48px);border-radius:var(--st-radius);background:var(--st-surface);overflow:hidden}.sf-hero small,.sf-promo small{color:var(--st-accent);font-size:.58em;font-weight:900}.sf-hero h1{font-size:2.15em;line-height:1.2;margin:8px 0 10px;max-width:590px}.sf-hero p,.sf-promo p,.sf-heading p{color:var(--st-muted);font-size:.68em;line-height:1.8;margin:0 0 15px}.hero-art{height:210px;position:relative;border-radius:calc(var(--st-radius) * .8);background:linear-gradient(145deg,color-mix(in srgb,var(--st-accent) 84%,#fff),color-mix(in srgb,var(--st-accent) 54%,#000));overflow:hidden;color:#fff}.hero-art span{position:absolute;top:14px;right:14px;font-size:.6em}.hero-art i{position:absolute;width:150px;height:150px;border:1px solid rgba(255,255,255,.35);border-radius:50%;left:-25px;bottom:-38px}.hero-art b{position:absolute;bottom:14px;right:14px;font-size:1.4em;letter-spacing:.15em}.sf-section{display:grid;gap:14px}.sf-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.sf-heading h2{font-size:1.25em;margin:0 0 3px}.sf-heading p{margin:0}.sf-heading>span{color:var(--st-accent);font-size:.55em;font-weight:800}.category-grid,.product-grid{display:grid;gap:10px}.category-grid article{min-height:105px;padding:14px;border-radius:var(--st-radius);background:var(--st-surface);display:grid;align-content:space-between}.category-grid i{font-style:normal;color:var(--st-muted);font-size:.5em}.category-grid b{font-size:.72em}.category-grid span{font-size:.48em;color:var(--st-accent)}.product-grid article{overflow:hidden;border-radius:var(--st-radius);background:var(--st-surface)}.product-image{height:145px;position:relative;display:grid;place-items:center;background:color-mix(in srgb,var(--st-accent) 9%,var(--st-bg));overflow:hidden}.product-image img{width:100%;height:100%;object-fit:cover}.product-image span{position:absolute;top:10px;right:10px;color:var(--st-muted);font-size:.48em}.product-image i{width:62px;height:62px;border-radius:18px;transform:rotate(20deg);background:color-mix(in srgb,var(--st-accent) 70%,#fff)}.product-info{padding:11px}.product-info>small{font-size:.45em;color:var(--st-accent)}.product-info>b{font-size:.68em;display:block;margin:3px 0}.product-info>p{font-size:.48em;color:var(--st-muted);line-height:1.6;height:2.9em;overflow:hidden;margin:0 0 8px}.product-info>div{display:flex;align-items:center;justify-content:space-between;gap:6px}.product-info strong{font-size:.58em}.product-info button{width:24px;height:24px;border:0;border-radius:8px;background:var(--st-accent);color:#fff}.sf-outline{justify-self:center;border:1px solid color-mix(in srgb,var(--st-text) 18%,transparent);background:transparent;color:var(--st-text);padding:8px 13px;border-radius:9px;font-size:.52em}.sf-promo{border-radius:var(--st-radius);padding:25px 28px;background:var(--st-accent);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:15px}.sf-promo small,.sf-promo p{color:rgba(255,255,255,.72)}.sf-promo h2{font-size:1.35em;margin:4px 0}.sf-promo p{margin:0}.sf-promo button{background:#fff;color:var(--st-accent);white-space:nowrap}.sf-footer{padding:18px 30px;border-top:1px solid color-mix(in srgb,var(--st-text) 10%,transparent);display:flex;justify-content:space-between;color:var(--st-muted);font-size:.5em}.section-list{display:grid;gap:6px}.section-list>div{display:grid;grid-template-columns:1fr auto;align-items:center;border:1px solid #252f40;border-radius:10px;background:#090f17;overflow:hidden}.section-list>div.selected{border-color:#7183a1;background:#111a27}.section-main{border:0;background:transparent;color:#e8eef6;text-align:right;display:flex;align-items:center;gap:8px;padding:8px}.section-main i{font-style:normal;font-size:7px;color:#647187}.section-main span{display:grid;gap:2px}.section-main b{font-size:9px}.section-main small{font-size:7px;color:#6f7c90}.section-actions{display:flex;padding-left:5px;gap:2px}.section-actions button{width:22px;height:22px;border:0;border-radius:6px;background:#141d29;color:#7b899e;font-size:8px}.section-actions button.on{color:#72d9af}.add-row{display:flex;gap:4px;overflow:auto;margin-top:9px}.add-row button{white-space:nowrap;border:1px dashed #334056;border-radius:8px;background:transparent;color:#8794a7;padding:7px;font-size:7px}.delete{border:0;background:transparent;color:#e98e9a;font-size:8px}.inline-fields{display:grid;grid-template-columns:1fr 1fr;gap:7px}.storefront-frame.mobile .sf-header nav{display:none}.storefront-frame.mobile .sf-header{padding:10px 12px}.storefront-frame.mobile .sf-hero{grid-template-columns:1fr;min-height:auto;padding:20px}.storefront-frame.mobile .sf-hero h1{font-size:1.6em}.storefront-frame.mobile .hero-art{height:140px}.storefront-frame.mobile .category-grid,.storefront-frame.mobile .product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.storefront-frame.mobile .product-image{height:120px}.storefront-frame.mobile .sf-promo{align-items:flex-start;flex-direction:column}.storefront-frame.mobile .sf-footer{padding:14px;gap:8px;flex-direction:column}
@media(max-width:1280px){.builder{grid-template-columns:260px minmax(470px,1fr) 280px}.presets>button{grid-template-columns:62px 1fr}.preset-preview{height:50px}}
@media(max-width:1020px){.topbar{grid-template-columns:1fr auto}.topbar nav{display:none}.builder{grid-template-columns:1fr}.left-panel,.right-panel{position:static;max-height:none}.preview-panel{order:3}.right-panel{order:2}.preview-panel{min-height:650px}.preview-stage{min-height:590px}}
@media(max-width:650px){.topbar{height:auto;min-height:68px;padding:9px 12px;gap:8px}.publish-actions>span,.secondary{display:none}.primary{padding:8px}.template-page>main{padding:20px 10px}.intro{display:grid}.release{width:100%;text-align:right}.preview-stage{padding:8px}.preview-toolbar{padding:0 9px}.storefront-frame.desktop{min-width:700px}.preview-stage{justify-content:flex-start}.sf-content{padding:14px}.sf-header nav{display:none}}
`;
