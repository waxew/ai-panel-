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

async function workspaceForUser(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw new Error(`membership:${error.message}`);
  return data?.[0]?.workspaceId as string | undefined;
}

async function storeForWorkspace(admin: any, workspaceId: string) {
  const { data, error } = await admin.from("Store").select("id,name,currency,status").eq("workspaceId", workspaceId).maybeSingle();
  if (error) throw new Error(`store:${error.message}`);
  return data ?? null;
}

async function readOrders(admin: any, store: any) {
  if (!store) {
    return { ok: true, store: null, orders: [], summary: { total: 0, awaitingPayment: 0, paid: 0, processing: 0, completed: 0, cancelled: 0, refunded: 0 } };
  }

  const [ordersResult, totalResult, awaitingResult, paidResult, processingResult, completedResult, cancelledResult, refundedResult] = await Promise.all([
    admin.from("StoreOrder")
      .select("id,customerId,sourcePlatform,externalConversationId,status,subtotalAmount,discountAmount,totalAmount,currency,note,idempotencyKey,createdAt,updatedAt,paidAt")
      .eq("storeId", store.id)
      .order("createdAt", { ascending: false })
      .limit(100),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "AWAITING_PAYMENT"),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "PAID"),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "PROCESSING"),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "COMPLETED"),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "CANCELLED"),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).eq("status", "REFUNDED"),
  ]);

  const firstError = [ordersResult, totalResult, awaitingResult, paidResult, processingResult, completedResult, cancelledResult, refundedResult].map((x) => x.error).find(Boolean);
  if (firstError) throw new Error(`orders:${firstError.message}`);

  const orders = ordersResult.data ?? [];
  const orderIds = orders.map((order: any) => order.id);
  const customerIds = [...new Set(orders.map((order: any) => order.customerId).filter(Boolean))];

  const [itemsResult, customersResult] = await Promise.all([
    orderIds.length
      ? admin.from("StoreOrderItem").select("id,orderId,itemId,titleSnapshot,skuSnapshot,unitPriceAmount,quantity,lineTotalAmount,metadata,createdAt").in("orderId", orderIds).order("createdAt", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    customerIds.length
      ? admin.from("StoreCustomer").select("id,platform,externalUserId,username,displayName,phone,lastSeenAt,createdAt").in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (itemsResult.error || customersResult.error) throw new Error(`order_details:${itemsResult.error?.message ?? customersResult.error?.message}`);

  const itemsByOrder = new Map<string, any[]>();
  for (const item of itemsResult.data ?? []) {
    const current = itemsByOrder.get(item.orderId) ?? [];
    current.push(item);
    itemsByOrder.set(item.orderId, current);
  }
  const customersById = new Map((customersResult.data ?? []).map((customer: any) => [customer.id, customer]));

  return {
    ok: true,
    store,
    orders: orders.map((order: any) => ({ ...order, customer: order.customerId ? customersById.get(order.customerId) ?? null : null, items: itemsByOrder.get(order.id) ?? [] })),
    summary: {
      total: totalResult.count ?? 0,
      awaitingPayment: awaitingResult.count ?? 0,
      paid: paidResult.count ?? 0,
      processing: processingResult.count ?? 0,
      completed: completedResult.count ?? 0,
      cancelled: cancelledResult.count ?? 0,
      refunded: refundedResult.count ?? 0,
    },
  };
}

function allowedTransition(from: string, to: string) {
  const allowed: Record<string, string[]> = {
    NEW: ["AWAITING_PAYMENT", "CANCELLED"],
    AWAITING_PAYMENT: ["CANCELLED"],
    PAID: ["PROCESSING"],
    PROCESSING: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };
  return (allowed[from] ?? []).includes(to);
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const admin = ctx.supabaseAdmin;

  let workspaceId: string | undefined;
  let store: any;
  try {
    workspaceId = await workspaceForUser(admin, userId);
    if (!workspaceId) return json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404);
    store = await storeForWorkspace(admin, workspaceId);
  } catch (error) {
    console.error("store orders context failed", error);
    return json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500);
  }

  if (request.method === "GET") {
    try { return json(await readOrders(admin, store)); }
    catch (error) { console.error("store orders read failed", error); return json({ ok: false, message: "سفارش‌ها قابل دریافت نیستند." }, 500); }
  }

  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  if (!store) return json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }

  const action = typeof body.action === "string" ? body.action : "";
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!orderId) return json({ ok: false, message: "سفارش مشخص نشده است." }, 400);

  const { data: order, error: orderError } = await admin.from("StoreOrder").select("id,status,note").eq("id", orderId).eq("storeId", store.id).maybeSingle();
  if (orderError) return json({ ok: false, message: "بررسی سفارش انجام نشد." }, 500);
  if (!order) return json({ ok: false, message: "سفارش پیدا نشد." }, 404);

  if (action === "update_note") {
    if (typeof body.note !== "string") return json({ ok: false, message: "یادداشت معتبر نیست." }, 400);
    const note = body.note.trim().slice(0, 2000) || null;
    const { error } = await admin.from("StoreOrder").update({ note, updatedAt: new Date().toISOString() }).eq("id", order.id).eq("storeId", store.id);
    if (error) return json({ ok: false, message: "ذخیره یادداشت انجام نشد." }, 500);
    return json(await readOrders(admin, store));
  }

  if (action === "transition") {
    const nextStatus = typeof body.status === "string" ? body.status.toUpperCase() : "";
    if (!allowedTransition(order.status, nextStatus)) {
      return json({ ok: false, message: "این تغییر وضعیت مجاز نیست. وضعیت PAID و REFUNDED فقط باید توسط جریان پرداخت معتبر تغییر کنند." }, 409);
    }
    const { data: transitioned, error } = await admin.from("StoreOrder")
      .update({ status: nextStatus, updatedAt: new Date().toISOString() })
      .eq("id", order.id)
      .eq("storeId", store.id)
      .eq("status", order.status)
      .select("id,status")
      .maybeSingle();
    if (error) return json({ ok: false, message: "تغییر وضعیت سفارش انجام نشد." }, 500);
    if (!transitioned) return json({ ok: false, message: "وضعیت سفارش هم‌زمان تغییر کرده است. صفحه را تازه کنید و دوباره بررسی کنید." }, 409);
    return json(await readOrders(admin, store));
  }

  return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
});

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    const response = await authenticated(request);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, { status: response.status, headers });
  },
};
