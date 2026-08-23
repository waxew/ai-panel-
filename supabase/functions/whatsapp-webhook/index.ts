import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const enc = new TextEncoder();

function hex(bytes: Uint8Array) { return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
function fromB64(value: string) { return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)); }
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body))));
}
async function appSecret(id: string) {
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  if (error || !data?.value) throw new Error(`missing_secret:${id}`);
  return data.value as string;
}
async function decryptToken(ciphertext: string) {
  const keyHex = await appSecret("whatsapp_token_encryption");
  const parts = keyHex.match(/.{1,2}/g);
  if (!parts || parts.length !== 32) throw new Error("invalid_whatsapp_encryption_key");
  const keyBytes = Uint8Array.from(parts.map((x) => parseInt(x, 16)));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);
  const [iv64, data64] = ciphertext.split(".");
  if (!iv64 || !data64) throw new Error("invalid_ciphertext");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv64) }, key, fromB64(data64));
  return new TextDecoder().decode(plain);
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
function normalize(value: unknown) { return typeof value === "string" ? value.trim().toLocaleLowerCase("fa") : ""; }
function matches(text: string, keywords: unknown) {
  const list = Array.isArray(keywords) ? keywords.map(normalize).filter(Boolean) : [];
  const haystack = normalize(text);
  return list.some((word) => haystack.includes(word));
}
function timestamp(value: unknown) {
  const seconds = Number(value ?? 0);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date();
}
function messageBody(message: any) {
  if (message?.type === "text") return String(message?.text?.body ?? "");
  if (message?.type === "button") return String(message?.button?.text ?? message?.button?.payload ?? "");
  if (message?.type === "interactive") return String(message?.interactive?.button_reply?.title ?? message?.interactive?.button_reply?.id ?? message?.interactive?.list_reply?.title ?? message?.interactive?.list_reply?.id ?? "");
  if (message?.type === "image") return String(message?.image?.caption ?? "");
  if (message?.type === "document") return String(message?.document?.caption ?? message?.document?.filename ?? "");
  if (message?.type === "video") return String(message?.video?.caption ?? "");
  if (message?.type === "location") return `${message?.location?.latitude ?? ""},${message?.location?.longitude ?? ""}`;
  if (message?.type === "order") return "order";
  return "";
}
async function accountForPhoneNumberId(phoneNumberId: string) {
  const { data, error } = await admin.from("WhatsAppAccount")
    .select("id,workspaceId,wabaId,phoneNumberId,accessTokenCiphertext,status,webhookSubscribed")
    .eq("phoneNumberId", phoneNumberId).maybeSingle();
  if (error) throw error;
  return data as any;
}
async function sendAutoReply(account: any, conversation: any, text: string, rule: any) {
  if (!text.trim()) return;
  const windowEnd = conversation.customerServiceWindowExpiresAt ? new Date(conversation.customerServiceWindowExpiresAt).getTime() : 0;
  if (windowEnd <= Date.now()) return;
  const token = await decryptToken(account.accessTokenCiphertext);
  const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: conversation.waUserId, type: "text", text: { preview_url: false, body: text } }),
  });
  if (!result.response.ok) {
    console.error("whatsapp auto reply failed", result.data);
    return;
  }
  const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
  await admin.from("WhatsAppMessage").insert({
    workspaceId: account.workspaceId,
    whatsappAccountId: account.id,
    conversationId: conversation.id,
    providerMessageId,
    direction: "OUTBOUND",
    messageType: "text",
    body: text,
    status: "SENT",
    isTemplate: false,
    providerTimestamp: new Date().toISOString(),
    metadata: { source: "automation", ruleId: rule.id },
  });
  await admin.from("WhatsAppAutomationRule").update({
    executions: Number(rule.executions ?? 0) + 1,
    lastTriggeredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).eq("id", rule.id);
}
async function processIncoming(account: any, value: any, message: any) {
  const providerMessageId = String(message?.id ?? "");
  const waUserId = String(message?.from ?? "");
  if (!providerMessageId || !waUserId) return;
  const { data: duplicate } = await admin.from("WhatsAppMessage").select("id").eq("providerMessageId", providerMessageId).maybeSingle();
  if (duplicate) return;

  const sentAt = timestamp(message?.timestamp);
  const sentAtIso = sentAt.toISOString();
  const windowExpiresAt = new Date(sentAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const contact = Array.isArray(value?.contacts) ? value.contacts.find((x: any) => String(x?.wa_id ?? "") === waUserId) : null;
  const customerName = contact?.profile?.name ? String(contact.profile.name) : null;

  let { data: conversation, error: conversationError } = await admin.from("WhatsAppConversation")
    .select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount")
    .eq("whatsappAccountId", account.id).eq("waUserId", waUserId).maybeSingle();
  if (conversationError) throw conversationError;
  if (!conversation) {
    const created = await admin.from("WhatsAppConversation").insert({
      workspaceId: account.workspaceId,
      whatsappAccountId: account.id,
      waUserId,
      customerPhone: waUserId,
      customerName,
      status: "OPEN",
      lastMessageAt: sentAtIso,
      customerServiceWindowExpiresAt: windowExpiresAt,
      unreadCount: 1,
      metadata: { source: "webhook" },
    }).select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount").single();
    if (created.error) throw created.error;
    conversation = created.data;
  } else {
    const { data: updated, error } = await admin.from("WhatsAppConversation").update({
      customerPhone: waUserId,
      customerName: customerName ?? conversation.customerName,
      status: "OPEN",
      lastMessageAt: sentAtIso,
      customerServiceWindowExpiresAt: windowExpiresAt,
      unreadCount: Number(conversation.unreadCount ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    }).eq("id", conversation.id).select("id,workspaceId,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount").single();
    if (error) throw error;
    conversation = updated;
  }

  const body = messageBody(message);
  const messageType = String(message?.type ?? "unknown");
  const { error: insertError } = await admin.from("WhatsAppMessage").insert({
    workspaceId: account.workspaceId,
    whatsappAccountId: account.id,
    conversationId: conversation.id,
    providerMessageId,
    direction: "INBOUND",
    messageType,
    body: body || null,
    status: "RECEIVED",
    isTemplate: false,
    providerTimestamp: sentAtIso,
    metadata: { provider: message },
  });
  if (insertError) throw insertError;

  if (!body) return;
  const { data: rules, error: rulesError } = await admin.from("WhatsAppAutomationRule")
    .select("id,triggerConfig,actionConfig,executions")
    .eq("workspaceId", account.workspaceId)
    .eq("whatsappAccountId", account.id)
    .eq("triggerType", "MESSAGE_KEYWORD")
    .eq("isActive", true);
  if (rulesError) throw rulesError;
  const rule = (rules ?? []).find((r: any) => matches(body, r.triggerConfig?.keywords));
  if (!rule) return;
  const replyText = String(rule.actionConfig?.message ?? "").trim();
  if (replyText) await sendAutoReply(account, conversation, replyText, rule);
}
async function processStatus(account: any, status: any) {
  const providerMessageId = String(status?.id ?? "");
  if (!providerMessageId) return;
  const mappedStatus = String(status?.status ?? "UNKNOWN").toUpperCase();
  const pricingCategory = status?.pricing?.category ? String(status.pricing.category) : null;
  const { data: existing } = await admin.from("WhatsAppMessage").select("id,metadata").eq("providerMessageId", providerMessageId).maybeSingle();
  if (!existing) return;
  await admin.from("WhatsAppMessage").update({
    status: mappedStatus,
    pricingCategory,
    metadata: { ...(existing.metadata ?? {}), delivery: status },
  }).eq("id", existing.id);
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (request.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token") ?? "";
    const challenge = url.searchParams.get("hub.challenge") ?? "";
    const expected = await appSecret("whatsapp_webhook_verify_token").catch(() => "");
    if (mode === "subscribe" && expected && timingSafeEqual(token, expected)) return new Response(challenge, { status: 200 });
    return new Response("Forbidden", { status: 403 });
  }
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await request.text();
  const metaAppSecret = await appSecret("meta_app_secret").catch(() => Deno.env.get("META_APP_SECRET") ?? "");
  if (!metaAppSecret) return new Response("Meta App Secret not configured", { status: 503 });
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const expected = `sha256=${await hmacHex(metaAppSecret, raw)}`;
  if (!timingSafeEqual(signature, expected)) return new Response("Invalid signature", { status: 401 });

  let payload: any;
  try { payload = JSON.parse(raw); }
  catch { return new Response("Bad request", { status: 400 }); }
  if (payload?.object && payload.object !== "whatsapp_business_account") return Response.json({ ok: true, ignored: true });

  const jobs: Promise<void>[] = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== "messages") continue;
      const value = change?.value ?? {};
      const phoneNumberId = String(value?.metadata?.phone_number_id ?? "");
      if (!phoneNumberId) continue;
      const account = await accountForPhoneNumberId(phoneNumberId);
      if (!account) continue;
      for (const message of value?.messages ?? []) jobs.push(processIncoming(account, value, message));
      for (const status of value?.statuses ?? []) jobs.push(processStatus(account, status));
    }
  }
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) console.error("whatsapp webhook partial failures", failed);
  return Response.json({ ok: true, processed: jobs.length, failed: failed.length });
});
