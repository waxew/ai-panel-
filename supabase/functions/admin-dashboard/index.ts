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
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: corsHeaders })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: corsHeaders });
}

// راهنما: این دستور متغیر/ثابت «authenticated» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  // راهنما: این شرط بررسی می‌کند آیا «request.method !== "GET"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (request.method !== "GET") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "Method not allowed" }, 405)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "Method not allowed" }, 405);

  // راهنما: این دستور متغیر/ثابت «userId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const userId = ctx.userClaims?.id;
  // راهنما: این شرط بررسی می‌کند آیا «!userId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!userId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "ورود به حساب الزامی است." }, 401)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);

  // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const admin = ctx.supabaseAdmin;
  // راهنما: این دستور متغیر/ثابت «{ data: user, error: userError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: user, error: userError } = await admin.from("User").select("id,email,displayName,role").eq("id", userId).single();
  // راهنما: این شرط بررسی می‌کند آیا «userError || !user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (userError || !user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "حساب کاربری پیدا نشد." }, 404)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "حساب کاربری پیدا نشد." }, 404);
  // راهنما: این شرط بررسی می‌کند آیا «user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دسترسی مدیریت برای این حساب فعال نیست." }, 403)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, message: "دسترسی مدیریت برای این حساب فعال نیست." }, 403);

  // راهنما: این دستور متغیر/ثابت «[customers, subscriptions, waitingOrders, pa…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [customers, subscriptions, waitingOrders, paidOrders, stores, commerceRevenueRows, commercePaidCount, recentStoreOrders, activeBots, activeInstagram] = await Promise.all([
    admin.from("User").select("id", { count: "exact", head: true }).eq("role", "CUSTOMER"),
    admin.from("Subscription").select("id", { count: "exact", head: true }).in("status", ["ACTIVE", "TRIALING"]),
    admin.from("Order").select("id", { count: "exact", head: true }).eq("status", "WAITING_PAYMENT"),
    admin.from("Order").select("amount,currency").eq("status", "PAID"),
    admin.from("Store").select("id", { count: "exact", head: true }),
    admin.from("StoreOrder").select("totalAmount,currency").in("status", ["PAID", "PROCESSING", "COMPLETED"]),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).in("status", ["PAID", "PROCESSING", "COMPLETED"]),
    admin.from("StoreOrder").select("id,totalAmount,currency,status,createdAt").order("createdAt", { ascending: false }).limit(50),
    admin.from("TelegramBot").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    admin.from("InstagramAccount").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
  ]);

  // راهنما: این دستور متغیر/ثابت «firstError» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const firstError = [customers, subscriptions, waitingOrders, paidOrders, stores, commerceRevenueRows, commercePaidCount, recentStoreOrders, activeBots, activeInstagram].map((x) => x.error).find(Boolean);
  // راهنما: این شرط بررسی می‌کند آیا «firstError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (firstError) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("admin dashboard query failed", firstError)».
    console.error("admin dashboard query failed", firstError);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, message: "دریافت آمار مدیریت انجام نشد." }, 500)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, message: "دریافت آمار مدیریت انجام نشد." }, 500);
  }

  // راهنما: این دستور متغیر/ثابت «billingRevenue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const billingRevenue = (paidOrders.data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
  // راهنما: این دستور متغیر/ثابت «commerceRevenue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const commerceRevenue = (commerceRevenueRows.data ?? []).reduce((sum: number, row: any) => sum + Number(row.totalAmount ?? 0), 0);

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, user, summary: { customerCount: customers.count ?? 0, act…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({
    ok: true,
    user,
    summary: {
      customerCount: customers.count ?? 0,
      activeSubscriptions: subscriptions.count ?? 0,
      pendingOrders: waitingOrders.count ?? 0,
      billingRevenue,
      storeCount: stores.count ?? 0,
      commerceRevenue,
      commercePaidOrders: commercePaidCount.count ?? 0,
      activeTelegramBots: activeBots.count ?? 0,
      activeInstagramAccounts: activeInstagram.count ?? 0,
    },
    recentStoreOrders: recentStoreOrders.data ?? [],
  });
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
