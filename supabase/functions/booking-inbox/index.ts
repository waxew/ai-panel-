import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
async function userFromRequest(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return null;
  const { data, error } = await admin.auth.getUser(jwt);
  return error ? null : data.user;
}
async function contextForUser(userId: string) {
  const { data: memberships, error } = await admin.from("WorkspaceMember").select("workspaceId,role").eq("userId", userId).limit(1);
  if (error) throw error;
  const membership = memberships?.[0] as { workspaceId?: string; role?: string } | undefined;
  if (!membership?.workspaceId) return null;
  const role = String(membership.role ?? "");
  if (role === "ADMIN" || role === "SUPER_ADMIN") return { workspaceId: membership.workspaceId, role, isAdmin: true };
  const { data: access, error: accessError } = await admin.from("BookingStaffAccess").select("isEnabled,permissions").eq("workspaceId", membership.workspaceId).eq("userId", userId).maybeSingle();
  if (accessError) throw accessError;
  const permissions = (access?.permissions ?? {}) as Record<string, unknown>;
  if (!access?.isEnabled || (permissions.customers !== true && permissions.automations !== true)) return { workspaceId: membership.workspaceId, role, isAdmin: false, denied: true };
  return { workspaceId: membership.workspaceId, role, isAdmin: false };
}
async function dashboard(workspaceId: string) {
  const [inboxResult, outboxResult, customerResult, smsAccountResult] = await Promise.all([
    admin.from("BookingInboxMessage").select("id,source,customerId,name,phone,email,subject,body,status,priority,handledByUserId,handledAt,createdAt,updatedAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(150),
    admin.from("BookingMessageOutbox").select("id,customerId,appointmentId,ruleId,channel,recipient,body,scheduledFor,status,attempts,providerMessageId,lastError,createdAt,sentAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(250),
    admin.from("BookingCustomer").select("id,fullName,phone,email,isVip").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(500),
    admin.from("BookingSmsAccount").select("provider,status,senderNumber,balanceMessages,bulkBalanceMessages,subscriptionEndsAt").eq("workspaceId", workspaceId).maybeSingle(),
  ]);
  const firstError = [inboxResult, outboxResult, customerResult, smsAccountResult].map((x: any) => x.error).find(Boolean);
  if (firstError) throw firstError;
  const inbound = inboxResult.data ?? [];
  const outbound = outboxResult.data ?? [];
  const customers = customerResult.data ?? [];
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

Deno.serve(async (request) => {
  const user = await userFromRequest(request);
  if (!user) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  let ctx;
  try { ctx = await contextForUser(user.id); }
  catch (error) { console.error("message center context failed", error); return json({ ok: false, message: "دسترسی مرکز پیام بررسی نشد." }, 500); }
  if (!ctx) return json({ ok: false, message: "Workspace پیدا نشد." }, 404);
  if (ctx.denied) return json({ ok: false, message: "دسترسی به مرکز پیام برای این حساب فعال نیست." }, 403);

  if (request.method === "GET") {
    try { return json(await dashboard(ctx.workspaceId)); }
    catch (error) { console.error("message center dashboard failed", error); return json({ ok: false, message: "اطلاعات مرکز پیام دریافت نشد." }, 500); }
  }
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = String(body?.action ?? "");
  const now = new Date().toISOString();
  try {
    if (action === "inbound_status") {
      const id = String(body.id ?? "");
      const status = String(body.status ?? "");
      if (!["NEW","OPEN","DONE","ARCHIVED","SPAM"].includes(status)) return json({ ok: false, message: "وضعیت معتبر نیست." }, 400);
      const patch: Record<string, unknown> = { status, updatedAt: now };
      if (["DONE","ARCHIVED","SPAM"].includes(status)) { patch.handledByUserId = user.id; patch.handledAt = now; }
      const { error } = await admin.from("BookingInboxMessage").update(patch).eq("id", id).eq("workspaceId", ctx.workspaceId);
      if (error) throw error;
      return json(await dashboard(ctx.workspaceId));
    }
    if (action === "inbound_priority") {
      const id = String(body.id ?? "");
      const priority = String(body.priority ?? "");
      if (!["LOW","NORMAL","HIGH","URGENT"].includes(priority)) return json({ ok: false, message: "اولویت معتبر نیست." }, 400);
      const { error } = await admin.from("BookingInboxMessage").update({ priority, updatedAt: now }).eq("id", id).eq("workspaceId", ctx.workspaceId);
      if (error) throw error;
      return json(await dashboard(ctx.workspaceId));
    }
    if (action === "cancel_outbound") {
      const id = String(body.id ?? "");
      const { data: message, error: loadError } = await admin.from("BookingMessageOutbox").select("id,status").eq("id", id).eq("workspaceId", ctx.workspaceId).maybeSingle();
      if (loadError) throw loadError;
      if (!message) return json({ ok: false, message: "پیام پیدا نشد." }, 404);
      if (message.status !== "PENDING") return json({ ok: false, message: "فقط پیام در انتظار ارسال قابل لغو است." }, 409);
      const { error } = await admin.from("BookingMessageOutbox").update({ status: "CANCELLED" }).eq("id", id).eq("workspaceId", ctx.workspaceId).eq("status", "PENDING");
      if (error) throw error;
      return json(await dashboard(ctx.workspaceId));
    }
    return json({ ok: false, message: "Action ناشناخته است." }, 400);
  } catch (error) {
    console.error("message center action failed", error);
    return json({ ok: false, message: "عملیات مرکز پیام انجام نشد." }, 500);
  }
});