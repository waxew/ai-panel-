import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const actionTypes = new Set(["CATALOG", "CART", "ORDERS", "SUPPORT", "TEXT", "URL", "SUBMENU"]);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function cleanTitle(value: unknown) {
  if (typeof value !== "string") return null;
  const title = value.trim();
  if (!title || title.length > 64) return null;
  return title;
}

function cleanActionType(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return actionTypes.has(normalized) ? normalized : null;
}

function cleanActionValue(actionType: string, value: unknown) {
  if (actionType === "SUBMENU") return null;
  if (value == null || value === "") {
    if (actionType === "URL") throw new Error("invalid_url");
    return null;
  }
  if (typeof value !== "string") throw new Error("invalid_action_value");
  const text = value.trim();
  if (actionType === "URL") {
    if (!text) throw new Error("invalid_url");
    let parsed: URL;
    try { parsed = new URL(text); } catch { throw new Error("invalid_url"); }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("invalid_url");
    if (text.length > 1000) throw new Error("invalid_action_value");
    return text;
  }
  if (text.length > 1500) throw new Error("invalid_action_value");
  return text || null;
}

async function workspaceForUser(admin: any, userId: string) {
  const { data, error } = await admin
    .from("WorkspaceMember")
    .select("workspaceId")
    .eq("userId", userId)
    .limit(1);
  if (error) throw new Error(`membership:${error.message}`);
  return data?.[0]?.workspaceId as string | undefined;
}

async function ownedBot(admin: any, workspaceId: string, botId: string) {
  const { data, error } = await admin
    .from("TelegramBot")
    .select("id,telegramBotId,username,displayName,description,status,welcomeMessage,createdAt")
    .eq("id", botId)
    .eq("workspaceId", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`bot:${error.message}`);
  return data ?? null;
}

async function loadBotBuilder(admin: any, workspaceId: string, botId?: string | null) {
  const { data: bots, error: botsError } = await admin
    .from("TelegramBot")
    .select("id,telegramBotId,username,displayName,description,status,welcomeMessage,createdAt")
    .eq("workspaceId", workspaceId)
    .order("createdAt", { ascending: false });
  if (botsError) throw new Error(`bots:${botsError.message}`);

  const selected = botId ? (bots ?? []).find((bot: any) => bot.id === botId) : (bots ?? [])[0];
  if (botId && !selected) return { bots: bots ?? [], bot: null, buttons: [] };
  if (!selected) return { bots: bots ?? [], bot: null, buttons: [] };

  const { data: buttons, error: buttonError } = await admin
    .from("TelegramButton")
    .select("id,botId,parentId,title,actionType,actionValue,sortOrder,createdAt")
    .eq("botId", selected.id)
    .order("sortOrder", { ascending: true });
  if (buttonError) throw new Error(`buttons:${buttonError.message}`);

  return { bots: bots ?? [], bot: selected, buttons: buttons ?? [] };
}

async function ensureParent(admin: any, botId: string, parentId: unknown, selfId?: string) {
  if (parentId == null || parentId === "") return null;
  if (typeof parentId !== "string") throw new Error("invalid_parent");
  if (selfId && parentId === selfId) throw new Error("invalid_parent");
  const { data: buttons, error } = await admin
    .from("TelegramButton")
    .select("id,parentId,actionType")
    .eq("botId", botId);
  if (error) throw new Error(`parent:${error.message}`);
  const byId = new Map((buttons ?? []).map((row: any) => [String(row.id), row]));
  const parent = byId.get(parentId);
  if (!parent || parent.actionType !== "SUBMENU") throw new Error("invalid_parent");
  if (selfId) {
    let cursor: string | null = parentId;
    const visited = new Set<string>();
    while (cursor) {
      if (cursor === selfId || visited.has(cursor)) throw new Error("invalid_parent");
      visited.add(cursor);
      const row: any = byId.get(cursor);
      cursor = row?.parentId ? String(row.parentId) : null;
    }
  }
  return parentId;
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
    const url = new URL(request.url);
    try {
      const result = await loadBotBuilder(admin, workspaceId, url.searchParams.get("botId"));
      return json({ ok: true, ...result });
    } catch (error) {
      console.error("telegram builder read failed", error);
      return json({ ok: false, message: "اطلاعات منوی ربات دریافت نشد." }, 500);
    }
  }

  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = typeof body.action === "string" ? body.action : "";
  const botId = typeof body.botId === "string" ? body.botId : "";
  if (!botId) return json({ ok: false, message: "ربات مشخص نشده است." }, 400);

  let bot: any;
  try { bot = await ownedBot(admin, workspaceId, botId); }
  catch (error) { console.error(error); return json({ ok: false, message: "بررسی مالکیت ربات انجام نشد." }, 500); }
  if (!bot) return json({ ok: false, message: "این ربات متعلق به Workspace شما نیست." }, 403);

  try {
    if (action === "update_welcome") {
      if (typeof body.welcomeMessage !== "string") return json({ ok: false, message: "پیام خوش‌آمد معتبر نیست." }, 400);
      const welcomeMessage = body.welcomeMessage.trim();
      if (!welcomeMessage || welcomeMessage.length > 4000) return json({ ok: false, message: "پیام خوش‌آمد باید بین ۱ تا ۴۰۰۰ کاراکتر باشد." }, 400);
      const { error } = await admin.from("TelegramBot").update({ welcomeMessage }).eq("id", bot.id).eq("workspaceId", workspaceId);
      if (error) throw new Error(`welcome:${error.message}`);
    } else if (action === "create_button") {
      const title = cleanTitle(body.title);
      const actionType = cleanActionType(body.actionType);
      if (!title || !actionType) return json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400);
      const parentId = await ensureParent(admin, bot.id, body.parentId);
      const actionValue = cleanActionValue(actionType, body.actionValue);
      let lastQuery = admin.from("TelegramButton").select("sortOrder").eq("botId", bot.id);
      lastQuery = parentId ? lastQuery.eq("parentId", parentId) : lastQuery.is("parentId", null);
      const { data: last, error: lastError } = await lastQuery.order("sortOrder", { ascending: false }).limit(1);
      if (lastError) throw new Error(`sort_read:${lastError.message}`);
      const sortOrder = Number(last?.[0]?.sortOrder ?? 0) + 10;
      const { error } = await admin.from("TelegramButton").insert({ id: crypto.randomUUID(), botId: bot.id, parentId, title, actionType, actionValue, sortOrder });
      if (error) throw new Error(`create_button:${error.message}`);
    } else if (action === "update_button") {
      const buttonId = typeof body.buttonId === "string" ? body.buttonId : "";
      if (!buttonId) return json({ ok: false, message: "دکمه مشخص نشده است." }, 400);
      const { data: current, error: currentError } = await admin.from("TelegramButton").select("id,botId,title,actionType,actionValue,parentId,sortOrder").eq("id", buttonId).eq("botId", bot.id).maybeSingle();
      if (currentError) throw new Error(`button:${currentError.message}`);
      if (!current) return json({ ok: false, message: "دکمه پیدا نشد." }, 404);
      const title = body.title === undefined ? current.title : cleanTitle(body.title);
      const actionType = body.actionType === undefined ? current.actionType : cleanActionType(body.actionType);
      if (!title || !actionType) return json({ ok: false, message: "عنوان یا نوع دکمه معتبر نیست." }, 400);
      const parentId = body.parentId === undefined ? current.parentId : await ensureParent(admin, bot.id, body.parentId, buttonId);
      const actionValue = cleanActionValue(actionType, body.actionValue === undefined ? current.actionValue : body.actionValue);
      const sortOrder = body.sortOrder === undefined ? Number(current.sortOrder) : Number(body.sortOrder);
      if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) return json({ ok: false, message: "ترتیب دکمه معتبر نیست." }, 400);
      const { error } = await admin.from("TelegramButton").update({ title, actionType, actionValue, parentId, sortOrder }).eq("id", buttonId).eq("botId", bot.id);
      if (error) throw new Error(`update_button:${error.message}`);
    } else if (action === "delete_button") {
      const buttonId = typeof body.buttonId === "string" ? body.buttonId : "";
      if (!buttonId) return json({ ok: false, message: "دکمه مشخص نشده است." }, 400);
      const { data: current, error: currentError } = await admin.from("TelegramButton").select("id").eq("id", buttonId).eq("botId", bot.id).maybeSingle();
      if (currentError) throw new Error(`button:${currentError.message}`);
      if (!current) return json({ ok: false, message: "دکمه پیدا نشد." }, 404);
      const { error: promoteError } = await admin.from("TelegramButton").update({ parentId: null }).eq("botId", bot.id).eq("parentId", buttonId);
      if (promoteError) throw new Error(`promote_children:${promoteError.message}`);
      const { error } = await admin.from("TelegramButton").delete().eq("id", buttonId).eq("botId", bot.id);
      if (error) throw new Error(`delete_button:${error.message}`);
    } else if (action === "reorder") {
      if (!Array.isArray(body.buttonIds)) return json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400);
      const ids = body.buttonIds.filter((value): value is string => typeof value === "string");
      if (!ids.length || ids.length > 100 || new Set(ids).size !== ids.length) return json({ ok: false, message: "لیست ترتیب معتبر نیست." }, 400);
      const { data: owned, error: ownedError } = await admin.from("TelegramButton").select("id,parentId").eq("botId", bot.id).in("id", ids);
      if (ownedError) throw new Error(`reorder_read:${ownedError.message}`);
      if ((owned ?? []).length !== ids.length) return json({ ok: false, message: "یکی از دکمه‌ها متعلق به این ربات نیست." }, 403);
      const parentKeys = new Set((owned ?? []).map((row: any) => row.parentId ?? "__root__"));
      if (parentKeys.size !== 1) return json({ ok: false, message: "فقط گزینه‌های هم‌سطح را می‌توان با هم مرتب کرد." }, 400);
      for (let index = 0; index < ids.length; index += 1) {
        const { error } = await admin.from("TelegramButton").update({ sortOrder: (index + 1) * 10 }).eq("id", ids[index]).eq("botId", bot.id);
        if (error) throw new Error(`reorder:${error.message}`);
      }
    } else {
      return json({ ok: false, message: "عملیات پشتیبانی نمی‌شود." }, 400);
    }

    const result = await loadBotBuilder(admin, workspaceId, bot.id);
    return json({ ok: true, ...result });
  } catch (error) {
    console.error("telegram builder write failed", error);
    const message = String(error).includes("invalid_url")
      ? "برای عملکرد لینک، آدرس URL معتبر الزامی است."
      : String(error).includes("invalid_parent")
        ? "زیرمنوی انتخاب‌شده معتبر نیست یا باعث حلقه در منو می‌شود."
        : "ذخیره تنظیمات منو انجام نشد.";
    return json({ ok: false, message }, 400);
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
