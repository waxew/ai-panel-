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
// راهنما: این تابع «contextForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function contextForUser(userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data: memberships, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: memberships, error } = await admin.from("WorkspaceMember").select("workspaceId,role").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این دستور متغیر/ثابت «membership» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const membership = memberships?.[0] as { workspaceId?: string; role?: string } | undefined;
  // راهنما: این شرط بررسی می‌کند آیا «!membership?.workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!membership?.workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این دستور متغیر/ثابت «role» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const role = String(membership.role ?? "");
  // راهنما: این شرط بررسی می‌کند آیا «role === "ADMIN" || role === "SUPER_ADMIN"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (role === "ADMIN" || role === "SUPER_ADMIN") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ workspaceId: membership.workspaceId, role, isAdmin: true }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { workspaceId: membership.workspaceId, role, isAdmin: true };
  // راهنما: این دستور متغیر/ثابت «{ data: access, error: accessError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: access, error: accessError } = await admin.from("BookingStaffAccess").select("isEnabled,permissions").eq("workspaceId", membership.workspaceId).eq("userId", userId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «accessError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (accessError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw accessError;
  // راهنما: این دستور متغیر/ثابت «permissions» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const permissions = (access?.permissions ?? {}) as Record<string, unknown>;
  // راهنما: این شرط بررسی می‌کند آیا «!access?.isEnabled || (permissions.customers !== true && permissions.automation…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!access?.isEnabled || (permissions.customers !== true && permissions.automations !== true)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ workspaceId: membership.workspaceId, role, isAdmin: false, denied: true }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return { workspaceId: membership.workspaceId, role, isAdmin: false, denied: true };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ workspaceId: membership.workspaceId, role, isAdmin: false }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return { workspaceId: membership.workspaceId, role, isAdmin: false };
}
// راهنما: این تابع «dashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function dashboard(workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «[inboxResult, outboxResult, customerResult, …» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [inboxResult, outboxResult, customerResult, smsAccountResult] = await Promise.all([
    admin.from("BookingInboxMessage").select("id,source,customerId,name,phone,email,subject,body,status,priority,handledByUserId,handledAt,createdAt,updatedAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(150),
    admin.from("BookingMessageOutbox").select("id,customerId,appointmentId,ruleId,channel,recipient,body,scheduledFor,status,attempts,providerMessageId,lastError,createdAt,sentAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(250),
    admin.from("BookingCustomer").select("id,fullName,phone,email,isVip").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(500),
    admin.from("BookingSmsAccount").select("provider,status,senderNumber,balanceMessages,bulkBalanceMessages,subscriptionEndsAt").eq("workspaceId", workspaceId).maybeSingle(),
  ]);
  // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const firstError = [inboxResult, outboxResult, customerResult, smsAccountResult].map((x: any) => x.error).find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (firstError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw firstError;
  // راهنما: این دستور متغیر/ثابت «inbound» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const inbound = inboxResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «outbound» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const outbound = outboxResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «customers» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const customers = customerResult.data ?? [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, inbound, outbound, customers, messaging: { smsAccount: smsAcco…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    inbound,
    outbound,
    customers,
    messaging: {
      smsAccount: smsAccountResult.data ?? null,
      channels: {
        SMS: { configured: smsAccountResult.data?.status === "CONNECTED" },
        WHATSAPP: { configured: false, note: "این کانال فقط برای ارسال پیام‌های CRM/نوبت‌دهی است و به ربات واتساپ پروژه متصل نیست." },
      },
    },
    summary: {
      inboundNew: inbound.filter((x: any) => x.status === "NEW").length,
      inboundOpen: inbound.filter((x: any) => x.status === "NEW" || x.status === "OPEN").length,
      outboundPending: outbound.filter((x: any) => x.status === "PENDING").length,
      outboundSent: outbound.filter((x: any) => x.status === "SENT").length,
      outboundFailed: outbound.filter((x: any) => x.status === "FAILED" || x.status === "BLOCKED").length,
      whatsappQueued: outbound.filter((x: any) => x.channel === "WHATSAPP").length,
      smsQueued: outbound.filter((x: any) => x.channel === "SMS").length,
    },
  };
}

// راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Deno.serve(async (request) => { const user = await userFromRequest(request); if (!user) r…».
Deno.serve(async (request) => {
  // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const user = await userFromRequest(request);
  // راهنما: این شرط بررسی می‌کند آیا «!user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  // راهنما: این دستور متغیر/ثابت «ctx» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let ctx;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «ctx = await contextForUser(user.id)». */ ctx = await contextForUser(user.id); }
  catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("message center context failed", error)». */ console.error("message center context failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسترسی مرکز پیام بررسی نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسترسی مرکز پیام بررسی نشد." }, 500); }
  // راهنما: این شرط بررسی می‌کند آیا «!ctx» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!ctx) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace پیدا نشد." }, 404);
  // راهنما: این شرط بررسی می‌کند آیا «ctx.denied» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (ctx.denied) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسترسی به مرکز پیام برای این حساب فعال نیست." …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسترسی به مرکز پیام برای این حساب فعال نیست." }, 403);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(ctx.workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await dashboard(ctx.workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("message center dashboard failed", error)». */ console.error("message center dashboard failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات مرکز پیام دریافت نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات مرکز پیام دریافت نشد." }, 500); }
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = String(body?.action ?? "");
  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = new Date().toISOString();
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این شرط بررسی می‌کند آیا «action === "inbound_status"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "inbound_status") {
      // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const id = String(body.id ?? "");
      // راهنما: این دستور متغیر/ثابت «status» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const status = String(body.status ?? "");
      // راهنما: این شرط بررسی می‌کند آیا «!["NEW","OPEN","DONE","ARCHIVED","SPAM"].includes(status)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!["NEW","OPEN","DONE","ARCHIVED","SPAM"].includes(status)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "وضعیت معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "وضعیت معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «patch» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const patch: Record<string, unknown> = { status, updatedAt: now };
      // راهنما: این شرط بررسی می‌کند آیا «["DONE","ARCHIVED","SPAM"].includes(status)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (["DONE","ARCHIVED","SPAM"].includes(status)) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.handledByUserId = user.id». */ patch.handledByUserId = user.id; /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «patch.handledAt = now». */ patch.handledAt = now; }
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingInboxMessage").update(patch).eq("id", id).eq("workspaceId", ctx.workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(ctx.workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(ctx.workspaceId));
    }
    // راهنما: این شرط بررسی می‌کند آیا «action === "inbound_priority"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "inbound_priority") {
      // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const id = String(body.id ?? "");
      // راهنما: این دستور متغیر/ثابت «priority» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const priority = String(body.priority ?? "");
      // راهنما: این شرط بررسی می‌کند آیا «!["LOW","NORMAL","HIGH","URGENT"].includes(priority)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!["LOW","NORMAL","HIGH","URGENT"].includes(priority)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اولویت معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اولویت معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingInboxMessage").update({ priority, updatedAt: now }).eq("id", id).eq("workspaceId", ctx.workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(ctx.workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(ctx.workspaceId));
    }
    // راهنما: این شرط بررسی می‌کند آیا «action === "cancel_outbound"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "cancel_outbound") {
      // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const id = String(body.id ?? "");
      // راهنما: این دستور متغیر/ثابت «{ data: message, error: loadError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: message, error: loadError } = await admin.from("BookingMessageOutbox").select("id,status").eq("id", id).eq("workspaceId", ctx.workspaceId).maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «loadError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (loadError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw loadError;
      // راهنما: این شرط بررسی می‌کند آیا «!message» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!message) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "پیام پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "پیام پیدا نشد." }, 404);
      // راهنما: این شرط بررسی می‌کند آیا «message.status !== "PENDING"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (message.status !== "PENDING") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فقط پیام در انتظار ارسال قابل لغو است." }, 409)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فقط پیام در انتظار ارسال قابل لغو است." }, 409);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingMessageOutbox").update({ status: "CANCELLED" }).eq("id", id).eq("workspaceId", ctx.workspaceId).eq("status", "PENDING");
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(ctx.workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(ctx.workspaceId));
    }
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Action ناشناخته است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "Action ناشناخته است." }, 400);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("message center action failed", error)».
    console.error("message center action failed", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات مرکز پیام انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "عملیات مرکز پیام انجام نشد." }, 500);
  }
});