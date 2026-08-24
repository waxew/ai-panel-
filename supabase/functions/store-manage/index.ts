import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const templateSectionTypes = new Set(["hero", "categories", "products", "promo"]);
const templateKeys = new Set(["minimal", "showcase", "catalog"]);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function slugify(value: string) {
  const clean = value.trim().toLowerCase().normalize("NFKC").replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  return clean || crypto.randomUUID().slice(0, 8);
}

function objectValue(value: unknown): Record<string, any> | null {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : null;
}

function textValue(value: unknown, fallback = "", max = 240) {
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

function numberValue(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback;
}

function colorValue(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function normalizeTemplate(value: unknown) {
  const raw = objectValue(value);
  if (!raw) return null;

  const templateKey = templateKeys.has(String(raw.templateKey)) ? String(raw.templateKey) : "minimal";
  const defaults = templateKey === "showcase"
    ? { accent: "#7c3aed", background: "#0b0b10", surface: "#15141b", text: "#f8fafc", muted: "#a1a1aa", radius: 24, fontScale: 104 }
    : templateKey === "catalog"
      ? { accent: "#0f766e", background: "#f1f5f4", surface: "#ffffff", text: "#10231f", muted: "#64748b", radius: 12, fontScale: 96 }
      : { accent: "#111827", background: "#f7f7f5", surface: "#ffffff", text: "#111827", muted: "#6b7280", radius: 18, fontScale: 100 };
  const theme = objectValue(raw.theme) ?? {};
  const sectionsInput = Array.isArray(raw.sections) ? raw.sections.slice(0, 12) : [];
  const sections = sectionsInput.flatMap((entry: unknown) => {
    const section = objectValue(entry);
    if (!section || !templateSectionTypes.has(String(section.type))) return [];
    const type = String(section.type);
    const columns = [2, 3, 4].includes(Number(section.columns)) ? Number(section.columns) : 3;
    return [{
      id: typeof section.id === "string" && section.id.length > 0 && section.id.length <= 80 ? section.id : crypto.randomUUID(),
      type,
      enabled: section.enabled !== false,
      eyebrow: textValue(section.eyebrow, "", 80),
      title: textValue(section.title, type, 160),
      body: textValue(section.body, "", 500),
      ctaLabel: textValue(section.ctaLabel, "", 80),
      limit: numberValue(section.limit, 6, 1, 12),
      columns,
    }];
  });

  if (sections.length === 0) return null;

  return {
    schemaVersion: 1,
    templateKey,
    theme: {
      accent: colorValue(theme.accent, defaults.accent),
      background: colorValue(theme.background, defaults.background),
      surface: colorValue(theme.surface, defaults.surface),
      text: colorValue(theme.text, defaults.text),
      muted: colorValue(theme.muted, defaults.muted),
      radius: numberValue(theme.radius, defaults.radius, 0, 40),
      fontScale: numberValue(theme.fontScale, defaults.fontScale, 85, 120),
      logoUrl: textValue(theme.logoUrl, "", 500),
    },
    sections,
  };
}

async function firstWorkspace(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw new Error(`workspace_membership:${error.message}`);
  return data?.[0]?.workspaceId as string | undefined;
}

async function ownedStore(admin: any, workspaceId: string) {
  const { data, error } = await admin.from("Store").select("id,workspaceId,name,currency,status,settings,createdAt,updatedAt").eq("workspaceId", workspaceId).maybeSingle();
  if (error) throw new Error(`store_read:${error.message}`);
  return data ?? null;
}

async function readDashboard(admin: any, workspaceId: string) {
  const store = await ownedStore(admin, workspaceId);
  if (!store) return { ok: true, store: null, categories: [], items: [], orders: [], summary: { itemCount: 0, categoryCount: 0, orderCount: 0, paidOrderCount: 0, customerCount: 0 } };

  const [categoriesResult, itemsResult, ordersResult, customersResult, orderCountResult, paidOrderCountResult] = await Promise.all([
    admin.from("StoreCategory").select("id,title,slug,sortOrder,isActive,createdAt,updatedAt").eq("storeId", store.id).order("sortOrder", { ascending: true }),
    admin.from("StoreItem").select("id,categoryId,sku,title,description,itemType,priceAmount,currency,inventoryCount,imageUrl,sortOrder,isActive,metadata,createdAt,updatedAt").eq("storeId", store.id).order("sortOrder", { ascending: true }).order("createdAt", { ascending: false }),
    admin.from("StoreOrder").select("id,customerId,sourcePlatform,status,subtotalAmount,discountAmount,totalAmount,currency,note,createdAt,paidAt").eq("storeId", store.id).order("createdAt", { ascending: false }).limit(30),
    admin.from("StoreCustomer").select("id", { count: "exact", head: true }).eq("storeId", store.id),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id),
    admin.from("StoreOrder").select("id", { count: "exact", head: true }).eq("storeId", store.id).in("status", ["PAID", "PROCESSING", "COMPLETED"]),
  ]);

  const error = [categoriesResult.error, itemsResult.error, ordersResult.error, customersResult.error, orderCountResult.error, paidOrderCountResult.error].find(Boolean);
  if (error) throw new Error(`store_dashboard:${error.message}`);

  const categories = categoriesResult.data ?? [];
  const items = itemsResult.data ?? [];
  return {
    ok: true,
    store,
    categories,
    items,
    orders: ordersResult.data ?? [],
    summary: {
      itemCount: items.length,
      categoryCount: categories.length,
      orderCount: orderCountResult.count ?? 0,
      paidOrderCount: paidOrderCountResult.count ?? 0,
      customerCount: customersResult.count ?? 0,
    },
  };
}

async function saveTemplate(admin: any, workspaceId: string, store: any, rawTemplate: unknown, publish: boolean) {
  const template = normalizeTemplate(rawTemplate);
  if (!template) return { error: "ساختار قالب معتبر نیست." } as const;

  const settings = objectValue(store.settings) ?? {};
  const currentEngine = objectValue(settings.templateEngine) ?? {};
  const now = new Date().toISOString();
  const currentVersion = numberValue(currentEngine.version, 0, 0, 1_000_000);
  const templateEngine = {
    ...currentEngine,
    draft: template,
    draftSavedAt: now,
    ...(publish ? { published: template, publishedAt: now, version: currentVersion + 1 } : {}),
  };

  const { error } = await admin.from("Store").update({ settings: { ...settings, templateEngine }, updatedAt: now }).eq("id", store.id).eq("workspaceId", workspaceId);
  if (error) throw new Error(`template_save:${error.message}`);
  return { data: await readDashboard(admin, workspaceId) } as const;
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const admin = ctx.supabaseAdmin;

  let workspaceId: string | undefined;
  try { workspaceId = await firstWorkspace(admin, userId); }
  catch (error) { console.error(error); return json({ ok: false, message: "فضای کاری قابل شناسایی نیست." }, 500); }
  if (!workspaceId) return json({ ok: false, message: "فضای کاری برای این حساب پیدا نشد." }, 404);

  if (request.method === "GET") {
    try { return json(await readDashboard(admin, workspaceId)); }
    catch (error) { console.error(error); return json({ ok: false, message: "اطلاعات فروشگاه در دسترس نیست." }, 500); }
  }
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "ensure_store") {
    try {
      const existing = await ownedStore(admin, workspaceId);
      if (existing) return json(await readDashboard(admin, workspaceId));
      const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 120) : "فروشگاه من";
      const { error } = await admin.from("Store").insert({ workspaceId, name, status: "ACTIVE" });
      if (error) throw error;
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      console.error("store create failed", error);
      return json({ ok: false, message: "ساخت فروشگاه انجام نشد." }, 500);
    }
  }

  let store: any;
  try { store = await ownedStore(admin, workspaceId); }
  catch (error) { console.error(error); return json({ ok: false, message: "فروشگاه قابل دریافت نیست." }, 500); }
  if (!store) return json({ ok: false, message: "ابتدا فروشگاه را ایجاد کنید." }, 409);

  if (action === "save_template_draft" || action === "publish_template") {
    try {
      const result = await saveTemplate(admin, workspaceId, store, body.template, action === "publish_template");
      if ("error" in result) return json({ ok: false, message: result.error }, 400);
      return json(result.data);
    } catch (error) {
      console.error("template save failed", error);
      return json({ ok: false, message: "ذخیره قالب فروشگاه انجام نشد." }, 500);
    }
  }

  if (action === "create_category") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
    if (!title) return json({ ok: false, message: "نام دسته‌بندی الزامی است." }, 400);
    try {
      let slug = slugify(title);
      const { data: duplicate, error: duplicateError } = await admin.from("StoreCategory").select("id").eq("storeId", store.id).eq("slug", slug).limit(1);
      if (duplicateError) throw duplicateError;
      if (duplicate?.length) slug = `${slug}-${crypto.randomUUID().slice(0, 5)}`;
      const { error } = await admin.from("StoreCategory").insert({ storeId: store.id, title, slug });
      if (error) throw error;
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      console.error("category create failed", error);
      return json({ ok: false, message: "ساخت دسته‌بندی انجام نشد." }, 500);
    }
  }

  if (action === "create_item") {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const priceAmount = Number(body.priceAmount);
    const itemType = ["DIGITAL", "PHYSICAL", "SERVICE"].includes(body.itemType) ? body.itemType : "DIGITAL";
    const inventoryRaw = body.inventoryCount;
    const inventoryCount = inventoryRaw === "" || inventoryRaw === null || inventoryRaw === undefined ? null : Number(inventoryRaw);
    const categoryId = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;

    if (!title) return json({ ok: false, message: "نام محصول الزامی است." }, 400);
    if (!Number.isSafeInteger(priceAmount) || priceAmount < 0) return json({ ok: false, message: "قیمت محصول معتبر نیست." }, 400);
    if (inventoryCount !== null && (!Number.isSafeInteger(inventoryCount) || inventoryCount < 0)) return json({ ok: false, message: "موجودی معتبر نیست." }, 400);

    try {
      if (categoryId) {
        const { data: category, error } = await admin.from("StoreCategory").select("id").eq("id", categoryId).eq("storeId", store.id).maybeSingle();
        if (error || !category) return json({ ok: false, message: "دسته‌بندی انتخاب‌شده معتبر نیست." }, 400);
      }
      const row = {
        storeId: store.id,
        categoryId,
        title,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim().slice(0, 4000) : null,
        itemType,
        priceAmount,
        currency: "IRR",
        inventoryCount,
        isActive: true,
      };
      const { error } = await admin.from("StoreItem").insert(row);
      if (error) throw error;
      return json(await readDashboard(admin, workspaceId), 201);
    } catch (error) {
      console.error("item create failed", error);
      return json({ ok: false, message: "ساخت محصول انجام نشد." }, 500);
    }
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
