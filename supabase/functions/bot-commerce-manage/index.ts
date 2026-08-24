import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const providers = new Set(["telegram", "bale", "rubika"]);
const presetKeys = new Set(["commerce", "services", "digital"]);
const actionTypes = new Set([
  "CATALOG", "SEARCH", "CART", "ORDERS", "TRACK_ORDER", "ACCOUNT", "WALLET",
  "MY_SERVICES", "PRICING", "REFERRAL", "TUTORIAL", "SUPPORT", "TEXT", "URL", "SUBMENU",
]);
const liveActionTypes = new Set(["CATALOG", "CART", "ORDERS", "SUPPORT", "TEXT", "URL", "SUBMENU"]);

const providerConfig = {
  telegram: { table: "TelegramBot", externalId: "telegramBotId", buttonTable: "TelegramButton" },
  bale: { table: "BaleBot", externalId: "baleBotId", buttonTable: "BaleButton" },
  rubika: { table: "RubikaBot", externalId: "rubikaBotId", buttonTable: "RubikaButton" },
} as const;

type Provider = keyof typeof providerConfig;
type JsonObject = Record<string, any>;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function objectValue(value: unknown): JsonObject | null {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function textValue(value: unknown, fallback: string, max: number) {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max);
}

function integerValue(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function normalizeActionValue(actionType: string, value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("invalid_action_value");
  const clean = value.trim();
  if (actionType === "URL") {
    if (clean.length > 1000) throw new Error("invalid_action_value");
    let parsed: URL;
    try { parsed = new URL(clean); } catch { throw new Error("invalid_url"); }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("invalid_url");
    return clean;
  }
  if (clean.length > 2000) throw new Error("invalid_action_value");
  return clean || null;
}

async function workspaceForUser(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw new Error(`workspace:${error.message}`);
  return data?.[0]?.workspaceId as string | undefined;
}

async function ownedStore(admin: any, workspaceId: string) {
  const { data, error } = await admin.from("Store")
    .select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt")
    .eq("workspaceId", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`store:${error.message}`);
  return data ?? null;
}

async function ensureStore(admin: any, workspaceId: string) {
  const current = await ownedStore(admin, workspaceId);
  if (current) return current;
  const { data, error } = await admin.from("Store")
    .insert({ workspaceId, name: "فروشگاه من", status: "ACTIVE" })
    .select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt")
    .single();
  if (error || !data) throw new Error(`store_create:${error?.message ?? "unknown"}`);
  return data;
}

async function listProviderBots(admin: any, workspaceId: string) {
  const result: Record<string, any[]> = { telegram: [], bale: [], rubika: [] };
  for (const provider of Object.keys(providerConfig) as Provider[]) {
    const config = providerConfig[provider];
    const { data, error } = await admin.from(config.table)
      .select(`id,${config.externalId},username,displayName,description,status,createdAt`)
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: false });
    if (error) throw new Error(`${provider}_bots:${error.message}`);
    result[provider] = (data ?? []).map((bot: any) => ({
      id: bot.id,
      externalId: bot[config.externalId],
      username: bot.username ?? null,
      displayName: bot.displayName ?? null,
      description: bot.description ?? null,
      status: bot.status,
      createdAt: bot.createdAt,
    }));
  }
  return result;
}

function buildOwnedTargetSet(providerBots: Record<string, any[]>) {
  const owned = new Set<string>();
  for (const provider of Object.keys(providerBots)) {
    for (const bot of providerBots[provider] ?? []) owned.add(`${provider}:${bot.id}`);
  }
  return owned;
}

function validateMenuGraph(menu: any[]) {
  const ids = new Set(menu.map((node) => node.id));
  for (const node of menu) {
    if (node.parentId !== null && !ids.has(node.parentId)) throw new Error("invalid_parent");
    if (node.parentId === node.id) throw new Error("menu_cycle");
  }

  const byId = new Map(menu.map((node) => [node.id, node]));
  for (const node of menu) {
    let cursor: any = node;
    const visited = new Set<string>();
    let depth = 0;
    while (cursor?.parentId) {
      if (visited.has(cursor.id)) throw new Error("menu_cycle");
      visited.add(cursor.id);
      cursor = byId.get(cursor.parentId);
      depth += 1;
      if (depth > 3) throw new Error("menu_depth");
    }
  }
}

function normalizeTemplate(value: unknown, ownedTargets: Set<string>, forPublish: boolean) {
  const raw = objectValue(value);
  if (!raw) throw new Error("invalid_template");

  const presetKey = presetKeys.has(String(raw.presetKey)) ? String(raw.presetKey) : "commerce";
  const name = textValue(raw.name, "فروشگاه پیام‌رسان", 120) || "فروشگاه پیام‌رسان";
  const welcomeMessage = textValue(raw.welcomeMessage, "سلام! از منوی زیر یکی از گزینه‌ها را انتخاب کنید.", 4000);
  if (!welcomeMessage) throw new Error("invalid_welcome");

  if (!Array.isArray(raw.menu) || raw.menu.length === 0 || raw.menu.length > 60) throw new Error("invalid_menu");
  const seenIds = new Set<string>();
  const menu = raw.menu.map((entry: unknown, index: number) => {
    const node = objectValue(entry);
    if (!node) throw new Error("invalid_menu_node");
    const id = textValue(node.id, "", 80);
    if (!id || seenIds.has(id)) throw new Error("duplicate_menu_id");
    seenIds.add(id);
    const title = textValue(node.title, "", 64);
    if (!title) throw new Error("invalid_menu_title");
    const actionType = String(node.actionType ?? "").trim().toUpperCase();
    if (!actionTypes.has(actionType)) throw new Error("invalid_action_type");
    const enabled = node.enabled !== false;
    if (forPublish && enabled && !liveActionTypes.has(actionType)) throw new Error(`action_not_live:${actionType}`);
    const parentId = node.parentId == null || node.parentId === "" ? null : textValue(node.parentId, "", 80);
    return {
      id,
      parentId,
      title,
      actionType,
      actionValue: normalizeActionValue(actionType, node.actionValue),
      sortOrder: integerValue(node.sortOrder, (index + 1) * 10, 0, 100000),
      enabled,
    };
  });
  validateMenuGraph(menu);
  if (!menu.some((node) => node.enabled && node.parentId === null)) throw new Error("no_root_menu");

  const targetsInput = Array.isArray(raw.targets) ? raw.targets.slice(0, 20) : [];
  const targetKeys = new Set<string>();
  const targets = targetsInput.map((entry: unknown) => {
    const target = objectValue(entry);
    if (!target) throw new Error("invalid_target");
    const provider = String(target.provider ?? "").trim();
    const botId = textValue(target.botId, "", 100);
    if (!providers.has(provider) || !botId) throw new Error("invalid_target");
    const key = `${provider}:${botId}`;
    if (targetKeys.has(key)) throw new Error("duplicate_target");
    targetKeys.add(key);
    if (!ownedTargets.has(key)) throw new Error("foreign_target");
    return { provider, botId, enabled: target.enabled !== false };
  });
  if (forPublish && !targets.some((target) => target.enabled)) throw new Error("no_publish_target");

  const settings = objectValue(raw.settings) ?? {};
  return {
    schemaVersion: 1,
    presetKey,
    name,
    welcomeMessage,
    menu,
    targets,
    settings: {
      columns: Number(settings.columns) === 1 ? 1 : 2,
      showPrices: settings.showPrices !== false,
      showInventory: settings.showInventory !== false,
    },
  };
}

async function readState(admin: any, workspaceId: string) {
  const [store, providerBots] = await Promise.all([ownedStore(admin, workspaceId), listProviderBots(admin, workspaceId)]);
  const settings = objectValue(store?.settings) ?? {};
  return {
    ok: true,
    store: store ? { id: store.id, name: store.name, currency: store.currency, status: store.status } : null,
    botCommerce: objectValue(settings.botCommerce) ?? null,
    providers: providerBots,
    capabilities: {
      runtimeActions: Array.from(liveActionTypes),
      foundationActions: Array.from(actionTypes).filter((action) => !liveActionTypes.has(action)),
    },
  };
}

async function saveEngine(admin: any, workspaceId: string, rawTemplate: unknown, publish: boolean) {
  const [store, providerBots] = await Promise.all([ensureStore(admin, workspaceId), listProviderBots(admin, workspaceId)]);
  const ownedTargets = buildOwnedTargetSet(providerBots);
  const template = normalizeTemplate(rawTemplate, ownedTargets, publish);
  const settings = objectValue(store.settings) ?? {};
  const engine = objectValue(settings.botCommerce) ?? {};
  const now = new Date().toISOString();
  const version = integerValue(engine.version, 0, 0, 1_000_000);
  const nextEngine = {
    ...engine,
    draft: template,
    draftSavedAt: now,
    ...(publish ? { published: template, publishedAt: now, version: version + 1 } : {}),
  };
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: nextEngine }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  if (error) throw new Error(`save:${error.message}`);
  return readState(admin, workspaceId);
}

async function importProvider(admin: any, workspaceId: string, provider: Provider, botId: string) {
  const config = providerConfig[provider];
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,welcomeMessage,status")
    .eq("id", botId).eq("workspaceId", workspaceId).maybeSingle();
  if (botError || !bot) throw new Error("foreign_target");
  const { data: buttons, error: buttonError } = await admin.from(config.buttonTable)
    .select("id,parentId,title,actionType,actionValue,sortOrder")
    .eq("botId", botId).order("sortOrder", { ascending: true });
  if (buttonError) throw new Error(`import_buttons:${buttonError.message}`);
  if (!(buttons ?? []).length) throw new Error("empty_provider_menu");

  const template = {
    schemaVersion: 1,
    presetKey: "commerce",
    name: "فروشگاه پیام‌رسان",
    welcomeMessage: bot.welcomeMessage || "سلام! از منوی زیر یکی از گزینه‌ها را انتخاب کنید.",
    menu: (buttons ?? []).map((button: any) => ({ ...button, enabled: true })),
    targets: [{ provider, botId, enabled: true }],
    settings: { columns: 2, showPrices: true, showInventory: true },
  };
  return saveEngine(admin, workspaceId, template, false);
}

async function unpublish(admin: any, workspaceId: string) {
  const store = await ownedStore(admin, workspaceId);
  if (!store) return readState(admin, workspaceId);
  const settings = objectValue(store.settings) ?? {};
  const engine = objectValue(settings.botCommerce) ?? {};
  const now = new Date().toISOString();
  const next = { ...engine, published: null, publishedAt: null };
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: next }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  if (error) throw new Error(`unpublish:${error.message}`);
  return readState(admin, workspaceId);
}

function friendlyError(error: unknown) {
  const text = String(error);
  if (text.includes("action_not_live:")) return `این قابلیت هنوز Runtime نهایی ندارد: ${text.split("action_not_live:")[1] ?? ""}. آن را غیرفعال کنید یا بعد از تکمیل Runtime منتشر کنید.`;
  if (text.includes("no_publish_target")) return "برای انتشار حداقل یک ربات متصل را انتخاب کنید.";
  if (text.includes("foreign_target")) return "یکی از ربات‌های انتخاب‌شده متعلق به این Workspace نیست.";
  if (text.includes("invalid_url")) return "یکی از لینک‌های منو معتبر نیست.";
  if (text.includes("menu_cycle")) return "ساختار منو حلقه دارد و معتبر نیست.";
  if (text.includes("menu_depth")) return "حداکثر عمق منو سه سطح است.";
  if (text.includes("invalid_parent")) return "والد یکی از گزینه‌های منو معتبر نیست.";
  if (text.includes("empty_provider_menu")) return "منوی قابل انتقالی در این ربات وجود ندارد.";
  return "تنظیمات Bot Commerce معتبر نیست یا ذخیره نشد.";
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
    try { return json(await readState(admin, workspaceId)); }
    catch (error) { console.error("bot commerce read", error); return json({ ok: false, message: "اطلاعات فروشگاه رباتی دریافت نشد." }, 500); }
  }
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: JsonObject;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = typeof body.action === "string" ? body.action : "";

  try {
    if (action === "save_draft") return json(await saveEngine(admin, workspaceId, body.template, false));
    if (action === "publish") return json(await saveEngine(admin, workspaceId, body.template, true));
    if (action === "unpublish") return json(await unpublish(admin, workspaceId));
    if (action === "import_provider") {
      const provider = typeof body.provider === "string" ? body.provider : "";
      const botId = typeof body.botId === "string" ? body.botId : "";
      if (!providers.has(provider) || !botId) return json({ ok: false, message: "ربات مبدا معتبر نیست." }, 400);
      return json(await importProvider(admin, workspaceId, provider as Provider, botId));
    }
    return json({ ok: false, message: "عملیات شناخته‌شده نیست." }, 400);
  } catch (error) {
    console.error("bot commerce write", error);
    return json({ ok: false, message: friendlyError(error) }, 400);
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
