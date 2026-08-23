import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method !== "GET") return json({ ok: false, message: "Method not allowed" }, 405);

  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);

  const admin = ctx.supabaseAdmin;
  const { data: user, error: userError } = await admin.from("User").select("id,email,displayName,role").eq("id", userId).single();
  if (userError || !user) return json({ ok: false, message: "حساب کاربری پیدا نشد." }, 404);
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return json({ ok: false, message: "دسترسی مدیریت برای این حساب فعال نیست." }, 403);

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

  const firstError = [customers, subscriptions, waitingOrders, paidOrders, stores, commerceRevenueRows, commercePaidCount, recentStoreOrders, activeBots, activeInstagram].map((x) => x.error).find(Boolean);
  if (firstError) {
    console.error("admin dashboard query failed", firstError);
    return json({ ok: false, message: "دریافت آمار مدیریت انجام نشد." }, 500);
  }

  const billingRevenue = (paidOrders.data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
  const commerceRevenue = (commerceRevenueRows.data ?? []).reduce((sum: number, row: any) => sum + Number(row.totalAmount ?? 0), 0);

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

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    const response = await authenticated(request);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, { status: response.status, headers });
  },
};
