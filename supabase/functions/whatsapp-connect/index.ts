import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const enc = new TextEncoder();

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
function toB64(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
async function appSecret(id: string) {
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  if (error || !data?.value) throw new Error(`missing_secret:${id}`);
  return data.value as string;
}
async function hasAppSecret(id: string) {
  const { data } = await admin.from("AppSecret").select("id").eq("id", id).maybeSingle();
  return Boolean(data?.id);
}
async function encryptToken(token: string) {
  const keyHex = await appSecret("whatsapp_token_encryption");
  const parts = keyHex.match(/.{1,2}/g);
  if (!parts || parts.length !== 32) throw new Error("invalid_whatsapp_encryption_key");
  const keyBytes = Uint8Array.from(parts.map((x) => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(token)));
  return `${toB64(iv)}.${toB64(encrypted)}`;
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
async function graph(path: string, accessToken: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${path}`, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  const user = await userFromRequest(request);
  if (!user) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const workspaceId = await workspaceForUser(user.id);
  if (!workspaceId) return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

  let body: { wabaId?: unknown; phoneNumberId?: unknown; accessToken?: unknown };
  try { body = await request.json(); }
  catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }

  const wabaId = typeof body.wabaId === "string" ? body.wabaId.trim() : "";
  const phoneNumberId = typeof body.phoneNumberId === "string" ? body.phoneNumberId.trim() : "";
  const accessToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  if (!/^\d{5,}$/.test(wabaId) || !/^\d{5,}$/.test(phoneNumberId) || accessToken.length < 20) {
    return json({ ok: false, code: "INVALID_INPUT", message: "WABA ID، Phone Number ID و Access Token معتبر وارد کنید." }, 400);
  }

  const phones = await graph(`${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,name_status&limit=100`, accessToken);
  if (!phones.response.ok) {
    return json({ ok: false, code: "META_AUTH_FAILED", message: phones.data?.error?.message ?? "اعتبارسنجی حساب واتساپ در Meta انجام نشد." }, phones.response.status === 401 ? 401 : 400);
  }
  const phone = Array.isArray(phones.data?.data) ? phones.data.data.find((item: any) => String(item?.id ?? "") === phoneNumberId) : null;
  if (!phone) return json({ ok: false, code: "PHONE_NOT_IN_WABA", message: "Phone Number ID واردشده متعلق به این WABA نیست." }, 400);

  const ciphertext = await encryptToken(accessToken);
  const webhookReady = await hasAppSecret("meta_app_secret");
  let webhookSubscribed = false;
  let webhookStatus: number | null = null;
  let webhookError: string | null = null;

  if (webhookReady) {
    const verifyToken = await appSecret("whatsapp_webhook_verify_token");
    const callbackUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook`;
    const subscription = await graph(`${encodeURIComponent(wabaId)}/subscribed_apps`, accessToken, {
      method: "POST",
      body: JSON.stringify({ override_callback_uri: callbackUrl, verify_token: verifyToken }),
    });
    webhookStatus = subscription.response.status;
    webhookSubscribed = subscription.response.ok && subscription.data?.success !== false && subscription.data?.error == null;
    webhookError = webhookSubscribed ? null : String(subscription.data?.error?.message ?? "Webhook subscription failed");
  }

  const now = new Date().toISOString();
  const { data: account, error } = await admin.from("WhatsAppAccount").upsert({
    workspaceId,
    wabaId,
    phoneNumberId,
    displayPhoneNumber: phone.display_phone_number ?? null,
    verifiedName: phone.verified_name ?? null,
    accessTokenCiphertext: ciphertext,
    tokenType: "SYSTEM_USER",
    status: webhookSubscribed ? "ACTIVE" : "PENDING",
    webhookSubscribed,
    qualityRating: phone.quality_rating ?? null,
    lastSyncedAt: now,
    connectionMeta: {
      nameStatus: phone.name_status ?? null,
      webhookReady,
      webhookStatus,
      webhookError,
      connectedAt: now,
    },
    updatedAt: now,
  }, { onConflict: "phoneNumberId" }).select("id,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt").single();
  if (error || !account) return json({ ok: false, message: "ذخیره اتصال واتساپ انجام نشد." }, 500);

  return json({
    ok: true,
    account,
    webhookReady,
    webhookSubscribed,
    code: webhookReady ? (webhookSubscribed ? "CONNECTED" : "WEBHOOK_SUBSCRIBE_FAILED") : "META_APP_SECRET_REQUIRED",
    message: webhookSubscribed
      ? "شماره واتساپ متصل شد و Webhook فعال است."
      : webhookReady
        ? "شماره واتساپ ذخیره شد، اما اشتراک Webhook در Meta کامل نشد."
        : "شماره واتساپ اعتبارسنجی و ذخیره شد. برای فعال شدن Webhook باید Meta App Secret در پنل پلتفرم تنظیم شود.",
  }, 200);
});
