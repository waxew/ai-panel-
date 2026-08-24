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
const customTitleActionTypes = new Set(["TEXT", "URL", "SUBMENU"]);
const fixedActionTitles: Record<string, string> = {
  CATALOG: "🛍 محصولات",
  SEARCH: "🔎 جستجوی محصول",
  CART: "🛒 سبد خرید",
  ORDERS: "📦 سفارش‌های من",
  TRACK_ORDER: "🚚 پیگیری سفارش",
  ACCOUNT: "👤 حساب کاربری",
  WALLET: "💳 کیف پول",
  MY_SERVICES: "📦 سرویس‌های من",
  PRICING: "💰 تعرفه‌ها",
  REFERRAL: "👥 زیرمجموعه‌گیری",
  TUTORIAL: "📚 آموزش",
  SUPPORT: "☎️ پشتیبانی",
};

const providerConfig = {
  telegram: { table: "TelegramBot", externalId: "telegramBotId", buttonTable: "TelegramButton" },
  bale: { table: "BaleBot", externalId: "baleBotId", buttonTable: "BaleButton" },
  rubika: { table: "RubikaBot", externalId: "rubikaBotId", buttonTable: "RubikaButton" },
} as const;

type Provider = keyof typeof providerConfig;
type JsonObject = Record<string, any>;
type RuntimeTarget = { provider: Provider; botId: string; enabled: boolean };

type LegacyTargetSnapshot = {
  provider: Provider;
  botId: string;
  welcomeMessage: string | null;
  buttons: Array<{
    id: string;
    parentId: string | null;
    title: string;
    actionType: string;
    actionValue: string | null;
    sortOrder: number;
  }>;
};

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

function canonicalMenuTitle(value: string) {
  return value.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "").toLocaleLowerCase("fa-IR");
}

const reservedMenuTitles = new Set(Object.values(fixedActionTitles).map(canonicalMenuTitle));

function normalizeMenuTitle(actionType: string, requestedTitle: string) {
  const fixedTitle = fixedActionTitles[actionType];
  if (fixedTitle) return fixedTitle;
  if (!customTitleActionTypes.has(actionType)) throw new Error("invalid_action_type");
  if (reservedMenuTitles.has(canonicalMenuTitle(requestedTitle))) throw new Error("reserved_menu_title");
  return requestedTitle;
}

function normalizeActionValue(actionType: string, value: unknown) {
  if (actionType === "SUBMENU") return null;
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

function validateMenuGraph(menu: any[], forPublish: boolean) {
  const ids = new Set(menu.map((node) => node.id));
  const byId = new Map(menu.map((node) => [node.id, node]));
  for (const node of menu) {
    if (node.parentId !== null && !ids.has(node.parentId)) throw new Error("invalid_parent");
    if (node.parentId === node.id) throw new Error("menu_cycle");
    if (forPublish && node.enabled && node.parentId && !byId.get(node.parentId)?.enabled) throw new Error("enabled_child_of_disabled_parent");
  }

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
    const requestedTitle = textValue(node.title, "", 64);
    if (!requestedTitle) throw new Error("invalid_menu_title");
    const actionType = String(node.actionType ?? "").trim().toUpperCase();
    if (!actionTypes.has(actionType)) throw new Error("invalid_action_type");
    const title = normalizeMenuTitle(actionType, requestedTitle);
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
  validateMenuGraph(menu, forPublish);
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
    return { provider: provider as Provider, botId, enabled: target.enabled !== false };
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

async function snapshotTarget(admin: any, workspaceId: string, target: RuntimeTarget, requireActive = true): Promise<LegacyTargetSnapshot> {
  const config = providerConfig[target.provider];
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,welcomeMessage,status")
    .eq("id", target.botId).eq("workspaceId", workspaceId).maybeSingle();
  if (botError || !bot) throw new Error("foreign_target");
  if (requireActive && bot.status !== "ACTIVE") throw new Error("inactive_target");
  const { data: buttons, error: buttonError } = await admin.from(config.buttonTable)
    .select("id,parentId,title,actionType,actionValue,sortOrder")
    .eq("botId", target.botId).order("sortOrder", { ascending: true });
  if (buttonError) throw new Error(`snapshot_buttons:${buttonError.message}`);
  return {
    provider: target.provider,
    botId: target.botId,
    welcomeMessage: bot.welcomeMessage ?? null,
    buttons: (buttons ?? []).map((button: any) => ({
      id: String(button.id),
      parentId: button.parentId ? String(button.parentId) : null,
      title: String(button.title),
      actionType: String(button.actionType),
      actionValue: button.actionValue == null ? null : String(button.actionValue),
      sortOrder: Number(button.sortOrder ?? 0),
    })),
  };
}

async function replaceButtons(admin: any, provider: Provider, botId: string, rows: any[]) {
  const table = providerConfig[provider].buttonTable;
  const { data: current, error: readError } = await admin.from(table).select("id").eq("botId", botId);
  if (readError) throw new Error(`projection_read:${readError.message}`);
  const nextIds = new Set(rows.map((row) => String(row.id)));
  const staleIds = (current ?? []).map((row: any) => String(row.id)).filter((id: string) => !nextIds.has(id));
  if (rows.length) {
    const { error: upsertError } = await admin.from(table).upsert(rows, { onConflict: "id" });
    if (upsertError) throw new Error(`projection_upsert:${upsertError.message}`);
  }
  if (staleIds.length) {
    const { error: deleteError } = await admin.from(table).delete().in("id", staleIds);
    if (deleteError) throw new Error(`projection_delete:${deleteError.message}`);
  }
}

async function projectTarget(admin: any, workspaceId: string, target: RuntimeTarget, template: any) {
  const config = providerConfig[target.provider];
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id,status")
    .eq("id", target.botId).eq("workspaceId", workspaceId).maybeSingle();
  if (botError || !bot) throw new Error("foreign_target");
  if (bot.status !== "ACTIVE") throw new Error("inactive_target");

  const enabled = template.menu.filter((node: any) => node.enabled);
  const projectionId = (nodeId: string) => `${target.botId}:${nodeId}`;
  const rows = enabled.map((node: any) => ({
    id: projectionId(node.id),
    botId: target.botId,
    parentId: node.parentId ? projectionId(node.parentId) : null,
    title: node.title,
    actionType: node.actionType,
    actionValue: node.actionType === "SUBMENU" ? projectionId(node.id) : node.actionValue,
    sortOrder: node.sortOrder,
  }));
  await replaceButtons(admin, target.provider, target.botId, rows);
  const { error: welcomeError } = await admin.from(config.table)
    .update({ welcomeMessage: template.welcomeMessage })
    .eq("id", target.botId).eq("workspaceId", workspaceId);
  if (welcomeError) throw new Error(`projection_welcome:${welcomeError.message}`);
}

async function restoreTarget(admin: any, workspaceId: string, snapshot: LegacyTargetSnapshot) {
  const config = providerConfig[snapshot.provider];
  const { data: bot, error: botError } = await admin.from(config.table)
    .select("id")
    .eq("id", snapshot.botId).eq("workspaceId", workspaceId).maybeSingle();
  if (botError || !bot) return;
  const rows = snapshot.buttons.map((button) => ({ ...button, botId: snapshot.botId }));
  await replaceButtons(admin, snapshot.provider, snapshot.botId, rows);
  if (snapshot.welcomeMessage) {
    const { error } = await admin.from(config.table).update({ welcomeMessage: snapshot.welcomeMessage }).eq("id", snapshot.botId);
    if (error) throw new Error(`restore_welcome:${error.message}`);
  }
}

function parseLegacySnapshots(value: unknown) {
  const raw = objectValue(value) ?? {};
  const snapshots: Record<string, LegacyTargetSnapshot> = {};
  for (const [key, entry] of Object.entries(raw)) {
    const item = objectValue(entry);
    if (!item || !providers.has(String(item.provider)) || typeof item.botId !== "string" || !Array.isArray(item.buttons)) continue;
    snapshots[key] = item as LegacyTargetSnapshot;
  }
  return snapshots;
}

function publishedTargets(engine: JsonObject): RuntimeTarget[] {
  return Array.isArray(engine.published?.targets)
    ? (engine.published.targets as RuntimeTarget[]).filter((target) => target?.enabled && providers.has(String(target.provider)) && typeof target.botId === "string")
    : [];
}

function uniqueTargets(targets: RuntimeTarget[]) {
  const map = new Map<string, RuntimeTarget>();
  for (const target of targets) map.set(`${target.provider}:${target.botId}`, target);
  return Array.from(map.values());
}

async function snapshotRuntimeTargets(admin: any, workspaceId: string, targets: RuntimeTarget[]) {
  const snapshots: LegacyTargetSnapshot[] = [];
  for (const target of uniqueTargets(targets)) {
    try {
      snapshots.push(await snapshotTarget(admin, workspaceId, target, false));
    } catch (error) {
      if (!String(error).includes("foreign_target")) throw error;
    }
  }
  return snapshots;
}

async function restoreRuntimeTargets(admin: any, workspaceId: string, snapshots: LegacyTargetSnapshot[]) {
  for (const snapshot of snapshots) {
    try { await restoreTarget(admin, workspaceId, snapshot); }
    catch (error) { console.error("bot commerce rollback restore", error); }
  }
}

async function syncPublishedTargets(admin: any, workspaceId: string, engine: JsonObject, template: any) {
  const snapshots = parseLegacySnapshots(engine.legacyTargets);
  const nextTargets = (template.targets as RuntimeTarget[]).filter((target) => target.enabled);
  const nextKeys = new Set(nextTargets.map((target) => `${target.provider}:${target.botId}`));
  const previousTargets = publishedTargets(engine);

  for (const previous of previousTargets) {
    const key = `${previous.provider}:${previous.botId}`;
    if (!nextKeys.has(key) && snapshots[key]) await restoreTarget(admin, workspaceId, snapshots[key]);
  }

  for (const target of nextTargets) {
    const key = `${target.provider}:${target.botId}`;
    if (!snapshots[key]) snapshots[key] = await snapshotTarget(admin, workspaceId, target);
    await projectTarget(admin, workspaceId, target, template);
  }
  return snapshots;
}

async function saveEngine(admin: any, workspaceId: string, rawTemplate: unknown, publish: boolean) {
  const [store, providerBots] = await Promise.all([ensureStore(admin, workspaceId), listProviderBots(admin, workspaceId)]);
  const ownedTargets = buildOwnedTargetSet(providerBots);
  const template = normalizeTemplate(rawTemplate, ownedTargets, publish);
  const settings = objectValue(store.settings) ?? {};
  const engine = objectValue(settings.botCommerce) ?? {};
  const now = new Date().toISOString();
  const version = integerValue(engine.version, 0, 0, 1_000_000);

  let legacyTargets = engine.legacyTargets;
  let rollbackSnapshots: LegacyTargetSnapshot[] = [];
  if (publish) {
    const nextTargets = (template.targets as RuntimeTarget[]).filter((target) => target.enabled);
    rollbackSnapshots = await snapshotRuntimeTargets(admin, workspaceId, [...publishedTargets(engine), ...nextTargets]);
    try {
      legacyTargets = await syncPublishedTargets(admin, workspaceId, engine, template);
    } catch (error) {
      await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
      throw error;
    }
  }

  const nextEngine = {
    ...engine,
    draft: template,
    draftSavedAt: now,
    ...(publish ? { published: template, publishedAt: now, version: version + 1, legacyTargets } : {}),
  };
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: nextEngine }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  if (error) {
    if (publish) await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    throw new Error(`save:${error.message}`);
  }
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
    menu: (buttons ?? []).map((button: any) => ({ ...button, actionValue: button.actionType === "SUBMENU" ? null : button.actionValue, enabled: true })),
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
  const snapshots = parseLegacySnapshots(engine.legacyTargets);
  const currentTargets = publishedTargets(engine);
  const rollbackSnapshots = await snapshotRuntimeTargets(admin, workspaceId, currentTargets);

  try {
    for (const target of currentTargets) {
      const key = `${target.provider}:${target.botId}`;
      if (snapshots[key]) await restoreTarget(admin, workspaceId, snapshots[key]);
    }
  } catch (error) {
    await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    throw error;
  }

  const now = new Date().toISOString();
  const next = { ...engine, published: null, publishedAt: null };
  const { error } = await admin.from("Store").update({ settings: { ...settings, botCommerce: next }, updatedAt: now })
    .eq("id", store.id).eq("workspaceId", workspaceId);
  if (error) {
    await restoreRuntimeTargets(admin, workspaceId, rollbackSnapshots);
    throw new Error(`unpublish:${error.message}`);
  }
  return readState(admin, workspaceId);
}

function friendlyError(error: unknown) {
  const text = String(error);
  if (text.includes("action_not_live:")) return `این قابلیت هنوز Runtime نهایی ندارد: ${text.split("action_not_live:")[1] ?? ""}. آن را غیرفعال کنید یا بعد از تکمیل Runtime منتشر کنید.`;
  if (text.includes("reserved_menu_title")) return "عنوان انتخاب‌شده متعلق به یک عملکرد آماده است. برای دکمه سفارشی نام دیگری انتخاب کنید.";
  if (text.includes("no_publish_target")) return "برای انتشار حداقل یک ربات متصل را انتخاب کنید.";
  if (text.includes("inactive_target")) return "برای انتشار، ربات انتخاب‌شده باید ACTIVE و متصل باشد.";
  if (text.includes("foreign_target")) return "یکی از ربات‌های انتخاب‌شده متعلق به این Workspace نیست.";
  if (text.includes("invalid_url")) return "یکی از لینک‌های منو معتبر نیست.";
  if (text.includes("menu_cycle")) return "ساختار منو حلقه دارد و معتبر نیست.";
  if (text.includes("menu_depth")) return "حداکثر عمق منو سه سطح است.";
  if (text.includes("enabled_child_of_disabled_parent")) return "زیرگزینه فعال نمی‌تواند زیر یک گزینه غیرفعال منتشر شود.";
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
