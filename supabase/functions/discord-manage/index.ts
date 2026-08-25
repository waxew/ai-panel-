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

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return Response.json(data, { status, headers: corsHeaders }); }

// راهنما: این تابع «fromHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromHex(hex: string) {
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(hex.length / 2);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < bytes.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)». */ bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}
// راهنما: این تابع «fromBase64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromBase64(value: string) {
  // راهنما: این دستور متغیر/ثابت «binary» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const binary = atob(value);
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(binary.length);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < binary.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = binary.charCodeAt(i)». */ bytes[i] = binary.charCodeAt(i);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}
// راهنما: این تابع «decryptToken» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function decryptToken(ciphertext: string, keyHex: string) {
  // راهنما: این دستور متغیر/ثابت «[version, iv64, data64]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [version, iv64, data64] = ciphertext.split(":");
  // راهنما: این شرط بررسی می‌کند آیا «version !== "v1" || !iv64 || !data64» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (version !== "v1" || !iv64 || !data64) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_ciphertext");
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["decrypt"]);
  // راهنما: این دستور متغیر/ثابت «plain» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv64) }, key, fromBase64(data64));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new TextDecoder().decode(plain)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return new TextDecoder().decode(plain);
}

// راهنما: این تابع «getWorkspaceIds» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function getWorkspaceIds(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(error.message);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(data ?? []).map((row: any) => row.workspaceId as string)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (data ?? []).map((row: any) => row.workspaceId as string);
}

// راهنما: این تابع «getBotForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function getBotForUser(admin: any, userId: string, botId: string) {
  // راهنما: این دستور متغیر/ثابت «workspaceIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceIds = await getWorkspaceIds(admin, userId);
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceIds.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceIds.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «{ data }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data } = await admin.from("DiscordBot").select("*").eq("id", botId).in("workspaceId", workspaceIds).maybeSingle();
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
}

// راهنما: این تابع «discordCall» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function discordCall(token: string, path: string, init: RequestInit = {}) {
  // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: { authorization: `Bot ${token}`, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers ?? {}) },
  });
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = await response.json().catch(() => ({}));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: response.ok, status: response.status, data }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { ok: response.ok, status: response.status, data };
}

// راهنما: این تابع «syncCommands» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function syncCommands(admin: any, bot: any) {
  // راهنما: این دستور متغیر/ثابت «{ data: secret }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: secret } = await admin.from("AppSecret").select("value").eq("id", "discord_token_encryption").single();
  // راهنما: این شرط بررسی می‌کند آیا «!secret?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!secret?.value) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("missing_secret");
  // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const token = await decryptToken(bot.tokenCiphertext, secret.value);
  // راهنما: این دستور متغیر/ثابت «{ data: commands, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: commands, error } = await admin.from("DiscordCommand").select("name,description,isActive,sortOrder").eq("botId", bot.id).eq("isActive", true).order("sortOrder");
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(error.message);
  // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const payload = (commands ?? []).map((command: any) => ({ name: command.name, description: command.description || command.name, type: 1 }));
  // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const result = await discordCall(token, `/applications/${bot.applicationId}/commands`, { method: "PUT", body: JSON.stringify(payload) });
  // راهنما: این شرط بررسی می‌کند آیا «!result.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!result.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`discord_sync:${result.status}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «result.data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return result.data;
}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId = ctx.userClaims?.id;
  // راهنما: این شرط بررسی می‌کند آیا «!userId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!userId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin = ctx.supabaseAdmin;
  // راهنما: این دستور متغیر/ثابت «workspaceIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const workspaceIds = await getWorkspaceIds(admin, userId);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این شرط بررسی می‌کند آیا «!workspaceIds.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!workspaceIds.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, bots: [], commands: [] })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: true, bots: [], commands: [] });
    // راهنما: این دستور متغیر/ثابت «{ data: bots, error: botsError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: bots, error: botsError } = await admin.from("DiscordBot").select("id,workspaceId,applicationId,botUserId,username,displayName,description,status,defaultGuildId,defaultChannelId,settings,createdAt,updatedAt").in("workspaceId", workspaceIds).order("createdAt", { ascending: false });
    // راهنما: این شرط بررسی می‌کند آیا «botsError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (botsError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دریافت ربات‌های Discord انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دریافت ربات‌های Discord انجام نشد." }, 500);
    // راهنما: این دستور متغیر/ثابت «botIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const botIds = (bots ?? []).map((bot: any) => bot.id);
    // راهنما: این دستور متغیر/ثابت «commands» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let commands: any[] = [];
    // راهنما: این شرط بررسی می‌کند آیا «botIds.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (botIds.length) {
      // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data, error } = await admin.from("DiscordCommand").select("id,botId,name,description,responseText,responseEphemeral,isActive,executions,lastUsedAt,sortOrder,createdAt,updatedAt").in("botId", botIds).order("sortOrder");
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دریافت فرمان‌ها انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دریافت فرمان‌ها انجام نشد." }, 500);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «commands = data ?? []».
      commands = data ?? [];
    }
    // راهنما: این دستور متغیر/ثابت «enriched» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const enriched = (bots ?? []).map((bot: any) => ({
      ...bot,
      installUrl: `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(bot.applicationId)}&permissions=274877975552&integration_type=0&scope=bot+applications.commands`,
      interactionsEndpoint: `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/discord-interactions/${bot.applicationId}`,
    }));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, bots: enriched, commands })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true, bots: enriched, commands });
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);
  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = String(body.action ?? "");

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_bot"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_bot") {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    // راهنما: این دستور متغیر/ثابت «patch» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const patch = {
      displayName: typeof body.displayName === "string" ? body.displayName.trim().slice(0, 100) : bot.displayName,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : bot.description,
      defaultGuildId: typeof body.defaultGuildId === "string" ? body.defaultGuildId.trim() || null : bot.defaultGuildId,
      defaultChannelId: typeof body.defaultChannelId === "string" ? body.defaultChannelId.trim() || null : bot.defaultChannelId,
      updatedAt: new Date().toISOString(),
    };
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("DiscordBot").update(patch).eq("id", bot.id);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره تنظیمات انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ذخیره تنظیمات انجام نشد." }, 500);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true });
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "create_command"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "create_command") {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const name = String(body.name ?? "").trim().toLowerCase();
    // راهنما: این شرط بررسی می‌کند آیا «!/^[a-z0-9_-]{1,32}$/.test(name)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!/^[a-z0-9_-]{1,32}$/.test(name)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام فرمان باید ۱ تا ۳۲ کاراکتر انگلیسی کوچک، ع…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام فرمان باید ۱ تا ۳۲ کاراکتر انگلیسی کوچک، عدد، - یا _ باشد." }, 400);
    // راهنما: این دستور متغیر/ثابت «description» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const description = String(body.description ?? "").trim().slice(0, 100);
    // راهنما: این دستور متغیر/ثابت «responseText» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const responseText = String(body.responseText ?? "").trim().slice(0, 1900);
    // راهنما: این شرط بررسی می‌کند آیا «!description || !responseText» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!description || !responseText) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "توضیح و پاسخ فرمان را وارد کنید." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "توضیح و پاسخ فرمان را وارد کنید." }, 400);
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("DiscordCommand").insert({ id: crypto.randomUUID(), botId: bot.id, name, description, responseText, responseEphemeral: Boolean(body.responseEphemeral), isActive: true, executions: 0, sortOrder: Number(body.sortOrder ?? 100), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: error.code === "23505" ? "این نام فرمان قبلاً ا…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: error.code === "23505" ? "این نام فرمان قبلاً استفاده شده است." : "ساخت فرمان انجام نشد." }, 500);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await syncCommands(admin, bot)». */ await syncCommands(admin, bot); } catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true });
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_command"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_command") {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    // راهنما: این دستور متغیر/ثابت «commandId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const commandId = String(body.commandId ?? "");
    // راهنما: این دستور متغیر/ثابت «{ data: command }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: command } = await admin.from("DiscordCommand").select("id").eq("id", commandId).eq("botId", bot.id).maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «!command» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!command) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فرمان پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فرمان پیدا نشد." }, 404);
    // راهنما: این دستور متغیر/ثابت «patch» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const patch: any = { updatedAt: new Date().toISOString() };
    // راهنما: این شرط بررسی می‌کند آیا «typeof body.description === "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (typeof body.description === "string") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.description = body.description.trim().slice(0, 100)». */ patch.description = body.description.trim().slice(0, 100);
    // راهنما: این شرط بررسی می‌کند آیا «typeof body.responseText === "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (typeof body.responseText === "string") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.responseText = body.responseText.trim().slice(0, 1900)». */ patch.responseText = body.responseText.trim().slice(0, 1900);
    // راهنما: این شرط بررسی می‌کند آیا «typeof body.responseEphemeral === "boolean"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (typeof body.responseEphemeral === "boolean") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.responseEphemeral = body.responseEphemeral». */ patch.responseEphemeral = body.responseEphemeral;
    // راهنما: این شرط بررسی می‌کند آیا «typeof body.isActive === "boolean"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (typeof body.isActive === "boolean") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.isActive = body.isActive». */ patch.isActive = body.isActive;
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("DiscordCommand").update(patch).eq("id", commandId);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ویرایش فرمان انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ویرایش فرمان انجام نشد." }, 500);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await syncCommands(admin, bot)». */ await syncCommands(admin, bot); } catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true });
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "delete_command"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "delete_command") {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("DiscordCommand").delete().eq("id", String(body.commandId ?? "")).eq("botId", bot.id);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حذف فرمان انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حذف فرمان انجام نشد." }, 500);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await syncCommands(admin, bot)». */ await syncCommands(admin, bot); } catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true });
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "sync_commands"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "sync_commands") {
    // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ربات پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد. */ const result = await syncCommands(admin, bot); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, synced: Array.isArray(result) ? result.length : 0 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: true, synced: Array.isArray(result) ? result.length : 0 }); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "همگام‌سازی فرمان‌ها با Discord انجام نشد." }, …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "همگام‌سازی فرمان‌ها با Discord انجام نشد." }, 502); }
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات ناشناخته است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ ok: false, message: "عملیات ناشناخته است." }, 400);
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
