/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور فایل/ماژول را از ماژول «jsr:@supabase/functions-js/edge-runtime.d.ts» وارد می‌کند تا در این فایل قابل استفاده باشد.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// راهنما: این دستور { withSupabase } را از ماژول «npm:@supabase/server@1.4.1» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { withSupabase } from "npm:@supabase/server@1.4.1";

// راهنما: این دستور متغیر/ثابت «corsHeaders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// راهنما: این دستور متغیر/ثابت «templateSectionTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const templateSectionTypes = new Set(["hero", "categories", "products", "promo"]);
// راهنما: این دستور متغیر/ثابت «templateKeys» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const templateKeys = new Set(["minimal", "showcase", "catalog"]);
// راهنما: این دستور متغیر/ثابت «itemTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const itemTypes = new Set(["DIGITAL", "PHYSICAL", "SERVICE"]);

// راهنما: این دستور متغیر/ثابت «defaultProductTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const defaultProductTypes = [
  { id: "digital", title: "محصول دیجیتال", itemType: "DIGITAL", sortOrder: 10 },
  { id: "physical", title: "محصول فیزیکی", itemType: "PHYSICAL", sortOrder: 20 },
  { id: "service", title: "خدمت", itemType: "SERVICE", sortOrder: 30 },
] as const;

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این تابع «slugify» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function slugify(value: string) {
  // راهنما: این دستور متغیر/ثابت «clean» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const clean = value.trim().toLowerCase().normalize("NFKC").replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «clean || crypto.randomUUID().slice(0, 8)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return clean || crypto.randomUUID().slice(0, 8);
}

// راهنما: این تابع «objectValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function objectValue(value: unknown): Record<string, any> | null {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Boolean(value) && typeof value === "object" && !Array.isArray(value) ? val…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : null;
}

// راهنما: این تابع «textValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function textValue(value: unknown, fallback = "", max = 240) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === "string" ? value.slice(0, max) : fallback» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

// راهنما: این تابع «numberValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function numberValue(value: unknown, fallback: number, min: number, max: number) {
  // راهنما: این دستور متغیر/ثابت «parsed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const parsed = Number(value);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed)))…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback;
}

// راهنما: این تابع «colorValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function colorValue(value: unknown, fallback: string) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fal…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

// راهنما: این تابع «normalizeProductTypes» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeProductTypes(settingsValue: unknown) {
  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(settingsValue) ?? {};
  // راهنما: این شرط بررسی می‌کند آیا «!Array.isArray(settings.productTypes)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!Array.isArray(settings.productTypes)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «defaultProductTypes.map((item) => ({ ...item }))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return defaultProductTypes.map((item) => ({ ...item }));

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «settings.productTypes.slice(0, 50).flatMap((entry: unknown, index: number)…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return settings.productTypes.slice(0, 50).flatMap((entry: unknown, index: number) => {
    // راهنما: این دستور متغیر/ثابت «row» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const row = objectValue(entry);
    // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const id = typeof row?.id === "string" && row.id.trim() ? row.id.trim().slice(0, 80) : "";
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof row?.title === "string" ? row.title.trim().slice(0, 80) : "";
    // راهنما: این شرط بررسی می‌کند آیا «!id || !title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!id || !title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [];
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[{ id, title, itemType: itemTypes.has(String(row?.itemType)) ? String(row?…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return [{
      id,
      title,
      itemType: itemTypes.has(String(row?.itemType)) ? String(row?.itemType) : "DIGITAL",
      sortOrder: numberValue(row?.sortOrder, (index + 1) * 10, 0, 100000),
    }];
  }).sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

// راهنما: این تابع «normalizeTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeTemplate(value: unknown) {
  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = objectValue(value);
  // راهنما: این شرط بررسی می‌کند آیا «!raw» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!raw) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;

  // راهنما: این دستور متغیر/ثابت «templateKey» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const templateKey = templateKeys.has(String(raw.templateKey)) ? String(raw.templateKey) : "minimal";
  // راهنما: این دستور متغیر/ثابت «defaults» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const defaults = templateKey === "showcase"
    ? { accent: "#7c3aed", background: "#0b0b10", surface: "#15141b", text: "#f8fafc", muted: "#a1a1aa", radius: 24, fontScale: 104 }
    : templateKey === "catalog"
      ? { accent: "#0f766e", background: "#f1f5f4", surface: "#ffffff", text: "#10231f", muted: "#64748b", radius: 12, fontScale: 96 }
      : { accent: "#111827", background: "#f7f7f5", surface: "#ffffff", text: "#111827", muted: "#6b7280", radius: 18, fontScale: 100 };
  // راهنما: این دستور متغیر/ثابت «theme» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const theme = objectValue(raw.theme) ?? {};
  // راهنما: این دستور متغیر/ثابت «sectionsInput» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const sectionsInput = Array.isArray(raw.sections) ? raw.sections.slice(0, 12) : [];
  // راهنما: این دستور متغیر/ثابت «sections» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const sections = sectionsInput.flatMap((entry: unknown) => {
    // راهنما: این دستور متغیر/ثابت «section» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const section = objectValue(entry);
    // راهنما: این شرط بررسی می‌کند آیا «!section || !templateSectionTypes.has(String(section.type))» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!section || !templateSectionTypes.has(String(section.type))) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [];
    // راهنما: این دستور متغیر/ثابت «type» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const type = String(section.type);
    // راهنما: این دستور متغیر/ثابت «columns» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const columns = [2, 3, 4].includes(Number(section.columns)) ? Number(section.columns) : 3;
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[{ id: typeof section.id === "string" && section.id.length > 0 && section.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return [{
      id: typeof section.id === "string" && section.id.length > 0 && section.id.length <= 80 ? section.id : crypto.randomUUID(),
      type,
      enabled: section.enabled !== false,
      eyebrow: textValue(section.eyebrow, "", 80),
      title: textValue(section.title, type, 160),
      body: textValue(section.body, "", 500),
      ctaLabel: textValue(section.ctaLabel, "", 80),
      limit: numberValue(section.limit, 6, 1, 12),
      columns,
    }];
  });

  // راهنما: این شرط بررسی می‌کند آیا «sections.length === 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (sections.length === 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ schemaVersion: 1, templateKey, theme: { accent: colorValue(theme.accent,…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    schemaVersion: 1,
    templateKey,
    theme: {
      accent: colorValue(theme.accent, defaults.accent),
      background: colorValue(theme.background, defaults.background),
      surface: colorValue(theme.surface, defaults.surface),
      text: colorValue(theme.text, defaults.text),
      muted: colorValue(theme.muted, defaults.muted),
      radius: numberValue(theme.radius, defaults.radius, 0, 40),
      fontScale: numberValue(theme.fontScale, defaults.fontScale, 85, 120),
      logoUrl: textValue(theme.logoUrl, "", 500),
    },
    sections,
  };
}

// راهنما: این تابع «firstWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function firstWorkspace(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`workspace_membership:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}

// راهنما: این تابع «ownedStore» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ownedStore(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("Store").select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt").eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store_read:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
}

// راهنما: این تابع «saveStoreSettings» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function saveStoreSettings(admin: any, workspaceId: string, store: any, patch: Record<string, unknown>) {
  // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const current = objectValue(store.settings) ?? {};
  // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const next = { ...current, ...patch };
  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error } = await admin.from("Store").update({ settings: next, updatedAt: now }).eq("id", store.id).eq("workspaceId", workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store_settings:${error.message}`);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «store.settings = next».
  store.settings = next;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «store.updatedAt = now».
  store.updatedAt = now;
}

// راهنما: این تابع «requireCategory» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function requireCategory(admin: any, storeId: string, categoryId: string | null) {
  // راهنما: این شرط بررسی می‌کند آیا «!categoryId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!categoryId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("StoreCategory").select("id").eq("id", categoryId).eq("storeId", storeId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`category_read:${error.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!data) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_category");
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «categoryId» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return categoryId;
}

// راهنما: این تابع «itemsUsingProductType» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function itemsUsingProductType(admin: any, storeId: string, productTypeId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("StoreItem").select("id,metadata").eq("storeId", storeId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`type_items:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(data ?? []).filter((row: any) => objectValue(row.metadata)?.productTypeId…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (data ?? []).filter((row: any) => objectValue(row.metadata)?.productTypeId === productTypeId);
}

// راهنما: این تابع «readDashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readDashboard(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «store» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const store = await ownedStore(admin, workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, store: null, productTypes: [], categories: [], items: [], orde…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { ok: true, store: null, productTypes: [], categories: [], items: [], orders: [], shareTargets: { telegram: [] }, summary: { itemCount: 0, categoryCount: 0, orderCount: 0, paidOrderCount: 0, customerCount: 0 } };

  // راهنما: این دستور متغیر/ثابت «[categoriesResult, itemsResult, ordersResult…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [categoriesResult, itemsResult, ordersResult, customersResult, orderCountResult, paidOrderCountResult, telegramBotsResult] = await Promise.all([
    admin.from("StoreCategory").select("id,title,slug,sortOrder,isActive,createdAt,updatedAt").eq("storeId", store.id).order("sortOrder", { ascending: true }),
    admin.from("StoreItem").select("id,categoryId,sku,title,description,itemType,priceAmount,currency,inventoryCount,imageUrl,sortOrder,isActive,metadata,createdAt,updatedAt").eq("storeId", store.id).order("sortOrder", { ascending: true }).order("createdAt", { ascending: false }),
    admin.from("StoreOrder").select("id,customerId,sourcePlatform,status,subtotalAmount,discountAmount,totalAmount,currency,note,createdAt,paidAt").eq("storeId", store.id).order("createdAt", { ascending: false }).limit(30),
    admin.from("StoreCustomer").select("id", { count: "exact", head: true }).eq("storeId", store.id),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).in("status", ["PAID", "PROCESSING", "COMPLETED"]),
    admin.from("TelegramBot").select("id,username,displayName,status,createdAt").eq("workspaceId", workspaceId).eq("status", "ACTIVE").not("username", "is", null).order("createdAt", { ascending: false }).limit(5),
  ]);

  // راهنما: این دستور متغیر/ثابت «error» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const error = [categoriesResult.error, itemsResult.error, ordersResult.error, customersResult.error, orderCountResult.error, paidOrderCountResult.error, telegramBotsResult.error].find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store_dashboard:${error.message}`);

  // راهنما: این دستور متغیر/ثابت «categories» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const categories = categoriesResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «items» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const items = itemsResult.data ?? [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, store, productTypes: normalizeProductTypes(store.settings), ca…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    store,
    productTypes: normalizeProductTypes(store.settings),
    categories,
    items,
    orders: ordersResult.data ?? [],
    shareTargets: {
      telegram: (telegramBotsResult.data ?? []).map((bot: any) => ({ id: bot.id, username: bot.username, displayName: bot.displayName ?? null })),
    },
    summary: {
      itemCount: items.length,
      categoryCount: categories.length,
      orderCount: orderCountResult.count ?? 0,
      paidOrderCount: paidOrderCountResult.count ?? 0,
      customerCount: customersResult.count ?? 0,
    },
  };
}

// راهنما: این تابع «saveTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function saveTemplate(admin: any, workspaceId: string, store: any, rawTemplate: unknown, publish: boolean) {
  // راهنما: این دستور متغیر/ثابت «template» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const template = normalizeTemplate(rawTemplate);
  // راهنما: این شرط بررسی می‌کند آیا «!template» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!template) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ error: "ساختار قالب معتبر نیست." } as const» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { error: "ساختار قالب معتبر نیست." } as const;

  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(store.settings) ?? {};
  // راهنما: این دستور متغیر/ثابت «currentEngine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const currentEngine = objectValue(settings.templateEngine) ?? {};
  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این دستور متغیر/ثابت «currentVersion» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const currentVersion = numberValue(currentEngine.version, 0, 0, 1_000_000);
  // راهنما: این دستور متغیر/ثابت «templateEngine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const templateEngine = {
    ...currentEngine,
    draft: template,
    draftSavedAt: now,
    ...(publish ? { published: template, publishedAt: now, version: currentVersion + 1 } : {}),
  };

  // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error } = await admin.from("Store").update({ settings: { ...settings, templateEngine }, updatedAt: now }).eq("id", store.id).eq("workspaceId", workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`template_save:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ data: await readDashboard(admin, workspaceId) } as const» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { data: await readDashboard(admin, workspaceId) } as const;
}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId = ctx.userClaims?.id;
  // راهنما: این شرط بررسی می‌کند آیا «!userId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!userId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin = ctx.supabaseAdmin;

  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let workspaceId: string | undefined;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «workspaceId = await firstWorkspace(admin, userId)». */ workspaceId = await firstWorkspace(admin, userId); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فضای کاری قابل شناسایی نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فضای کاری قابل شناسایی نیست." }, 500); }
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فضای کاری برای این حساب پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فضای کاری برای این حساب پیدا نشد." }, 404);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await readDashboard(admin, workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500); }
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = typeof body?.action === "string" ? body.action : "";

  // راهنما: این شرط بررسی می‌کند آیا «action === "ensure_store"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "ensure_store") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const existing = await ownedStore(admin, workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «existing» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (existing) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await readDashboard(admin, workspaceId));
      // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 120) : "فروشگاه من";
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("Store").insert({ workspaceId, name, status: "ACTIVE" });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId), 201)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("store create failed", error)».
      console.error("store create failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ساخت فروشگاه انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ساخت فروشگاه انجام نشد." }, 500);
    }
  }

  // راهنما: این دستور متغیر/ثابت «store» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let store: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «store = await ownedStore(admin, workspaceId)». */ store = await ownedStore(admin, workspaceId); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فروشگاه قابل دریافت نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فروشگاه قابل دریافت نیست." }, 500); }
  // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409);

  // راهنما: این شرط بررسی می‌کند آیا «action === "save_template_draft" || action === "publish_template"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "save_template_draft" || action === "publish_template") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await saveTemplate(admin, workspaceId, store, body.template, action === "publish_template");
      // راهنما: این شرط بررسی می‌کند آیا «"error" in result» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if ("error" in result) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: result.error }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: result.error }, 400);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(result.data)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(result.data);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("template save failed", error)».
      console.error("template save failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره قالب فروشگاه انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ذخیره قالب فروشگاه انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "create_product_type"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "create_product_type") {
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
    // راهنما: این شرط بررسی می‌کند آیا «!title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام نوع محصول الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام نوع محصول الزامی است." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «productTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productTypes = normalizeProductTypes(store.settings);
      // راهنما: این شرط بررسی می‌کند آیا «productTypes.some((item) => item.title.localeCompare(title, "fa", { sensitivity…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypes.some((item) => item.title.localeCompare(title, "fa", { sensitivity: "base" }) === 0)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "این نوع محصول قبلاً وجود دارد." }, 409)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "این نوع محصول قبلاً وجود دارد." }, 409);
      // راهنما: این دستور متغیر/ثابت «maxSort» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const maxSort = Math.max(0, ...productTypes.map((item) => item.sortOrder));
      // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const next = [...productTypes, { id: crypto.randomUUID(), title, itemType: itemTypes.has(String(body.itemType)) ? String(body.itemType) : "DIGITAL", sortOrder: maxSort + 10 }];
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await saveStoreSettings(admin, workspaceId, store, { productTypes: next })».
      await saveStoreSettings(admin, workspaceId, store, { productTypes: next });
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId), 201)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("product type create failed", error)».
      console.error("product type create failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ساخت نوع محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ساخت نوع محصول انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_product_type"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_product_type") {
    // راهنما: این دستور متغیر/ثابت «productTypeId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const productTypeId = typeof body.productTypeId === "string" ? body.productTypeId.trim() : "";
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
    // راهنما: این شرط بررسی می‌کند آیا «!productTypeId || !title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!productTypeId || !title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول و نام جدید الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول و نام جدید الزامی است." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «productTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productTypes = normalizeProductTypes(store.settings);
      // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const current = productTypes.find((item) => item.id === productTypeId);
      // راهنما: این شرط بررسی می‌کند آیا «!current» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!current) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول پیدا نشد." }, 404);
      // راهنما: این شرط بررسی می‌کند آیا «productTypes.some((item) => item.id !== productTypeId && item.title.localeCompa…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypes.some((item) => item.id !== productTypeId && item.title.localeCompare(title, "fa", { sensitivity: "base" }) === 0)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع دیگری با این نام وجود دارد." }, 409)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع دیگری با این نام وجود دارد." }, 409);
      // راهنما: این دستور متغیر/ثابت «nextItemType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const nextItemType = itemTypes.has(String(body.itemType)) ? String(body.itemType) : current.itemType;
      // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const next = productTypes.map((item) => item.id === productTypeId ? { ...item, title, itemType: nextItemType } : item);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await saveStoreSettings(admin, workspaceId, store, { productTypes: next })».
      await saveStoreSettings(admin, workspaceId, store, { productTypes: next });
      // راهنما: این شرط بررسی می‌کند آیا «nextItemType !== current.itemType» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (nextItemType !== current.itemType) {
        // راهنما: این دستور متغیر/ثابت «usedBy» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const usedBy = await itemsUsingProductType(admin, store.id, productTypeId);
        // راهنما: این شرط بررسی می‌کند آیا «usedBy.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (usedBy.length) {
          // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
          const { error } = await admin.from("StoreItem").update({ itemType: nextItemType, updatedAt: new Date().toISOString() }).in("id", usedBy.map((item: any) => item.id)).eq("storeId", store.id);
          // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
          if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`type_sync:${error.message}`);
        }
      }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("product type update failed", error)».
      console.error("product type update failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ویرایش نوع محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ویرایش نوع محصول انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "delete_product_type"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "delete_product_type") {
    // راهنما: این دستور متغیر/ثابت «productTypeId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const productTypeId = typeof body.productTypeId === "string" ? body.productTypeId.trim() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!productTypeId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!productTypeId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول مشخص نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول مشخص نیست." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «productTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productTypes = normalizeProductTypes(store.settings);
      // راهنما: این شرط بررسی می‌کند آیا «!productTypes.some((item) => item.id === productTypeId)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!productTypes.some((item) => item.id === productTypeId)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «usedBy» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const usedBy = await itemsUsingProductType(admin, store.id, productTypeId);
      // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
      for (const item of usedBy) {
        // راهنما: این دستور متغیر/ثابت «metadata» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const metadata = objectValue(item.metadata) ?? {};
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «delete metadata.productTypeId».
        delete metadata.productTypeId;
        // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const { error } = await admin.from("StoreItem").update({ metadata, updatedAt: new Date().toISOString() }).eq("id", item.id).eq("storeId", store.id);
        // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`type_unlink:${error.message}`);
      }
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await saveStoreSettings(admin, workspaceId, store, { productTypes: productTypes.filter((i…».
      await saveStoreSettings(admin, workspaceId, store, { productTypes: productTypes.filter((item) => item.id !== productTypeId) });
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("product type delete failed", error)».
      console.error("product type delete failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حذف نوع محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "حذف نوع محصول انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "create_category"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "create_category") {
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
    // راهنما: این شرط بررسی می‌کند آیا «!title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام دسته‌بندی الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام دسته‌بندی الزامی است." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «slug» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      let slug = slugify(title);
      // راهنما: این دستور متغیر/ثابت «{ data: duplicate, error: duplicateError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: duplicate, error: duplicateError } = await admin.from("StoreCategory").select("id").eq("storeId", store.id).eq("slug", slug).limit(1);
      // راهنما: این شرط بررسی می‌کند آیا «duplicateError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (duplicateError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw duplicateError;
      // راهنما: این شرط بررسی می‌کند آیا «duplicate?.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (duplicate?.length) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «slug = `${slug}-${crypto.randomUUID().slice(0, 5)}`». */ slug = `${slug}-${crypto.randomUUID().slice(0, 5)}`;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("StoreCategory").insert({ storeId: store.id, title, slug });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId), 201)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("category create failed", error)».
      console.error("category create failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ساخت دسته‌بندی انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ساخت دسته‌بندی انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_category"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_category") {
    // راهنما: این دستور متغیر/ثابت «categoryId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
    // راهنما: این شرط بررسی می‌کند آیا «!categoryId || !title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!categoryId || !title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی و نام جدید الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی و نام جدید الزامی است." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ data: category, error: categoryError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: category, error: categoryError } = await admin.from("StoreCategory").select("id").eq("id", categoryId).eq("storeId", store.id).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «categoryError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (categoryError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw categoryError;
      // راهنما: این شرط بررسی می‌کند آیا «!category» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!category) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «slug» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      let slug = slugify(title);
      // راهنما: این دستور متغیر/ثابت «{ data: duplicate, error: duplicateError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: duplicate, error: duplicateError } = await admin.from("StoreCategory").select("id").eq("storeId", store.id).eq("slug", slug).neq("id", categoryId).limit(1);
      // راهنما: این شرط بررسی می‌کند آیا «duplicateError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (duplicateError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw duplicateError;
      // راهنما: این شرط بررسی می‌کند آیا «duplicate?.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (duplicate?.length) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «slug = `${slug}-${crypto.randomUUID().slice(0, 5)}`». */ slug = `${slug}-${crypto.randomUUID().slice(0, 5)}`;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("StoreCategory").update({ title, slug, updatedAt: new Date().toISOString() }).eq("id", categoryId).eq("storeId", store.id);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("category update failed", error)».
      console.error("category update failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ویرایش دسته‌بندی انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ویرایش دسته‌بندی انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "delete_category"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "delete_category") {
    // راهنما: این دستور متغیر/ثابت «categoryId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!categoryId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!categoryId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی مشخص نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی مشخص نیست." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «{ data: category, error: categoryError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: category, error: categoryError } = await admin.from("StoreCategory").select("id").eq("id", categoryId).eq("storeId", store.id).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «categoryError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (categoryError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw categoryError;
      // راهنما: این شرط بررسی می‌کند آیا «!category» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!category) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «{ error: unassignError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error: unassignError } = await admin.from("StoreItem").update({ categoryId: null, updatedAt: new Date().toISOString() }).eq("storeId", store.id).eq("categoryId", categoryId);
      // راهنما: این شرط بررسی می‌کند آیا «unassignError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (unassignError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw unassignError;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("StoreCategory").delete().eq("id", categoryId).eq("storeId", store.id);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("category delete failed", error)».
      console.error("category delete failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حذف دسته‌بندی انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "حذف دسته‌بندی انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "bulk_set_price"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "bulk_set_price") {
    // راهنما: این دستور متغیر/ثابت «priceAmount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const priceAmount = Number(body.priceAmount);
    // راهنما: این دستور متغیر/ثابت «categoryId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const categoryId = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
    // راهنما: این شرط بررسی می‌کند آیا «!Number.isSafeInteger(priceAmount) || priceAmount < 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!Number.isSafeInteger(priceAmount) || priceAmount < 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قیمت گروهی معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قیمت گروهی معتبر نیست." }, 400);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await requireCategory(admin, store.id, categoryId)».
      await requireCategory(admin, store.id, categoryId);
      // راهنما: این دستور متغیر/ثابت «query» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      let query = admin.from("StoreItem").update({ priceAmount, updatedAt: new Date().toISOString() }).eq("storeId", store.id);
      // راهنما: این شرط بررسی می‌کند آیا «categoryId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (categoryId) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «query = query.eq("categoryId", categoryId)». */ query = query.eq("categoryId", categoryId);
      // راهنما: این دستور متغیر/ثابت «{ data: updated, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: updated, error } = await query.select("id");
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await readDashboard(admin, workspaceId)), bulkUpdated: updated?…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await readDashboard(admin, workspaceId)), bulkUpdated: updated?.length ?? 0 });
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bulk price update failed", error)».
      console.error("bulk price update failed", error);
      // راهنما: این شرط بررسی می‌کند آیا «String(error).includes("invalid_category")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (String(error).includes("invalid_category")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "تغییر گروهی قیمت انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "تغییر گروهی قیمت انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "create_item"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "create_item") {
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    // راهنما: این دستور متغیر/ثابت «priceAmount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const priceAmount = Number(body.priceAmount);
    // راهنما: این دستور متغیر/ثابت «inventoryRaw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const inventoryRaw = body.inventoryCount;
    // راهنما: این دستور متغیر/ثابت «inventoryCount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const inventoryCount = inventoryRaw === "" || inventoryRaw === null || inventoryRaw === undefined ? null : Number(inventoryRaw);
    // راهنما: این دستور متغیر/ثابت «categoryId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const categoryId = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
    // راهنما: این دستور متغیر/ثابت «productTypeId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const productTypeId = typeof body.productTypeId === "string" && body.productTypeId ? body.productTypeId : null;

    // راهنما: این شرط بررسی می‌کند آیا «!title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام محصول الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام محصول الزامی است." }, 400);
    // راهنما: این شرط بررسی می‌کند آیا «!Number.isSafeInteger(priceAmount) || priceAmount < 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!Number.isSafeInteger(priceAmount) || priceAmount < 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قیمت محصول معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قیمت محصول معتبر نیست." }, 400);
    // راهنما: این شرط بررسی می‌کند آیا «inventoryCount !== null && (!Number.isSafeInteger(inventoryCount) || inventoryC…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (inventoryCount !== null && (!Number.isSafeInteger(inventoryCount) || inventoryCount < 0)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "موجودی معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "موجودی معتبر نیست." }, 400);

    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await requireCategory(admin, store.id, categoryId)».
      await requireCategory(admin, store.id, categoryId);
      // راهنما: این دستور متغیر/ثابت «productTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productTypes = normalizeProductTypes(store.settings);
      // راهنما: این دستور متغیر/ثابت «productType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productType = productTypeId ? productTypes.find((item) => item.id === productTypeId) : null;
      // راهنما: این شرط بررسی می‌کند آیا «productTypeId && !productType» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypeId && !productType) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول انتخاب‌شده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول انتخاب‌شده معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «itemType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const itemType = productType?.itemType ?? (itemTypes.has(String(body.itemType)) ? String(body.itemType) : "DIGITAL");
      // راهنما: این دستور متغیر/ثابت «metadata» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const metadata = objectValue(body.metadata) ?? {};
      // راهنما: این شرط بررسی می‌کند آیا «productTypeId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypeId) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «metadata.productTypeId = productTypeId». */ metadata.productTypeId = productTypeId;
      // راهنما: این دستور متغیر/ثابت «row» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const row = {
        storeId: store.id,
        categoryId,
        title,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim().slice(0, 4000) : null,
        itemType,
        priceAmount,
        currency: "IRR",
        inventoryCount,
        isActive: true,
        metadata,
      };
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("StoreItem").insert(row);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId), 201)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("item create failed", error)».
      console.error("item create failed", error);
      // راهنما: این شرط بررسی می‌کند آیا «String(error).includes("invalid_category")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (String(error).includes("invalid_category")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ساخت محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ساخت محصول انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_item"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_item") {
    // راهنما: این دستور متغیر/ثابت «itemId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!itemId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!itemId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول مشخص نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول مشخص نیست." }, 400);
    // راهنما: این دستور متغیر/ثابت «{ data: current, error: currentError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: current, error: currentError } = await admin.from("StoreItem").select("id,title,description,itemType,priceAmount,inventoryCount,categoryId,metadata,isActive").eq("id", itemId).eq("storeId", store.id).maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «currentError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (currentError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بررسی محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بررسی محصول انجام نشد." }, 500);
    // راهنما: این شرط بررسی می‌کند آیا «!current» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!current) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول پیدا نشد." }, 404);

    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : current.title;
    // راهنما: این دستور متغیر/ثابت «priceAmount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const priceAmount = body.priceAmount === undefined ? Number(current.priceAmount) : Number(body.priceAmount);
    // راهنما: این دستور متغیر/ثابت «inventoryRaw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const inventoryRaw = body.inventoryCount === undefined ? current.inventoryCount : body.inventoryCount;
    // راهنما: این دستور متغیر/ثابت «inventoryCount» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const inventoryCount = inventoryRaw === "" || inventoryRaw === null || inventoryRaw === undefined ? null : Number(inventoryRaw);
    // راهنما: این دستور متغیر/ثابت «categoryId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const categoryId = body.categoryId === undefined ? current.categoryId : (typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null);
    // راهنما: این دستور متغیر/ثابت «productTypeId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const productTypeId = body.productTypeId === undefined ? objectValue(current.metadata)?.productTypeId ?? null : (typeof body.productTypeId === "string" && body.productTypeId ? body.productTypeId : null);
    // راهنما: این شرط بررسی می‌کند آیا «!title» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!title) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام محصول الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام محصول الزامی است." }, 400);
    // راهنما: این شرط بررسی می‌کند آیا «!Number.isSafeInteger(priceAmount) || priceAmount < 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!Number.isSafeInteger(priceAmount) || priceAmount < 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قیمت محصول معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قیمت محصول معتبر نیست." }, 400);
    // راهنما: این شرط بررسی می‌کند آیا «inventoryCount !== null && (!Number.isSafeInteger(inventoryCount) || inventoryC…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (inventoryCount !== null && (!Number.isSafeInteger(inventoryCount) || inventoryCount < 0)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "موجودی معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "موجودی معتبر نیست." }, 400);

    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await requireCategory(admin, store.id, categoryId)».
      await requireCategory(admin, store.id, categoryId);
      // راهنما: این دستور متغیر/ثابت «productTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productTypes = normalizeProductTypes(store.settings);
      // راهنما: این دستور متغیر/ثابت «productType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const productType = productTypeId ? productTypes.find((item) => item.id === productTypeId) : null;
      // راهنما: این شرط بررسی می‌کند آیا «productTypeId && !productType» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypeId && !productType) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع محصول انتخاب‌شده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع محصول انتخاب‌شده معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «metadata» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const metadata = objectValue(current.metadata) ?? {};
      // راهنما: این شرط بررسی می‌کند آیا «productTypeId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (productTypeId) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «metadata.productTypeId = productTypeId». */ metadata.productTypeId = productTypeId;
      else /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «delete metadata.productTypeId». */ delete metadata.productTypeId;
      // راهنما: این دستور متغیر/ثابت «itemType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const itemType = productType?.itemType ?? current.itemType;
      // راهنما: این دستور متغیر/ثابت «description» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const description = typeof body.description === "string" ? (body.description.trim().slice(0, 4000) || null) : current.description;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("StoreItem").update({ title, description, priceAmount, inventoryCount, categoryId, itemType, metadata, updatedAt: new Date().toISOString() }).eq("id", itemId).eq("storeId", store.id);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("item update failed", error)».
      console.error("item update failed", error);
      // راهنما: این شرط بررسی می‌کند آیا «String(error).includes("invalid_category")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (String(error).includes("invalid_category")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ویرایش محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "ویرایش محصول انجام نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "toggle_item"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "toggle_item") {
    // راهنما: این دستور متغیر/ثابت «itemId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!itemId || typeof body.isActive !== "boolean"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!itemId || typeof body.isActive !== "boolean") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول یا وضعیت آن معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول یا وضعیت آن معتبر نیست." }, 400);
    // راهنما: این دستور متغیر/ثابت «{ data: updated, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: updated, error } = await admin.from("StoreItem").update({ isActive: body.isActive, updatedAt: new Date().toISOString() }).eq("id", itemId).eq("storeId", store.id).select("id").maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "تغییر وضعیت محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "تغییر وضعیت محصول انجام نشد." }, 500);
    // راهنما: این شرط بررسی می‌کند آیا «!updated» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!updated) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول پیدا نشد." }, 404);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json(await readDashboard(admin, workspaceId));
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "delete_item"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "delete_item") {
    // راهنما: این دستور متغیر/ثابت «itemId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!itemId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!itemId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول مشخص نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول مشخص نیست." }, 400);
    // راهنما: این دستور متغیر/ثابت «{ data: deleted, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: deleted, error } = await admin.from("StoreItem").delete().eq("id", itemId).eq("storeId", store.id).select("id").maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حذف محصول انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حذف محصول انجام نشد." }, 500);
    // راهنما: این شرط بررسی می‌کند آیا «!deleted» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!deleted) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "محصول پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "محصول پیدا نشد." }, 404);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json(await readDashboard(admin, workspaceId));
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
});

// راهنما: این دستور از نوع ExportAssignment بخشی از کنترل جریان یا تعریف منطق این فایل است.
export default {
  async fetch(request: Request) {
    // راهنما: این شرط بررسی می‌کند آیا «request.method === "OPTIONS"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (request.method === "OPTIONS") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok", { headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok", { headers: corsHeaders });
    // راهنما: این دستور متغیر/ثابت «response» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const response = await authenticated(request);
    // راهنما: این دستور متغیر/ثابت «headers» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const headers = new Headers(response.headers);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value))».
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response(response.body, { status: response.status, headers })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return new Response(response.body, { status: response.status, headers });
  },
};
