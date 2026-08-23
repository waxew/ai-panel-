import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const META_API_VERSION = Deno.env.get("META_API_VERSION") ?? "v24.0";
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
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
async function appSecret(id: string) {
  const { data, error } = await admin.from("AppSecret").select("value").eq("id", id).maybeSingle();
  if (error || !data?.value) throw new Error(`missing_secret:${id}`);
  return data.value as string;
}
function fromB64(value: string) { return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)); }
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
async function getAccount(workspaceId: string, accountId: string) {
  const { data, error } = await admin.from("WhatsAppAccount")
    .select("id,workspaceId,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,accessTokenCiphertext,status,webhookSubscribed,qualityRating,lastSyncedAt")
    .eq("id", accountId).eq("workspaceId", workspaceId).maybeSingle();
  if (error) throw error;
  return data as any;
}
async function dashboard(workspaceId: string) {
  const [accountsResult, conversationsResult, templatesResult, rulesResult, messagesResult] = await Promise.all([
    admin.from("WhatsAppAccount").select("id,wabaId,phoneNumberId,displayPhoneNumber,verifiedName,status,webhookSubscribed,qualityRating,lastSyncedAt,createdAt,updatedAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }),
    admin.from("WhatsAppConversation").select("id,whatsappAccountId,waUserId,customerPhone,customerName,status,lastMessageAt,customerServiceWindowExpiresAt,unreadCount,updatedAt").eq("workspaceId", workspaceId).order("lastMessageAt", { ascending: false }).limit(50),
    admin.from("WhatsAppTemplate").select("id,whatsappAccountId,metaTemplateId,name,language,category,status,components,qualityScore,lastSyncedAt").eq("workspaceId", workspaceId).order("updatedAt", { ascending: false }).limit(100),
    admin.from("WhatsAppAutomationRule").select("id,whatsappAccountId,name,triggerType,triggerConfig,actionType,actionConfig,isActive,executions,lastTriggeredAt,updatedAt").eq("workspaceId", workspaceId).order("updatedAt", { ascending: false }).limit(100),
    admin.from("WhatsAppMessage").select("id,whatsappAccountId,conversationId,providerMessageId,direction,messageType,body,templateName,status,pricingCategory,isTemplate,providerTimestamp,createdAt").eq("workspaceId", workspaceId).order("createdAt", { ascending: false }).limit(100),
  ]);
  const firstError = [accountsResult, conversationsResult, templatesResult, rulesResult, messagesResult].map((r: any) => r.error).find(Boolean);
  if (firstError) throw firstError;
  const accounts = accountsResult.data ?? [];
  const conversations = conversationsResult.data ?? [];
  const templates = templatesResult.data ?? [];
  const rules = rulesResult.data ?? [];
  const messages = messagesResult.data ?? [];
  return {
    ok: true,
    accounts,
    conversations,
    templates,
    rules,
    messages,
    summary: {
      accountCount: accounts.length,
      activeAccounts: accounts.filter((x: any) => x.status === "ACTIVE").length,
      openConversations: conversations.filter((x: any) => x.status === "OPEN").length,
      unreadMessages: conversations.reduce((sum: number, x: any) => sum + Number(x.unreadCount ?? 0), 0),
      approvedTemplates: templates.filter((x: any) => x.status === "APPROVED").length,
      activeRules: rules.filter((x: any) => x.isActive).length,
    },
  };
}

Deno.serve(async (request) => {
  const user = await userFromRequest(request);
  if (!user) return json({ ok: false, message: "ورود به حساب الزامی است." }, 401);
  const workspaceId = await workspaceForUser(user.id);
  if (!workspaceId) return json({ ok: false, message: "Workspace پیدا نشد." }, 404);

  if (request.method === "GET") {
    try { return json(await dashboard(workspaceId)); }
    catch (error) { console.error("whatsapp dashboard failed", error); return json({ ok: false, message: "اطلاعات واتساپ دریافت نشد." }, 500); }
  }
  if (request.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  let body: any;
  try { body = await request.json(); }
  catch { return json({ ok: false, message: "درخواست معتبر نیست." }, 400); }
  const action = String(body?.action ?? "");

  try {
    if (action === "sync_templates") {
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      if (!account) return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      const token = await decryptToken(account.accessTokenCiphertext);
      const result = await graph(`${encodeURIComponent(account.wabaId)}/message_templates?fields=id,name,language,category,status,components&limit=100`, token);
      if (!result.response.ok) return json({ ok: false, message: result.data?.error?.message ?? "دریافت Templateها از Meta انجام نشد." }, 400);
      const now = new Date().toISOString();
      for (const item of result.data?.data ?? []) {
        const { error } = await admin.from("WhatsAppTemplate").upsert({
          workspaceId,
          whatsappAccountId: account.id,
          metaTemplateId: item.id ? String(item.id) : null,
          name: String(item.name ?? ""),
          language: String(item.language ?? ""),
          category: String(item.category ?? "UNKNOWN"),
          status: String(item.status ?? "UNKNOWN"),
          components: item.components ?? [],
          lastSyncedAt: now,
          updatedAt: now,
        }, { onConflict: "whatsappAccountId,name,language" });
        if (error) throw error;
      }
      return json({ ...(await dashboard(workspaceId)), message: "Templateهای واتساپ همگام شدند." });
    }

    if (action === "create_rule") {
      const accountId = String(body.accountId ?? "");
      const account = await getAccount(workspaceId, accountId);
      if (!account) return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      const name = String(body.name ?? "").trim();
      const keywords = Array.isArray(body.keywords) ? body.keywords.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 25) : [];
      const replyText = String(body.replyText ?? "").trim();
      if (!name || keywords.length === 0 || !replyText) return json({ ok: false, message: "نام Rule، کلیدواژه و متن پاسخ را کامل کنید." }, 400);
      if (replyText.length > 4000) return json({ ok: false, message: "متن پاسخ بیش از حد طولانی است." }, 400);
      const { error } = await admin.from("WhatsAppAutomationRule").insert({
        workspaceId,
        whatsappAccountId: account.id,
        name,
        triggerType: "MESSAGE_KEYWORD",
        triggerConfig: { keywords },
        actionType: "SEND_MESSAGE",
        actionConfig: { message: replyText },
        isActive: Boolean(body.isActive ?? true),
      });
      if (error) throw error;
      return json({ ...(await dashboard(workspaceId)), message: "Rule پاسخ خودکار ساخته شد." }, 201);
    }

    if (action === "toggle_rule") {
      const ruleId = String(body.ruleId ?? "");
      const { data: rule } = await admin.from("WhatsAppAutomationRule").select("id").eq("id", ruleId).eq("workspaceId", workspaceId).maybeSingle();
      if (!rule) return json({ ok: false, message: "Rule پیدا نشد." }, 404);
      const { error } = await admin.from("WhatsAppAutomationRule").update({ isActive: Boolean(body.isActive), updatedAt: new Date().toISOString() }).eq("id", ruleId).eq("workspaceId", workspaceId);
      if (error) throw error;
      return json({ ...(await dashboard(workspaceId)), message: "وضعیت Rule تغییر کرد." });
    }

    if (action === "send_message") {
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      if (!account) return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      const conversationId = String(body.conversationId ?? "");
      const text = String(body.text ?? "").trim();
      if (!text || text.length > 4000) return json({ ok: false, message: "متن پیام معتبر نیست." }, 400);
      const { data: conversation } = await admin.from("WhatsAppConversation")
        .select("id,waUserId,customerPhone,customerServiceWindowExpiresAt")
        .eq("id", conversationId).eq("workspaceId", workspaceId).eq("whatsappAccountId", account.id).maybeSingle();
      if (!conversation) return json({ ok: false, message: "گفتگو پیدا نشد." }, 404);
      const windowEnd = conversation.customerServiceWindowExpiresAt ? new Date(conversation.customerServiceWindowExpiresAt).getTime() : 0;
      if (windowEnd <= Date.now()) return json({ ok: false, code: "CUSTOMER_SERVICE_WINDOW_CLOSED", message: "پنجره ۲۴ ساعته این گفتگو بسته است؛ برای شروع دوباره باید Template تأییدشده ارسال شود." }, 409);
      const token = await decryptToken(account.accessTokenCiphertext);
      const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, {
        method: "POST",
        body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: conversation.waUserId, type: "text", text: { preview_url: false, body: text } }),
      });
      if (!result.response.ok) return json({ ok: false, message: result.data?.error?.message ?? "ارسال پیام انجام نشد." }, 400);
      const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
      await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, conversationId: conversation.id, providerMessageId, direction: "OUTBOUND", messageType: "text", body: text, status: "SENT", isTemplate: false, providerTimestamp: new Date().toISOString(), metadata: { source: "panel" } });
      await admin.from("WhatsAppConversation").update({ lastMessageAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).eq("id", conversation.id);
      return json({ ...(await dashboard(workspaceId)), message: "پیام ارسال شد." });
    }

    if (action === "send_template") {
      const account = await getAccount(workspaceId, String(body.accountId ?? ""));
      if (!account) return json({ ok: false, message: "حساب واتساپ پیدا نشد." }, 404);
      const to = String(body.to ?? "").replace(/[^0-9]/g, "");
      const templateName = String(body.templateName ?? "").trim();
      const language = String(body.language ?? "").trim();
      const components = Array.isArray(body.components) ? body.components : undefined;
      if (!to || !templateName || !language) return json({ ok: false, message: "گیرنده، نام Template و زبان الزامی است." }, 400);
      const { data: approved } = await admin.from("WhatsAppTemplate").select("id,status").eq("workspaceId", workspaceId).eq("whatsappAccountId", account.id).eq("name", templateName).eq("language", language).maybeSingle();
      if (!approved || approved.status !== "APPROVED") return json({ ok: false, code: "TEMPLATE_NOT_APPROVED", message: "این Template در لیست تأییدشده‌های Meta نیست. ابتدا Templateها را همگام کنید." }, 409);
      const token = await decryptToken(account.accessTokenCiphertext);
      const template: any = { name: templateName, language: { code: language } };
      if (components) template.components = components;
      const result = await graph(`${encodeURIComponent(account.phoneNumberId)}/messages`, token, { method: "POST", body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template", template }) });
      if (!result.response.ok) return json({ ok: false, message: result.data?.error?.message ?? "ارسال Template انجام نشد." }, 400);
      const providerMessageId = result.data?.messages?.[0]?.id ? String(result.data.messages[0].id) : null;
      let { data: conversation } = await admin.from("WhatsAppConversation").select("id").eq("whatsappAccountId", account.id).eq("waUserId", to).maybeSingle();
      if (!conversation) {
        const created = await admin.from("WhatsAppConversation").insert({ workspaceId, whatsappAccountId: account.id, waUserId: to, customerPhone: to, status: "OPEN", lastMessageAt: new Date().toISOString() }).select("id").single();
        if (created.error) throw created.error;
        conversation = created.data;
      }
      await admin.from("WhatsAppMessage").insert({ workspaceId, whatsappAccountId: account.id, conversationId: conversation.id, providerMessageId, direction: "OUTBOUND", messageType: "template", templateName, status: "SENT", isTemplate: true, providerTimestamp: new Date().toISOString(), metadata: { source: "panel", language, components: components ?? [] } });
      return json({ ...(await dashboard(workspaceId)), message: "Template ارسال شد." });
    }

    return json({ ok: false, message: "Action ناشناخته است." }, 400);
  } catch (error) {
    console.error("whatsapp manage failed", error);
    return json({ ok: false, message: "عملیات واتساپ انجام نشد." }, 500);
  }
});
