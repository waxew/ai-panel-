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
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این تابع «firstWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function firstWorkspace(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}

// راهنما: این تابع «ensureDefaults» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ensureDefaults(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «defaults» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const defaults = [
    { type: "APPOINTMENT_REMINDER", name: "یادآوری نوبت", template: "سلام {name}، یادآوری نوبت شما برای {service} در تاریخ {date} ساعت {time}.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "10:00" },
    { type: "BIRTHDAY", name: "تبریک تولد", template: "{name} عزیز، تولدت مبارک. امیدواریم سال فوق‌العاده‌ای پیش رو داشته باشی.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "10:00" },
    { type: "WINBACK", name: "بازگشت مشتری", template: "{name} عزیز، مدتی است افتخار دیدارت را نداشتیم. برای رزرو نوبت جدید خوشحال می‌شویم دوباره کنارت باشیم.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "11:00" },
  ];
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const row of defaults) {
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("BookingAutomationRule").upsert({ workspaceId, channel: "SMS", isActive: false, ...row }, { onConflict: "workspaceId,type", ignoreDuplicates: true });
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  }
  // راهنما: این دستور متغیر/ثابت «{ error: smsError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { error: smsError } = await admin.from("BookingSmsAccount").upsert({ workspaceId }, { onConflict: "workspaceId", ignoreDuplicates: true });
  // راهنما: این شرط بررسی می‌کند آیا «smsError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (smsError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw smsError;
}

// راهنما: این تابع «dashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function dashboard(admin: any, workspaceId: string) {
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ensureDefaults(admin, workspaceId)».
  await ensureDefaults(admin, workspaceId);
  // راهنما: این دستور متغیر/ثابت «[rules, outbox, sms, customers]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [rules, outbox, sms, customers] = await Promise.all([
    admin.from("BookingAutomationRule").select("*").eq("workspaceId", workspaceId).order("createdAt", { ascending: true }),
    admin.from("BookingMessageOutbox").select("id,customerId,appointmentId,ruleId,channel,recipient,body,scheduledFor,status,attempts,lastError,createdAt,sentAt,BookingCustomer(fullName)").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(100),
    admin.from("BookingSmsAccount").select("*").eq("workspaceId", workspaceId).maybeSingle(),
    admin.from("BookingCustomer").select("id,fullName,phone,birthDate,marketingOptIn").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(200),
  ]);
  // راهنما: این دستور متغیر/ثابت «error» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const error = [rules.error, outbox.error, sms.error, customers.error].find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این دستور متغیر/ثابت «messages» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const messages = outbox.data ?? [];
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, rules: rules.data ?? [], outbox: messages, smsAccount: sms.dat…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    rules: rules.data ?? [],
    outbox: messages,
    smsAccount: sms.data ?? null,
    customers: customers.data ?? [],
    summary: {
      pending: messages.filter((x:any)=>x.status === "PENDING").length,
      sent: messages.filter((x:any)=>x.status === "SENT").length,
      failed: messages.filter((x:any)=>x.status === "FAILED").length,
      birthdays: (customers.data ?? []).filter((x:any)=>Boolean(x.birthDate)).length,
    },
  };
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
  const workspaceId = await firstWorkspace(admin, userId);
  // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "فضای کاری پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "فضای کاری پیدا نشد." }, 404);

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await dashboard(admin, workspaceId)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error(error)». */ console.error(error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات اتوماسیون در دسترس نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "اطلاعات اتوماسیون در دسترس نیست." }, 500); }
  }
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body:any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok:false, message:"درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok:false, message:"درخواست معتبر نیست." }, 400); }
  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = typeof body?.action === "string" ? body.action : "";

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ensureDefaults(admin, workspaceId)».
    await ensureDefaults(admin, workspaceId);

    // راهنما: این شرط بررسی می‌کند آیا «action === "save_rule"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "save_rule") {
      // راهنما: این دستور متغیر/ثابت «type» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const type = ["APPOINTMENT_REMINDER","BIRTHDAY","WINBACK"].includes(body.type) ? body.type : "";
      // راهنما: این شرط بررسی می‌کند آیا «!type» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!type) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok:false, message:"نوع اتوماسیون معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok:false, message:"نوع اتوماسیون معتبر نیست." }, 400);
      // راهنما: این دستور متغیر/ثابت «patch» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const patch:any = {
        isActive: body.isActive === true,
        channel: ["SMS","WHATSAPP"].includes(body.channel) ? body.channel : "SMS",
        template: typeof body.template === "string" ? body.template.trim().slice(0, 1000) : "",
        leadMinutes: Number(body.leadMinutes ?? 1440),
        daysAfterLastVisit: Number(body.daysAfterLastVisit ?? 60),
        sendTime: typeof body.sendTime === "string" ? body.sendTime : "10:00",
        updatedAt: new Date().toISOString(),
      };
      // راهنما: این شرط بررسی می‌کند آیا «!patch.template» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (!patch.template) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok:false, message:"متن پیام الزامی است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok:false, message:"متن پیام الزامی است." }, 400);
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingAutomationRule").update(patch).eq("workspaceId", workspaceId).eq("type", type);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(admin, workspaceId));
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "save_customer_birthday"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "save_customer_birthday") {
      // راهنما: این دستور متغیر/ثابت «customerId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const customerId = typeof body.customerId === "string" ? body.customerId : "";
      // راهنما: این دستور متغیر/ثابت «birthDate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const birthDate = typeof body.birthDate === "string" && body.birthDate ? body.birthDate : null;
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingCustomer").update({ birthDate, marketingOptIn: body.marketingOptIn !== false, updatedAt: new Date().toISOString() }).eq("id", customerId).eq("workspaceId", workspaceId);
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(admin, workspaceId));
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "generate_now"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "generate_now") {
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.rpc("booking_generate_due_messages");
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.log("manual generator unavailable via rpc", error.message)».
        console.log("manual generator unavailable via rpc", error.message);
      }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(admin, workspaceId));
    }

    // راهنما: این شرط بررسی می‌کند آیا «action === "cancel_message"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (action === "cancel_message") {
      // راهنما: این دستور متغیر/ثابت «id» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const id = typeof body.id === "string" ? body.id : "";
      // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error } = await admin.from("BookingMessageOutbox").update({ status: "CANCELLED" }).eq("id", id).eq("workspaceId", workspaceId).eq("status", "PENDING");
      // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await dashboard(admin, workspaceId))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await dashboard(admin, workspaceId));
    }

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok:false, message:"عملیات شناخته‌شده نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok:false, message:"عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("booking-automations", error)».
    console.error("booking-automations", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok:false, message:"عملیات اتوماسیون انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok:false, message:"عملیات اتوماسیون انجام نشد." }, 500);
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
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «Object.entries(corsHeaders).forEach(([key,value])=>headers.set(key,value))».
    Object.entries(corsHeaders).forEach(([key,value])=>headers.set(key,value));
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response(response.body, { status: response.status, headers })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return new Response(response.body, { status: response.status, headers });
  },
};
