import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

type DiscordUser = { id: string; username: string; global_name?: string | null; bot?: boolean };
type DiscordApplication = { id: string; name: string; description?: string; icon?: string | null; bot_public?: boolean; public_key: string };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
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

async function encryptToken(token: string, keyHex: string) {
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token)));
  return `v1:${toBase64(iv)}:${toBase64(encrypted)}`;
}

async function discordCall<T>(token: string, path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://discord.com/api/v10${path}`, {
      ...init,
      headers: {
        authorization: `Bot ${token}`,
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data: data as T };
  } finally {
    clearTimeout(timeout);
  }
}

async function getWorkspace(admin: any, userId: string, email: string) {
  const { error: userError } = await admin.from("User").upsert({ id: userId, email }, { onConflict: "id" });
  if (userError) throw new Error(`user_upsert:${userError.message}`);
  const { data: memberships, error: membershipError } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (membershipError) throw new Error(`membership_read:${membershipError.message}`);
  if (memberships?.[0]?.workspaceId) return memberships[0].workspaceId as string;
  const workspaceId = `${userId}:workspace`;
  await admin.from("Workspace").upsert({ id: workspaceId, name: "فضای کاری من" }, { onConflict: "id" });
  await admin.from("WorkspaceMember").upsert({ id: `${userId}:member`, workspaceId, userId, role: "CUSTOMER" }, { onConflict: "id" });
  return workspaceId;
}

async function ensureDefaultCommands(admin: any, botId: string) {
  const { count } = await admin.from("DiscordCommand").select("id", { count: "exact", head: true }).eq("botId", botId);
  if ((count ?? 0) > 0) return;
  const rows = [
    { name: "help", description: "نمایش راهنمای ربات", responseText: "سلام! من ربات AI Panel هستم. مدیر سرور می‌تواند فرمان‌ها و پاسخ‌های من را از پنل تنظیم کند.", sortOrder: 10 },
    { name: "products", description: "نمایش محصولات و خدمات", responseText: "کاتالوگ فروشگاه هنوز برای این سرور تنظیم نشده است.", sortOrder: 20 },
    { name: "support", description: "ارتباط با پشتیبانی", responseText: "اطلاعات پشتیبانی هنوز تنظیم نشده است.", sortOrder: 30 },
  ].map((row) => ({ id: crypto.randomUUID(), botId, responseEphemeral: false, isActive: true, executions: 0, ...row }));
  const { error } = await admin.from("DiscordCommand").insert(rows);
  if (error) throw new Error(error.message);
}

async function syncCommands(admin: any, bot: any, token: string) {
  const { data: commands, error } = await admin.from("DiscordCommand").select("name,description,isActive,sortOrder").eq("botId", bot.id).eq("isActive", true).order("sortOrder");
  if (error) throw new Error(error.message);
  const payload = (commands ?? []).map((command: any) => ({ name: command.name, description: command.description || command.name, type: 1 }));
  const result = await discordCall<any[]>(token, `/applications/${bot.applicationId}/commands`, { method: "PUT", body: JSON.stringify(payload) });
  if (!result.ok) throw new Error(`discord_sync:${result.status}`);
  return result.data;
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  if (request.method === "GET") return json({ ok: true, service: "discord-connect", version: 1 });
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  const userId = ctx.userClaims?.id;
  const email = ctx.userClaims?.email;
  if (!userId || !email) return json({ ok: false, message: "حساب کاربری معتبر نیست." }, 401);

  let body: { token?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  if (typeof body.token !== "string" || body.token.trim().length < 30) return json({ ok: false, message: "Bot Token دیسکورد معتبر نیست." }, 400);
  const token = body.token.trim();

  let identity: Awaited<ReturnType<typeof discordCall<DiscordUser>>>;
  let application: Awaited<ReturnType<typeof discordCall<DiscordApplication>>>;
  try {
    [identity, application] = await Promise.all([
      discordCall<DiscordUser>(token, "/users/@me"),
      discordCall<DiscordApplication>(token, "/oauth2/applications/@me"),
    ]);
  } catch {
    return json({ ok: false, message: "ارتباط با Discord برقرار نشد. دوباره تلاش کنید." }, 502);
  }
  if (!identity.ok || !application.ok || !identity.data?.id || !application.data?.id || !application.data?.public_key) {
    return json({ ok: false, message: "Discord این Bot Token را تأیید نکرد." }, 401);
  }

  const admin = ctx.supabaseAdmin;
  let workspaceId: string;
  try { workspaceId = await getWorkspace(admin, userId, email); }
  catch (error) { console.error(error); return json({ ok: false, message: "فضای کاری مشتری آماده نشد." }, 500); }

  const { data: existingBots, error: existingError } = await admin.from("DiscordBot").select("id,workspaceId").eq("applicationId", application.data.id).limit(1);
  if (existingError) return json({ ok: false, message: "بررسی وضعیت ربات انجام نشد." }, 500);
  const existing = existingBots?.[0];
  if (existing && existing.workspaceId !== workspaceId) return json({ ok: false, message: "این Discord Application قبلاً به حساب دیگری متصل شده است." }, 409);

  const { data: secret, error: secretError } = await admin.from("AppSecret").select("value").eq("id", "discord_token_encryption").single();
  if (secretError || !secret?.value) return json({ ok: false, message: "کلید رمزنگاری Discord در دسترس نیست." }, 500);
  let tokenCiphertext: string;
  try { tokenCiphertext = await encryptToken(token, secret.value); }
  catch { return json({ ok: false, message: "رمزنگاری Bot Token انجام نشد." }, 500); }

  const row = {
    workspaceId,
    applicationId: application.data.id,
    botUserId: identity.data.id,
    username: identity.data.username ?? null,
    displayName: identity.data.global_name ?? application.data.name ?? identity.data.username,
    description: application.data.description ?? null,
    publicKey: application.data.public_key,
    tokenCiphertext,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  };
  const { data: bot, error: saveError } = await admin.from("DiscordBot").upsert(row, { onConflict: "applicationId" }).select("id,workspaceId,applicationId,botUserId,username,displayName,description,publicKey,status,defaultGuildId,defaultChannelId,settings,createdAt,updatedAt").single();
  if (saveError || !bot) { console.error(saveError); return json({ ok: false, message: "ذخیره ربات Discord انجام نشد." }, 500); }

  try {
    await ensureDefaultCommands(admin, bot.id);
    await syncCommands(admin, bot, token);
  } catch (error) {
    console.error("discord default sync failed", error);
  }

  const installUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(bot.applicationId)}&permissions=274877975552&integration_type=0&scope=bot+applications.commands`;
  const interactionsEndpoint = `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/discord-interactions/${bot.applicationId}`;
  return json({ ok: true, status: "connected", bot, installUrl, interactionsEndpoint });
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
