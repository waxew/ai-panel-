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

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: { "Cache-Control": "no-store" } })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
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
// راهنما: این تابع «getAccount» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function getAccount(workspaceId: string, accountId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WhatsAppAccount")
    .select("id,workspaceId,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,accessTokenCiphertext,status,webhookSubscribed,qualityRating,lastSyncedAt")
    .eq("id", accountId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data as any» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data as any;
}
// راهنما: این تابع «dashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function dashboard(workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «[accountsResult, conversationsResult, templa…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [accountsResult, conversationsResult, templatesResult, rulesResult, messagesResult] = await Promise.all([
    admin.from("WhatsAppAccount").select("id,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt,createdAt,updatedAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }),
    admin.from("WhatsAppConversation").select("id,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount,updatedAt").eq("workspaceId", workspaceId).order("lastMessageAt", { ascending: false }).limit(50),
    admin.from("WhatsAppTemplate").select("id,whatsappAccountId,metaTemplateId,name,language,category,status,components,qualityScore,lastSyncedAt").eq("workspaceId", workspaceId).order("updatedAt", { ascending: false }).limit(100),
    admin.from("WhatsAppAutomationRule").select("id,whatsappAccountId,name,triggerType,triggerConfig,actionType,actionConfig,isActive,executions,lastTriggeredAt,updatedAt").eq("workspaceId", workspaceId).order("updatedAt", { ascending: false }).limit(100),
    admin.from("WhatsAppMessage").select("id,whatsappAccountId,conversationId,providerMessageId,direction,messageType,body,templateName,status,pricingCategory,isTemplate,providerTimestamp,createdAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(100),
  ]);
  // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const firstError = [accountsResult, conversationsResult, templatesResult, rulesResult, messagesResult].map((r: any) => r.error).find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (firstError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw firstError;
  // راهنما: این دستور متغیر/ثابت «accounts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const accounts = accountsResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «conversations» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const conversations = conversationsResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «templates» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const templates = templatesResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «rules» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rules = rulesResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «messages» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const messages = messagesResult.data ?? [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, accounts, conversations, templates, rules, messages, summary: …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    accounts,
    conversations,
    templates,
    rules,
    messages,
    summary: {
      accountCount: accounts.length,
      activeAccounts: accounts.filter((x: any) => x.status === "ACTIVE").length,
      openConversations: conversations.filter((x: any) => x.status === "OPEN").length,
      unreadMessages: conversations.reduce((sum: number, x: any) => sum + Number(x.unreadCount ?? 0), 0),
      approvedTemplates: templates.filter((x: any) => x.status === "APPROVED").length,
      activeRules: rules.filter((x: any) => x.isActive).length,
    },
  };
}

// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Deno.serve(async (request) => { const user = await userFromRequest(request); if (!user) r…».
Deno.serve(async (request) => {
  // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const user = await userFromRequest(request);
  // راهنما: این شرط بررسی می‌کند آیا «!user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceId = await workspaceForUser(user.id);
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await dashboard(workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("whatsapp dashboard failed", error)». */ console.error("whatsapp dashboard failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات واتساپ دریافت نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات واتساپ دریافت نشد." }, 500); }
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = String(body?.action ?? "");

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این شرط بررسی می‌کند آیا «action === "sync_templates"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "sync_templates") {
      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const token = await decryptToken(account.accessTokenCiphertext);
      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await graph(`${encodeURIComponent(account.wabaId)}/message_templates?fields=id,name,language,category,status,components&limit=100`, token);
      // راهنما: این شرط بررسی می‌کند آیا «!result.response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!result.response.ok) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: result.data?.error?.message ?? "دریافت Template…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: result.data?.error?.message ?? "دریافت Templateها از Meta انجام نشد." }, 400);
      // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const now = new Date().toISOString();
      // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
      for (const item of result.data?.data ?? []) {
        // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const { error } = await admin.from("WhatsAppTemplate").upsert({
          workspaceId,
          whatsappAccountId: account.id,
          metaTemplateId: item.id ? String(item.id) : null,
          name: String(item.name ?? ""),
          language: String(item.language ?? ""),
          category: String(item.category ?? "UNKNOWN"),
          status: String(item.status ?? "UNKNOWN"),
          components: item.components ?? [],
          lastSyncedAt: now,
          updatedAt: now,
        }, { onConflict: "whatsappAccountId,name,language" });
        // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await dashboard(workspaceId)), message: "Templateهای واتساپ همگ…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await dashboard(workspaceId)), message: "Templateهای واتساپ همگام شدند." });
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "create_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "create_rule") {
      // راهنما: این دستور متغیر/ثابت «accountId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const accountId = String(body.accountId ?? "");
      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await getAccount(workspaceId, accountId);
      // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const name = String(body.name ?? "").trim();
      // راهنما: این دستور متغیر/ثابت «keywords» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const keywords = Array.isArray(body.keywords) ? body.keywords.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 25) : [];
      // راهنما: این دستور متغیر/ثابت «replyText» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const replyText = String(body.replyText ?? "").trim();
      // راهنما: این شرط بررسی می‌کند آیا «!name || keywords.length === 0 || !replyText» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!name || keywords.length === 0 || !replyText) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام Rule، کلیدواژه و متن پاسخ را کامل کنید." }…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام Rule، کلیدواژه و متن پاسخ را کامل کنید." }, 400);
      // راهنما: این شرط بررسی می‌کند آیا «replyText.length > 4000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (replyText.length > 4000) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "متن پاسخ بیش از حد طولانی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "متن پاسخ بیش از حد طولانی است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("WhatsAppAutomationRule").insert({
        workspaceId,
        whatsappAccountId: account.id,
        name,
        triggerType: "MESSAGE_KEYWORD",
        triggerConfig: { keywords },
        actionType: "SEND_MESSAGE",
        actionConfig: { message: replyText },
        isActive: Boolean(body.isActive ?? true),
      });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await dashboard(workspaceId)), message: "Rule پاسخ خودکار ساخته…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await dashboard(workspaceId)), message: "Rule پاسخ خودکار ساخته شد." }, 201);
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "toggle_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "toggle_rule") {
      // راهنما: این دستور متغیر/ثابت «ruleId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ruleId = String(body.ruleId ?? "");
      // راهنما: این دستور متغیر/ثابت «{ data: rule }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: rule } = await admin.from("WhatsAppAutomationRule").select("id").eq("id", ruleId).eq("workspaceId", workspaceId).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «!rule» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!rule) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Rule پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Rule پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("WhatsAppAutomationRule").update({ isActive: Boolean(body.isActive), updatedAt: new Date().toISOString() }).eq("id", ruleId).eq("workspaceId", workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await dashboard(workspaceId)), message: "وضعیت Rule تغییر کرد."…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await dashboard(workspaceId)), message: "وضعیت Rule تغییر کرد." });
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "send_message"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "send_message") {
      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «conversationId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const conversationId = String(body.conversationId ?? "");
      // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const text = String(body.text ?? "").trim();
      // راهنما: این شرط بررسی می‌کند آیا «!text || text.length > 4000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!text || text.length > 4000) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "متن پیام معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "متن پیام معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: conversation }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: conversation } = await admin.from("WhatsAppConversation")
        .select("id,waUserId,customerPhone,customerServiceWindowExpiresAt")
        .eq("id", conversationId).eq("workspaceId", workspaceId).eq("whatsappAccountId", account.id).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «!conversation» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!conversation) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "گفتگو پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "گفتگو پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «windowEnd» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const windowEnd = conversation.customerServiceWindowExpiresAt ? new Date(conversation.customerServiceWindowExpiresAt).getTime() : 0;
      // راهنما: این شرط بررسی می‌کند آیا «windowEnd <= Date.now()» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (windowEnd <= Date.now()) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "CUSTOMER_SERVICE_WINDOW_CLOSED", message: "پنجره …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, code: "CUSTOMER_SERVICE_WINDOW_CLOSED", message: "پنجره ۲۴ ساعته این گفتگو بسته است؛ برای شروع دوباره باید Template تأییدشده ارسال شود." }, 409);
      // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const token = await decryptToken(account.accessTokenCiphertext);
      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, {
        method: "POST",
        body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: conversation.waUserId, type: "text", text: { preview_url: false, body: text } }),
      });
      // راهنما: این شرط بررسی می‌کند آیا «!result.response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!result.response.ok) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: result.data?.error?.message ?? "ارسال پیام انجا…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: result.data?.error?.message ?? "ارسال پیام انجام نشد." }, 400);
      // راهنما: این دستور متغیر/ثابت «providerMessageId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, …».
      await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, conversationId: conversation.id, providerMessageId, direction: "OUTBOUND", messageType: "text", body: text, status: "SENT", isTemplate: false, providerTimestamp: new Date().toISOString(), metadata: { source: "panel" } });
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppConversation").update({ lastMessageAt: new Date().toISOString()…».
      await admin.from("WhatsAppConversation").update({ lastMessageAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq("id", conversation.id);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await dashboard(workspaceId)), message: "پیام ارسال شد." })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await dashboard(workspaceId)), message: "پیام ارسال شد." });
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "send_template"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "send_template") {
      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      // راهنما: این شرط بررسی می‌کند آیا «!account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «to» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const to = String(body.to ?? "").replace(/[^0-9]/g, "");
      // راهنما: این دستور متغیر/ثابت «templateName» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const templateName = String(body.templateName ?? "").trim();
      // راهنما: این دستور متغیر/ثابت «language» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const language = String(body.language ?? "").trim();
      // راهنما: این دستور متغیر/ثابت «components» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const components = Array.isArray(body.components) ? body.components : undefined;
      // راهنما: این شرط بررسی می‌کند آیا «!to || !templateName || !language» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!to || !templateName || !language) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "گیرنده، نام Template و زبان الزامی است." }, 40…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "گیرنده، نام Template و زبان الزامی است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: approved }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: approved } = await admin.from("WhatsAppTemplate").select("id,status").eq("workspaceId", workspaceId).eq("whatsappAccountId", account.id).eq("name", templateName).eq("language", language).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «!approved || approved.status !== "APPROVED"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!approved || approved.status !== "APPROVED") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, code: "TEMPLATE_NOT_APPROVED", message: "این Template در…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, code: "TEMPLATE_NOT_APPROVED", message: "این Template در لیست تأییدشده‌های Meta نیست. ابتدا Templateها را همگام کنید." }, 409);
      // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const token = await decryptToken(account.accessTokenCiphertext);
      // راهنما: این دستور متغیر/ثابت «template» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const template: any = { name: templateName, language: { code: language } };
      // راهنما: این شرط بررسی می‌کند آیا «components» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (components) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «template.components = components». */ template.components = components;
      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, { method: "POST", body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template", template }) });
      // راهنما: این شرط بررسی می‌کند آیا «!result.response.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!result.response.ok) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: result.data?.error?.message ?? "ارسال Template …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: result.data?.error?.message ?? "ارسال Template انجام نشد." }, 400);
      // راهنما: این دستور متغیر/ثابت «providerMessageId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
      // راهنما: این دستور متغیر/ثابت «{ data: conversation }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      let { data: conversation } = await admin.from("WhatsAppConversation").select("id").eq("whatsappAccountId", account.id).eq("waUserId", to).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «!conversation» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!conversation) {
        // راهنما: این دستور متغیر/ثابت «created» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const created = await admin.from("WhatsAppConversation").insert({ workspaceId, whatsappAccountId: account.id, waUserId: to, customerPhone: to, status: "OPEN", lastMessageAt: new Date().toISOString() }).select("id").single();
        // راهنما: این شرط بررسی می‌کند آیا «created.error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (created.error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw created.error;
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «conversation = created.data».
        conversation = created.data;
      }
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, …».
      await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, conversationId: conversation.id, providerMessageId, direction: "OUTBOUND", messageType: "template", templateName, status: "SENT", isTemplate: true, providerTimestamp: new Date().toISOString(), metadata: { source: "panel", language, components: components ?? [] } });
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await dashboard(workspaceId)), message: "Template ارسال شد." })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await dashboard(workspaceId)), message: "Template ارسال شد." });
    }

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Action ناشناخته است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "Action ناشناخته است." }, 400);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("whatsapp manage failed", error)».
    console.error("whatsapp manage failed", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات واتساپ انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "عملیات واتساپ انجام نشد." }, 500);
  }
});
