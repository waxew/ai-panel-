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

// راهنما: این دستور متغیر/ثابت «actionTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const actionTypes = new Set(["CATALOG", "CART", "ORDERS", "SUPPORT", "TEXT", "URL", "SUBMENU"]);

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این تابع «cleanTitle» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanTitle(value: unknown) {
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const title = value.trim();
  // راهنما: این شرط بررسی می‌کند آیا «!title || title.length > 64» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!title || title.length > 64) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «title» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return title;
}

// راهنما: این تابع «cleanActionType» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanActionType(value: unknown) {
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «normalized» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const normalized = value.trim().toUpperCase();
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «actionTypes.has(normalized) ? normalized : null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return actionTypes.has(normalized) ? normalized : null;
}

// راهنما: این تابع «cleanActionValue» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanActionValue(actionType: string, value: unknown) {
  // راهنما: این شرط بررسی می‌کند آیا «value == null || value === ""» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (value == null || value === "") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
  // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const text = value.trim();
  // راهنما: این شرط بررسی می‌کند آیا «actionType === "URL"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (actionType === "URL") {
    // راهنما: این دستور متغیر/ثابت «parsed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let parsed: URL;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «parsed = new URL(text)». */ parsed = new URL(text); } catch { /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_url"); }
    // راهنما: این شرط بررسی می‌کند آیا «parsed.protocol !== "https:" && parsed.protocol !== "http:"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_url");
    // راهنما: این شرط بررسی می‌کند آیا «text.length > 1000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (text.length > 1000) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «text» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return text;
  }
  // راهنما: این شرط بررسی می‌کند آیا «text.length > 1500» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (text.length > 1500) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_action_value");
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «text» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return text;
}

// راهنما: این تابع «workspaceForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function workspaceForUser(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`membership:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}

// راهنما: این تابع «ownedBot» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ownedBot(admin: any, workspaceId: string, botId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin
    .from("BaleBot")
    .select("id,baleBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt")
    .eq("id", botId)
    .eq("workspaceId", workspaceId)
    .maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`bot:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
}

// راهنما: این تابع «loadBotBuilder» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function loadBotBuilder(admin: any, workspaceId: string, botId?: string | null) {
  // راهنما: این دستور متغیر/ثابت «{ data: bots, error: botsError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: bots, error: botsError } = await admin
    .from("BaleBot")
    .select("id,baleBotId,username,displayName,description,status,welcomeMessage,createdAt,updatedAt")
    .eq("workspaceId", workspaceId)
    .order("createdAt", { ascending: false });
  // راهنما: این شرط بررسی می‌کند آیا «botsError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botsError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`bots:${botsError.message}`);

  // راهنما: این دستور متغیر/ثابت «selected» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const selected = botId ? (bots ?? []).find((bot: any) => bot.id === botId) : (bots ?? [])[0];
  // راهنما: این شرط بررسی می‌کند آیا «botId && !selected» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (botId && !selected) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ bots: bots ?? [], bot: null, buttons: [] }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { bots: bots ?? [], bot: null, buttons: [] };
  // راهنما: این شرط بررسی می‌کند آیا «!selected» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!selected) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ bots: bots ?? [], bot: null, buttons: [] }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { bots: bots ?? [], bot: null, buttons: [] };

  // راهنما: این دستور متغیر/ثابت «{ data: buttons, error: buttonError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: buttons, error: buttonError } = await admin
    .from("BaleButton")
    .select("id,botId,parentId,title,actionType,actionValue,sortOrder,createdAt")
    .eq("botId", selected.id)
    .order("sortOrder", { ascending: true });
  // راهنما: این شرط بررسی می‌کند آیا «buttonError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (buttonError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`buttons:${buttonError.message}`);

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ bots: bots ?? [], bot: selected, buttons: buttons ?? [] }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { bots: bots ?? [], bot: selected, buttons: buttons ?? [] };
}

// راهنما: این تابع «ensureParent» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureParent(admin: any, botId: string, parentId: unknown, selfId?: string) {
  // راهنما: این شرط بررسی می‌کند آیا «parentId == null || parentId === ""» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (parentId == null || parentId === "") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این شرط بررسی می‌کند آیا «typeof parentId !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof parentId !== "string") /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_parent");
  // راهنما: این شرط بررسی می‌کند آیا «selfId && parentId === selfId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (selfId && parentId === selfId) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_parent");
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("BaleButton").select("id,botId").eq("id", parentId).eq("botId", botId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`parent:${error.message}`);
  // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!data) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("invalid_parent");
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.id as string» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data.id as string;
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
    // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const url = new URL(request.url);
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await loadBotBuilder(admin, workspaceId, url.searchParams.get("botId"));
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, ...result })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: true, ...result });
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale builder read failed", error)».
      console.error("bale builder read failed", error);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات بازوی بله دریافت نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "اطلاعات بازوی بله دریافت نشد." }, 500);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: Record<string, unknown>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = typeof body.action === "string" ? body.action : "";
  // راهنما: این دستور متغیر/ثابت «botId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const botId = typeof body.botId === "string" ? body.botId : "";
  // راهنما: این شرط بررسی می‌کند آیا «!botId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!botId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بازوی بله مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بازوی بله مشخص نشده است." }, 400);

  // راهنما: این دستور متغیر/ثابت «bot» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let bot: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bot = await ownedBot(admin, workspaceId, botId)». */ bot = await ownedBot(admin, workspaceId, botId); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بررسی مالکیت بازو انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بررسی مالکیت بازو انجام نشد." }, 500); }
  // راهنما: این شرط بررسی می‌کند آیا «!bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!bot) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "این بازو متعلق به Workspace شما نیست." }, 403)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "این بازو متعلق به Workspace شما نیست." }, 403);

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این شرط بررسی می‌کند آیا «action === "update_welcome"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "update_welcome") {
      // راهنما: این شرط بررسی می‌کند آیا «typeof body.welcomeMessage !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (typeof body.welcomeMessage !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "پیام خوش‌آمد معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "پیام خوش‌آمد معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «welcomeMessage» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const welcomeMessage = body.welcomeMessage.trim();
      // راهنما: این شرط بررسی می‌کند آیا «!welcomeMessage || welcomeMessage.length > 4000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!welcomeMessage || welcomeMessage.length > 4000) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "پیام خوش‌آمد باید بین ۱ تا ۴۰۰۰ کاراکتر باشد."…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "پیام خوش‌آمد باید بین ۱ تا ۴۰۰۰ کاراکتر باشد." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BaleBot").update({ welcomeMessage, updatedAt: new Date().toISOString() }).eq("id", bot.id).eq("workspaceId", workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`welcome:${error.message}`);
    } else /* راهنما: این شرط بررسی می‌کند آیا «action === "create_button"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (action === "create_button") {
      // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const title = cleanTitle(body.title);
      // راهنما: این دستور متغیر/ثابت «actionType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const actionType = cleanActionType(body.actionType);
      // راهنما: این شرط بررسی می‌کند آیا «!title || !actionType» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!title || !actionType) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «parentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const parentId = await ensureParent(admin, bot.id, body.parentId);
      // راهنما: این دستور متغیر/ثابت «actionValue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const actionValue = cleanActionValue(actionType, body.actionValue);
      // راهنما: این دستور متغیر/ثابت «query» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      let query = admin.from("BaleButton").select("sortOrder").eq("botId", bot.id);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «query = parentId === null ? query.is("parentId", null) : query.eq("parentId", parentId)».
      query = parentId === null ? query.is("parentId", null) : query.eq("parentId", parentId);
      // راهنما: این دستور متغیر/ثابت «{ data: last }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: last } = await query.order("sortOrder", { ascending: false }).limit(1);
      // راهنما: این دستور متغیر/ثابت «sortOrder» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const sortOrder = Number(last?.[0]?.sortOrder ?? 0) + 10;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BaleButton").insert({ id: crypto.randomUUID(), botId: bot.id, parentId, title, actionType, actionValue, sortOrder });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`create_button:${error.message}`);
    } else /* راهنما: این شرط بررسی می‌کند آیا «action === "update_button"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (action === "update_button") {
      // راهنما: این دستور متغیر/ثابت «buttonId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const buttonId = typeof body.buttonId === "string" ? body.buttonId : "";
      // راهنما: این شرط بررسی می‌کند آیا «!buttonId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!buttonId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دکمه مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دکمه مشخص نشده است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: current, error: currentError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: current, error: currentError } = await admin.from("BaleButton").select("id,botId,title,actionType,actionValue,parentId,sortOrder").eq("id", buttonId).eq("botId", bot.id).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «currentError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (currentError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`button:${currentError.message}`);
      // راهنما: این شرط بررسی می‌کند آیا «!current» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!current) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دکمه پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دکمه پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «title» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const title = body.title === undefined ? current.title : cleanTitle(body.title);
      // راهنما: این دستور متغیر/ثابت «actionType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const actionType = body.actionType === undefined ? current.actionType : cleanActionType(body.actionType);
      // راهنما: این شرط بررسی می‌کند آیا «!title || !actionType» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!title || !actionType) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «parentId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const parentId = body.parentId === undefined ? current.parentId : await ensureParent(admin, bot.id, body.parentId, buttonId);
      // راهنما: این دستور متغیر/ثابت «actionValue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const actionValue = body.actionValue === undefined ? current.actionValue : cleanActionValue(actionType, body.actionValue);
      // راهنما: این دستور متغیر/ثابت «sortOrder» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const sortOrder = body.sortOrder === undefined ? Number(current.sortOrder) : Number(body.sortOrder);
      // راهنما: این شرط بررسی می‌کند آیا «!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ترتیب دکمه معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ترتیب دکمه معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BaleButton").update({ title, actionType, actionValue, parentId, sortOrder }).eq("id", buttonId).eq("botId", bot.id);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`update_button:${error.message}`);
    } else /* راهنما: این شرط بررسی می‌کند آیا «action === "delete_button"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (action === "delete_button") {
      // راهنما: این دستور متغیر/ثابت «buttonId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const buttonId = typeof body.buttonId === "string" ? body.buttonId : "";
      // راهنما: این شرط بررسی می‌کند آیا «!buttonId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!buttonId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دکمه مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دکمه مشخص نشده است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: current, error: currentError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: current, error: currentError } = await admin.from("BaleButton").select("id").eq("id", buttonId).eq("botId", bot.id).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «currentError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (currentError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`button:${currentError.message}`);
      // راهنما: این شرط بررسی می‌کند آیا «!current» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!current) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دکمه پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دکمه پیدا نشد." }, 404);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("BaleButton").update({ parentId: null }).eq("botId", bot.id).eq("parentI…».
      await admin.from("BaleButton").update({ parentId: null }).eq("botId", bot.id).eq("parentId", buttonId);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BaleButton").delete().eq("id", buttonId).eq("botId", bot.id);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`delete_button:${error.message}`);
    } else /* راهنما: این شرط بررسی می‌کند آیا «action === "reorder"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (action === "reorder") {
      // راهنما: این شرط بررسی می‌کند آیا «!Array.isArray(body.buttonIds)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!Array.isArray(body.buttonIds)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «ids» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ids = body.buttonIds.filter((value): value is string => typeof value === "string");
      // راهنما: این شرط بررسی می‌کند آیا «!ids.length || ids.length > 100 || new Set(ids).size !== ids.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!ids.length || ids.length > 100 || new Set(ids).size !== ids.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: owned, error: ownedError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: owned, error: ownedError } = await admin.from("BaleButton").select("id").eq("botId", bot.id).in("id", ids);
      // راهنما: این شرط بررسی می‌کند آیا «ownedError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (ownedError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`reorder_read:${ownedError.message}`);
      // راهنما: این شرط بررسی می‌کند آیا «(owned ?? []).length !== ids.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if ((owned ?? []).length !== ids.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "یکی از دکمه‌ها متعلق به این بازو نیست." }, 403)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "یکی از دکمه‌ها متعلق به این بازو نیست." }, 403);
      // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
      for (let index = 0; index < ids.length; index += 1) {
        // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const { error } = await admin.from("BaleButton").update({ sortOrder: (index + 1) * 10 }).eq("id", ids[index]).eq("botId", bot.id);
        // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`reorder:${error.message}`);
      }
    } else {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات پشتیبانی نمی‌شود." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "عملیات پشتیبانی نمی‌شود." }, 400);
    }

    // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const result = await loadBotBuilder(admin, workspaceId, bot.id);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, ...result })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: true, ...result });
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale builder write failed", error)».
    console.error("bale builder write failed", error);
    // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const text = String(error);
    // راهنما: این دستور متغیر/ثابت «message» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const message = text.includes("invalid_url")
      ? "آدرس URL معتبر نیست."
      : text.includes("invalid_parent")
        ? "زیرمنوی انتخاب‌شده معتبر نیست."
        : "ذخیره تنظیمات بازوی بله انجام نشد.";
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message }, 400);
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
