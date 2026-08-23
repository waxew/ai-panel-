import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_APP_ID = Deno.env.get("META_APP_ID") ?? "";
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
const APP_URL = (Deno.env.get("APP_URL") ?? "https://ai-panel-demo.bustling-larch.workers.dev").replace(/\/$/, "");
const CALLBACK_URL = Deno.env.get("INSTAGRAM_OAUTH_REDIRECT_URI") ?? `${SUPABASE_URL}/functions/v1/instagram-connect/callback`;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const enc = new TextEncoder();

const corsHeaders = {
  "Access-Control-Allow-Origin": APP_URL,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { ...corsHeaders, "Cache-Control": "no-store" } }); }
function hex(bytes: Uint8Array) { return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function sha256(value: string) { return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)))); }
function toB64(bytes: Uint8Array) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); }
async function appSecret(id: string) {
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  if (error || !data?.value) throw new Error(`missing_secret:${id}`);
  return data.value as string;
}
async function encryptToken(token: string) {
  const keyHex = await appSecret("instagram_token_encryption");
  const keyBytes = Uint8Array.from(keyHex.match(/.{1,2}/g)!.map((x) => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(token)));
  return `${toB64(iv)}.${toB64(encrypted)}`;
}
function redirectResult(kind: "connected" | "error", detail?: string) {
  const url = new URL(`${APP_URL}/app/instagram`);
  url.searchParams.set("instagram", kind);
  if (detail) url.searchParams.set("detail", detail.slice(0, 100));
  return Response.redirect(url.toString(), 302);
}
async function userFromRequest(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return null;
  const { data, error } = await admin.auth.getUser(jwt);
  return error ? null : data.user;
}
async function workspaceForUser(userId: string) {
  const { data, error } = await admin.from("WorkspaceMember").select("workspaceId").eq("userId", userId).limit(1);
  if (error) throw error;
  return data?.[0]?.workspaceId as string | undefined;
}
async function exchangeToken(code: string) {
  const body = new URLSearchParams({ client_id: META_APP_ID, client_secret: META_APP_SECRET, grant_type: "authorization_code", redirect_uri: CALLBACK_URL, code });
  const shortResponse = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const short = await shortResponse.json();
  if (!shortResponse.ok || !short.access_token) throw new Error(`short_token:${short.error_message ?? short.error?.message ?? shortResponse.status}`);

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", META_APP_SECRET);
  longUrl.searchParams.set("access_token", short.access_token);
  const longResponse = await fetch(longUrl);
  const long = await longResponse.json();
  if (!longResponse.ok || !long.access_token) return { accessToken: short.access_token as string, expiresIn: Number(short.expires_in ?? 3600) };
  return { accessToken: long.access_token as string, expiresIn: Number(long.expires_in ?? 5184000) };
}
async function fetchProfile(token: string) {
  const url = new URL(`https://graph.instagram.com/${META_API_VERSION}/me`);
  url.searchParams.set("fields", "id,username,account_type");
  url.searchParams.set("access_token", token);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.id) throw new Error(`profile:${data.error?.message ?? response.status}`);
  return data as { id: string; username?: string; account_type?: string };
}
async function subscribeWebhooks(igUserId: string, token: string) {
  const url = new URL(`https://graph.instagram.com/${META_API_VERSION}/${igUserId}/subscribed_apps`);
  url.searchParams.set("subscribed_fields", "comments,messages");
  url.searchParams.set("access_token", token);
  const response = await fetch(url, { method: "POST" });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok && data?.success !== false, status: response.status, data };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(request.url);

  if (request.method === "POST" && (url.pathname.endsWith("/instagram-connect") || url.pathname.endsWith("/instagram-connect/"))) {
    if (!META_APP_ID || !META_APP_SECRET) return json({ ok: false, code: "META_NOT_CONFIGURED", message: "Meta App ID / App Secret هنوز روی سرور تنظیم نشده است." }, 503);
    const user = await userFromRequest(request);
    if (!user) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
    const workspaceId = await workspaceForUser(user.id);
    if (!workspaceId) return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

    const state = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const stateHash = await sha256(state);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await admin.from("InstagramOAuthState").insert({ workspaceId, userId: user.id, stateHash, redirectUri: CALLBACK_URL, expiresAt });
    if (error) return json({ ok: false, message: "ساخت OAuth state انجام نشد." }, 500);

    const authUrl = new URL("https://www.instagram.com/oauth/authorize");
    authUrl.searchParams.set("enable_fb_login", "0");
    authUrl.searchParams.set("force_authentication", "1");
    authUrl.searchParams.set("client_id", META_APP_ID);
    authUrl.searchParams.set("redirect_uri", CALLBACK_URL);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish");
    authUrl.searchParams.set("state", state);
    return json({ ok: true, authorizationUrl: authUrl.toString(), callbackUrl: CALLBACK_URL });
  }

  if (request.method === "GET" && url.pathname.endsWith("/instagram-connect/callback")) {
    if (!META_APP_ID || !META_APP_SECRET) return redirectResult("error", "meta_not_configured");
    const code = url.searchParams.get("code") ?? "";
    const state = url.searchParams.get("state") ?? "";
    const providerError = url.searchParams.get("error") ?? url.searchParams.get("error_reason") ?? "";
    if (providerError) return redirectResult("error", providerError);
    if (!code || !state) return redirectResult("error", "missing_code_or_state");

    const stateHash = await sha256(state);
    const { data: oauthState, error: stateError } = await admin.from("InstagramOAuthState")
      .select("id,workspaceId,userId,redirectUri,expiresAt,consumedAt")
      .eq("stateHash", stateHash).maybeSingle();
    if (stateError || !oauthState || oauthState.consumedAt || new Date(oauthState.expiresAt).getTime() < Date.now() || oauthState.redirectUri !== CALLBACK_URL) return redirectResult("error", "invalid_state");

    const consumedAt = new Date().toISOString();
    const { data: claimed } = await admin.from("InstagramOAuthState").update({ consumedAt }).eq("id", oauthState.id).is("consumedAt", null).select("id").maybeSingle();
    if (!claimed) return redirectResult("error", "state_already_used");

    try {
      const exchanged = await exchangeToken(code);
      const profile = await fetchProfile(exchanged.accessToken);
      const ciphertext = await encryptToken(exchanged.accessToken);
      const subscription = await subscribeWebhooks(profile.id, exchanged.accessToken);
      const expiresAt = new Date(Date.now() + exchanged.expiresIn * 1000).toISOString();
      const now = new Date().toISOString();

      const { error: upsertError } = await admin.from("InstagramAccount").upsert({
        workspaceId: oauthState.workspaceId,
        username: profile.username ?? `instagram-${profile.id}`,
        displayName: profile.username ?? null,
        metaAccountId: profile.id,
        accessTokenCiphertext: ciphertext,
        permissions: ["instagram_business_basic", "instagram_business_manage_messages", "instagram_business_manage_comments", "instagram_business_content_publish"],
        webhookSubscribed: subscription.ok,
        status: subscription.ok ? "ACTIVE" : "PENDING",
        tokenExpiresAt: expiresAt,
        tokenRefreshedAt: now,
        lastSyncedAt: now,
        connectionMeta: { accountType: profile.account_type ?? null, webhookStatus: subscription.status, connectedAt: now },
        updatedAt: now,
      }, { onConflict: "metaAccountId" });
      if (upsertError) throw new Error(`account:${upsertError.message}`);
      return redirectResult("connected");
    } catch (error) {
      console.error("instagram oauth callback failed", error);
      return redirectResult("error", "connection_failed");
    }
  }

  return json({ ok: false, message: "Not found" }, 404);
});
