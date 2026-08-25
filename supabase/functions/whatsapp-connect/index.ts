/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور فایل/ماژول را از ماژول «jsr:@supabase/functions-js/edge-runtime.d.ts» وارد می‌کند تا در این فایل قابل استفاده باشد.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// راهنما: این دستور { createClient } را از ماژول «npm:@supabase/supabase-js@2.57.4» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// راهنما: این دستور متغیر/ثابت «SUPABASE_URL» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// راهنما: این دستور متغیر/ثابت «SERVICE_ROLE» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// راهنما: این دستور متغیر/ثابت «META_API_VERSION» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
// راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
// راهنما: این دستور متغیر/ثابت «enc» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const enc = new TextEncoder();

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: { "Cache-Control": "no-store" } })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
// راهنما: این تابع «toB64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function toB64(bytes: Uint8Array) {
  // راهنما: این دستور متغیر/ثابت «s» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let s = "";
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const b of bytes) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «s += String.fromCharCode(b)». */ s += String.fromCharCode(b);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «btoa(s)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return btoa(s);
}
// راهنما: این تابع «appSecret» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function appSecret(id: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error || !data?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error || !data?.value) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`missing_secret:${id}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.value as string» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data.value as string;
}
// راهنما: این تابع «hasAppSecret» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function hasAppSecret(id: string) {
  // راهنما: این دستور متغیر/ثابت «{ data }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data } = await admin.from("AppSecret").select("id").eq("id", id).maybeSingle();
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Boolean(data?.id)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Boolean(data?.id);
}
// راهنما: این تابع «encryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function encryptToken(token: string) {
  // راهنما: این دستور متغیر/ثابت «keyHex» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyHex = await appSecret("whatsapp_token_encryption");
  // راهنما: این دستور متغیر/ثابت «parts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const parts = keyHex.match(/.{1,2}/g);
  // راهنما: این شرط بررسی می‌کند آیا «!parts || parts.length !== 32» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!parts || parts.length !== 32) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_whatsapp_encryption_key");
  // راهنما: این دستور متغیر/ثابت «keyBytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyBytes = Uint8Array.from(parts.map((x) => parseInt(x, 16)));
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  // راهنما: این دستور متغیر/ثابت «iv» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // راهنما: این دستور متغیر/ثابت «encrypted» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(token)));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${toB64(iv)}.${toB64(encrypted)}`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${toB64(iv)}.${toB64(encrypted)}`;
}
// راهنما: این تابع «userFromRequest» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function userFromRequest(request: Request) {
  // راهنما: این دستور متغیر/ثابت «auth» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const auth = request.headers.get("authorization") ?? "";
  // راهنما: این دستور متغیر/ثابت «jwt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  // راهنما: این شرط بررسی می‌کند آیا «!jwt» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!jwt) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.auth.getUser(jwt);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «error ? null : data.user» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return error ? null : data.user;
}
// راهنما: این تابع «workspaceForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function workspaceForUser(userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}
// راهنما: این تابع «graph» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function graph(path: string, accessToken: string, init: RequestInit = {}) {
  // راهنما: این دستور متغیر/ثابت «headers» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const headers = new Headers(init.headers);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «headers.set("Authorization", `Bearer ${accessToken}`)».
  headers.set("Authorization", `Bearer ${accessToken}`);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «headers.set("Accept", "application/json")».
  headers.set("Accept", "application/json");
  // راهنما: این شرط بررسی می‌کند آیا «init.body» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (init.body) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «headers.set("Content-Type", "application/json")». */ headers.set("Content-Type", "application/json");
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${path}`, { ...init, headers });
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = await response.json().catch(() => ({}));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ response, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { response, data };
}

// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Deno.serve(async (request) => { if (request.method !== "POST") return json({ ok: false, m…».
Deno.serve(async (request) => {
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);
  // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const user = await userFromRequest(request);
  // راهنما: این شرط بررسی می‌کند آیا «!user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceId = await workspaceForUser(user.id);
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: { wabaId?: unknown; phoneNumberId?: unknown; accessToken?: unknown };
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }

  // راهنما: این دستور متغیر/ثابت «wabaId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const wabaId = typeof body.wabaId === "string" ? body.wabaId.trim() : "";
  // راهنما: این دستور متغیر/ثابت «phoneNumberId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const phoneNumberId = typeof body.phoneNumberId === "string" ? body.phoneNumberId.trim() : "";
  // راهنما: این دستور متغیر/ثابت «accessToken» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  // راهنما: این شرط بررسی می‌کند آیا «!/^\d{5,}$/.test(wabaId) || !/^\d{5,}$/.test(phoneNumberId) || accessToken.leng…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^\d{5,}$/.test(wabaId) || !/^\d{5,}$/.test(phoneNumberId) || accessToken.length < 20) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "INVALID_INPUT", message: "WABA ID، Phone Number I…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, code: "INVALID_INPUT", message: "WABA ID، Phone Number ID و Access Token معتبر وارد کنید." }, 400);
  }

  // راهنما: این دستور متغیر/ثابت «phones» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const phones = await graph(`${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,name_status&limit=100`, accessToken);
  // راهنما: این شرط بررسی می‌کند آیا «!phones.response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!phones.response.ok) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "META_AUTH_FAILED", message: phones.data?.error?.m…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, code: "META_AUTH_FAILED", message: phones.data?.error?.message ?? "اعتبارسنجی حساب واتساپ در Meta انجام نشد." }, phones.response.status === 401 ? 401 : 400);
  }
  // راهنما: این دستور متغیر/ثابت «phone» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const phone = Array.isArray(phones.data?.data) ? phones.data.data.find((item: any) => String(item?.id ?? "") === phoneNumberId) : null;
  // راهنما: این شرط بررسی می‌کند آیا «!phone» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!phone) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "PHONE_NOT_IN_WABA", message: "Phone Number ID وار…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, code: "PHONE_NOT_IN_WABA", message: "Phone Number ID واردشده متعلق به این WABA نیست." }, 400);

  // راهنما: این دستور متغیر/ثابت «ciphertext» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const ciphertext = await encryptToken(accessToken);
  // راهنما: این دستور متغیر/ثابت «webhookReady» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const webhookReady = await hasAppSecret("meta_app_secret");
  // راهنما: این دستور متغیر/ثابت «webhookSubscribed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let webhookSubscribed = false;
  // راهنما: این دستور متغیر/ثابت «webhookStatus» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let webhookStatus: number | null = null;
  // راهنما: این دستور متغیر/ثابت «webhookError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let webhookError: string | null = null;

  // راهنما: این شرط بررسی می‌کند آیا «webhookReady» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (webhookReady) {
    // راهنما: این دستور متغیر/ثابت «verifyToken» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const verifyToken = await appSecret("whatsapp_webhook_verify_token");
    // راهنما: این دستور متغیر/ثابت «callbackUrl» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const callbackUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
    // راهنما: این دستور متغیر/ثابت «subscription» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const subscription = await graph(`${encodeURIComponent(wabaId)}/subscribed_apps`, accessToken, {
      method: "POST",
      body: JSON.stringify({ override_callback_uri: callbackUrl, verify_token: verifyToken }),
    });
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «webhookStatus = subscription.response.status».
    webhookStatus = subscription.response.status;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «webhookSubscribed = subscription.response.ok && subscription.data?.success !== false && s…».
    webhookSubscribed = subscription.response.ok && subscription.data?.success !== false && subscription.data?.error == null;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «webhookError = webhookSubscribed ? null : String(subscription.data?.error?.message ?? "We…».
    webhookError = webhookSubscribed ? null : String(subscription.data?.error?.message ?? "Webhook subscription failed");
  }

  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این دستور متغیر/ثابت «{ data: account, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: account, error } = await admin.from("WhatsAppAccount").upsert({
    workspaceId,
    wabaId,
    phoneNumberId,
    displayPhoneNumber: phone.display_phone_number ?? null,
    verifiedName: phone.verified_name ?? null,
    accessTokenCiphertext: ciphertext,
    tokenType: "SYSTEM_USER",
    status: webhookSubscribed ? "ACTIVE" : "PENDING",
    webhookSubscribed,
    qualityRating: phone.quality_rating ?? null,
    lastSyncedAt: now,
    connectionMeta: {
      nameStatus: phone.name_status ?? null,
      webhookReady,
      webhookStatus,
      webhookError,
      connectedAt: now,
    },
    updatedAt: now,
  }, { onConflict: "phoneNumberId" }).select("id,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt").single();
  // راهنما: این شرط بررسی می‌کند آیا «error || !account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error || !account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره اتصال واتساپ انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ذخیره اتصال واتساپ انجام نشد." }, 500);

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, account, webhookReady, webhookSubscribed, code: webhookRe…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({
    ok: true,
    account,
    webhookReady,
    webhookSubscribed,
    code: webhookReady ? (webhookSubscribed ? "CONNECTED" : "WEBHOOK_SUBSCRIBE_FAILED") : "META_APP_SECRET_REQUIRED",
    message: webhookSubscribed
      ? "شماره واتساپ متصل شد و Webhook فعال است."
      : webhookReady
        ? "شماره واتساپ ذخیره شد، اما اشتراک Webhook در Meta کامل نشد."
        : "شماره واتساپ اعتبارسنجی و ذخیره شد. برای فعال شدن Webhook باید Meta App Secret در پنل پلتفرم تنظیم شود.",
  }, 200);
});
