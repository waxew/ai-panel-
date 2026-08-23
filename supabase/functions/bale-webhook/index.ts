import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";

type BaleUser = { id: number; username?: string; first_name?: string; last_name?: string };
type BaleMessage = { message_id?: number; chat?: { id?: number }; from?: BaleUser; text?: string };
type BaleUpdate = { update_id?: number; message?: BaleMessage; callback_query?: { id?: string; from?: BaleUser; data?: string; message?: BaleMessage } };
type Button = { id: string; parentId?: string | null; title: string; actionType: string; actionValue?: string | null; sortOrder: number };
type BaleApiResponse<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

function fromHex(value: string) {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error("bad_key");
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function decrypt(ciphertext: string, keyHex: string) {
  const [version, ivPart, payloadPart] = ciphertext.split(":");
  if (version !== "v1" || !ivPart || !payloadPart) throw new Error("bad_cipher");
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(ivPart) }, key, fromBase64(payloadPart));
  return new TextDecoder().decode(plaintext);
}

function money(value: unknown, currency = "IRR") {
  return `${new Intl.NumberFormat("fa-IR").format(Number(value ?? 0))} ${currency === "IRR" ? "ریال" : currency}`;
}

function nameOf(user?: BaleUser) {
  return user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() : "";
}

async function bale<T>(token: string, method: string, body: Record<string, unknown>): Promise<BaleApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://tapi.bale.ai/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({ ok: false, description: `HTTP ${response.status}` }))) as BaleApiResponse<T>;
    if (!response.ok || !payload.ok) console.error("bale api", method, response.status, payload.description ?? payload.error_code);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function sendInline(token: string, chatId: number, text: string, rows: Array<Array<Record<string, unknown>>>) {
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (rows.length) body.reply_markup = { inline_keyboard: rows };
  return bale(token, "sendMessage", body);
}

async function sendMenu(token: string, chatId: number, text: string, buttons: Button[]) {
  const rows: Array<Array<{ text: string }>> = [];
  for (let index = 0; index < buttons.length; index += 2) {
    rows.push(buttons.slice(index, index + 2).map((button) => ({ text: button.title })));
  }
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (rows.length) body.reply_markup = { keyboard: rows };
  return bale(token, "sendMessage", body);
}

async function ack(token: string, callbackId?: string, text?: string) {
  if (!callbackId) return;
  await bale(token, "answerCallbackQuery", { callback_query_id: callbackId, ...(text ? { text } : {}) }).catch(() => undefined);
}

async function storeFor(admin: any, workspaceId: string) {
  const { data, error } = await admin.from("Store").select("id,name,currency,status").eq("workspaceId", workspaceId).eq("status", "ACTIVE").maybeSingle();
  if (error) throw error;
  return data;
}

async function catalog(admin: any, token: string, chatId: number, store: any) {
  const [{ data: categories, error: categoryError }, { data: items, error: itemError }] = await Promise.all([
    admin.from("StoreCategory").select("id,title").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(10),
    admin.from("StoreItem").select("id,title,priceAmount,currency").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(12),
  ]);
  if (categoryError || itemError) throw categoryError || itemError;
  if (!(items ?? []).length) return sendInline(token, chatId, `فروشگاه «${store.name}» هنوز محصول فعالی ندارد.`, []);
  if ((categories ?? []).length) {
    const rows = (categories ?? []).map((category: any) => [{ text: category.title, callback_data: `cat:${category.id}` }]);
    rows.push([{ text: "همه محصولات", callback_data: "cat:all" }]);
    return sendInline(token, chatId, `🛍 محصولات «${store.name}»`, rows);
  }
  return sendInline(token, chatId, `🛍 محصولات «${store.name}»`, (items ?? []).map((item: any) => [{ text: `${item.title} — ${money(item.priceAmount, item.currency)}`, callback_data: `product:${item.id}` }]));
}

async function category(admin: any, token: string, chatId: number, store: any, categoryId: string) {
  let query = admin.from("StoreItem").select("id,title,priceAmount,currency").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(12);
  if (categoryId !== "all") query = query.eq("categoryId", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []).map((item: any) => [{ text: `${item.title} — ${money(item.priceAmount, item.currency)}`, callback_data: `product:${item.id}` }]);
  rows.push([{ text: "← بازگشت", callback_data: "catalog" }]);
  return sendInline(token, chatId, rows.length === 1 ? "در این دسته محصولی نیست." : "محصول را انتخاب کنید:", rows);
}

async function product(admin: any, token: string, chatId: number, store: any, itemId: string) {
  const { data: item, error } = await admin.from("StoreItem").select("id,title,description,priceAmount,currency,inventoryCount").eq("id", itemId).eq("storeId", store.id).eq("isActive", true).maybeSingle();
  if (error) throw error;
  if (!item) return sendInline(token, chatId, "این محصول دیگر در دسترس نیست.", [[{ text: "← محصولات", callback_data: "catalog" }]]);
  const soldOut = item.inventoryCount !== null && Number(item.inventoryCount) <= 0;
  const rows: Array<Array<Record<string, unknown>>> = [];
  if (!soldOut) rows.push([{ text: "➕ افزودن به سبد", callback_data: `cartadd:${item.id}` }]);
  rows.push([{ text: "← محصولات", callback_data: "catalog" }]);
  return sendInline(token, chatId, `📦 ${item.title}\n💳 ${money(item.priceAmount, item.currency)}\n${item.inventoryCount === null ? "موجودی: نامحدود" : `موجودی: ${item.inventoryCount}`}\n${item.description ?? ""}${soldOut ? "\n⛔️ ناموجود" : ""}`, rows);
}

async function cartSnapshot(admin: any, storeId: string, userId: string) {
  const { data, error } = await admin.rpc("bale_cart_snapshot", { p_store_id: storeId, p_external_user_id: userId });
  if (error) throw error;
  return data;
}

async function showCart(admin: any, token: string, chatId: number, store: any, user?: BaleUser) {
  if (!user?.id) return sendInline(token, chatId, "کاربر قابل شناسایی نیست.", []);
  const cart = await cartSnapshot(admin, store.id, String(user.id));
  if (!cart?.itemCount) return sendInline(token, chatId, "🛒 سبد خرید شما خالی است.", [[{ text: "🛍 مشاهده محصولات", callback_data: "catalog" }]]);
  const lines = [
    "🛒 سبد خرید",
    ...(cart.items ?? []).map((item: any) => `${item.title} × ${item.quantity} — ${money(item.lineTotalAmount, item.currency)}`),
    `\nجمع: ${money(cart.totalAmount, cart.currency)}`,
  ];
  const rows: Array<Array<Record<string, unknown>>> = (cart.items ?? []).flatMap((item: any) => [[
    { text: `− ${item.title}`, callback_data: `cartdel:${item.itemId}` },
    { text: `+ ${item.title}`, callback_data: `cartadd:${item.itemId}` },
  ]]);
  rows.push([{ text: "ثبت سفارش", callback_data: "checkout" }], [{ text: "🛍 ادامه خرید", callback_data: "catalog" }]);
  return sendInline(token, chatId, lines.join("\n"), rows);
}

async function changeCart(admin: any, store: any, user: BaleUser | undefined, itemId: string, delta: number) {
  if (!user?.id) throw new Error("user_missing");
  const { data, error } = await admin.rpc("bale_cart_change", {
    p_store_id: store.id,
    p_item_id: itemId,
    p_external_user_id: String(user.id),
    p_username: user.username ?? "",
    p_display_name: nameOf(user),
    p_delta: delta,
  });
  if (error) throw error;
  return data;
}

async function checkout(admin: any, store: any, user: BaleUser | undefined, chatId: number, messageId?: number) {
  if (!user?.id) throw new Error("user_missing");
  const { data, error } = await admin.rpc("bale_checkout_cart", {
    p_store_id: store.id,
    p_external_user_id: String(user.id),
    p_external_conversation_id: String(chatId),
    p_idempotency_key: `bale:checkout:${chatId}:${messageId ?? "no-message"}`,
  });
  if (error) throw error;
  return data;
}

async function orders(admin: any, token: string, chatId: number, store: any, user?: BaleUser) {
  if (!user?.id) return sendInline(token, chatId, "کاربر قابل شناسایی نیست.", []);
  const { data: customer, error: customerError } = await admin.from("StoreCustomer").select("id").eq("storeId", store.id).eq("platform", "bale").eq("externalUserId", String(user.id)).maybeSingle();
  if (customerError) throw customerError;
  if (!customer) return sendInline(token, chatId, "هنوز سفارشی ندارید.", [[{ text: "🛍 محصولات", callback_data: "catalog" }]]);
  const { data: recentOrders, error } = await admin.from("StoreOrder").select("id,status,totalAmount,currency").eq("storeId", store.id).eq("customerId", customer.id).order("createdAt", { ascending: false }).limit(5);
  if (error) throw error;
  const text = (recentOrders ?? []).length
    ? ["📦 سفارش‌های شما", ...(recentOrders ?? []).map((order: any) => `#${order.id.slice(0, 8)} — ${order.status} — ${money(order.totalAmount, order.currency)}`)].join("\n")
    : "هنوز سفارشی ندارید.";
  return sendInline(token, chatId, text, [[{ text: "🛍 محصولات", callback_data: "catalog" }]]);
}

function childrenOf(buttons: Button[], parentId: string) {
  return buttons.filter((button) => button.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
}

async function runMenuAction(admin: any, token: string, chatId: number, store: any, user: BaleUser | undefined, button: Button, buttons: Button[]) {
  if (button.actionType === "CATALOG") return store ? catalog(admin, token, chatId, store) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  if (button.actionType === "CART") return store ? showCart(admin, token, chatId, store, user) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  if (button.actionType === "ORDERS") return store ? orders(admin, token, chatId, store, user) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  if (button.actionType === "SUPPORT") return sendInline(token, chatId, button.actionValue || "اطلاعات پشتیبانی هنوز تنظیم نشده است.", []);
  if (button.actionType === "TEXT") return sendInline(token, chatId, button.actionValue || button.title, []);
  if (button.actionType === "URL") {
    const url = button.actionValue ?? "";
    return sendInline(token, chatId, button.title, [[{ text: "باز کردن لینک", url }]]);
  }
  if (button.actionType === "SUBMENU") {
    const children = childrenOf(buttons, button.id);
    if (!children.length) return sendInline(token, chatId, "این زیرمنو هنوز گزینه‌ای ندارد.", []);
    return sendInline(token, chatId, button.actionValue || button.title, children.map((child) => [{ text: child.title, callback_data: `menu:${child.id}` }]));
  }
  return sendInline(token, chatId, button.actionValue || `گزینه «${button.title}» انتخاب شد.`, []);
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if (request.method !== "POST") return new Response("ok");

    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    const incomingSecret = decodeURIComponent(parts.at(-1) ?? "");
    const baleBotId = decodeURIComponent(parts.at(-2) ?? "");
    if (!baleBotId || !incomingSecret) return new Response("unauthorized", { status: 401 });

    const admin = ctx.supabaseAdmin;
    const { data: bot, error: botError } = await admin
      .from("BaleBot")
      .select("id,workspaceId,tokenCiphertext,welcomeMessage,webhookSecretHash,status")
      .eq("baleBotId", baleBotId)
      .maybeSingle();
    if (botError || !bot || bot.status !== "ACTIVE" || !bot.webhookSecretHash) return new Response("not found", { status: 404 });

    const incomingHash = await sha256(incomingSecret);
    if (!constantTimeEqual(incomingHash, bot.webhookSecretHash)) return new Response("unauthorized", { status: 401 });

    let update: BaleUpdate;
    try { update = await request.json(); } catch { return new Response("ok"); }

    const [{ data: encryptionSecret }, { data: rawButtons }] = await Promise.all([
      admin.from("AppSecret").select("value").eq("id", "bale_token_encryption").single(),
      admin.from("BaleButton").select("id,parentId,title,actionType,actionValue,sortOrder").eq("botId", bot.id).order("sortOrder"),
    ]);
    if (!encryptionSecret?.value) return new Response("ok");

    let token: string;
    try { token = await decrypt(bot.tokenCiphertext, encryptionSecret.value); }
    catch (error) { console.error("bale token decrypt failed", error); return new Response("ok"); }

    const buttons = (rawButtons ?? []) as Button[];
    const roots = buttons.filter((button) => !button.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const store = await storeFor(admin, bot.workspaceId).catch(() => null);
    const callback = update.callback_query;

    if (callback?.data && callback.message?.chat?.id) {
      const chatId = callback.message.chat.id;
      const data = callback.data;
      try {
        if (data.startsWith("menu:")) {
          const button = buttons.find((item) => item.id === data.slice(5));
          await ack(token, callback.id);
          if (button) await runMenuAction(admin, token, chatId, store, callback.from, button, buttons);
          return new Response("ok");
        }

        if (!store) {
          await ack(token, callback.id, "فروشگاه فعال نیست.");
          await sendInline(token, chatId, "فروشگاه فعال نیست.", []);
          return new Response("ok");
        }

        if (data === "catalog") {
          await ack(token, callback.id);
          await catalog(admin, token, chatId, store);
        } else if (data.startsWith("cat:")) {
          await ack(token, callback.id);
          await category(admin, token, chatId, store, data.slice(4));
        } else if (data.startsWith("product:")) {
          await ack(token, callback.id);
          await product(admin, token, chatId, store, data.slice(8));
        } else if (data.startsWith("cartadd:")) {
          await changeCart(admin, store, callback.from, data.slice(8), 1);
          await ack(token, callback.id, "به سبد اضافه شد.");
          await showCart(admin, token, chatId, store, callback.from);
        } else if (data.startsWith("cartdel:")) {
          await changeCart(admin, store, callback.from, data.slice(8), -1);
          await ack(token, callback.id, "سبد به‌روزرسانی شد.");
          await showCart(admin, token, chatId, store, callback.from);
        } else if (data === "cart") {
          await ack(token, callback.id);
          await showCart(admin, token, chatId, store, callback.from);
        } else if (data === "checkout") {
          const order = await checkout(admin, store, callback.from, chatId, callback.message.message_id);
          await ack(token, callback.id, order.replayed ? "این سفارش قبلاً ثبت شده است." : "سفارش ثبت شد.");
          await sendInline(token, chatId, `✅ سفارش #${String(order.orderId).slice(0, 8)}\nمبلغ: ${money(order.totalAmount, order.currency)}\nوضعیت: در انتظار پرداخت\n\nدرگاه پرداخت هنوز فعال نشده است؛ وضعیت سفارش خودکار PAID نمی‌شود.`, [[{ text: "📦 سفارش‌های من", callback_data: "orders" }]]);
        } else if (data === "orders") {
          await ack(token, callback.id);
          await orders(admin, token, chatId, store, callback.from);
        } else {
          await ack(token, callback.id);
        }
      } catch (error) {
        console.error("bale callback failed", error);
        const text = String(error);
        const message = text.includes("insufficient_stock")
          ? "موجودی کافی نیست."
          : text.includes("cart_empty")
            ? "سبد خرید خالی است."
            : "عملیات انجام نشد.";
        await ack(token, callback.id, message);
        await sendInline(token, chatId, message, []).catch(() => undefined);
      }
      return new Response("ok");
    }

    const chatId = update.message?.chat?.id;
    const text = update.message?.text?.trim();
    const user = update.message?.from;
    if (!chatId || !text) return new Response("ok");

    try {
      if (text === "/start" || text.startsWith("/start ")) {
        await sendMenu(token, chatId, bot.welcomeMessage || "سلام! از منوی زیر انتخاب کنید.", roots);
      } else {
        const selected = roots.find((button) => button.title === text);
        if (!selected) await sendMenu(token, chatId, "یکی از گزینه‌های منو را انتخاب کنید.", roots);
        else await runMenuAction(admin, token, chatId, store, user, selected, buttons);
      }
    } catch (error) {
      console.error("bale message failed", error);
      await sendMenu(token, chatId, "در پردازش درخواست مشکلی پیش آمد.", roots).catch(() => undefined);
    }

    return new Response("ok");
  }),
};
