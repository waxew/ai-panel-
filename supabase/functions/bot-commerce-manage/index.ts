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

// راهنما: این دستور متغیر/ثابت «providers» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const providers = new Set(["telegram", "bale", "rubika"]);
// راهنما: این دستور متغیر/ثابت «presetKeys» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const presetKeys = new Set(["commerce", "services", "digital"]);
// راهنما: این دستور متغیر/ثابت «actionTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const actionTypes = new Set([
  "CATALOG", "SEARCH", "CART", "ORDERS", "TRACK_ORDER", "ACCOUNT", "WALLET",
  "MY_SERVICES", "PRICING", "REFERRAL", "TUTORIAL", "SUPPORT", "TEXT", "URL", "SUBMENU",
]);
// راهنما: این دستور متغیر/ثابت «liveActionTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const liveActionTypes = new Set(["CATALOG", "CART", "ORDERS", "SUPPORT", "TEXT", "URL", "SUBMENU"]);
// راهنما: این دستور متغیر/ثابت «customTitleActionTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const customTitleActionTypes = new Set(["TEXT", "URL", "SUBMENU"]);
// راهنما: این دستور متغیر/ثابت «fixedActionTitles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const fixedActionTitles: Record<string, string> = {
  CATALOG: "🛍 محصولات",
  SEARCH: "🔎 جستجوی محصول",
  CART: "🛒 سبد خرید",
  ORDERS: "📦 سفارش‌های من",
  TRACK_ORDER: "🚚 پیگیری سفارش",
  ACCOUNT: "👤 حساب کاربری",
  WALLET: "💳 کیف پول",
  MY_SERVICES: "📦 سرویس‌های من",
  PRICING: "💰 تعرفه‌ها",
  REFERRAL: "👥 زیرمجموعه‌گیری",
  TUTORIAL: "📚 آموزش",
  SUPPORT: "☎️ پشتیبانی",
};

// راهنما: این دستور متغیر/ثابت «providerConfig» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const providerConfig = {
  telegram: { table: "TelegramBot", externalId: "telegramBotId", buttonTable: "TelegramButton" },
  bale: { table: "BaleBot", externalId: "baleBotId", buttonTable: "BaleButton" },
  rubika: { table: "RubikaBot", externalId: "rubikaBotId", buttonTable: "RubikaButton" },
} as const;

// راهنما: این Type با نام «Provider» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Provider = keyof typeof providerConfig;
// راهنما: این Type با نام «JsonObject» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type JsonObject = Record<string, any>;
// راهنما: این Type با نام «RuntimeTarget» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type RuntimeTarget = { provider: Provider; botId: string; enabled: boolean };

// راهنما: این Type با نام «LegacyTargetSnapshot» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type LegacyTargetSnapshot = {
  provider: Provider;
  botId: string;
  welcomeMessage: string | null;
  buttons: Array<{
    id: string;
    parentId: string | null;
    title: string;
    actionType: string;
    actionValue: string | null;
    sortOrder: number;
  }>;
};

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این تابع «objectValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function objectValue(value: unknown): JsonObject | null {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Boolean(value) && typeof value === "object" && !Array.isArray(value) ? val…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

// راهنما: این تابع «textValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function textValue(value: unknown, fallback: string, max: number) {
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «fallback» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return fallback;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value.trim().slice(0, max)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return value.trim().slice(0, max);
}

// راهنما: این تابع «integerValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function integerValue(value: unknown, fallback: number, min: number, max: number) {
  // راهنما: این دستور متغیر/ثابت «parsed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const parsed = Number(value);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

// راهنما: این تابع «canonicalMenuTitle» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function canonicalMenuTitle(value: string) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLocaleLowerCase(…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return value.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLocaleLowerCase("fa-IR");
}

// راهنما: این دستور متغیر/ثابت «reservedMenuTitles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const reservedMenuTitles = new Set(Object.values(fixedActionTitles).map(canonicalMenuTitle));

// راهنما: این تابع «normalizeMenuTitle» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeMenuTitle(actionType: string, requestedTitle: string) {
  // راهنما: این دستور متغیر/ثابت «fixedTitle» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const fixedTitle = fixedActionTitles[actionType];
  // راهنما: این شرط بررسی می‌کند آیا «fixedTitle» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (fixedTitle) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «fixedTitle» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return fixedTitle;
  // راهنما: این شرط بررسی می‌کند آیا «!customTitleActionTypes.has(actionType)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!customTitleActionTypes.has(actionType)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_type");
  // راهنما: این شرط بررسی می‌کند آیا «reservedMenuTitles.has(canonicalMenuTitle(requestedTitle))» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (reservedMenuTitles.has(canonicalMenuTitle(requestedTitle))) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("reserved_menu_title");
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «requestedTitle» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return requestedTitle;
}

// راهنما: این تابع «normalizeActionValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeActionValue(actionType: string, value: unknown) {
  // راهنما: این شرط بررسی می‌کند آیا «actionType === "SUBMENU"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (actionType === "SUBMENU") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این شرط بررسی می‌کند آیا «value == null || value === ""» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (value == null || value === "") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
  // راهنما: این دستور متغیر/ثابت «clean» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const clean = value.trim();
  // راهنما: این شرط بررسی می‌کند آیا «actionType === "URL"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (actionType === "URL") {
    // راهنما: این شرط بررسی می‌کند آیا «clean.length > 1000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (clean.length > 1000) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
    // راهنما: این دستور متغیر/ثابت «parsed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let parsed: URL;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «parsed = new URL(clean)». */ parsed = new URL(clean); } catch { /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_url"); }
    // راهنما: این شرط بررسی می‌کند آیا «parsed.protocol !== "https:" && parsed.protocol !== "http:"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_url");
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «clean» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return clean;
  }
  // راهنما: این شرط بررسی می‌کند آیا «clean.length > 2000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (clean.length > 2000) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «clean || null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return clean || null;
}

// راهنما: این تابع «workspaceForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function workspaceForUser(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`workspace:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}

// راهنما: این تابع «ownedStore» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ownedStore(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("Store")
    .select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt")
    .eq("workspaceId", workspaceId)
    .maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
}

// راهنما: این تابع «ensureStore» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureStore(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const current = await ownedStore(admin, workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «current» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (current) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «current» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return current;
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("Store")
    .insert({ workspaceId, name: "فروشگاه من", status: "ACTIVE" })
    .select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt")
    .single();
  // راهنما: این شرط بررسی می‌کند آیا «error || !data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error || !data) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store_create:${error?.message ?? "unknown"}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «listProviderBots» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function listProviderBots(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const result: Record<string, any[]> = { telegram: [], bale: [], rubika: [] };
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const provider of Object.keys(providerConfig) as Provider[]) {
    // راهنما: این دستور متغیر/ثابت «config» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const config = providerConfig[provider];
    // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data, error } = await admin.from(config.table)
      .select(`id,${config.externalId},username,displayName,description,status,createdAt`)
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: false });
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`${provider}_bots:${error.message}`);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «result[provider] = (data ?? []).map((bot: any) => ({ id: bot.id, externalId: bot[config.e…».
    result[provider] = (data ?? []).map((bot: any) => ({
      id: bot.id,
      externalId: bot[config.externalId],
      username: bot.username ?? null,
      displayName: bot.displayName ?? null,
      description: bot.description ?? null,
      status: bot.status,
      createdAt: bot.createdAt,
    }));
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «result» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return result;
}

// راهنما: این تابع «buildOwnedTargetSet» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function buildOwnedTargetSet(providerBots: Record<string, any[]>) {
  // راهنما: این دستور متغیر/ثابت «owned» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const owned = new Set<string>();
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const provider of Object.keys(providerBots)) {
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const bot of providerBots[provider] ?? []) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «owned.add(`${provider}:${bot.id}`)». */ owned.add(`${provider}:${bot.id}`);
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «owned» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return owned;
}

// راهنما: این تابع «validateMenuGraph» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function validateMenuGraph(menu: any[], forPublish: boolean) {
  // راهنما: این دستور متغیر/ثابت «ids» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const ids = new Set(menu.map((node) => node.id));
  // راهنما: این دستور متغیر/ثابت «byId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const byId = new Map(menu.map((node) => [node.id, node]));
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const node of menu) {
    // راهنما: این شرط بررسی می‌کند آیا «node.parentId !== null && !ids.has(node.parentId)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (node.parentId !== null && !ids.has(node.parentId)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_parent");
    // راهنما: این شرط بررسی می‌کند آیا «node.parentId === node.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (node.parentId === node.id) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("menu_cycle");
    // راهنما: این شرط بررسی می‌کند آیا «forPublish && node.enabled && node.parentId && !byId.get(node.parentId)?.enabled» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (forPublish && node.enabled && node.parentId && !byId.get(node.parentId)?.enabled) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("enabled_child_of_disabled_parent");
  }

  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const node of menu) {
    // راهنما: این دستور متغیر/ثابت «cursor» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let cursor: any = node;
    // راهنما: این دستور متغیر/ثابت «visited» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const visited = new Set<string>();
    // راهنما: این دستور متغیر/ثابت «depth» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let depth = 0;
    // راهنما: این حلقه تا زمانی که شرط تعیین‌شده برقرار باشد، دستورات داخل بدنه را تکرار می‌کند.
    while (cursor?.parentId) {
      // راهنما: این شرط بررسی می‌کند آیا «visited.has(cursor.id)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (visited.has(cursor.id)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("menu_cycle");
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «visited.add(cursor.id)».
      visited.add(cursor.id);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «cursor = byId.get(cursor.parentId)».
      cursor = byId.get(cursor.parentId);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «depth += 1».
      depth += 1;
      // راهنما: این شرط بررسی می‌کند آیا «depth > 3» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (depth > 3) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("menu_depth");
    }
  }
}

// راهنما: این تابع «normalizeTemplate» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalizeTemplate(value: unknown, ownedTargets: Set<string>, forPublish: boolean) {
  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = objectValue(value);
  // راهنما: این شرط بررسی می‌کند آیا «!raw» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!raw) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_template");

  // راهنما: این دستور متغیر/ثابت «presetKey» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const presetKey = presetKeys.has(String(raw.presetKey)) ? String(raw.presetKey) : "commerce";
  // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const name = textValue(raw.name, "فروشگاه پیام‌رسان", 120) || "فروشگاه پیام‌رسان";
  // راهنما: این دستور متغیر/ثابت «welcomeMessage» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const welcomeMessage = textValue(raw.welcomeMessage, "سلام! از منوی زیر یکی از گزینه‌ها را انتخاب کنید.", 4000);
  // راهنما: این شرط بررسی می‌کند آیا «!welcomeMessage» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!welcomeMessage) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_welcome");

  // راهنما: این شرط بررسی می‌کند آیا «!Array.isArray(raw.menu) || raw.menu.length === 0 || raw.menu.length > 60» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!Array.isArray(raw.menu) || raw.menu.length === 0 || raw.menu.length > 60) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_menu");
  // راهنما: این دستور متغیر/ثابت «seenIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const seenIds = new Set<string>();
  // راهنما: این دستور متغیر/ثابت «menu» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const menu = raw.menu.map((entry: unknown, index: number) => {
    // راهنما: این دستور متغیر/ثابت «node» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const node = objectValue(entry);
    // راهنما: این شرط بررسی می‌کند آیا «!node» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!node) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_menu_node");
    // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const id = textValue(node.id, "", 80);
    // راهنما: این شرط بررسی می‌کند آیا «!id || seenIds.has(id)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!id || seenIds.has(id)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("duplicate_menu_id");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «seenIds.add(id)».
    seenIds.add(id);
    // راهنما: این دستور متغیر/ثابت «requestedTitle» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const requestedTitle = textValue(node.title, "", 64);
    // راهنما: این شرط بررسی می‌کند آیا «!requestedTitle» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!requestedTitle) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_menu_title");
    // راهنما: این دستور متغیر/ثابت «actionType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const actionType = String(node.actionType ?? "").trim().toUpperCase();
    // راهنما: این شرط بررسی می‌کند آیا «!actionTypes.has(actionType)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!actionTypes.has(actionType)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_type");
    // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const title = normalizeMenuTitle(actionType, requestedTitle);
    // راهنما: این دستور متغیر/ثابت «enabled» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const enabled = node.enabled !== false;
    // راهنما: این شرط بررسی می‌کند آیا «forPublish && enabled && !liveActionTypes.has(actionType)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (forPublish && enabled && !liveActionTypes.has(actionType)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`action_not_live:${actionType}`);
    // راهنما: این دستور متغیر/ثابت «parentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const parentId = node.parentId == null || node.parentId === "" ? null : textValue(node.parentId, "", 80);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ id, parentId, title, actionType, actionValue: normalizeActionValue(actio…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return {
      id,
      parentId,
      title,
      actionType,
      actionValue: normalizeActionValue(actionType, node.actionValue),
      sortOrder: integerValue(node.sortOrder, (index + 1) * 10, 0, 100000),
      enabled,
    };
  });
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «validateMenuGraph(menu, forPublish)».
  validateMenuGraph(menu, forPublish);
  // راهنما: این شرط بررسی می‌کند آیا «!menu.some((node) => node.enabled && node.parentId === null)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!menu.some((node) => node.enabled && node.parentId === null)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("no_root_menu");

  // راهنما: این دستور متغیر/ثابت «targetsInput» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const targetsInput = Array.isArray(raw.targets) ? raw.targets.slice(0, 20) : [];
  // راهنما: این دستور متغیر/ثابت «targetKeys» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const targetKeys = new Set<string>();
  // راهنما: این دستور متغیر/ثابت «targets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const targets = targetsInput.map((entry: unknown) => {
    // راهنما: این دستور متغیر/ثابت «target» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const target = objectValue(entry);
    // راهنما: این شرط بررسی می‌کند آیا «!target» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!target) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_target");
    // راهنما: این دستور متغیر/ثابت «provider» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const provider = String(target.provider ?? "").trim();
    // راهنما: این دستور متغیر/ثابت «botId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const botId = textValue(target.botId, "", 100);
    // راهنما: این شرط بررسی می‌کند آیا «!providers.has(provider) || !botId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!providers.has(provider) || !botId) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_target");
    // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const key = `${provider}:${botId}`;
    // راهنما: این شرط بررسی می‌کند آیا «targetKeys.has(key)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (targetKeys.has(key)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("duplicate_target");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «targetKeys.add(key)».
    targetKeys.add(key);
    // راهنما: این شرط بررسی می‌کند آیا «!ownedTargets.has(key)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!ownedTargets.has(key)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("foreign_target");
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ provider: provider as Provider, botId, enabled: target.enabled !== false…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return { provider: provider as Provider, botId, enabled: target.enabled !== false };
  });
  // راهنما: این شرط بررسی می‌کند آیا «forPublish && !targets.some((target) => target.enabled)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (forPublish && !targets.some((target) => target.enabled)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("no_publish_target");

  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(raw.settings) ?? {};
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ schemaVersion: 1, presetKey, name, welcomeMessage, menu, targets, settin…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    schemaVersion: 1,
    presetKey,
    name,
    welcomeMessage,
    menu,
    targets,
    settings: {
      columns: Number(settings.columns) === 1 ? 1 : 2,
      showPrices: settings.showPrices !== false,
      showInventory: settings.showInventory !== false,
    },
  };
}

// راهنما: این تابع «readState» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readState(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «[store, providerBots]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [store, providerBots] = await Promise.all([ownedStore(admin, workspaceId), listProviderBots(admin, workspaceId)]);
  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(store?.settings) ?? {};
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, store: store ? { id: store.id, name: store.name, currency: sto…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    store: store ? { id: store.id, name: store.name, currency: store.currency, status: store.status } : null,
    botCommerce: objectValue(settings.botCommerce) ?? null,
    providers: providerBots,
    capabilities: {
      runtimeActions: Array.from(liveActionTypes),
      foundationActions: Array.from(actionTypes).filter((action) => !liveActionTypes.has(action)),
    },
  };
}

// راهنما: این تابع «snapshotTarget» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function snapshotTarget(admin: any, workspaceId: string, target: RuntimeTarget, requireActive = true): Promise<LegacyTargetSnapshot> {
  // راهنما: این دستور متغیر/ثابت «config» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const config = providerConfig[target.provider];
  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,welcomeMessage,status")
    .eq("id", target.botId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «botError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botError || !bot) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("foreign_target");
  // راهنما: این شرط بررسی می‌کند آیا «requireActive && bot.status !== "ACTIVE"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (requireActive && bot.status !== "ACTIVE") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("inactive_target");
  // راهنما: این دستور متغیر/ثابت «{ data: buttons, error: buttonError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: buttons, error: buttonError } = await admin.from(config.buttonTable)
    .select("id,parentId,title,actionType,actionValue,sortOrder")
    .eq("botId", target.botId).order("sortOrder", { ascending: true });
  // راهنما: این شرط بررسی می‌کند آیا «buttonError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (buttonError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`snapshot_buttons:${buttonError.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ provider: target.provider, botId: target.botId, welcomeMessage: bot.welc…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    provider: target.provider,
    botId: target.botId,
    welcomeMessage: bot.welcomeMessage ?? null,
    buttons: (buttons ?? []).map((button: any) => ({
      id: String(button.id),
      parentId: button.parentId ? String(button.parentId) : null,
      title: String(button.title),
      actionType: String(button.actionType),
      actionValue: button.actionValue == null ? null : String(button.actionValue),
      sortOrder: Number(button.sortOrder ?? 0),
    })),
  };
}

// راهنما: این تابع «replaceButtons» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function replaceButtons(admin: any, provider: Provider, botId: string, rows: any[]) {
  // راهنما: این دستور متغیر/ثابت «table» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const table = providerConfig[provider].buttonTable;
  // راهنما: این دستور متغیر/ثابت «{ data: current, error: readError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: current, error: readError } = await admin.from(table).select("id").eq("botId", botId);
  // راهنما: این شرط بررسی می‌کند آیا «readError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (readError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`projection_read:${readError.message}`);
  // راهنما: این دستور متغیر/ثابت «nextIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const nextIds = new Set(rows.map((row) => String(row.id)));
  // راهنما: این دستور متغیر/ثابت «staleIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const staleIds = (current ?? []).map((row: any) => String(row.id)).filter((id: string) => !nextIds.has(id));
  // راهنما: این شرط بررسی می‌کند آیا «rows.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (rows.length) {
    // راهنما: این دستور متغیر/ثابت «{ error: upsertError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error: upsertError } = await admin.from(table).upsert(rows, { onConflict: "id" });
    // راهنما: این شرط بررسی می‌کند آیا «upsertError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (upsertError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`projection_upsert:${upsertError.message}`);
  }
  // راهنما: این شرط بررسی می‌کند آیا «staleIds.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (staleIds.length) {
    // راهنما: این دستور متغیر/ثابت «{ error: deleteError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error: deleteError } = await admin.from(table).delete().in("id", staleIds);
    // راهنما: این شرط بررسی می‌کند آیا «deleteError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (deleteError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`projection_delete:${deleteError.message}`);
  }
}

// راهنما: این تابع «projectTarget» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function projectTarget(admin: any, workspaceId: string, target: RuntimeTarget, template: any) {
  // راهنما: این دستور متغیر/ثابت «config» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const config = providerConfig[target.provider];
  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,status")
    .eq("id", target.botId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «botError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botError || !bot) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("foreign_target");
  // راهنما: این شرط بررسی می‌کند آیا «bot.status !== "ACTIVE"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (bot.status !== "ACTIVE") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("inactive_target");

  // راهنما: این دستور متغیر/ثابت «enabled» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const enabled = template.menu.filter((node: any) => node.enabled);
  // راهنما: این دستور متغیر/ثابت «projectionId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const projectionId = (nodeId: string) => `${target.botId}:${nodeId}`;
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows = enabled.map((node: any) => ({
    id: projectionId(node.id),
    botId: target.botId,
    parentId: node.parentId ? projectionId(node.parentId) : null,
    title: node.title,
    actionType: node.actionType,
    actionValue: node.actionType === "SUBMENU" ? projectionId(node.id) : node.actionValue,
    sortOrder: node.sortOrder,
  }));
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await replaceButtons(admin, target.provider, target.botId, rows)».
  await replaceButtons(admin, target.provider, target.botId, rows);
  // راهنما: این دستور متغیر/ثابت «{ error: welcomeError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: welcomeError } = await admin.from(config.table)
    .update({ welcomeMessage: template.welcomeMessage })
    .eq("id", target.botId).eq("workspaceId", workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «welcomeError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (welcomeError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`projection_welcome:${welcomeError.message}`);
}

// راهنما: این تابع «restoreTarget» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function restoreTarget(admin: any, workspaceId: string, snapshot: LegacyTargetSnapshot) {
  // راهنما: این دستور متغیر/ثابت «config» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const config = providerConfig[snapshot.provider];
  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id")
    .eq("id", snapshot.botId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «botError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botError || !bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows = snapshot.buttons.map((button) => ({ ...button, botId: snapshot.botId }));
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await replaceButtons(admin, snapshot.provider, snapshot.botId, rows)».
  await replaceButtons(admin, snapshot.provider, snapshot.botId, rows);
  // راهنما: این شرط بررسی می‌کند آیا «snapshot.welcomeMessage» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (snapshot.welcomeMessage) {
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from(config.table).update({ welcomeMessage: snapshot.welcomeMessage }).eq("id", snapshot.botId);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`restore_welcome:${error.message}`);
  }
}

// راهنما: این تابع «parseLegacySnapshots» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function parseLegacySnapshots(value: unknown) {
  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = objectValue(value) ?? {};
  // راهنما: این دستور متغیر/ثابت «snapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const snapshots: Record<string, LegacyTargetSnapshot> = {};
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const [key, entry] of Object.entries(raw)) {
    // راهنما: این دستور متغیر/ثابت «item» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const item = objectValue(entry);
    // راهنما: این شرط بررسی می‌کند آیا «!item || !providers.has(String(item.provider)) || typeof item.botId !== "string…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!item || !providers.has(String(item.provider)) || typeof item.botId !== "string" || !Array.isArray(item.buttons)) /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «snapshots[key] = item as LegacyTargetSnapshot».
    snapshots[key] = item as LegacyTargetSnapshot;
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «snapshots» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return snapshots;
}

// راهنما: این تابع «publishedTargets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function publishedTargets(engine: JsonObject): RuntimeTarget[] {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Array.isArray(engine.published?.targets) ? (engine.published.targets as Ru…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Array.isArray(engine.published?.targets)
    ? (engine.published.targets as RuntimeTarget[]).filter((target) => target?.enabled && providers.has(String(target.provider)) && typeof target.botId === "string")
    : [];
}

// راهنما: این تابع «uniqueTargets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function uniqueTargets(targets: RuntimeTarget[]) {
  // راهنما: این دستور متغیر/ثابت «map» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const map = new Map<string, RuntimeTarget>();
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const target of targets) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «map.set(`${target.provider}:${target.botId}`, target)». */ map.set(`${target.provider}:${target.botId}`, target);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Array.from(map.values())» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Array.from(map.values());
}

// راهنما: این تابع «snapshotRuntimeTargets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function snapshotRuntimeTargets(admin: any, workspaceId: string, targets: RuntimeTarget[]) {
  // راهنما: این دستور متغیر/ثابت «snapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const snapshots: LegacyTargetSnapshot[] = [];
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const target of uniqueTargets(targets)) {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «snapshots.push(await snapshotTarget(admin, workspaceId, target, false))».
      snapshots.push(await snapshotTarget(admin, workspaceId, target, false));
    } catch (error) {
      // راهنما: این شرط بررسی می‌کند آیا «!String(error).includes("foreign_target")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!String(error).includes("foreign_target")) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
    }
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «snapshots» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return snapshots;
}

// راهنما: این تابع «restoreRuntimeTargets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function restoreRuntimeTargets(admin: any, workspaceId: string, snapshots: LegacyTargetSnapshot[]) {
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const snapshot of snapshots) {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreTarget(admin, workspaceId, snapshot)». */ await restoreTarget(admin, workspaceId, snapshot); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bot commerce rollback restore", error)». */ console.error("bot commerce rollback restore", error); }
  }
}

// راهنما: این تابع «syncPublishedTargets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function syncPublishedTargets(admin: any, workspaceId: string, engine: JsonObject, template: any) {
  // راهنما: این دستور متغیر/ثابت «snapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const snapshots = parseLegacySnapshots(engine.legacyTargets);
  // راهنما: این دستور متغیر/ثابت «nextTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const nextTargets = (template.targets as RuntimeTarget[]).filter((target) => target.enabled);
  // راهنما: این دستور متغیر/ثابت «nextKeys» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const nextKeys = new Set(nextTargets.map((target) => `${target.provider}:${target.botId}`));
  // راهنما: این دستور متغیر/ثابت «previousTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const previousTargets = publishedTargets(engine);

  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const previous of previousTargets) {
    // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const key = `${previous.provider}:${previous.botId}`;
    // راهنما: این شرط بررسی می‌کند آیا «!nextKeys.has(key) && snapshots[key]» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!nextKeys.has(key) && snapshots[key]) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreTarget(admin, workspaceId, snapshots[key])». */ await restoreTarget(admin, workspaceId, snapshots[key]);
  }

  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const target of nextTargets) {
    // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const key = `${target.provider}:${target.botId}`;
    // راهنما: این شرط بررسی می‌کند آیا «!snapshots[key]» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!snapshots[key]) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «snapshots[key] = await snapshotTarget(admin, workspaceId, target)». */ snapshots[key] = await snapshotTarget(admin, workspaceId, target);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await projectTarget(admin, workspaceId, target, template)».
    await projectTarget(admin, workspaceId, target, template);
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «snapshots» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return snapshots;
}

// راهنما: این تابع «saveEngine» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function saveEngine(admin: any, workspaceId: string, rawTemplate: unknown, publish: boolean) {
  // راهنما: این دستور متغیر/ثابت «[store, providerBots]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [store, providerBots] = await Promise.all([ensureStore(admin, workspaceId), listProviderBots(admin, workspaceId)]);
  // راهنما: این دستور متغیر/ثابت «ownedTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const ownedTargets = buildOwnedTargetSet(providerBots);
  // راهنما: این دستور متغیر/ثابت «template» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const template = normalizeTemplate(rawTemplate, ownedTargets, publish);
  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(store.settings) ?? {};
  // راهنما: این دستور متغیر/ثابت «engine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const engine = objectValue(settings.botCommerce) ?? {};
  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این دستور متغیر/ثابت «version» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const version = integerValue(engine.version, 0, 0, 1_000_000);

  // راهنما: این دستور متغیر/ثابت «legacyTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let legacyTargets = engine.legacyTargets;
  // راهنما: این دستور متغیر/ثابت «rollbackSnapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let rollbackSnapshots: LegacyTargetSnapshot[] = [];
  // راهنما: این شرط بررسی می‌کند آیا «publish» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (publish) {
    // راهنما: این دستور متغیر/ثابت «nextTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const nextTargets = (template.targets as RuntimeTarget[]).filter((target) => target.enabled);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rollbackSnapshots = await snapshotRuntimeTargets(admin, workspaceId, [...publishedTargets…».
    rollbackSnapshots = await snapshotRuntimeTargets(admin, workspaceId, [...publishedTargets(engine), ...nextTargets]);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «legacyTargets = await syncPublishedTargets(admin, workspaceId, engine, template)».
      legacyTargets = await syncPublishedTargets(admin, workspaceId, engine, template);
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots)».
      await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
      // راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.
      throw error;
    }
  }

  // راهنما: این دستور متغیر/ثابت «nextEngine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const nextEngine = {
    ...engine,
    draft: template,
    draftSavedAt: now,
    ...(publish ? { published: template, publishedAt: now, version: version + 1, legacyTargets } : {}),
  };
  // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: nextEngine }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) {
    // راهنما: این شرط بررسی می‌کند آیا «publish» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (publish) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots)». */ await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    // راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.
    throw new Error(`save:${error.message}`);
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «readState(admin, workspaceId)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return readState(admin, workspaceId);
}

// راهنما: این تابع «importProvider» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function importProvider(admin: any, workspaceId: string, provider: Provider, botId: string) {
  // راهنما: این دستور متغیر/ثابت «config» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const config = providerConfig[provider];
  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,welcomeMessage,status")
    .eq("id", botId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «botError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botError || !bot) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("foreign_target");
  // راهنما: این دستور متغیر/ثابت «{ data: buttons, error: buttonError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: buttons, error: buttonError } = await admin.from(config.buttonTable)
    .select("id,parentId,title,actionType,actionValue,sortOrder")
    .eq("botId", botId).order("sortOrder", { ascending: true });
  // راهنما: این شرط بررسی می‌کند آیا «buttonError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (buttonError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`import_buttons:${buttonError.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «!(buttons ?? []).length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!(buttons ?? []).length) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("empty_provider_menu");

  // راهنما: این دستور متغیر/ثابت «template» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const template = {
    schemaVersion: 1,
    presetKey: "commerce",
    name: "فروشگاه پیام‌رسان",
    welcomeMessage: bot.welcomeMessage || "سلام! از منوی زیر یکی از گزینه‌ها را انتخاب کنید.",
    menu: (buttons ?? []).map((button: any) => ({ ...button, actionValue: button.actionType === "SUBMENU" ? null : button.actionValue, enabled: true })),
    targets: [{ provider, botId, enabled: true }],
    settings: { columns: 2, showPrices: true, showInventory: true },
  };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «saveEngine(admin, workspaceId, template, false)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return saveEngine(admin, workspaceId, template, false);
}

// راهنما: این تابع «unpublish» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function unpublish(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «store» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const store = await ownedStore(admin, workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «readState(admin, workspaceId)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return readState(admin, workspaceId);
  // راهنما: این دستور متغیر/ثابت «settings» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const settings = objectValue(store.settings) ?? {};
  // راهنما: این دستور متغیر/ثابت «engine» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const engine = objectValue(settings.botCommerce) ?? {};
  // راهنما: این دستور متغیر/ثابت «snapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const snapshots = parseLegacySnapshots(engine.legacyTargets);
  // راهنما: این دستور متغیر/ثابت «currentTargets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const currentTargets = publishedTargets(engine);
  // راهنما: این دستور متغیر/ثابت «rollbackSnapshots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rollbackSnapshots = await snapshotRuntimeTargets(admin, workspaceId, currentTargets);

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const target of currentTargets) {
      // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const key = `${target.provider}:${target.botId}`;
      // راهنما: این شرط بررسی می‌کند آیا «snapshots[key]» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (snapshots[key]) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreTarget(admin, workspaceId, snapshots[key])». */ await restoreTarget(admin, workspaceId, snapshots[key]);
    }
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots)».
    await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    // راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.
    throw error;
  }

  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این دستور متغیر/ثابت «next» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const next = { ...engine, published: null, publishedAt: null };
  // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: next }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots)».
    await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    // راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود.
    throw new Error(`unpublish:${error.message}`);
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «readState(admin, workspaceId)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return readState(admin, workspaceId);
}

// راهنما: این تابع «friendlyError» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function friendlyError(error: unknown) {
  // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const text = String(error);
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("action_not_live:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("action_not_live:")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`این قابلیت هنوز Runtime نهایی ندارد: ${text.split("action_not_live:")[1] …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `این قابلیت هنوز Runtime نهایی ندارد: ${text.split("action_not_live:")[1] ?? ""}. آن را غیرفعال کنید یا بعد از تکمیل Runtime منتشر کنید.`;
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("reserved_menu_title")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("reserved_menu_title")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"عنوان انتخاب‌شده متعلق به یک عملکرد آماده است. برای دکمه سفارشی نام دیگری…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "عنوان انتخاب‌شده متعلق به یک عملکرد آماده است. برای دکمه سفارشی نام دیگری انتخاب کنید.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("no_publish_target")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("no_publish_target")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"برای انتشار حداقل یک ربات متصل را انتخاب کنید."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "برای انتشار حداقل یک ربات متصل را انتخاب کنید.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("inactive_target")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("inactive_target")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"برای انتشار، ربات انتخاب‌شده باید ACTIVE و متصل باشد."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "برای انتشار، ربات انتخاب‌شده باید ACTIVE و متصل باشد.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("foreign_target")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("foreign_target")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"یکی از ربات‌های انتخاب‌شده متعلق به این Workspace نیست."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "یکی از ربات‌های انتخاب‌شده متعلق به این Workspace نیست.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("invalid_url")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("invalid_url")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"یکی از لینک‌های منو معتبر نیست."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "یکی از لینک‌های منو معتبر نیست.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("menu_cycle")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("menu_cycle")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"ساختار منو حلقه دارد و معتبر نیست."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "ساختار منو حلقه دارد و معتبر نیست.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("menu_depth")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("menu_depth")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"حداکثر عمق منو سه سطح است."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "حداکثر عمق منو سه سطح است.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("enabled_child_of_disabled_parent")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("enabled_child_of_disabled_parent")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"زیرگزینه فعال نمی‌تواند زیر یک گزینه غیرفعال منتشر شود."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "زیرگزینه فعال نمی‌تواند زیر یک گزینه غیرفعال منتشر شود.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("invalid_parent")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("invalid_parent")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"والد یکی از گزینه‌های منو معتبر نیست."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "والد یکی از گزینه‌های منو معتبر نیست.";
  // راهنما: این شرط بررسی می‌کند آیا «text.includes("empty_provider_menu")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.includes("empty_provider_menu")) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"منوی قابل انتقالی در این ربات وجود ندارد."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "منوی قابل انتقالی در این ربات وجود ندارد.";
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"تنظیمات Bot Commerce معتبر نیست یا ذخیره نشد."» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return "تنظیمات Bot Commerce معتبر نیست یا ذخیره نشد.";
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
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «workspaceId = await workspaceForUser(admin, userId)». */ workspaceId = await workspaceForUser(admin, userId); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace قابل دریافت نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace قابل دریافت نیست." }, 500); }
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readState(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await readState(admin, workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bot commerce read", error)». */ console.error("bot commerce read", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات فروشگاه رباتی دریافت نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات فروشگاه رباتی دریافت نشد." }, 500); }
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: JsonObject;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = typeof body.action === "string" ? body.action : "";

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این شرط بررسی می‌کند آیا «action === "save_draft"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "save_draft") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await saveEngine(admin, workspaceId, body.template, false))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await saveEngine(admin, workspaceId, body.template, false));
    // راهنما: این شرط بررسی می‌کند آیا «action === "publish"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "publish") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await saveEngine(admin, workspaceId, body.template, true))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await saveEngine(admin, workspaceId, body.template, true));
    // راهنما: این شرط بررسی می‌کند آیا «action === "unpublish"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "unpublish") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await unpublish(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await unpublish(admin, workspaceId));
    // راهنما: این شرط بررسی می‌کند آیا «action === "import_provider"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "import_provider") {
      // راهنما: این دستور متغیر/ثابت «provider» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const provider = typeof body.provider === "string" ? body.provider : "";
      // راهنما: این دستور متغیر/ثابت «botId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const botId = typeof body.botId === "string" ? body.botId : "";
      // راهنما: این شرط بررسی می‌کند آیا «!providers.has(provider) || !botId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!providers.has(provider) || !botId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات مبدا معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات مبدا معتبر نیست." }, 400);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await importProvider(admin, workspaceId, provider as Provider, botId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await importProvider(admin, workspaceId, provider as Provider, botId));
    }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bot commerce write", error)».
    console.error("bot commerce write", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: friendlyError(error) }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: friendlyError(error) }, 400);
  }
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
