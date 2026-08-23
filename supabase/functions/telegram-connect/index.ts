import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

type TelegramBotIdentity = { id: number; is_bot: boolean; first_name: string; username?: string };
type TelegramApiResponse<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function parseTelegramToken(token: string) {
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  return match ? { botId: match[1] } : null;
}

async function telegramCall<T>(token: string, method: string, body?: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json", accept: "application/json" } : { accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    return (await response.json()) as TelegramApiResponse<T>;
  } finally {
    clearTimeout(timeout);
  }
}

function fromHex(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("Invalid encryption key");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

async function encryptToken(token: string, keyHex: string) {
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token)));
  return `v1:${toBase64(iv)}:${toBase64(encrypted)}`;
}

async function getWorkspace(admin: any, userId: string, email: string) {
  const { error: userError } = await admin.from("User").upsert({ id: userId, email }, { onConflict: "id" });
  if (userError) throw new Error(`user_upsert:${userError.message}`);

  const { data: memberships, error: membershipError } = await admin
    .from("WorkspaceMember")
    .select("workspaceId")
    .eq("userId", userId)
    .limit(1);
  if (membershipError) throw new Error(`membership_read:${membershipError.message}`);
  if (memberships?.[0]?.workspaceId) return memberships[0].workspaceId as string;

  const workspaceId = `${userId}:workspace`;
  const memberId = `${userId}:member`;
  const { error: workspaceError } = await admin.from("Workspace").upsert({ id: workspaceId, name: "فضای کاری من" }, { onConflict: "id" });
  if (workspaceError) throw new Error(`workspace_create:${workspaceError.message}`);
  const { error: memberError } = await admin.from("WorkspaceMember").upsert({ id: memberId, workspaceId, userId, role: "CUSTOMER" }, { onConflict: "id" });
  if (memberError) throw new Error(`membership_create:${memberError.message}`);
  return workspaceId;
}

async function ensureDefaultButtons(admin: any, botId: string) {
  const { count, error } = await admin.from("TelegramButton").select("id", { count: "exact", head: true }).eq("botId", botId);
  if (error) throw new Error(`button_count:${error.message}`);
  if ((count ?? 0) > 0) return;

  const rows = [
    { title: "🛍 محصولات", actionType: "CATALOG", actionValue: "catalog", sortOrder: 10 },
    { title: "🛒 سبد خرید", actionType: "CART", actionValue: "cart", sortOrder: 20 },
    { title: "📦 سفارش‌های من", actionType: "ORDERS", actionValue: "orders", sortOrder: 30 },
    { title: "☎️ پشتیبانی", actionType: "SUPPORT", actionValue: "support", sortOrder: 40 },
  ].map((item) => ({ id: crypto.randomUUID(), botId, parentId: null, ...item }));

  const { error: insertError } = await admin.from("TelegramButton").insert(rows);
  if (insertError) throw new Error(`button_insert:${insertError.message}`);
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method === "GET") return json({ ok: true, service: "telegram-connect", auth: "user", version: 3 });
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  const userId = ctx.userClaims?.id;
  const email = ctx.userClaims?.email;
  if (!userId || !email) return json({ ok: false, message: "حساب کاربری معتبر نیست." }, 401);

  let body: { token?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  if (typeof body.token !== "string") return json({ ok: false, message: "توکن واردشده معتبر نیست." }, 400);

  const token = body.token.trim();
  if (!parseTelegramToken(token)) return json({ ok: false, message: "فرمت توکن BotFather صحیح نیست." }, 400);

  let identity: TelegramApiResponse<TelegramBotIdentity>;
  try { identity = await telegramCall<TelegramBotIdentity>(token, "getMe"); }
  catch { return json({ ok: false, message: "ارتباط با Telegram برقرار نشد. دوباره تلاش کنید." }, 502); }
  if (!identity.ok || !identity.result?.is_bot) return json({ ok: false, message: "Telegram این توکن را تأیید نکرد. توکن BotFather را بررسی کنید." }, 401);

  const admin = ctx.supabaseAdmin;
  let workspaceId: string;
  try { workspaceId = await getWorkspace(admin, userId, email); }
  catch (error) { console.error("workspace setup failed", error); return json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500); }

  const telegramBotId = String(identity.result.id);
  const { data: existingBots, error: existingError } = await admin.from("TelegramBot").select("id,workspaceId").eq("telegramBotId", telegramBotId).limit(1);
  if (existingError) return json({ ok: false, message: "بررسی وضعیت ربات انجام نشد." }, 500);
  const existingBot = existingBots?.[0];
  if (existingBot && existingBot.workspaceId !== workspaceId) return json({ ok: false, message: "این ربات قبلاً به حساب مشتری دیگری متصل شده است." }, 409);

  const { data: secret, error: secretError } = await admin.from("AppSecret").select("value").eq("id", "telegram_token_encryption").single();
  if (secretError || !secret?.value) return json({ ok: false, message: "کلید رمزنگاری در دسترس نیست." }, 500);

  let tokenCiphertext: string;
  try { tokenCiphertext = await encryptToken(token, secret.value); }
  catch { return json({ ok: false, message: "رمزنگاری توکن انجام نشد." }, 500); }

  const webhookSecret = randomSecret();
  const webhookSecretHash = await sha256(webhookSecret);
  const row = {
    workspaceId,
    telegramBotId,
    username: identity.result.username ?? null,
    displayName: identity.result.first_name,
    tokenCiphertext,
    webhookSecretHash,
    status: "ACTIVE",
  };

  const { data: bot, error: saveError } = await admin.from("TelegramBot")
    .upsert(row, { onConflict: "telegramBotId" })
    .select("id,telegramBotId,username,displayName,description,status,welcomeMessage")
    .single();
  if (saveError || !bot) return json({ ok: false, message: "ذخیره ربات در دیتابیس انجام نشد." }, 500);

  try { await ensureDefaultButtons(admin, bot.id); }
  catch (error) { console.error("default buttons failed", error); }

  const webhookUrl = `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/telegram-webhook/${telegramBotId}`;
  let webhookResult: TelegramApiResponse<boolean>;
  try {
    webhookResult = await telegramCall<boolean>(token, "setWebhook", {
      url: webhookUrl,
      secret_token: webhookSecret,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    });
  } catch (error) {
    console.error("telegram setWebhook failed", error);
    await admin.from("TelegramBot").update({ webhookSecretHash: null }).eq("id", bot.id);
    return json({ ok: false, message: "ربات ذخیره شد اما Webhook تلگرام فعال نشد. دوباره اتصال را انجام دهید." }, 502);
  }

  if (!webhookResult.ok) {
    console.error("telegram setWebhook rejected", webhookResult);
    await admin.from("TelegramBot").update({ webhookSecretHash: null }).eq("id", bot.id);
    return json({ ok: false, message: "Telegram تنظیم Webhook را نپذیرفت. توکن و دسترسی ربات را بررسی کنید." }, 502);
  }

  return json({
    ok: true,
    status: "connected",
    persisted: true,
    webhookConfigured: true,
    bot: {
      id: bot.id,
      telegramBotId: bot.telegramBotId,
      username: bot.username ?? undefined,
      displayName: bot.displayName ?? undefined,
      description: bot.description ?? undefined,
      status: bot.status,
    },
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
