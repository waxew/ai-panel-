import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) { return Response.json(data, { status, headers: corsHeaders }); }

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}
function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function decryptToken(ciphertext: string, keyHex: string) {
  const [version, iv64, data64] = ciphertext.split(":");
  if (version !== "v1" || !iv64 || !data64) throw new Error("invalid_ciphertext");
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv64) }, key, fromBase64(data64));
  return new TextDecoder().decode(plain);
}

async function getWorkspaceIds(admin: any, userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => row.workspaceId as string);
}

async function getBotForUser(admin: any, userId: string, botId: string) {
  const workspaceIds = await getWorkspaceIds(admin, userId);
  if (!workspaceIds.length) return null;
  const { data } = await admin.from("DiscordBot").select("*").eq("id", botId).in("workspaceId", workspaceIds).maybeSingle();
  return data ?? null;
}

async function discordCall(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: { authorization: `Bot ${token}`, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function syncCommands(admin: any, bot: any) {
  const { data: secret } = await admin.from("AppSecret").select("value").eq("id", "discord_token_encryption").single();
  if (!secret?.value) throw new Error("missing_secret");
  const token = await decryptToken(bot.tokenCiphertext, secret.value);
  const { data: commands, error } = await admin.from("DiscordCommand").select("name,description,isActive,sortOrder").eq("botId", bot.id).eq("isActive", true).order("sortOrder");
  if (error) throw new Error(error.message);
  const payload = (commands ?? []).map((command: any) => ({ name: command.name, description: command.description || command.name, type: 1 }));
  const result = await discordCall(token, `/applications/${bot.applicationId}/commands`, { method: "PUT", body: JSON.stringify(payload) });
  if (!result.ok) throw new Error(`discord_sync:${result.status}`);
  return result.data;
}

const authenticated = withSupabase({ auth: "user" }, async (request, ctx) => {
  const userId = ctx.userClaims?.id;
  if (!userId) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const admin = ctx.supabaseAdmin;
  const workspaceIds = await getWorkspaceIds(admin, userId);

  if (request.method === "GET") {
    if (!workspaceIds.length) return json({ ok: true, bots: [], commands: [] });
    const { data: bots, error: botsError } = await admin.from("DiscordBot").select("id,workspaceId,applicationId,botUserId,username,displayName,description,status,defaultGuildId,defaultChannelId,settings,createdAt,updatedAt").in("workspaceId", workspaceIds).order("createdAt", { ascending: false });
    if (botsError) return json({ ok: false, message: "دریافت ربات‌های Discord انجام نشد." }, 500);
    const botIds = (bots ?? []).map((bot: any) => bot.id);
    let commands: any[] = [];
    if (botIds.length) {
      const { data, error } = await admin.from("DiscordCommand").select("id,botId,name,description,responseText,responseEphemeral,isActive,executions,lastUsedAt,sortOrder,createdAt,updatedAt").in("botId", botIds).order("sortOrder");
      if (error) return json({ ok: false, message: "دریافت فرمان‌ها انجام نشد." }, 500);
      commands = data ?? [];
    }
    const enriched = (bots ?? []).map((bot: any) => ({
      ...bot,
      installUrl: `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(bot.applicationId)}&permissions=274877975552&integration_type=0&scope=bot+applications.commands`,
      interactionsEndpoint: `https://spncmjuvnvfkrahjnyjm.supabase.co/functions/v1/discord-interactions/${bot.applicationId}`,
    }));
    return json({ ok: true, bots: enriched, commands });
  }

  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = String(body.action ?? "");

  if (action === "update_bot") {
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    if (!bot) return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    const patch = {
      displayName: typeof body.displayName === "string" ? body.displayName.trim().slice(0, 100) : bot.displayName,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : bot.description,
      defaultGuildId: typeof body.defaultGuildId === "string" ? body.defaultGuildId.trim() || null : bot.defaultGuildId,
      defaultChannelId: typeof body.defaultChannelId === "string" ? body.defaultChannelId.trim() || null : bot.defaultChannelId,
      updatedAt: new Date().toISOString(),
    };
    const { error } = await admin.from("DiscordBot").update(patch).eq("id", bot.id);
    if (error) return json({ ok: false, message: "ذخیره تنظیمات انجام نشد." }, 500);
    return json({ ok: true });
  }

  if (action === "create_command") {
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    if (!bot) return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    const name = String(body.name ?? "").trim().toLowerCase();
    if (!/^[a-z0-9_-]{1,32}$/.test(name)) return json({ ok: false, message: "نام فرمان باید ۱ تا ۳۲ کاراکتر انگلیسی کوچک، عدد، - یا _ باشد." }, 400);
    const description = String(body.description ?? "").trim().slice(0, 100);
    const responseText = String(body.responseText ?? "").trim().slice(0, 1900);
    if (!description || !responseText) return json({ ok: false, message: "توضیح و پاسخ فرمان را وارد کنید." }, 400);
    const { error } = await admin.from("DiscordCommand").insert({ id: crypto.randomUUID(), botId: bot.id, name, description, responseText, responseEphemeral: Boolean(body.responseEphemeral), isActive: true, executions: 0, sortOrder: Number(body.sortOrder ?? 100), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (error) return json({ ok: false, message: error.code === "23505" ? "این نام فرمان قبلاً استفاده شده است." : "ساخت فرمان انجام نشد." }, 500);
    try { await syncCommands(admin, bot); } catch (error) { console.error(error); }
    return json({ ok: true });
  }

  if (action === "update_command") {
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    if (!bot) return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    const commandId = String(body.commandId ?? "");
    const { data: command } = await admin.from("DiscordCommand").select("id").eq("id", commandId).eq("botId", bot.id).maybeSingle();
    if (!command) return json({ ok: false, message: "فرمان پیدا نشد." }, 404);
    const patch: any = { updatedAt: new Date().toISOString() };
    if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 100);
    if (typeof body.responseText === "string") patch.responseText = body.responseText.trim().slice(0, 1900);
    if (typeof body.responseEphemeral === "boolean") patch.responseEphemeral = body.responseEphemeral;
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
    const { error } = await admin.from("DiscordCommand").update(patch).eq("id", commandId);
    if (error) return json({ ok: false, message: "ویرایش فرمان انجام نشد." }, 500);
    try { await syncCommands(admin, bot); } catch (error) { console.error(error); }
    return json({ ok: true });
  }

  if (action === "delete_command") {
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    if (!bot) return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    const { error } = await admin.from("DiscordCommand").delete().eq("id", String(body.commandId ?? "")).eq("botId", bot.id);
    if (error) return json({ ok: false, message: "حذف فرمان انجام نشد." }, 500);
    try { await syncCommands(admin, bot); } catch (error) { console.error(error); }
    return json({ ok: true });
  }

  if (action === "sync_commands") {
    const bot = await getBotForUser(admin, userId, String(body.botId ?? ""));
    if (!bot) return json({ ok: false, message: "ربات پیدا نشد." }, 404);
    try { const result = await syncCommands(admin, bot); return json({ ok: true, synced: Array.isArray(result) ? result.length : 0 }); }
    catch (error) { console.error(error); return json({ ok: false, message: "همگام‌سازی فرمان‌ها با Discord انجام نشد." }, 502); }
  }

  return json({ ok: false, message: "عملیات ناشناخته است." }, 400);
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
