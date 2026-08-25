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

// راهنما: این دستور متغیر/ثابت «triggerTypes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const triggerTypes = new Set(["COMMENT_KEYWORD", "DM_KEYWORD", "STORY_REPLY"]);
// راهنما: این دستور متغیر/ثابت «META_APP_ID_SECRET» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const META_APP_ID_SECRET = "meta_app_id";
// راهنما: این دستور متغیر/ثابت «META_APP_SECRET_SECRET» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const META_APP_SECRET_SECRET = "meta_app_secret";
// راهنما: این دستور متغیر/ثابت «META_OWNER_SECRET» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const META_OWNER_SECRET = "meta_platform_owner_workspace";

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
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

// راهنما: این تابع «cleanString» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanString(value: unknown, max: number) {
  // راهنما: این شرط بررسی می‌کند آیا «typeof value !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (typeof value !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «""» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return "";
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «value.trim().slice(0, max)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return value.trim().slice(0, max);
}

// راهنما: این تابع «cleanKeywords» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function cleanKeywords(value: unknown) {
  // راهنما: این دستور متغیر/ثابت «raw» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,،]+/) : [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[...new Set(raw.map((item) => typeof item === "string" ? item.trim().toLoc…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return [...new Set(raw.map((item) => typeof item === "string" ? item.trim().toLocaleLowerCase("fa") : "").filter(Boolean))].slice(0, 30);
}

// راهنما: این تابع «readSecrets» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readSecrets(admin: any, ids: string[]) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("AppSecret").select("id,value").in("id", ids);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`secret_read:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Map((data ?? []).map((row: any) => [row.id as string, row.value as str…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return new Map((data ?? []).map((row: any) => [row.id as string, row.value as string]));
}

// راهنما: این تابع «maskAppId» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function maskAppId(value: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این شرط بررسی می‌کند آیا «value.length <= 6» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (value.length <= 6) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${value.slice(0, 2)}••••`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${value.slice(0, 2)}••••`;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${value.slice(0, 4)}••••${value.slice(-3)}`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${value.slice(0, 4)}••••${value.slice(-3)}`;
}

// راهنما: این تابع «readPlatformConfig» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readPlatformConfig(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «secrets» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const secrets = await readSecrets(admin, [META_APP_ID_SECRET, META_APP_SECRET_SECRET, META_OWNER_SECRET]);
  // راهنما: این دستور متغیر/ثابت «appId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const appId = secrets.get(META_APP_ID_SECRET) ?? "";
  // راهنما: این دستور متغیر/ثابت «appSecret» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const appSecret = secrets.get(META_APP_SECRET_SECRET) ?? "";
  // راهنما: این دستور متغیر/ثابت «ownerWorkspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const ownerWorkspaceId = secrets.get(META_OWNER_SECRET) ?? "";
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ configured: Boolean(appId && appSecret), editable: !ownerWorkspaceId || …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    configured: Boolean(appId && appSecret),
    editable: !ownerWorkspaceId || ownerWorkspaceId === workspaceId,
    ownedByThisWorkspace: Boolean(ownerWorkspaceId && ownerWorkspaceId === workspaceId),
    appIdMasked: maskAppId(appId),
  };
}

// راهنما: این تابع «readDashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readDashboard(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «[accountsResult, rulesResult, eventsResult, …» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [accountsResult, rulesResult, eventsResult, platform] = await Promise.all([
    admin.from("InstagramAccount")
      .select("id,username,displayName,followersCount,followingCount,postsCount,engagementRate,metrics,status,lastSyncedAt,metaAccountId,pageId,permissions,webhookSubscribed,createdAt,updatedAt")
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: false }),
    admin.from("InstagramAutomationRule")
      .select("id,instagramAccountId,name,triggerType,triggerConfig,actionType,actionConfig,isActive,executions,lastTriggeredAt,createdAt,updatedAt")
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: false }),
    admin.from("InstagramAutomationEvent")
      .select("id,instagramAccountId,ruleId,eventType,sourceUsername,sourceText,outcome,metadata,createdAt")
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: false })
      .limit(50),
    readPlatformConfig(admin, workspaceId),
  ]);

  // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const firstError = [accountsResult.error, rulesResult.error, eventsResult.error].find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (firstError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`instagram_dashboard:${firstError.message}`);

  // راهنما: این دستور متغیر/ثابت «accounts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const accounts = accountsResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «rules» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rules = rulesResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «events» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const events = eventsResult.data ?? [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, accounts, rules, events, platform, connection: { configured: a…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    accounts,
    rules,
    events,
    platform,
    connection: {
      configured: accounts.some((account: any) => Boolean(account.metaAccountId)),
      webhookReady: accounts.some((account: any) => Boolean(account.webhookSubscribed)),
      provider: "META_INSTAGRAM_GRAPH_API",
    },
    summary: {
      accounts: accounts.length,
      activeAccounts: accounts.filter((account: any) => account.status === "ACTIVE").length,
      rules: rules.length,
      activeRules: rules.filter((rule: any) => rule.isActive).length,
      executions: rules.reduce((sum: number, rule: any) => sum + Number(rule.executions ?? 0), 0),
      sent: events.filter((event: any) => event.outcome === "SENT").length,
      failed: events.filter((event: any) => event.outcome === "FAILED").length,
    },
  };
}

// راهنما: این تابع «ownedAccount» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ownedAccount(admin: any, workspaceId: string, accountId: string | null) {
  // راهنما: این شرط بررسی می‌کند آیا «!accountId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!accountId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("InstagramAccount").select("id,status,metaAccountId,webhookSubscribed").eq("id", accountId).eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`account:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
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
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await readDashboard(admin, workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("instagram dashboard read failed", error)». */ console.error("instagram dashboard read failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات اینستاگرام دریافت نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات اینستاگرام دریافت نشد." }, 500); }
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: Record<string, unknown>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = cleanString(body.action, 40);

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این شرط بررسی می‌کند آیا «action === "save_platform_config"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "save_platform_config") {
      // راهنما: این دستور متغیر/ثابت «appId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const appId = cleanString(body.appId, 80);
      // راهنما: این دستور متغیر/ثابت «appSecret» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const appSecret = cleanString(body.appSecret, 256);
      // راهنما: این شرط بررسی می‌کند آیا «!/^\d{5,80}$/.test(appId)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!/^\d{5,80}$/.test(appId)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Meta App ID معتبر وارد کنید." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Meta App ID معتبر وارد کنید." }, 400);
      // راهنما: این شرط بررسی می‌کند آیا «appSecret.length < 16» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (appSecret.length < 16) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Meta App Secret معتبر وارد کنید." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Meta App Secret معتبر وارد کنید." }, 400);

      // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const current = await readSecrets(admin, [META_OWNER_SECRET]);
      // راهنما: این دستور متغیر/ثابت «ownerWorkspaceId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ownerWorkspaceId = current.get(META_OWNER_SECRET) ?? "";
      // راهنما: این شرط بررسی می‌کند آیا «ownerWorkspaceId && ownerWorkspaceId !== workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (ownerWorkspaceId && ownerWorkspaceId !== workspaceId) {
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "تنظیمات Meta متعلق به Workspace مدیر پلتفرم اس…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return json({ ok: false, message: "تنظیمات Meta متعلق به Workspace مدیر پلتفرم است و قابل تغییر نیست." }, 403);
      }

      // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const rows = [
        { id: META_APP_ID_SECRET, value: appId },
        { id: META_APP_SECRET_SECRET, value: appSecret },
        { id: META_OWNER_SECRET, value: workspaceId },
      ];
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("AppSecret").upsert(rows, { onConflict: "id" });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`platform_config:${error.message}`);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...(await readDashboard(admin, workspaceId)), platformConfigSaved: …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...(await readDashboard(admin, workspaceId)), platformConfigSaved: true });
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "create_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "create_rule") {
      // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const name = cleanString(body.name, 120);
      // راهنما: این دستور متغیر/ثابت «triggerType» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const triggerType = cleanString(body.triggerType, 40).toUpperCase();
      // راهنما: این دستور متغیر/ثابت «keywords» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const keywords = cleanKeywords(body.keywords);
      // راهنما: این دستور متغیر/ثابت «message» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const message = cleanString(body.message, 1500);
      // راهنما: این دستور متغیر/ثابت «accountId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const accountId = cleanString(body.instagramAccountId, 160) || null;
      // راهنما: این دستور متغیر/ثابت «requestedActive» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const requestedActive = body.isActive === true;

      // راهنما: این شرط بررسی می‌کند آیا «!name» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!name) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نام قانون الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نام قانون الزامی است." }, 400);
      // راهنما: این شرط بررسی می‌کند آیا «!triggerTypes.has(triggerType)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!triggerTypes.has(triggerType)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "نوع Trigger معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "نوع Trigger معتبر نیست." }, 400);
      // راهنما: این شرط بررسی می‌کند آیا «(triggerType === "COMMENT_KEYWORD" || triggerType === "DM_KEYWORD") && !keyword…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if ((triggerType === "COMMENT_KEYWORD" || triggerType === "DM_KEYWORD") && !keywords.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حداقل یک کلمه یا عدد برای Trigger وارد کنید." …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حداقل یک کلمه یا عدد برای Trigger وارد کنید." }, 400);
      // راهنما: این شرط بررسی می‌کند آیا «!message» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!message) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "متن دایرکت الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "متن دایرکت الزامی است." }, 400);

      // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const account = await ownedAccount(admin, workspaceId, accountId);
      // راهنما: این شرط بررسی می‌کند آیا «accountId && !account» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (accountId && !account) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب اینستاگرام انتخاب‌شده متعلق به Workspace …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب اینستاگرام انتخاب‌شده متعلق به Workspace شما نیست." }, 403);
      // راهنما: این دستور متغیر/ثابت «canActivate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const canActivate = Boolean(account?.metaAccountId && account?.webhookSubscribed && account?.status === "ACTIVE");

      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("InstagramAutomationRule").insert({
        workspaceId,
        instagramAccountId: accountId,
        name,
        triggerType,
        triggerConfig: { keywords, match: "CONTAINS", caseSensitive: false },
        actionType: "SEND_DM",
        actionConfig: { message },
        isActive: requestedActive && canActivate,
      });
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`create_rule:${error.message}`);

      // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const result = await readDashboard(admin, workspaceId);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ...result, activationDeferred: requestedActive && !canActivate }, 2…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ...result, activationDeferred: requestedActive && !canActivate }, 201);
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "toggle_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "toggle_rule") {
      // راهنما: این دستور متغیر/ثابت «ruleId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ruleId = cleanString(body.ruleId, 160);
      // راهنما: این شرط بررسی می‌کند آیا «!ruleId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!ruleId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قانون مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قانون مشخص نشده است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ data: rule, error: readError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: rule, error: readError } = await admin.from("InstagramAutomationRule")
        .select("id,instagramAccountId,isActive")
        .eq("id", ruleId).eq("workspaceId", workspaceId).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «readError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (readError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`rule:${readError.message}`);
      // راهنما: این شرط بررسی می‌کند آیا «!rule» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!rule) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قانون پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قانون پیدا نشد." }, 404);
      // راهنما: این دستور متغیر/ثابت «nextActive» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const nextActive = typeof body.isActive === "boolean" ? body.isActive : !rule.isActive;
      // راهنما: این شرط بررسی می‌کند آیا «nextActive» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (nextActive) {
        // راهنما: این دستور متغیر/ثابت «account» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const account = await ownedAccount(admin, workspaceId, rule.instagramAccountId ?? null);
        // راهنما: این شرط بررسی می‌کند آیا «!account?.metaAccountId || !account.webhookSubscribed || account.status !== "AC…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (!account?.metaAccountId || !account.webhookSubscribed || account.status !== "ACTIVE") {
          // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "برای فعال‌سازی Rule ابتدا اتصال رسمی Meta و We…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
          return json({ ok: false, message: "برای فعال‌سازی Rule ابتدا اتصال رسمی Meta و Webhook همین حساب باید کامل شود." }, 409);
        }
      }
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("InstagramAutomationRule").update({ isActive: nextActive, updatedAt: new Date().toISOString() }).eq("id", ruleId).eq("workspaceId", workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`toggle_rule:${error.message}`);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "delete_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "delete_rule") {
      // راهنما: این دستور متغیر/ثابت «ruleId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const ruleId = cleanString(body.ruleId, 160);
      // راهنما: این شرط بررسی می‌کند آیا «!ruleId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!ruleId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "قانون مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "قانون مشخص نشده است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("InstagramAutomationRule").delete().eq("id", ruleId).eq("workspaceId", workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`delete_rule:${error.message}`);
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readDashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readDashboard(admin, workspaceId));
    }

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("instagram manage write failed", error)».
    console.error("instagram manage write failed", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره تنظیمات اینستاگرام انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "ذخیره تنظیمات اینستاگرام انجام نشد." }, 500);
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
