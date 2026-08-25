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
// راهنما: این تابع «sha256» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sha256(value: string) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)))); }
// راهنما: این تابع «hmacHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function hmacHex(secret: string, body: string) {
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))));
}
// راهنما: این تابع «timingSafeEqual» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function timingSafeEqual(a: string, b: string) {
  // راهنما: این شرط بررسی می‌کند آیا «a.length !== b.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (a.length !== b.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
  // راهنما: این دستور متغیر/ثابت «out» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let out = 0; /* راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند. */ for (let i = 0; i < a.length; i++) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «out |= a.charCodeAt(i) ^ b.charCodeAt(i)». */ out |= a.charCodeAt(i) ^ b.charCodeAt(i); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «out === 0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return out === 0;
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
// راهنما: این تابع «fromB64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromB64(value: string) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Uint8Array.from(atob(value), (c) => c.charCodeAt(0))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)); }
// راهنما: این تابع «decryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function decryptToken(ciphertext: string) {
  // راهنما: این دستور متغیر/ثابت «keyHex» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyHex = await appSecret("instagram_token_encryption");
  // راهنما: این دستور متغیر/ثابت «keyBytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const keyBytes = Uint8Array.from(keyHex.match(/.{1,2}/g)!.map((x) => parseInt(x, 16)));
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
// راهنما: این تابع «normalize» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function normalize(value: unknown) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""; }
// راهنما: این تابع «matches» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function matches(text: string, keywords: unknown) {
  // راهنما: این دستور متغیر/ثابت «list» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const list = Array.isArray(keywords) ? keywords.map(normalize).filter(Boolean) : [];
  // راهنما: این دستور متغیر/ثابت «haystack» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const haystack = normalize(text); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «list.some((word) => haystack.includes(word))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return list.some((word) => haystack.includes(word));
}
// راهنما: این تابع «eventRow» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function eventRow(data: Record<string, unknown>) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("InstagramAutomationEvent").insert(data)». */ await admin.from("InstagramAutomationEvent").insert(data); }

// راهنما: این تابع «processComment» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function processComment(value: any) {
  // راهنما: این دستور متغیر/ثابت «commentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const commentId = String(value?.id ?? value?.comment_id ?? "");
  // راهنما: این دستور متغیر/ثابت «mediaId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const mediaId = String(value?.media?.id ?? value?.media_id ?? "");
  // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const text = String(value?.text ?? "");
  // راهنما: این دستور متغیر/ثابت «username» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const username = String(value?.from?.username ?? value?.username ?? "");
  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId = String(value?.from?.id ?? value?.user_id ?? "");
  // راهنما: این دستور متغیر/ثابت «igUserId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const igUserId = String(value?.media?.owner?.id ?? value?.recipient?.id ?? value?.ig_user_id ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «!commentId || !text» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!commentId || !text) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این دستور متغیر/ثابت «providerEventId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const providerEventId = await sha256(`comment:${commentId}`);
  // راهنما: این دستور متغیر/ثابت «{ data: existing }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: existing } = await admin.from("InstagramAutomationEvent").select("id").eq("providerEventId", providerEventId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «existing» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existing) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این دستور متغیر/ثابت «accountQuery» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let accountQuery = admin.from("InstagramAccount").select("id,workspaceId,metaAccountId,accessTokenCiphertext,status,webhookSubscribed");
  // راهنما: این شرط بررسی می‌کند آیا «igUserId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (igUserId) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «accountQuery = accountQuery.eq("metaAccountId", igUserId)». */ accountQuery = accountQuery.eq("metaAccountId", igUserId);
  // راهنما: این دستور متغیر/ثابت «{ data: account }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: account } = await accountQuery.eq("status", "ACTIVE").limit(1).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, eventT…».
  await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, eventType: "COMMENT", providerEventId, sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome: "RECEIVED", metadata: { commentId, mediaId } });

  // راهنما: این دستور متغیر/ثابت «{ data: rules }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: rules } = await admin.from("InstagramAutomationRule").select("id,triggerConfig,actionConfig,executions").eq("workspaceId", account.workspaceId).eq("instagramAccountId", account.id).eq("triggerType", "COMMENT_KEYWORD").eq("isActive", true);
  // راهنما: این دستور متغیر/ثابت «rule» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rule = (rules ?? []).find((r: any) => matches(text, r.triggerConfig?.keywords));
  // راهنما: این شرط بررسی می‌کند آیا «!rule» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!rule) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;

  // راهنما: این شرط بررسی می‌کند آیا «!account.accessTokenCiphertext || !account.webhookSubscribed» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!account.accessTokenCiphertext || !account.webhookSubscribed) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId…».
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome: "FAILED", metadata: { commentId, reason: "account_not_ready" } });
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return;
  }

  // راهنما: این دستور متغیر/ثابت «message» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const message = String(rule.actionConfig?.message ?? "").trim();
  // راهنما: این شرط بررسی می‌کند آیا «!message» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!message) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const token = await decryptToken(account.accessTokenCiphertext);
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch(`https://graph.instagram.com/${META_API_VERSION}/${account.metaAccountId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: message } }),
    });
    // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const result = await response.json().catch(() => ({}));
    // راهنما: این دستور متغیر/ثابت «outcome» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const outcome = response.ok ? "SENT" : "FAILED";
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId…».
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome, metadata: { commentId, mediaId, meta: result } });
    // راهنما: این شرط بررسی می‌کند آیا «response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (response.ok) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("InstagramAutomationRule").update({ executions: Number(rule.executions ?…». */ await admin.from("InstagramAutomationRule").update({ executions: Number(rule.executions ?? 0) + 1, lastTriggeredAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq("id", rule.id);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId…».
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceText: text, outcome: "FAILED", metadata: { commentId, reason: String(error) } });
  }
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
    const expected = await appSecret("instagram_webhook_verify_token").catch(() => "");
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
  const metaAppSecret = await appSecret("meta_app_secret").catch(() => "");
  // راهنما: این شرط بررسی می‌کند آیا «!metaAppSecret» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!metaAppSecret) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Meta secret not configured", { status: 503 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Meta secret not configured", { status: 503 });
  // راهنما: این دستور متغیر/ثابت «signature» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  // راهنما: این دستور متغیر/ثابت «expected» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const expected = `sha256=${await hmacHex(metaAppSecret, raw)}`;
  // راهنما: این شرط بررسی می‌کند آیا «!timingSafeEqual(signature, expected)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!timingSafeEqual(signature, expected)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Invalid signature", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Invalid signature", { status: 401 });

  // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let payload: any; /* راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود. */ try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «payload = JSON.parse(raw)». */ payload = JSON.parse(raw); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Bad request", { status: 400 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Bad request", { status: 400 }); }
  // راهنما: این دستور متغیر/ثابت «jobs» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const jobs: Promise<void>[] = [];
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const entry of payload?.entry ?? []) {
    // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
    for (const change of entry?.changes ?? []) /* راهنما: این شرط بررسی می‌کند آیا «change?.field === "comments"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (change?.field === "comments") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «jobs.push(processComment({ ...change.value, ig_user_id: entry.id }))». */ jobs.push(processComment({ ...change.value, ig_user_id: entry.id }));
  }
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await Promise.allSettled(jobs)».
  await Promise.allSettled(jobs);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json({ ok: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json({ ok: true });
});
