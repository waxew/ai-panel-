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

// راهنما: این Type با نام «DiscordUser» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DiscordUser = { id: string; username: string; global_name?: string | null; bot?: boolean };
// راهنما: این Type با نام «DiscordApplication» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type DiscordApplication = { id: string; name: string; description?: string; icon?: string | null; bot_public?: boolean; public_key: string };

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

// راهنما: این تابع «fromHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromHex(hex: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!/^[0-9a-f]{64}$/i.test(hex)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^[0-9a-f]{64}$/i.test(hex)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("Invalid encryption key");
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

// راهنما: این تابع «discordCall» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function discordCall<T>(token: string, path: string, init: RequestInit = {}) {
  // راهنما: این دستور متغیر/ثابت «controller» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const controller = new AbortController();
  // راهنما: این دستور متغیر/ثابت «timeout» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const timeout = setTimeout(() => controller.abort(), 10000);
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch(`https://discord.com/api/v10${path}`, {
      ...init,
      headers: {
        authorization: `Bot ${token}`,
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
    // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const data = await response.json().catch(() => ({}));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: response.ok, status: response.status, data: data as T }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return { ok: response.ok, status: response.status, data: data as T };
  } finally {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «clearTimeout(timeout)».
    clearTimeout(timeout);
  }
}

// راهنما: این تابع «getWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function getWorkspace(admin: any, userId: string, email: string) {
  // راهنما: این دستور متغیر/ثابت «{ error: userError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: userError } = await admin.from("User").upsert({ id: userId, email }, { onConflict: "id" });
  // راهنما: این شرط بررسی می‌کند آیا «userError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (userError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`user_upsert:${userError.message}`);
  // راهنما: این دستور متغیر/ثابت «{ data: memberships, error: membershipError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: memberships, error: membershipError } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «membershipError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (membershipError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`membership_read:${membershipError.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «memberships?.[0]?.workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (memberships?.[0]?.workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «memberships[0].workspaceId as string» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return memberships[0].workspaceId as string;
  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceId = `${userId}:workspace`;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("Workspace").upsert({ id: workspaceId, name: "فضای کاری من" }, { onConfl…».
  await admin.from("Workspace").upsert({ id: workspaceId, name: "فضای کاری من" }, { onConflict: "id" });
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("WorkspaceMember").upsert({ id: `${userId}:member`, workspaceId, userId,…».
  await admin.from("WorkspaceMember").upsert({ id: `${userId}:member`, workspaceId, userId, role: "CUSTOMER" }, { onConflict: "id" });
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «workspaceId» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return workspaceId;
}

// راهنما: این تابع «ensureDefaultCommands» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureDefaultCommands(admin: any, botId: string) {
  // راهنما: این دستور متغیر/ثابت «{ count }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { count } = await admin.from("DiscordCommand").select("id", { count: "exact", head: true }).eq("botId", botId);
  // راهنما: این شرط بررسی می‌کند آیا «(count ?? 0) > 0» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if ((count ?? 0) > 0) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows = [
    { name: "help", description: "نمایش راهنمای ربات", responseText: "سلام! من ربات AI Panel هستم. مدیر سرور می‌تواند فرمان‌ها و پاسخ‌های من را از پنل تنظیم کند.", sortOrder: 10 },
    { name: "products", description: "نمایش محصولات و خدمات", responseText: "کاتالوگ فروشگاه هنوز برای این سرور تنظیم نشده است.", sortOrder: 20 },
    { name: "support", description: "ارتباط با پشتیبانی", responseText: "اطلاعات پشتیبانی هنوز تنظیم نشده است.", sortOrder: 30 },
  ].map((row) => ({ id: crypto.randomUUID(), botId, responseEphemeral: false, isActive: true, executions: 0, ...row }));
  // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error } = await admin.from("DiscordCommand").insert(rows);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(error.message);
}

// راهنما: این تابع «syncCommands» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function syncCommands(admin: any, bot: any, token: string) {
  // راهنما: این دستور متغیر/ثابت «{ data: commands, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: commands, error } = await admin.from("DiscordCommand").select("name,description,isActive,sortOrder").eq("botId", bot.id).eq("isActive", true).order("sortOrder");
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(error.message);
  // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const payload = (commands ?? []).map((command: any) => ({ name: command.name, description: command.description || command.name, type: 1 }));
  // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const result = await discordCall<any[]>(token, `/applications/${bot.applicationId}/commands`, { method: "PUT", body: JSON.stringify(payload) });
  // راهنما: این شرط بررسی می‌کند آیا «!result.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!result.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`discord_sync:${result.status}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «result.data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return result.data;
}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, service: "discord-connect", version: 1 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: true, service: "discord-connect", version: 1 });
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
  // راهنما: این شرط بررسی می‌کند آیا «typeof body.token !== "string" || body.token.trim().length < 30» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof body.token !== "string" || body.token.trim().length < 30) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Bot Token دیسکورد معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Bot Token دیسکورد معتبر نیست." }, 400);
  // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const token = body.token.trim();

  // راهنما: این دستور متغیر/ثابت «identity» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let identity: Awaited<ReturnType<typeof discordCall<DiscordUser>>>;
  // راهنما: این دستور متغیر/ثابت «application» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let application: Awaited<ReturnType<typeof discordCall<DiscordApplication>>>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «[identity, application] = await Promise.all([ discordCall<DiscordUser>(token, "/users/@me…».
    [identity, application] = await Promise.all([
      discordCall<DiscordUser>(token, "/users/@me"),
      discordCall<DiscordApplication>(token, "/oauth2/applications/@me"),
    ]);
  } catch {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ارتباط با Discord برقرار نشد. دوباره تلاش کنید…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "ارتباط با Discord برقرار نشد. دوباره تلاش کنید." }, 502);
  }
  // راهنما: این شرط بررسی می‌کند آیا «!identity.ok || !application.ok || !identity.data?.id || !application.data?.id …» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!identity.ok || !application.ok || !identity.data?.id || !application.data?.id || !application.data?.public_key) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Discord این Bot Token را تأیید نکرد." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "Discord این Bot Token را تأیید نکرد." }, 401);
  }

  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin = ctx.supabaseAdmin;
  // راهنما: این دستور متغیر/ثابت «workspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let workspaceId: string;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «workspaceId = await getWorkspace(admin, userId, email)». */ workspaceId = await getWorkspace(admin, userId, email); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500); }

  // راهنما: این دستور متغیر/ثابت «{ data: existingBots, error: existingError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: existingBots, error: existingError } = await admin.from("DiscordBot").select("id,workspaceId").eq("applicationId", application.data.id).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «existingError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existingError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بررسی وضعیت ربات انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بررسی وضعیت ربات انجام نشد." }, 500);
  // راهنما: این دستور متغیر/ثابت «existing» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const existing = existingBots?.[0];
  // راهنما: این شرط بررسی می‌کند آیا «existing && existing.workspaceId !== workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (existing && existing.workspaceId !== workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "این Discord Application قبلاً به حساب دیگری مت…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "این Discord Application قبلاً به حساب دیگری متصل شده است." }, 409);

  // راهنما: این دستور متغیر/ثابت «{ data: secret, error: secretError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: secret, error: secretError } = await admin.from("AppSecret").select("value").eq("id", "discord_token_encryption").single();
  // راهنما: این شرط بررسی می‌کند آیا «secretError || !secret?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (secretError || !secret?.value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "کلید رمزنگاری Discord در دسترس نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "کلید رمزنگاری Discord در دسترس نیست." }, 500);
  // راهنما: این دستور متغیر/ثابت «tokenCiphertext» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let tokenCiphertext: string;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «tokenCiphertext = await encryptToken(token, secret.value)». */ tokenCiphertext = await encryptToken(token, secret.value); }
  catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "رمزنگاری Bot Token انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "رمزنگاری Bot Token انجام نشد." }, 500); }

  // راهنما: این دستور متغیر/ثابت «row» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const row = {
    workspaceId,
    applicationId: application.data.id,
    botUserId: identity.data.id,
    username: identity.data.username ?? null,
    displayName: identity.data.global_name ?? application.data.name ?? identity.data.username,
    description: application.data.description ?? null,
    publicKey: application.data.public_key,
    tokenCiphertext,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  };
  // راهنما: این دستور متغیر/ثابت «{ data: bot, error: saveError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bot, error: saveError } = await admin.from("DiscordBot").upsert(row, { onConflict: "applicationId" }).select("id,workspaceId,applicationId,botUserId,username,displayName,description,publicKey,status,defaultGuildId,defaultChannelId,settings,createdAt,updatedAt").single();
  // راهنما: این شرط بررسی می‌کند آیا «saveError || !bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (saveError || !bot) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(saveError)». */ console.error(saveError); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره ربات Discord انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ذخیره ربات Discord انجام نشد." }, 500); }

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ensureDefaultCommands(admin, bot.id)».
    await ensureDefaultCommands(admin, bot.id);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await syncCommands(admin, bot, token)».
    await syncCommands(admin, bot, token);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("discord default sync failed", error)».
    console.error("discord default sync failed", error);
  }

  // راهنما: این دستور متغیر/ثابت «installUrl» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const installUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(bot.applicationId)}&permissions=274877975552&integration_type=0&scope=bot+applications.commands`;
  // راهنما: این دستور متغیر/ثابت «interactionsEndpoint» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const interactionsEndpoint = `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/discord-interactions/${bot.applicationId}`;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, status: "connected", bot, installUrl, interactionsEndpoin…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ ok: true, status: "connected", bot, installUrl, interactionsEndpoint });
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
