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

// راهنما: این تابع «workspaceForUser» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function workspaceForUser(admin: any, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`membership:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.[0]?.workspaceId as string | undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data?.[0]?.workspaceId as string | undefined;
}

// راهنما: این تابع «storeForWorkspace» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function storeForWorkspace(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("Store").select("id,name,currency,status").eq("workspaceId", workspaceId).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`store:${error.message}`);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data ?? null;
}

// راهنما: این تابع «readOrders» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function readOrders(admin: any, store: any) {
  // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!store) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, store: null, orders: [], summary: { total: 0, awaitingPayment:…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return { ok: true, store: null, orders: [], summary: { total: 0, awaitingPayment: 0, paid: 0, processing: 0, completed: 0, cancelled: 0, refunded: 0 } };
  }

  // راهنما: این دستور متغیر/ثابت «[ordersResult, totalResult, awaitingResult, …» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
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

  // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const firstError = [ordersResult, totalResult, awaitingResult, paidResult, processingResult, completedResult, cancelledResult, refundedResult].map((x) => x.error).find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (firstError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`orders:${firstError.message}`);

  // راهنما: این دستور متغیر/ثابت «orders» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const orders = ordersResult.data ?? [];
  // راهنما: این دستور متغیر/ثابت «orderIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const orderIds = orders.map((order: any) => order.id);
  // راهنما: این دستور متغیر/ثابت «customerIds» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const customerIds = [...new Set(orders.map((order: any) => order.customerId).filter(Boolean))];

  // راهنما: این دستور متغیر/ثابت «[itemsResult, customersResult, reservationsR…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [itemsResult, customersResult, reservationsResult] = await Promise.all([
    orderIds.length
      ? admin.from("StoreOrderItem").select("id,orderId,itemId,titleSnapshot,skuSnapshot,unitPriceAmount,quantity,lineTotalAmount,metadata,createdAt").in("orderId", orderIds).order("createdAt", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    customerIds.length
      ? admin.from("StoreCustomer").select("id,platform,externalUserId,username,displayName,phone,lastSeenAt,createdAt").in("id", customerIds)
      : Promise.resolve({ data: [], error: null }),
    orderIds.length
      ? admin.from("StoreInventoryReservation").select("orderId,status,expiresAt,quantity").in("orderId", orderIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  // راهنما: این شرط بررسی می‌کند آیا «itemsResult.error || customersResult.error || reservationsResult.error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (itemsResult.error || customersResult.error || reservationsResult.error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(`order_details:${itemsResult.error?.message ?? customersResult.error?.message ?? reservationsResult.error?.message}`);

  // راهنما: این دستور متغیر/ثابت «itemsByOrder» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const itemsByOrder = new Map<string, any[]>();
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const item of itemsResult.data ?? []) {
    // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const current = itemsByOrder.get(item.orderId) ?? [];
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «current.push(item)».
    current.push(item);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «itemsByOrder.set(item.orderId, current)».
    itemsByOrder.set(item.orderId, current);
  }
  // راهنما: این دستور متغیر/ثابت «customersById» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const customersById = new Map((customersResult.data ?? []).map((customer: any) => [customer.id, customer]));
  // راهنما: این دستور متغیر/ثابت «reservationsByOrder» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const reservationsByOrder = new Map<string, { status: string; expiresAt: string | null; quantity: number }>();
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (const reservation of reservationsResult.data ?? []) {
    // راهنما: این دستور متغیر/ثابت «current» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const current = reservationsByOrder.get(reservation.orderId);
    // راهنما: این دستور متغیر/ثابت «quantity» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const quantity = Number(reservation.quantity ?? 0);
    // راهنما: این دستور متغیر/ثابت «status» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const status = reservation.status === "RESERVED" ? "RESERVED" : current?.status ?? reservation.status;
    // راهنما: این دستور متغیر/ثابت «expiresAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const expiresAt = reservation.status === "RESERVED" && reservation.expiresAt
      ? (!current?.expiresAt || new Date(reservation.expiresAt).getTime() < new Date(current.expiresAt).getTime() ? reservation.expiresAt : current.expiresAt)
      : current?.expiresAt ?? null;
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «reservationsByOrder.set(reservation.orderId, { status, expiresAt, quantity: (current?.qua…».
    reservationsByOrder.set(reservation.orderId, { status, expiresAt, quantity: (current?.quantity ?? 0) + quantity });
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ ok: true, store, orders: orders.map((order: any) => ({ ...order, custome…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    ok: true,
    store,
    orders: orders.map((order: any) => ({
      ...order,
      customer: order.customerId ? customersById.get(order.customerId) ?? null : null,
      items: itemsByOrder.get(order.id) ?? [],
      inventoryReservation: reservationsByOrder.get(order.id) ?? null,
    })),
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

// راهنما: این تابع «allowedTransition» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function allowedTransition(from: string, to: string) {
  // راهنما: این دستور متغیر/ثابت «allowed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const allowed: Record<string, string[]> = {
    NEW: ["AWAITING_PAYMENT", "CANCELLED"],
    AWAITING_PAYMENT: ["CANCELLED"],
    PAID: ["PROCESSING"],
    PROCESSING: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(allowed[from] ?? []).includes(to)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return (allowed[from] ?? []).includes(to);
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
  // راهنما: این دستور متغیر/ثابت «store» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let store: any;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «workspaceId = await workspaceForUser(admin, userId)».
    workspaceId = await workspaceForUser(admin, userId);
    // راهنما: این شرط بررسی می‌کند آیا «!workspaceId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!workspaceId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «store = await storeForWorkspace(admin, workspaceId)».
    store = await storeForWorkspace(admin, workspaceId);
  } catch (error) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("store orders context failed", error)».
    console.error("store orders context failed", error);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500);
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method === "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method === "GET") {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readOrders(admin, store))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json(await readOrders(admin, store)); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("store orders read failed", error)». */ console.error("store orders read failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "سفارش‌ها قابل دریافت نیستند." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "سفارش‌ها قابل دریافت نیستند." }, 500); }
  }

  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);
  // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!store) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409);

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: Record<string, unknown>;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()». */ body = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "درخواست معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }

  // راهنما: این دستور متغیر/ثابت «action» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const action = typeof body.action === "string" ? body.action : "";
  // راهنما: این دستور متغیر/ثابت «orderId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  // راهنما: این شرط بررسی می‌کند آیا «!orderId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!orderId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "سفارش مشخص نشده است." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "سفارش مشخص نشده است." }, 400);

  // راهنما: این دستور متغیر/ثابت «{ data: order, error: orderError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: order, error: orderError } = await admin.from("StoreOrder").select("id,status,note").eq("id", orderId).eq("storeId", store.id).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «orderError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (orderError) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "بررسی سفارش انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "بررسی سفارش انجام نشد." }, 500);
  // راهنما: این شرط بررسی می‌کند آیا «!order» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!order) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "سفارش پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "سفارش پیدا نشد." }, 404);

  // راهنما: این شرط بررسی می‌کند آیا «action === "update_note"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "update_note") {
    // راهنما: این شرط بررسی می‌کند آیا «typeof body.note !== "string"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (typeof body.note !== "string") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "یادداشت معتبر نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "یادداشت معتبر نیست." }, 400);
    // راهنما: این دستور متغیر/ثابت «note» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const note = body.note.trim().slice(0, 2000) || null;
    // راهنما: این دستور متغیر/ثابت «{ error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { error } = await admin.from("StoreOrder").update({ note, updatedAt: new Date().toISOString() }).eq("id", order.id).eq("storeId", store.id);
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ذخیره یادداشت انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ذخیره یادداشت انجام نشد." }, 500);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readOrders(admin, store))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json(await readOrders(admin, store));
  }

  // راهنما: این شرط بررسی می‌کند آیا «action === "transition"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (action === "transition") {
    // راهنما: این دستور متغیر/ثابت «nextStatus» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const nextStatus = typeof body.status === "string" ? body.status.toUpperCase() : "";
    // راهنما: این شرط بررسی می‌کند آیا «!allowedTransition(order.status, nextStatus)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!allowedTransition(order.status, nextStatus)) {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "این تغییر وضعیت مجاز نیست. وضعیت PAID و REFUND…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, message: "این تغییر وضعیت مجاز نیست. وضعیت PAID و REFUNDED فقط باید توسط جریان پرداخت معتبر تغییر کنند." }, 409);
    }

    // راهنما: این شرط بررسی می‌کند آیا «nextStatus === "CANCELLED"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (nextStatus === "CANCELLED") {
      // راهنما: این دستور متغیر/ثابت «{ error: cancelError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { error: cancelError } = await admin.rpc("store_cancel_order", { p_store_id: store.id, p_order_id: order.id });
      // راهنما: این شرط بررسی می‌کند آیا «cancelError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (cancelError) {
        // راهنما: این دستور متغیر/ثابت «conflict» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const conflict = cancelError.message?.includes("invalid_transition");
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: conflict ? "وضعیت سفارش هم‌زمان تغییر کرده است.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return json({ ok: false, message: conflict ? "وضعیت سفارش هم‌زمان تغییر کرده است. صفحه را تازه کنید و دوباره بررسی کنید." : "لغو سفارش و آزادسازی موجودی انجام نشد." }, conflict ? 409 : 500);
      }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readOrders(admin, store))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json(await readOrders(admin, store));
    }

    // راهنما: این دستور متغیر/ثابت «{ data: transitioned, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: transitioned, error } = await admin.from("StoreOrder")
      .update({ status: nextStatus, updatedAt: new Date().toISOString() })
      .eq("id", order.id)
      .eq("storeId", store.id)
      .eq("status", order.status)
      .select("id,status")
      .maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (error) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "تغییر وضعیت سفارش انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "تغییر وضعیت سفارش انجام نشد." }, 500);
    // راهنما: این شرط بررسی می‌کند آیا «!transitioned» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!transitioned) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "وضعیت سفارش هم‌زمان تغییر کرده است. صفحه را تا…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "وضعیت سفارش هم‌زمان تغییر کرده است. صفحه را تازه کنید و دوباره بررسی کنید." }, 409);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json(await readOrders(admin, store))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json(await readOrders(admin, store));
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
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
