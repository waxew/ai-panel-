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

// راهنما: این Type با نام «BaleUser» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleUser = { id: number; is_bot: boolean; first_name: string; last_name?: string; username?: string };
// راهنما: این Type با نام «BaleApiResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleApiResponse<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

// راهنما: این دستور متغیر/ثابت «corsHeaders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این تابع «parseBaleToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function parseBaleToken(token: string) {
  // راهنما: این دستور متغیر/ثابت «match» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «match ? { botId: match[1] } : null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return match ? { botId: match[1] } : null;
}

// راهنما: این تابع «baleCall» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function baleCall<T>(token: string, method: string, body?: Record<string, unknown>) {
  // راهنما: این دستور متغیر/ثابت «controller» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const controller = new AbortController();
  // راهنما: این دستور متغیر/ثابت «timeout» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const timeout = setTimeout(() => controller.abort(), 10000);
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch(`https://tapi.bale.ai/bot${token}/${method}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json", accept: "application/json" } : { accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(await response.json()) as BaleApiResponse<T>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return (await response.json()) as BaleApiResponse<T>;
  } finally {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «clearTimeout(timeout)».
    clearTimeout(timeout);
  }
}

// راهنما: این تابع «fromHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromHex(hex: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!/^[0-9a-f]{64}$/i.test(hex)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^[0-9a-f]{64}$/i.test(hex)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_encryption_key");
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(hex.length / 2);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < bytes.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)». */ bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}

// راهنما: این تابع «toBase64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function toBase64(bytes: Uint8Array) {
  // راهنما: این دستور متغیر/ثابت «binary» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let binary = "";
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const byte of bytes) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «binary += String.fromCharCode(byte)». */ binary += String.fromCharCode(byte);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «btoa(binary)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return btoa(binary);
}

// راهنما: این تابع «randomSecret» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function randomSecret() {
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  // راهنما: این دستور متغیر/ثابت «binary» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let binary = "";
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const byte of bytes) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «binary += String.fromCharCode(byte)». */ binary += String.fromCharCode(byte);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// راهنما: این تابع «toHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function toHex(bytes: Uint8Array) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// راهنما: این تابع «sha256» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sha256(value: string) {
  // راهنما: این دستور متغیر/ثابت «digest» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «toHex(new Uint8Array(digest))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return toHex(new Uint8Array(digest));
}

// راهنما: این تابع «encryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function encryptToken(token: string, keyHex: string) {
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["encrypt"]);
  // راهنما: این دستور متغیر/ثابت «iv» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // راهنما: این دستور متغیر/ثابت «encrypted» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token)));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`v1:${toBase64(iv)}:${toBase64(encrypted)}`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `v1:${toBase64(iv)}:${toBase64(encrypted)}`;
}

// راهنما: این تابع «getWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function getWorkspace(admin: any, userId: string, email: string) {
  // راهنما: این دستور متغیر/ثابت «{ error: userError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: userError } = await admin.from("User").upsert({ id: userId, email }, { onConflict: "id" });
  // راهنما: این شرط بررسی می‌کند آیا «userError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (userError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`user_upsert:${userError.message}`);

  // راهنما: این دستور متغیر/ثابت «{ data: memberships, error: membershipError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: memberships, error: membershipError } = await admin
    .from("WorkspaceMember")
    .select("workspaceId")
    .eq("userId", userId)
    .limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «membershipError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (membershipError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`membership_read:${membershipError.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «memberships?.[0]?.workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (memberships?.[0]?.workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «memberships[0].workspaceId as string» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return memberships[0].workspaceId as string;

  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceId = `${userId}:workspace`;
  // راهنما: این دستور متغیر/ثابت «memberId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const memberId = `${userId}:member`;
  // راهنما: این دستور متغیر/ثابت «{ error: workspaceError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: workspaceError } = await admin.from("Workspace").upsert({ id: workspaceId, name: "فضای کاری من" }, { onConflict: "id" });
  // راهنما: این شرط بررسی می‌کند آیا «workspaceError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (workspaceError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`workspace_create:${workspaceError.message}`);
  // راهنما: این دستور متغیر/ثابت «{ error: memberError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: memberError } = await admin.from("WorkspaceMember").upsert({ id: memberId, workspaceId, userId, role: "CUSTOMER" }, { onConflict: "id" });
  // راهنما: این شرط بررسی می‌کند آیا «memberError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (memberError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`membership_create:${memberError.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «workspaceId» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return workspaceId;
}

// راهنما: این تابع «ensureDefaultButtons» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureDefaultButtons(admin: any, botId: string) {
  // راهنما: این دستور متغیر/ثابت «{ count, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { count, error } = await admin.from("BaleButton").select("id", { count: "exact", head: true }).eq("botId", botId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`button_count:${error.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «(count ?? 0) > 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if ((count ?? 0) > 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows = [
    { title: "🛍 محصولات", actionType: "CATALOG", actionValue: "catalog", sortOrder: 10 },
    { title: "🛒 سبد خرید", actionType: "CART", actionValue: "cart", sortOrder: 20 },
    { title: "📦 سفارش‌های من", actionType: "ORDERS", actionValue: "orders", sortOrder: 30 },
    { title: "☎️ پشتیبانی", actionType: "SUPPORT", actionValue: "اطلاعات پشتیبانی هنوز تنظیم نشده است.", sortOrder: 40 },
  ].map((item) => ({ id: crypto.randomUUID(), botId, parentId: null, ...item }));

  // راهنما: این دستور متغیر/ثابت «{ error: insertError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: insertError } = await admin.from("BaleButton").insert(rows);
  // راهنما: این شرط بررسی می‌کند آیا «insertError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (insertError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`button_insert:${insertError.message}`);
}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, service: "bale-connect", auth: "user", version: 1 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: true, service: "bale-connect", auth: "user", version: 1 });
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId = ctx.userClaims?.id;
  // راهنما: این دستور متغیر/ثابت «email» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const email = ctx.userClaims?.email;
  // راهنما: این شرط بررسی می‌کند آیا «!userId || !email» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!userId || !email) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب کاربری معتبر نیست." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب کاربری معتبر نیست." }, 401);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: { token?: unknown };
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این شرط بررسی می‌کند آیا «typeof body.token !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof body.token !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "توکن واردشده معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "توکن واردشده معتبر نیست." }, 400);

  // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const token = body.token.trim();
  // راهنما: این شرط بررسی می‌کند آیا «!parseBaleToken(token)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!parseBaleToken(token)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فرمت توکن BotFather بله صحیح نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فرمت توکن BotFather بله صحیح نیست." }, 400);

  // راهنما: این دستور متغیر/ثابت «identity» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let identity: BaleApiResponse<BaleUser>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «identity = await baleCall<BaleUser>(token, "getMe")». */ identity = await baleCall<BaleUser>(token, "getMe"); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale getMe failed", error)». */ console.error("bale getMe failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ارتباط با بله برقرار نشد. دوباره تلاش کنید." }…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ارتباط با بله برقرار نشد. دوباره تلاش کنید." }, 502); }
  // راهنما: این شرط بررسی می‌کند آیا «!identity.ok || !identity.result?.is_bot || identity.result.id == null» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!identity.ok || !identity.result?.is_bot || identity.result.id == null) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بله این توکن را تأیید نکرد. توکن BotFather را …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "بله این توکن را تأیید نکرد. توکن BotFather را بررسی کنید." }, 401);
  }

  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin = ctx.supabaseAdmin;
  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let workspaceId: string;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «workspaceId = await getWorkspace(admin, userId, email)». */ workspaceId = await getWorkspace(admin, userId, email); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("workspace setup failed", error)». */ console.error("workspace setup failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500); }

  // راهنما: این دستور متغیر/ثابت «baleBotId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const baleBotId = String(identity.result.id);
  // راهنما: این دستور متغیر/ثابت «{ data: existingBots, error: existingError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: existingBots, error: existingError } = await admin.from("BaleBot").select("id,workspaceId").eq("baleBotId", baleBotId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «existingError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existingError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بررسی وضعیت بازوی بله انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بررسی وضعیت بازوی بله انجام نشد." }, 500);
  // راهنما: این دستور متغیر/ثابت «existingBot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const existingBot = existingBots?.[0];
  // راهنما: این شرط بررسی می‌کند آیا «existingBot && existingBot.workspaceId !== workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existingBot && existingBot.workspaceId !== workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "این بازو قبلاً به حساب مشتری دیگری متصل شده اس…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "این بازو قبلاً به حساب مشتری دیگری متصل شده است." }, 409);

  // راهنما: این دستور متغیر/ثابت «{ data: encryptionSecret, error: secretError…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: encryptionSecret, error: secretError } = await admin.from("AppSecret").select("value").eq("id", "bale_token_encryption").single();
  // راهنما: این شرط بررسی می‌کند آیا «secretError || !encryptionSecret?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (secretError || !encryptionSecret?.value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "کلید رمزنگاری بله در دسترس نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "کلید رمزنگاری بله در دسترس نیست." }, 500);

  // راهنما: این دستور متغیر/ثابت «tokenCiphertext» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let tokenCiphertext: string;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «tokenCiphertext = await encryptToken(token, encryptionSecret.value)». */ tokenCiphertext = await encryptToken(token, encryptionSecret.value); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "رمزنگاری توکن انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "رمزنگاری توکن انجام نشد." }, 500); }

  // راهنما: این دستور متغیر/ثابت «webhookSecret» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const webhookSecret = randomSecret();
  // راهنما: این دستور متغیر/ثابت «webhookSecretHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const webhookSecretHash = await sha256(webhookSecret);
  // راهنما: این دستور متغیر/ثابت «row» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const row = {
    workspaceId,
    baleBotId,
    username: identity.result.username ?? null,
    displayName: identity.result.first_name,
    tokenCiphertext,
    webhookSecretHash,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  };

  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: saveError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: saveError } = await admin.from("BaleBot")
    .upsert(row, { onConflict: "baleBotId" })
    .select("id,baleBotId,username,displayName,description,status,welcomeMessage")
    .single();
  // راهنما: این شرط بررسی می‌کند آیا «saveError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (saveError || !bot) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale bot save failed", saveError)».
    console.error("bale bot save failed", saveError);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره بازوی بله در دیتابیس انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "ذخیره بازوی بله در دیتابیس انجام نشد." }, 500);
  }

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ensureDefaultButtons(admin, bot.id)». */ await ensureDefaultButtons(admin, bot.id); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale default buttons failed", error)». */ console.error("bale default buttons failed", error); }

  // راهنما: این دستور متغیر/ثابت «webhookUrl» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const webhookUrl = `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/bale-webhook/${encodeURIComponent(baleBotId)}/${webhookSecret}`;
  // راهنما: این دستور متغیر/ثابت «webhookResult» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let webhookResult: BaleApiResponse<boolean>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «webhookResult = await baleCall<boolean>(token, "setWebhook", { url: webhookUrl })». */ webhookResult = await baleCall<boolean>(token, "setWebhook", { url: webhookUrl }); }
  catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale setWebhook failed", error)».
    console.error("bale setWebhook failed", error);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("BaleBot").update({ webhookSecretHash: null }).eq("id", bot.id)».
    await admin.from("BaleBot").update({ webhookSecretHash: null }).eq("id", bot.id);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بازو ذخیره شد اما Webhook بله فعال نشد. دوباره…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "بازو ذخیره شد اما Webhook بله فعال نشد. دوباره اتصال را انجام دهید." }, 502);
  }

  // راهنما: این شرط بررسی می‌کند آیا «!webhookResult.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!webhookResult.ok) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale setWebhook rejected", webhookResult)».
    console.error("bale setWebhook rejected", webhookResult);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("BaleBot").update({ webhookSecretHash: null }).eq("id", bot.id)».
    await admin.from("BaleBot").update({ webhookSecretHash: null }).eq("id", bot.id);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: webhookResult.description ?? "بله تنظیم Webhook…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: webhookResult.description ?? "بله تنظیم Webhook را نپذیرفت. توکن را بررسی کنید." }, 502);
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, status: "connected", persisted: true, webhookConfigured: …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({
    ok: true,
    status: "connected",
    persisted: true,
    webhookConfigured: true,
    bot: {
      id: bot.id,
      baleBotId: bot.baleBotId,
      username: bot.username ?? undefined,
      displayName: bot.displayName ?? undefined,
      description: bot.description ?? undefined,
      status: bot.status,
    },
  });
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
