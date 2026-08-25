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
// راهنما: این دستور متغیر/ثابت «APP_URL» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const APP_URL = (Deno.env.get("APP_URL") ?? "https://ai-panel-demo.bustling-larch.workers.dev").replace(/\/$/, "");
// راهنما: این دستور متغیر/ثابت «CALLBACK_URL» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const CALLBACK_URL = Deno.env.get("INSTAGRAM_OAUTH_REDIRECT_URI") ?? `${SUPABASE_URL}/functions/v1/instagram-connect/callback`;
// راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
// راهنما: این دستور متغیر/ثابت «enc» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const enc = new TextEncoder();

// راهنما: این دستور متغیر/ثابت «corsHeaders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const corsHeaders = {
  "Access-Control-Allow-Origin": APP_URL,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: { ...corsHeaders, "Cache-Control": …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json(data, { status, headers: { ...corsHeaders, "Cache-Control": "no-store" } }); }
// راهنما: این تابع «hex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function hex(bytes: Uint8Array) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
// راهنما: این تابع «sha256» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sha256(value: string) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)))); }
// راهنما: این تابع «toB64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function toB64(bytes: Uint8Array) { /* راهنما: این دستور متغیر/ثابت «s» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ let s = ""; /* راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند. */ for (const b of bytes) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «s += String.fromCharCode(b)». */ s += String.fromCharCode(b); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «btoa(s)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return btoa(s); }
// راهنما: این تابع «appSecret» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function appSecret(id: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error || !data?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error || !data?.value) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`missing_secret:${id}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.value as string» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data.value as string;
}
// راهنما: این تابع «metaCredentials» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function metaCredentials() {
  // راهنما: این دستور متغیر/ثابت «[appId, appSecretValue]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [appId, appSecretValue] = await Promise.all([appSecret("meta_app_id"), appSecret("meta_app_secret")]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ appId, appSecret: appSecretValue }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { appId, appSecret: appSecretValue };
}
// راهنما: این تابع «encryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function encryptToken(token: string) {
  // راهنما: این دستور متغیر/ثابت «keyHex» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyHex = await appSecret("instagram_token_encryption");
  // راهنما: این دستور متغیر/ثابت «keyBytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyBytes = Uint8Array.from(keyHex.match(/.{1,2}/g)!.map((x) => parseInt(x, 16)));
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  // راهنما: این دستور متغیر/ثابت «iv» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // راهنما: این دستور متغیر/ثابت «encrypted» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(token)));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${toB64(iv)}.${toB64(encrypted)}`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${toB64(iv)}.${toB64(encrypted)}`;
}
// راهنما: این تابع «redirectResult» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function redirectResult(kind: "connected" | "error", detail?: string) {
  // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const url = new URL(`${APP_URL}/app/instagram`);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("instagram", kind)».
  url.searchParams.set("instagram", kind);
  // راهنما: این شرط بررسی می‌کند آیا «detail» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (detail) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("detail", detail.slice(0, 100))». */ url.searchParams.set("detail", detail.slice(0, 100));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.redirect(url.toString(), 302)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.redirect(url.toString(), 302);
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
// راهنما: این تابع «exchangeToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function exchangeToken(code: string, appId: string, appSecretValue: string) {
  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const body = new URLSearchParams({ client_id: appId, client_secret: appSecretValue, grant_type: "authorization_code", redirect_uri: CALLBACK_URL, code });
  // راهنما: این متغیر «shortResponse» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const shortResponse = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  // راهنما: این دستور متغیر/ثابت «short» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const short = await shortResponse.json();
  // راهنما: این شرط بررسی می‌کند آیا «!shortResponse.ok || !short.access_token» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!shortResponse.ok || !short.access_token) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`short_token:${short.error_message ?? short.error?.message ?? shortResponse.status}`);

  // راهنما: این دستور متغیر/ثابت «longUrl» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const longUrl = new URL("https://graph.instagram.com/access_token");
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «longUrl.searchParams.set("grant_type", "ig_exchange_token")».
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «longUrl.searchParams.set("client_secret", appSecretValue)».
  longUrl.searchParams.set("client_secret", appSecretValue);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «longUrl.searchParams.set("access_token", short.access_token)».
  longUrl.searchParams.set("access_token", short.access_token);
  // راهنما: این متغیر «longResponse» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const longResponse = await fetch(longUrl);
  // راهنما: این دستور متغیر/ثابت «long» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const long = await longResponse.json();
  // راهنما: این شرط بررسی می‌کند آیا «!longResponse.ok || !long.access_token» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!longResponse.ok || !long.access_token) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ accessToken: short.access_token as string, expiresIn: Number(short.expir…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { accessToken: short.access_token as string, expiresIn: Number(short.expires_in ?? 3600) };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ accessToken: long.access_token as string, expiresIn: Number(long.expires…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { accessToken: long.access_token as string, expiresIn: Number(long.expires_in ?? 5184000) };
}
// راهنما: این تابع «fetchProfile» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function fetchProfile(token: string) {
  // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const url = new URL(`https://graph.instagram.com/${META_API_VERSION}/me`);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("fields", "id,username,account_type")».
  url.searchParams.set("fields", "id,username,account_type");
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("access_token", token)».
  url.searchParams.set("access_token", token);
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(url);
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = await response.json();
  // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !data.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!response.ok || !data.id) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`profile:${data.error?.message ?? response.status}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data as { id: string; username?: string; account_type?: string }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data as { id: string; username?: string; account_type?: string };
}
// راهنما: این تابع «subscribeWebhooks» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function subscribeWebhooks(igUserId: string, token: string) {
  // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const url = new URL(`https://graph.instagram.com/${META_API_VERSION}/${igUserId}/subscribed_apps`);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("subscribed_fields", "comments,messages")».
  url.searchParams.set("subscribed_fields", "comments,messages");
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «url.searchParams.set("access_token", token)».
  url.searchParams.set("access_token", token);
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(url, { method: "POST" });
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = await response.json().catch(() => ({}));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: response.ok && data?.success !== false, status: response.status, dat…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { ok: response.ok && data?.success !== false, status: response.status, data };
}

// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Deno.serve(async (request) => { if (request.method === "OPTIONS") return new Response("ok…».
Deno.serve(async (request) => {
  // راهنما: این شرط بررسی می‌کند آیا «request.method === "OPTIONS"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "OPTIONS") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok", { headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok", { headers: corsHeaders });
  // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const url = new URL(request.url);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "POST" && (url.pathname.endsWith("/instagram-connect") || ur…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "POST" && (url.pathname.endsWith("/instagram-connect") || url.pathname.endsWith("/instagram-connect/"))) {
    // راهنما: این دستور متغیر/ثابت «credentials» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let credentials: { appId: string; appSecret: string };
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «credentials = await metaCredentials()». */ credentials = await metaCredentials(); }
    catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "META_NOT_CONFIGURED", message: "ابتدا Meta App ID…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, code: "META_NOT_CONFIGURED", message: "ابتدا Meta App ID و App Secret را در پنل اینستاگرام ذخیره کنید." }, 503); }

    // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const user = await userFromRequest(request);
    // راهنما: این شرط بررسی می‌کند آیا «!user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
    // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const workspaceId = await workspaceForUser(user.id);
    // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

    // راهنما: این دستور متغیر/ثابت «state» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const state = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    // راهنما: این دستور متغیر/ثابت «stateHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const stateHash = await sha256(state);
    // راهنما: این دستور متغیر/ثابت «expiresAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("InstagramOAuthState").insert({ workspaceId, userId: user.id, stateHash, redirectUri: CALLBACK_URL, expiresAt });
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ساخت OAuth state انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ساخت OAuth state انجام نشد." }, 500);

    // راهنما: این دستور متغیر/ثابت «authUrl» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const authUrl = new URL("https://www.instagram.com/oauth/authorize");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("enable_fb_login", "0")».
    authUrl.searchParams.set("enable_fb_login", "0");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("force_authentication", "1")».
    authUrl.searchParams.set("force_authentication", "1");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("client_id", credentials.appId)».
    authUrl.searchParams.set("client_id", credentials.appId);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("redirect_uri", CALLBACK_URL)».
    authUrl.searchParams.set("redirect_uri", CALLBACK_URL);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("response_type", "code")».
    authUrl.searchParams.set("response_type", "code");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_mes…».
    authUrl.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish");
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «authUrl.searchParams.set("state", state)».
    authUrl.searchParams.set("state", state);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, authorizationUrl: authUrl.toString(), callbackUrl: CALLBA…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true, authorizationUrl: authUrl.toString(), callbackUrl: CALLBACK_URL });
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET" && url.pathname.endsWith("/instagram-connect/callback")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET" && url.pathname.endsWith("/instagram-connect/callback")) {
    // راهنما: این دستور متغیر/ثابت «credentials» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let credentials: { appId: string; appSecret: string };
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «credentials = await metaCredentials()». */ credentials = await metaCredentials(); }
    catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", "meta_not_configured")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return redirectResult("error", "meta_not_configured"); }

    // راهنما: این دستور متغیر/ثابت «code» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const code = url.searchParams.get("code") ?? "";
    // راهنما: این دستور متغیر/ثابت «state» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const state = url.searchParams.get("state") ?? "";
    // راهنما: این دستور متغیر/ثابت «providerError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const providerError = url.searchParams.get("error") ?? url.searchParams.get("error_reason") ?? "";
    // راهنما: این شرط بررسی می‌کند آیا «providerError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (providerError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", providerError)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return redirectResult("error", providerError);
    // راهنما: این شرط بررسی می‌کند آیا «!code || !state» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!code || !state) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", "missing_code_or_state")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return redirectResult("error", "missing_code_or_state");

    // راهنما: این دستور متغیر/ثابت «stateHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const stateHash = await sha256(state);
    // راهنما: این دستور متغیر/ثابت «{ data: oauthState, error: stateError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: oauthState, error: stateError } = await admin.from("InstagramOAuthState")
      .select("id,workspaceId,userId,redirectUri,expiresAt,consumedAt")
      .eq("stateHash", stateHash).maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «stateError || !oauthState || oauthState.consumedAt || new Date(oauthState.expir…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (stateError || !oauthState || oauthState.consumedAt || new Date(oauthState.expiresAt).getTime() < Date.now() || oauthState.redirectUri !== CALLBACK_URL) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", "invalid_state")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return redirectResult("error", "invalid_state");

    // راهنما: این دستور متغیر/ثابت «consumedAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const consumedAt = new Date().toISOString();
    // راهنما: این دستور متغیر/ثابت «{ data: claimed }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: claimed } = await admin.from("InstagramOAuthState").update({ consumedAt }).eq("id", oauthState.id).is("consumedAt", null).select("id").maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «!claimed» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!claimed) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", "state_already_used")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return redirectResult("error", "state_already_used");

    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «exchanged» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const exchanged = await exchangeToken(code, credentials.appId, credentials.appSecret);
      // راهنما: این دستور متغیر/ثابت «profile» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const profile = await fetchProfile(exchanged.accessToken);
      // راهنما: این دستور متغیر/ثابت «ciphertext» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ciphertext = await encryptToken(exchanged.accessToken);
      // راهنما: این دستور متغیر/ثابت «subscription» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const subscription = await subscribeWebhooks(profile.id, exchanged.accessToken);
      // راهنما: این دستور متغیر/ثابت «expiresAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const expiresAt = new Date(Date.now() + exchanged.expiresIn * 1000).toISOString();
      // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const now = new Date().toISOString();

      // راهنما: این دستور متغیر/ثابت «{ error: upsertError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error: upsertError } = await admin.from("InstagramAccount").upsert({
        workspaceId: oauthState.workspaceId,
        username: profile.username ?? `instagram-${profile.id}`,
        displayName: profile.username ?? null,
        metaAccountId: profile.id,
        accessTokenCiphertext: ciphertext,
        permissions: ["instagram_business_basic", "instagram_business_manage_messages", "instagram_business_manage_comments", "instagram_business_content_publish"],
        webhookSubscribed: subscription.ok,
        status: subscription.ok ? "ACTIVE" : "PENDING",
        tokenExpiresAt: expiresAt,
        tokenRefreshedAt: now,
        lastSyncedAt: now,
        connectionMeta: { accountType: profile.account_type ?? null, webhookStatus: subscription.status, connectedAt: now },
        updatedAt: now,
      }, { onConflict: "metaAccountId" });
      // راهنما: این شرط بررسی می‌کند آیا «upsertError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (upsertError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`account:${upsertError.message}`);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("connected")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return redirectResult("connected");
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("instagram oauth callback failed", error)».
      console.error("instagram oauth callback failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «redirectResult("error", "connection_failed")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return redirectResult("error", "connection_failed");
    }
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Not found" }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ ok: false, message: "Not found" }, 404);
});
