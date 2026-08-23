import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const triggerTypes = new Set(["COMMENT_KEYWORD", "DM_KEYWORD", "STORY_REPLY"]);
const META_APP_ID_SECRET = "meta_app_id";
const META_APP_SECRET_SECRET = "meta_app_secret";
const META_OWNER_SECRET = "meta_platform_owner_workspace";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

async function workspaceForUser(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw new Error(`membership:${error.message}`);
  return data?.[0]?.workspaceId as string | undefined;
}

function cleanString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function cleanKeywords(value: unknown) {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,،]+/) : [];
  return [...new Set(raw.map((item) => typeof item === "string" ? item.trim().toLocaleLowerCase("fa") : "").filter(Boolean))].slice(0, 30);
}

async function readSecrets(admin: any, ids: string[]) {
  const { data, error } = await admin.from("AppSecret").select("id,value").in("id", ids);
  if (error) throw new Error(`secret_read:${error.message}`);
  return new Map((data ?? []).map((row: any) => [row.id as string, row.value as string]));
}

function maskAppId(value: string) {
  if (!value) return null;
  if (value.length <= 6) return `${value.slice(0, 2)}••••`;
  return `${value.slice(0, 4)}••••${value.slice(-3)}`;
}

async function readPlatformConfig(admin: any, workspaceId: string) {
  const secrets = await readSecrets(admin, [META_APP_ID_SECRET, META_APP_SECRET_SECRET, META_OWNER_SECRET]);
  const appId = secrets.get(META_APP_ID_SECRET) ?? "";
  const appSecret = secrets.get(META_APP_SECRET_SECRET) ?? "";
  const ownerWorkspaceId = secrets.get(META_OWNER_SECRET) ?? "";
  return {
    configured: Boolean(appId && appSecret),
    editable: !ownerWorkspaceId || ownerWorkspaceId === workspaceId,
    ownedByThisWorkspace: Boolean(ownerWorkspaceId && ownerWorkspaceId === workspaceId),
    appIdMasked: maskAppId(appId),
  };
}

async function readDashboard(admin: any, workspaceId: string) {
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

  const firstError = [accountsResult.error, rulesResult.error, eventsResult.error].find(Boolean);
  if (firstError) throw new Error(`instagram_dashboard:${firstError.message}`);

  const accounts = accountsResult.data ?? [];
  const rules = rulesResult.data ?? [];
  const events = eventsResult.data ?? [];
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

async function ownedAccount(admin: any, workspaceId: string, accountId: string | null) {
  if (!accountId) return null;
  const { data, error } = await admin.from("InstagramAccount").select("id,status,metaAccountId,webhookSubscribed").eq("id", accountId).eq("workspaceId", workspaceId).maybeSingle();
  if (error) throw new Error(`account:${error.message}`);
  return data ?? null;
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const admin = ctx.supabaseAdmin;

  let workspaceId: string | undefined;
  try { workspaceId = await workspaceForUser(admin, userId); }
  catch (error) { console.error(error); return json({ ok: false, message: "Workspace قابل دریافت نیست." }, 500); }
  if (!workspaceId) return json({ ok: false, message: "Workspace برای این حساب پیدا نشد." }, 404);

  if (request.method === "GET") {
    try { return json(await readDashboard(admin, workspaceId)); }
    catch (error) { console.error("instagram dashboard read failed", error); return json({ ok: false, message: "اطلاعات اینستاگرام دریافت نشد." }, 500); }
  }

  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = cleanString(body.action, 40);

  try {
    if (action === "save_platform_config") {
      const appId = cleanString(body.appId, 80);
      const appSecret = cleanString(body.appSecret, 256);
      if (!/^\d{5,80}$/.test(appId)) return json({ ok: false, message: "Meta App ID معتبر وارد کنید." }, 400);
      if (appSecret.length < 16) return json({ ok: false, message: "Meta App Secret معتبر وارد کنید." }, 400);

      const current = await readSecrets(admin, [META_OWNER_SECRET]);
      const ownerWorkspaceId = current.get(META_OWNER_SECRET) ?? "";
      if (ownerWorkspaceId && ownerWorkspaceId !== workspaceId) {
        return json({ ok: false, message: "تنظیمات Meta متعلق به Workspace مدیر پلتفرم است و قابل تغییر نیست." }, 403);
      }

      const rows = [
        { id: META_APP_ID_SECRET, value: appId },
        { id: META_APP_SECRET_SECRET, value: appSecret },
        { id: META_OWNER_SECRET, value: workspaceId },
      ];
      const { error } = await admin.from("AppSecret").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(`platform_config:${error.message}`);
      return json({ ...(await readDashboard(admin, workspaceId)), platformConfigSaved: true });
    }

    if (action === "create_rule") {
      const name = cleanString(body.name, 120);
      const triggerType = cleanString(body.triggerType, 40).toUpperCase();
      const keywords = cleanKeywords(body.keywords);
      const message = cleanString(body.message, 1500);
      const accountId = cleanString(body.instagramAccountId, 160) || null;
      const requestedActive = body.isActive === true;

      if (!name) return json({ ok: false, message: "نام قانون الزامی است." }, 400);
      if (!triggerTypes.has(triggerType)) return json({ ok: false, message: "نوع Trigger معتبر نیست." }, 400);
      if ((triggerType === "COMMENT_KEYWORD" || triggerType === "DM_KEYWORD") && !keywords.length) return json({ ok: false, message: "حداقل یک کلمه یا عدد برای Trigger وارد کنید." }, 400);
      if (!message) return json({ ok: false, message: "متن دایرکت الزامی است." }, 400);

      const account = await ownedAccount(admin, workspaceId, accountId);
      if (accountId && !account) return json({ ok: false, message: "حساب اینستاگرام انتخاب‌شده متعلق به Workspace شما نیست." }, 403);
      const canActivate = Boolean(account?.metaAccountId && account?.webhookSubscribed && account?.status === "ACTIVE");

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
      if (error) throw new Error(`create_rule:${error.message}`);

      const result = await readDashboard(admin, workspaceId);
      return json({ ...result, activationDeferred: requestedActive && !canActivate }, 201);
    }

    if (action === "toggle_rule") {
      const ruleId = cleanString(body.ruleId, 160);
      if (!ruleId) return json({ ok: false, message: "قانون مشخص نشده است." }, 400);
      const { data: rule, error: readError } = await admin.from("InstagramAutomationRule")
        .select("id,instagramAccountId,isActive")
        .eq("id", ruleId).eq("workspaceId", workspaceId).maybeSingle();
      if (readError) throw new Error(`rule:${readError.message}`);
      if (!rule) return json({ ok: false, message: "قانون پیدا نشد." }, 404);
      const nextActive = typeof body.isActive === "boolean" ? body.isActive : !rule.isActive;
      if (nextActive) {
        const account = await ownedAccount(admin, workspaceId, rule.instagramAccountId ?? null);
        if (!account?.metaAccountId || !account.webhookSubscribed || account.status !== "ACTIVE") {
          return json({ ok: false, message: "برای فعال‌سازی Rule ابتدا اتصال رسمی Meta و Webhook همین حساب باید کامل شود." }, 409);
        }
      }
      const { error } = await admin.from("InstagramAutomationRule").update({ isActive: nextActive, updatedAt: new Date().toISOString() }).eq("id", ruleId).eq("workspaceId", workspaceId);
      if (error) throw new Error(`toggle_rule:${error.message}`);
      return json(await readDashboard(admin, workspaceId));
    }

    if (action === "delete_rule") {
      const ruleId = cleanString(body.ruleId, 160);
      if (!ruleId) return json({ ok: false, message: "قانون مشخص نشده است." }, 400);
      const { error } = await admin.from("InstagramAutomationRule").delete().eq("id", ruleId).eq("workspaceId", workspaceId);
      if (error) throw new Error(`delete_rule:${error.message}`);
      return json(await readDashboard(admin, workspaceId));
    }

    return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    console.error("instagram manage write failed", error);
    return json({ ok: false, message: "ذخیره تنظیمات اینستاگرام انجام نشد." }, 500);
  }
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
