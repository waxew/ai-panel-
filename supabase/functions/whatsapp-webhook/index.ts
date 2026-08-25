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

// راهنما: این تابع «hex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function hex(bytes: Uint8Array) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
// راهنما: این تابع «fromB64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromB64(value: string) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Uint8Array.from(atob(value), (c) => c.charCodeAt(0))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)); }
// راهنما: این تابع «timingSafeEqual» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function timingSafeEqual(a: string, b: string) {
  // راهنما: این شرط بررسی می‌کند آیا «a.length !== b.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (a.length !== b.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
  // راهنما: این دستور متغیر/ثابت «out» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let out = 0;
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < a.length; i++) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «out |= a.charCodeAt(i) ^ b.charCodeAt(i)». */ out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «out === 0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return out === 0;
}
// راهنما: این تابع «hmacHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function hmacHex(secret: string, body: string) {
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))));
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
// راهنما: این تابع «decryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function decryptToken(ciphertext: string) {
  // راهنما: این دستور متغیر/ثابت «keyHex» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyHex = await appSecret("whatsapp_token_encryption");
  // راهنما: این دستور متغیر/ثابت «parts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const parts = keyHex.match(/.{1,2}/g);
  // راهنما: این شرط بررسی می‌کند آیا «!parts || parts.length !== 32» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!parts || parts.length !== 32) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_whatsapp_encryption_key");
  // راهنما: این دستور متغیر/ثابت «keyBytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyBytes = Uint8Array.from(parts.map((x) => parseInt(x, 16)));
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  // راهنما: این دستور متغیر/ثابت «[iv64, data64]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [iv64, data64] = ciphertext.split(".");
  // راهنما: این شرط بررسی می‌کند آیا «!iv64 || !data64» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!iv64 || !data64) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_ciphertext");
  // راهنما: این دستور متغیر/ثابت «plain» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv64) }, key, fromB64(data64));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new TextDecoder().decode(plain)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return new TextDecoder().decode(plain);
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
// راهنما: این تابع «normalize» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalize(value: unknown) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""; }
// راهنما: این تابع «matches» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function matches(text: string, keywords: unknown) {
  // راهنما: این دستور متغیر/ثابت «list» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const list = Array.isArray(keywords) ? keywords.map(normalize).filter(Boolean) : [];
  // راهنما: این دستور متغیر/ثابت «haystack» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const haystack = normalize(text);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «list.some((word) => haystack.includes(word))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return list.some((word) => haystack.includes(word));
}
// راهنما: این تابع «timestamp» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function timestamp(value: unknown) {
  // راهنما: این دستور متغیر/ثابت «seconds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const seconds = Number(value ?? 0);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new D…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date();
}
// راهنما: این تابع «messageBody» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function messageBody(message: any) {
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "text"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "text") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.text?.body ?? "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.text?.body ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "button"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "button") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.button?.text ?? message?.button?.payload ?? "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.button?.text ?? message?.button?.payload ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "interactive"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "interactive") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.interactive?.button_reply?.title ?? message?.interactive?.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.interactive?.button_reply?.title ?? message?.interactive?.button_reply?.id ?? message?.interactive?.list_reply?.title ?? message?.interactive?.list_reply?.id ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "image"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "image") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.image?.caption ?? "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.image?.caption ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "document"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "document") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.document?.caption ?? message?.document?.filename ?? "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.document?.caption ?? message?.document?.filename ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "video"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "video") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «String(message?.video?.caption ?? "")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return String(message?.video?.caption ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "location"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "location") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${message?.location?.latitude ?? ""},${message?.location?.longitude ?? ""…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${message?.location?.latitude ?? ""},${message?.location?.longitude ?? ""}`;
  // راهنما: این شرط بررسی می‌کند آیا «message?.type === "order"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (message?.type === "order") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «"order"» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "order";
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «""» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return "";
}
// راهنما: این تابع «accountForPhoneNumberId» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function accountForPhoneNumberId(phoneNumberId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WhatsAppAccount")
    .select("id,workspaceId,wabaId,phoneNumberId,accessTokenCiphertext,status,webhookSubscribed")
    .eq("phoneNumberId", phoneNumberId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data as any» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data as any;
}
// راهنما: این تابع «sendAutoReply» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sendAutoReply(account: any, conversation: any, text: string, rule: any) {
  // راهنما: این شرط بررسی می‌کند آیا «!text.trim()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!text.trim()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «windowEnd» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const windowEnd = conversation.customerServiceWindowExpiresAt ? new Date(conversation.customerServiceWindowExpiresAt).getTime() : 0;
  // راهنما: این شرط بررسی می‌کند آیا «windowEnd <= Date.now()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (windowEnd <= Date.now()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const token = await decryptToken(account.accessTokenCiphertext);
  // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: conversation.waUserId, type: "text", text: { preview_url: false, body: text } }),
  });
  // راهنما: این شرط بررسی می‌کند آیا «!result.response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!result.response.ok) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("whatsapp auto reply failed", result.data)».
    console.error("whatsapp auto reply failed", result.data);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return;
  }
  // راهنما: این دستور متغیر/ثابت «providerMessageId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppMessage").insert({ workspaceId: account.workspaceId, whatsappAc…».
  await admin.from("WhatsAppMessage").insert({
    workspaceId: account.workspaceId,
    whatsappAccountId: account.id,
    conversationId: conversation.id,
    providerMessageId,
    direction: "OUTBOUND",
    messageType: "text",
    body: text,
    status: "SENT",
    isTemplate: false,
    providerTimestamp: new Date().toISOString(),
    metadata: { source: "automation", ruleId: rule.id },
  });
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppAutomationRule").update({ executions: Number(rule.executions ??…».
  await admin.from("WhatsAppAutomationRule").update({
    executions: Number(rule.executions ?? 0) + 1,
    lastTriggeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).eq("id", rule.id);
}
// راهنما: این تابع «processIncoming» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function processIncoming(account: any, value: any, message: any) {
  // راهنما: این دستور متغیر/ثابت «providerMessageId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const providerMessageId = String(message?.id ?? "");
  // راهنما: این دستور متغیر/ثابت «waUserId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const waUserId = String(message?.from ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «!providerMessageId || !waUserId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!providerMessageId || !waUserId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «{ data: duplicate }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: duplicate } = await admin.from("WhatsAppMessage").select("id").eq("providerMessageId", providerMessageId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «duplicate» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (duplicate) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این دستور متغیر/ثابت «sentAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const sentAt = timestamp(message?.timestamp);
  // راهنما: این دستور متغیر/ثابت «sentAtIso» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const sentAtIso = sentAt.toISOString();
  // راهنما: این دستور متغیر/ثابت «windowExpiresAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const windowExpiresAt = new Date(sentAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
  // راهنما: این دستور متغیر/ثابت «contact» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const contact = Array.isArray(value?.contacts) ? value.contacts.find((x: any) => String(x?.wa_id ?? "") === waUserId) : null;
  // راهنما: این دستور متغیر/ثابت «customerName» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const customerName = contact?.profile?.name ? String(contact.profile.name) : null;

  // راهنما: این دستور متغیر/ثابت «{ data: conversation, error: conversationErr…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let { data: conversation, error: conversationError } = await admin.from("WhatsAppConversation")
    .select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount")
    .eq("whatsappAccountId", account.id).eq("waUserId", waUserId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «conversationError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (conversationError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw conversationError;
  // راهنما: این شرط بررسی می‌کند آیا «!conversation» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!conversation) {
    // راهنما: این دستور متغیر/ثابت «created» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const created = await admin.from("WhatsAppConversation").insert({
      workspaceId: account.workspaceId,
      whatsappAccountId: account.id,
      waUserId,
      customerPhone: waUserId,
      customerName,
      status: "OPEN",
      lastMessageAt: sentAtIso,
      customerServiceWindowExpiresAt: windowExpiresAt,
      unreadCount: 1,
      metadata: { source: "webhook" },
    }).select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount").single();
    // راهنما: این شرط بررسی می‌کند آیا «created.error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (created.error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw created.error;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «conversation = created.data».
    conversation = created.data;
  } else {
    // راهنما: این دستور متغیر/ثابت «{ data: updated, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: updated, error } = await admin.from("WhatsAppConversation").update({
      customerPhone: waUserId,
      customerName: customerName ?? conversation.customerName,
      status: "OPEN",
      lastMessageAt: sentAtIso,
      customerServiceWindowExpiresAt: windowExpiresAt,
      unreadCount: Number(conversation.unreadCount ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    }).eq("id", conversation.id).select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount").single();
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «conversation = updated».
    conversation = updated;
  }

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const body = messageBody(message);
  // راهنما: این دستور متغیر/ثابت «messageType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const messageType = String(message?.type ?? "unknown");
  // راهنما: این دستور متغیر/ثابت «{ error: insertError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: insertError } = await admin.from("WhatsAppMessage").insert({
    workspaceId: account.workspaceId,
    whatsappAccountId: account.id,
    conversationId: conversation.id,
    providerMessageId,
    direction: "INBOUND",
    messageType,
    body: body || null,
    status: "RECEIVED",
    isTemplate: false,
    providerTimestamp: sentAtIso,
    metadata: { provider: message },
  });
  // راهنما: این شرط بررسی می‌کند آیا «insertError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (insertError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw insertError;

  // راهنما: این شرط بررسی می‌کند آیا «!body» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!body) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «{ data: rules, error: rulesError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: rules, error: rulesError } = await admin.from("WhatsAppAutomationRule")
    .select("id,triggerConfig,actionConfig,executions")
    .eq("workspaceId", account.workspaceId)
    .eq("whatsappAccountId", account.id)
    .eq("triggerType", "MESSAGE_KEYWORD")
    .eq("isActive", true);
  // راهنما: این شرط بررسی می‌کند آیا «rulesError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (rulesError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw rulesError;
  // راهنما: این دستور متغیر/ثابت «rule» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rule = (rules ?? []).find((r: any) => matches(body, r.triggerConfig?.keywords));
  // راهنما: این شرط بررسی می‌کند آیا «!rule» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!rule) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «replyText» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const replyText = String(rule.actionConfig?.message ?? "").trim();
  // راهنما: این شرط بررسی می‌کند آیا «replyText» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (replyText) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendAutoReply(account, conversation, replyText, rule)». */ await sendAutoReply(account, conversation, replyText, rule);
}
// راهنما: این تابع «processStatus» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function processStatus(account: any, status: any) {
  // راهنما: این دستور متغیر/ثابت «providerMessageId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const providerMessageId = String(status?.id ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «!providerMessageId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!providerMessageId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «mappedStatus» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const mappedStatus = String(status?.status ?? "UNKNOWN").toUpperCase();
  // راهنما: این دستور متغیر/ثابت «pricingCategory» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const pricingCategory = status?.pricing?.category ? String(status.pricing.category) : null;
  // راهنما: این دستور متغیر/ثابت «{ data: existing }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: existing } = await admin.from("WhatsAppMessage").select("id,metadata").eq("providerMessageId", providerMessageId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «!existing» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!existing) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppMessage").update({ status: mappedStatus, pricingCategory, metad…».
  await admin.from("WhatsAppMessage").update({
    status: mappedStatus,
    pricingCategory,
    metadata: { ...(existing.metadata ?? {}), delivery: status },
  }).eq("id", existing.id);
}

// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Deno.serve(async (request) => { const url = new URL(request.url); if (request.method === …».
Deno.serve(async (request) => {
  // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const url = new URL(request.url);
  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این دستور متغیر/ثابت «mode» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const mode = url.searchParams.get("hub.mode");
    // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const token = url.searchParams.get("hub.verify_token") ?? "";
    // راهنما: این دستور متغیر/ثابت «challenge» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const challenge = url.searchParams.get("hub.challenge") ?? "";
    // راهنما: این دستور متغیر/ثابت «expected» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const expected = await appSecret("whatsapp_webhook_verify_token").catch(() => "");
    // راهنما: این شرط بررسی می‌کند آیا «mode === "subscribe" && expected && timingSafeEqual(token, expected)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (mode === "subscribe" && expected && timingSafeEqual(token, expected)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response(challenge, { status: 200 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response(challenge, { status: 200 });
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Forbidden", { status: 403 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return new Response("Forbidden", { status: 403 });
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Method not allowed", { status: 405 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Method not allowed", { status: 405 });

  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = await request.text();
  // راهنما: این دستور متغیر/ثابت «metaAppSecret» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const metaAppSecret = await appSecret("meta_app_secret").catch(() => Deno.env.get("META_APP_SECRET") ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «!metaAppSecret» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!metaAppSecret) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Meta App Secret not configured", { status: 503 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Meta App Secret not configured", { status: 503 });
  // راهنما: این دستور متغیر/ثابت «signature» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  // راهنما: این دستور متغیر/ثابت «expected» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const expected = `sha256=${await hmacHex(metaAppSecret, raw)}`;
  // راهنما: این شرط بررسی می‌کند آیا «!timingSafeEqual(signature, expected)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!timingSafeEqual(signature, expected)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Invalid signature", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Invalid signature", { status: 401 });

  // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let payload: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «payload = JSON.parse(raw)». */ payload = JSON.parse(raw); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Bad request", { status: 400 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Bad request", { status: 400 }); }
  // راهنما: این شرط بررسی می‌کند آیا «payload?.object && payload.object !== "whatsapp_business_account"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (payload?.object && payload.object !== "whatsapp_business_account") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json({ ok: true, ignored: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json({ ok: true, ignored: true });

  // راهنما: این دستور متغیر/ثابت «jobs» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const jobs: Promise<void>[] = [];
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const entry of payload?.entry ?? []) {
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const change of entry?.changes ?? []) {
      // راهنما: این شرط بررسی می‌کند آیا «change?.field !== "messages"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (change?.field !== "messages") /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
      // راهنما: این دستور متغیر/ثابت «value» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const value = change?.value ?? {};
      // راهنما: این دستور متغیر/ثابت «phoneNumberId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const phoneNumberId = String(value?.metadata?.phone_number_id ?? "");
      // راهنما: این شرط بررسی می‌کند آیا «!phoneNumberId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!phoneNumberId) /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await accountForPhoneNumberId(phoneNumberId);
      // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!account) /* راهنما: این دستور ادامه دستورات مرحله فعلی حلقه را رد می‌کند و به تکرار بعدی می‌رود. */ continue;
      // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
      for (const message of value?.messages ?? []) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «jobs.push(processIncoming(account, value, message))». */ jobs.push(processIncoming(account, value, message));
      // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
      for (const status of value?.statuses ?? []) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «jobs.push(processStatus(account, status))». */ jobs.push(processStatus(account, status));
    }
  }
  // راهنما: این دستور متغیر/ثابت «results» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const results = await Promise.allSettled(jobs);
  // راهنما: این دستور متغیر/ثابت «failed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const failed = results.filter((r) => r.status === "rejected");
  // راهنما: این شرط بررسی می‌کند آیا «failed.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (failed.length) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("whatsapp webhook partial failures", failed)». */ console.error("whatsapp webhook partial failures", failed);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json({ ok: true, processed: jobs.length, failed: failed.length })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json({ ok: true, processed: jobs.length, failed: failed.length });
});
