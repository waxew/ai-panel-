import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const enc = new TextEncoder();

function hex(bytes: Uint8Array) { return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function sha256(value: string) { return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)))); }
async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))));
}
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0; for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i); return out === 0;
}
async function appSecret(id: string) {
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  if (error || !data?.value) throw new Error(`missing_secret:${id}`);
  return data.value as string;
}
function fromB64(value: string) { return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)); }
async function decryptToken(ciphertext: string) {
  const keyHex = await appSecret("instagram_token_encryption");
  const keyBytes = Uint8Array.from(keyHex.match(/.{1,2}/g)!.map((x) => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const [iv64, data64] = ciphertext.split(".");
  if (!iv64 || !data64) throw new Error("invalid_ciphertext");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv64) }, key, fromB64(data64));
  return new TextDecoder().decode(plain);
}
function normalize(value: unknown) { return typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""; }
function matches(text: string, keywords: unknown) {
  const list = Array.isArray(keywords) ? keywords.map(normalize).filter(Boolean) : [];
  const haystack = normalize(text); return list.some((word) => haystack.includes(word));
}
async function eventRow(data: Record<string, unknown>) { await admin.from("InstagramAutomationEvent").insert(data); }

async function processComment(value: any) {
  const commentId = String(value?.id ?? value?.comment_id ?? "");
  const mediaId = String(value?.media?.id ?? value?.media_id ?? "");
  const text = String(value?.text ?? "");
  const username = String(value?.from?.username ?? value?.username ?? "");
  const userId = String(value?.from?.id ?? value?.user_id ?? "");
  const igUserId = String(value?.media?.owner?.id ?? value?.recipient?.id ?? value?.ig_user_id ?? "");
  if (!commentId || !text) return;

  const providerEventId = await sha256(`comment:${commentId}`);
  const { data: existing } = await admin.from("InstagramAutomationEvent").select("id").eq("providerEventId", providerEventId).maybeSingle();
  if (existing) return;

  let accountQuery = admin.from("InstagramAccount").select("id,workspaceId,metaAccountId,accessTokenCiphertext,status,webhookSubscribed");
  if (igUserId) accountQuery = accountQuery.eq("metaAccountId", igUserId);
  const { data: account } = await accountQuery.eq("status", "ACTIVE").limit(1).maybeSingle();
  if (!account) return;

  await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, eventType: "COMMENT", providerEventId, sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome: "RECEIVED", metadata: { commentId, mediaId } });

  const { data: rules } = await admin.from("InstagramAutomationRule").select("id,triggerConfig,actionConfig,executions").eq("workspaceId", account.workspaceId).eq("instagramAccountId", account.id).eq("triggerType", "COMMENT_KEYWORD").eq("isActive", true);
  const rule = (rules ?? []).find((r: any) => matches(text, r.triggerConfig?.keywords));
  if (!rule) return;

  if (!account.accessTokenCiphertext || !account.webhookSubscribed) {
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome: "FAILED", metadata: { commentId, reason: "account_not_ready" } });
    return;
  }

  const message = String(rule.actionConfig?.message ?? "").trim();
  if (!message) return;
  try {
    const token = await decryptToken(account.accessTokenCiphertext);
    const response = await fetch(`https://graph.instagram.com/${META_API_VERSION}/${account.metaAccountId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: message } }),
    });
    const result = await response.json().catch(() => ({}));
    const outcome = response.ok ? "SENT" : "FAILED";
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceUserId: userId || null, sourceUsername: username || null, sourceText: text, outcome, metadata: { commentId, mediaId, meta: result } });
    if (response.ok) await admin.from("InstagramAutomationRule").update({ executions: Number(rule.executions ?? 0) + 1, lastTriggeredAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq("id", rule.id);
  } catch (error) {
    await eventRow({ workspaceId: account.workspaceId, instagramAccountId: account.id, ruleId: rule.id, eventType: "COMMENT", sourceText: text, outcome: "FAILED", metadata: { commentId, reason: String(error) } });
  }
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (request.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token") ?? "";
    const challenge = url.searchParams.get("hub.challenge") ?? "";
    const expected = await appSecret("instagram_webhook_verify_token").catch(() => "");
    if (mode === "subscribe" && expected && timingSafeEqual(token, expected)) return new Response(challenge, { status: 200 });
    return new Response("Forbidden", { status: 403 });
  }
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const raw = await request.text();
  if (!META_APP_SECRET) return new Response("Meta secret not configured", { status: 503 });
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const expected = `sha256=${await hmacHex(META_APP_SECRET, raw)}`;
  if (!timingSafeEqual(signature, expected)) return new Response("Invalid signature", { status: 401 });

  let payload: any; try { payload = JSON.parse(raw); } catch { return new Response("Bad request", { status: 400 }); }
  const jobs: Promise<void>[] = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) if (change?.field === "comments") jobs.push(processComment({ ...change.value, ig_user_id: entry.id }));
  }
  await Promise.allSettled(jobs);
  return Response.json({ ok: true });
});
