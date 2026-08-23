import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

async function firstWorkspace(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw error;
  return data?.[0]?.workspaceId as string | undefined;
}

async function ensureDefaults(admin: any, workspaceId: string) {
  const defaults = [
    { type: "APPOINTMENT_REMINDER", name: "یادآوری نوبت", template: "سلام {name}، یادآوری نوبت شما برای {service} در تاریخ {date} ساعت {time}.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "10:00" },
    { type: "BIRTHDAY", name: "تبریک تولد", template: "{name} عزیز، تولدت مبارک. امیدواریم سال فوق‌العاده‌ای پیش رو داشته باشی.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "10:00" },
    { type: "WINBACK", name: "بازگشت مشتری", template: "{name} عزیز، مدتی است افتخار دیدارت را نداشتیم. برای رزرو نوبت جدید خوشحال می‌شویم دوباره کنارت باشیم.", leadMinutes: 1440, daysAfterLastVisit: 60, sendTime: "11:00" },
  ];
  for (const row of defaults) {
    const { error } = await admin.from("BookingAutomationRule").upsert({ workspaceId, channel: "SMS", isActive: false, ...row }, { onConflict: "workspaceId,type", ignoreDuplicates: true });
    if (error) throw error;
  }
  const { error: smsError } = await admin.from("BookingSmsAccount").upsert({ workspaceId }, { onConflict: "workspaceId", ignoreDuplicates: true });
  if (smsError) throw smsError;
}

async function dashboard(admin: any, workspaceId: string) {
  await ensureDefaults(admin, workspaceId);
  const [rules, outbox, sms, customers] = await Promise.all([
    admin.from("BookingAutomationRule").select("*").eq("workspaceId", workspaceId).order("createdAt", { ascending: true }),
    admin.from("BookingMessageOutbox").select("id,customerId,appointmentId,ruleId,channel,recipient,body,scheduledFor,status,attempts,lastError,createdAt,sentAt,BookingCustomer(fullName)").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(100),
    admin.from("BookingSmsAccount").select("*").eq("workspaceId", workspaceId).maybeSingle(),
    admin.from("BookingCustomer").select("id,fullName,phone,birthDate,marketingOptIn").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(200),
  ]);
  const error = [rules.error, outbox.error, sms.error, customers.error].find(Boolean);
  if (error) throw error;
  const messages = outbox.data ?? [];
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

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const admin = ctx.supabaseAdmin;
  const workspaceId = await firstWorkspace(admin, userId);
  if (!workspaceId) return json({ ok: false, message: "فضای کاری پیدا نشد." }, 404);

  if (request.method === "GET") {
    try { return json(await dashboard(admin, workspaceId)); }
    catch (error) { console.error(error); return json({ ok: false, message: "اطلاعات اتوماسیون در دسترس نیست." }, 500); }
  }
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body:any;
  try { body = await request.json(); } catch { return json({ ok:false, message:"درخواست معتبر نیست." }, 400); }
  const action = typeof body?.action === "string" ? body.action : "";

  try {
    await ensureDefaults(admin, workspaceId);

    if (action === "save_rule") {
      const type = ["APPOINTMENT_REMINDER","BIRTHDAY","WINBACK"].includes(body.type) ? body.type : "";
      if (!type) return json({ ok:false, message:"نوع اتوماسیون معتبر نیست." }, 400);
      const patch:any = {
        isActive: body.isActive === true,
        channel: ["SMS","WHATSAPP"].includes(body.channel) ? body.channel : "SMS",
        template: typeof body.template === "string" ? body.template.trim().slice(0, 1000) : "",
        leadMinutes: Number(body.leadMinutes ?? 1440),
        daysAfterLastVisit: Number(body.daysAfterLastVisit ?? 60),
        sendTime: typeof body.sendTime === "string" ? body.sendTime : "10:00",
        updatedAt: new Date().toISOString(),
      };
      if (!patch.template) return json({ ok:false, message:"متن پیام الزامی است." }, 400);
      const { error } = await admin.from("BookingAutomationRule").update(patch).eq("workspaceId", workspaceId).eq("type", type);
      if (error) throw error;
      return json(await dashboard(admin, workspaceId));
    }

    if (action === "save_customer_birthday") {
      const customerId = typeof body.customerId === "string" ? body.customerId : "";
      const birthDate = typeof body.birthDate === "string" && body.birthDate ? body.birthDate : null;
      const { error } = await admin.from("BookingCustomer").update({ birthDate, marketingOptIn: body.marketingOptIn !== false, updatedAt: new Date().toISOString() }).eq("id", customerId).eq("workspaceId", workspaceId);
      if (error) throw error;
      return json(await dashboard(admin, workspaceId));
    }

    if (action === "generate_now") {
      const { error } = await admin.rpc("booking_generate_due_messages");
      if (error) {
        console.log("manual generator unavailable via rpc", error.message);
      }
      return json(await dashboard(admin, workspaceId));
    }

    if (action === "cancel_message") {
      const id = typeof body.id === "string" ? body.id : "";
      const { error } = await admin.from("BookingMessageOutbox").update({ status: "CANCELLED" }).eq("id", id).eq("workspaceId", workspaceId).eq("status", "PENDING");
      if (error) throw error;
      return json(await dashboard(admin, workspaceId));
    }

    return json({ ok:false, message:"عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    console.error("booking-automations", error);
    return json({ ok:false, message:"عملیات اتوماسیون انجام نشد." }, 500);
  }
});

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    const response = await authenticated(request);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key,value])=>headers.set(key,value));
    return new Response(response.body, { status: response.status, headers });
  },
};
