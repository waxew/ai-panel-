/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور فایل/ماژول را از ماژول «jsr:@supabase/functions-js/edge-runtime.d.ts» وارد می‌کند تا در این فایل قابل استفاده باشد.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// راهنما: این دستور { withSupabase } را از ماژول «npm:@supabase/server@1.4.1» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { withSupabase } from "npm:@supabase/server@1.4.1";

// راهنما: این Type با نام «BaleUser» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleUser = { id: number; username?: string; first_name?: string; last_name?: string };
// راهنما: این Type با نام «BaleMessage» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleMessage = { message_id?: number; chat?: { id?: number }; from?: BaleUser; text?: string };
// راهنما: این Type با نام «BaleUpdate» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleUpdate = { update_id?: number; message?: BaleMessage; callback_query?: { id?: string; from?: BaleUser; data?: string; message?: BaleMessage } };
// راهنما: این Type با نام «Button» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Button = { id: string; parentId?: string | null; title: string; actionType: string; actionValue?: string | null; sortOrder: number };
// راهنما: این Type با نام «BaleApiResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type BaleApiResponse<T> = { ok: boolean; result?: T; description?: string; error_code?: number };

// راهنما: این تابع «toHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function toHex(bytes: Uint8Array) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// راهنما: این تابع «sha256» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sha256(value: string) {
  // راهنما: این دستور متغیر/ثابت «digest» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «toHex(new Uint8Array(digest))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return toHex(new Uint8Array(digest));
}

// راهنما: این تابع «constantTimeEqual» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function constantTimeEqual(a: string, b: string) {
  // راهنما: این شرط بررسی می‌کند آیا «a.length !== b.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (a.length !== b.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
  // راهنما: این دستور متغیر/ثابت «diff» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let diff = 0;
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let index = 0; index < a.length; index += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «diff |= a.charCodeAt(index) ^ b.charCodeAt(index)». */ diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «diff === 0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return diff === 0;
}

// راهنما: این تابع «fromHex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromHex(value: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!/^[0-9a-f]{64}$/i.test(value)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^[0-9a-f]{64}$/i.test(value)) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("bad_key");
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(value.length / 2);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < bytes.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)». */ bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}

// راهنما: این تابع «fromBase64» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function fromBase64(value: string) {
  // راهنما: این دستور متغیر/ثابت «binary» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const binary = atob(value);
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(binary.length);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < binary.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = binary.charCodeAt(i)». */ bytes[i] = binary.charCodeAt(i);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}

// راهنما: این تابع «decrypt» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function decrypt(ciphertext: string, keyHex: string) {
  // راهنما: این دستور متغیر/ثابت «[version, ivPart, payloadPart]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [version, ivPart, payloadPart] = ciphertext.split(":");
  // راهنما: این شرط بررسی می‌کند آیا «version !== "v1" || !ivPart || !payloadPart» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (version !== "v1" || !ivPart || !payloadPart) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("bad_cipher");
  // راهنما: این دستور متغیر/ثابت «key» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const key = await crypto.subtle.importKey("raw", fromHex(keyHex), { name: "AES-GCM" }, false, ["decrypt"]);
  // راهنما: این دستور متغیر/ثابت «plaintext» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(ivPart) }, key, fromBase64(payloadPart));
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new TextDecoder().decode(plaintext)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return new TextDecoder().decode(plaintext);
}

// راهنما: این تابع «money» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function money(value: unknown, currency = "IRR") {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${new Intl.NumberFormat("fa-IR").format(Number(value ?? 0))} ${currency =…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return `${new Intl.NumberFormat("fa-IR").format(Number(value ?? 0))} ${currency === "IRR" ? "ریال" : currency}`;
}

// راهنما: این تابع «nameOf» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function nameOf(user?: BaleUser) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() : "";
}

// راهنما: این تابع «bale» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function bale<T>(token: string, method: string, body: Record<string, unknown>): Promise<BaleApiResponse<T>> {
  // راهنما: این دستور متغیر/ثابت «controller» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const controller = new AbortController();
  // راهنما: این دستور متغیر/ثابت «timeout» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const timeout = setTimeout(() => controller.abort(), 10000);
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch(`https://tapi.bale.ai/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const payload = (await response.json().catch(() => ({ ok: false, description: `HTTP ${response.status}` }))) as BaleApiResponse<T>;
    // راهنما: این شرط بررسی می‌کند آیا «!response.ok || !payload.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!response.ok || !payload.ok) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale api", method, response.status, payload.description ?? payload.error_c…». */ console.error("bale api", method, response.status, payload.description ?? payload.error_code);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «payload» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return payload;
  } finally {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «clearTimeout(timeout)».
    clearTimeout(timeout);
  }
}

// راهنما: این تابع «sendInline» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sendInline(token: string, chatId: number, text: string, rows: Array<Array<Record<string, unknown>>>) {
  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const body: Record<string, unknown> = { chat_id: chatId, text };
  // راهنما: این شرط بررسی می‌کند آیا «rows.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (rows.length) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body.reply_markup = { inline_keyboard: rows }». */ body.reply_markup = { inline_keyboard: rows };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bale(token, "sendMessage", body)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bale(token, "sendMessage", body);
}

// راهنما: این تابع «sendMenu» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function sendMenu(token: string, chatId: number, text: string, buttons: Button[]) {
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows: Array<Array<{ text: string }>> = [];
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let index = 0; index < buttons.length; index += 2) {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push(buttons.slice(index, index + 2).map((button) => ({ text: button.title })))».
    rows.push(buttons.slice(index, index + 2).map((button) => ({ text: button.title })));
  }
  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const body: Record<string, unknown> = { chat_id: chatId, text };
  // راهنما: این شرط بررسی می‌کند آیا «rows.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (rows.length) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body.reply_markup = { keyboard: rows }». */ body.reply_markup = { keyboard: rows };
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bale(token, "sendMessage", body)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bale(token, "sendMessage", body);
}

// راهنما: این تابع «ack» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function ack(token: string, callbackId?: string, text?: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!callbackId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!callbackId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await bale(token, "answerCallbackQuery", { callback_query_id: callbackId, ...(text ? { te…».
  await bale(token, "answerCallbackQuery", { callback_query_id: callbackId, ...(text ? { text } : {}) }).catch(() => undefined);
}

// راهنما: این تابع «storeFor» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function storeFor(admin: any, workspaceId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.from("Store").select("id,name,currency,status").eq("workspaceId", workspaceId).eq("status", "ACTIVE").maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «catalog» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function catalog(admin: any, token: string, chatId: number, store: any) {
  // راهنما: این دستور متغیر/ثابت «[{ data: categories, error: categoryError },…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [{ data: categories, error: categoryError }, { data: items, error: itemError }] = await Promise.all([
    admin.from("StoreCategory").select("id,title").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(10),
    admin.from("StoreItem").select("id,title,priceAmount,currency").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(12),
  ]);
  // راهنما: این شرط بررسی می‌کند آیا «categoryError || itemError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (categoryError || itemError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw categoryError || itemError;
  // راهنما: این شرط بررسی می‌کند آیا «!(items ?? []).length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!(items ?? []).length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, `فروشگاه «${store.name}» هنوز محصول فعالی ندارد.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, `فروشگاه «${store.name}» هنوز محصول فعالی ندارد.`, []);
  // راهنما: این شرط بررسی می‌کند آیا «(categories ?? []).length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if ((categories ?? []).length) {
    // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const rows = (categories ?? []).map((category: any) => [{ text: category.title, callback_data: `cat:${category.id}` }]);
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push([{ text: "همه محصولات", callback_data: "cat:all" }])».
    rows.push([{ text: "همه محصولات", callback_data: "cat:all" }]);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, `🛍 محصولات «${store.name}»`, rows)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return sendInline(token, chatId, `🛍 محصولات «${store.name}»`, rows);
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, `🛍 محصولات «${store.name}»`, (items ?? []).map(…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, `🛍 محصولات «${store.name}»`, (items ?? []).map((item: any) => [{ text: `${item.title} — ${money(item.priceAmount, item.currency)}`, callback_data: `product:${item.id}` }]));
}

// راهنما: این تابع «category» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function category(admin: any, token: string, chatId: number, store: any, categoryId: string) {
  // راهنما: این دستور متغیر/ثابت «query» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let query = admin.from("StoreItem").select("id,title,priceAmount,currency").eq("storeId", store.id).eq("isActive", true).order("sortOrder").limit(12);
  // راهنما: این شرط بررسی می‌کند آیا «categoryId !== "all"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (categoryId !== "all") /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «query = query.eq("categoryId", categoryId)». */ query = query.eq("categoryId", categoryId);
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await query;
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows = (data ?? []).map((item: any) => [{ text: `${item.title} — ${money(item.priceAmount, item.currency)}`, callback_data: `product:${item.id}` }]);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push([{ text: "← بازگشت", callback_data: "catalog" }])».
  rows.push([{ text: "← بازگشت", callback_data: "catalog" }]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, rows.length === 1 ? "در این دسته محصولی نیست." :…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, rows.length === 1 ? "در این دسته محصولی نیست." : "محصول را انتخاب کنید:", rows);
}

// راهنما: این تابع «product» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function product(admin: any, token: string, chatId: number, store: any, itemId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data: item, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: item, error } = await admin.from("StoreItem").select("id,title,description,priceAmount,currency,inventoryCount").eq("id", itemId).eq("storeId", store.id).eq("isActive", true).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این شرط بررسی می‌کند آیا «!item» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!item) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "این محصول دیگر در دسترس نیست.", [[{ text: "← مح…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "این محصول دیگر در دسترس نیست.", [[{ text: "← محصولات", callback_data: "catalog" }]]);
  // راهنما: این دستور متغیر/ثابت «soldOut» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const soldOut = item.inventoryCount !== null && Number(item.inventoryCount) <= 0;
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows: Array<Array<Record<string, unknown>>> = [];
  // راهنما: این شرط بررسی می‌کند آیا «!soldOut» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!soldOut) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push([{ text: "➕ افزودن به سبد", callback_data: `cartadd:${item.id}` }])». */ rows.push([{ text: "➕ افزودن به سبد", callback_data: `cartadd:${item.id}` }]);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push([{ text: "← محصولات", callback_data: "catalog" }])».
  rows.push([{ text: "← محصولات", callback_data: "catalog" }]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, `📦 ${item.title}\n💳 ${money(item.priceAmount, …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, `📦 ${item.title}\n💳 ${money(item.priceAmount, item.currency)}\n${item.inventoryCount === null ? "موجودی: نامحدود" : `موجودی: ${item.inventoryCount}`}\n${item.description ?? ""}${soldOut ? "\n⛔️ ناموجود" : ""}`, rows);
}

// راهنما: این تابع «cartSnapshot» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function cartSnapshot(admin: any, storeId: string, userId: string) {
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.rpc("bale_cart_snapshot", { p_store_id: storeId, p_external_user_id: userId });
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «showCart» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function showCart(admin: any, token: string, chatId: number, store: any, user?: BaleUser) {
  // راهنما: این شرط بررسی می‌کند آیا «!user?.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user?.id) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "کاربر قابل شناسایی نیست.", [])» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "کاربر قابل شناسایی نیست.", []);
  // راهنما: این دستور متغیر/ثابت «cart» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const cart = await cartSnapshot(admin, store.id, String(user.id));
  // راهنما: این شرط بررسی می‌کند آیا «!cart?.itemCount» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!cart?.itemCount) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "🛒 سبد خرید شما خالی است.", [[{ text: "🛍 مشاهد…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "🛒 سبد خرید شما خالی است.", [[{ text: "🛍 مشاهده محصولات", callback_data: "catalog" }]]);
  // راهنما: این دستور متغیر/ثابت «lines» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const lines = [
    "🛒 سبد خرید",
    ...(cart.items ?? []).map((item: any) => `${item.title} × ${item.quantity} — ${money(item.lineTotalAmount, item.currency)}`),
    `\nجمع: ${money(cart.totalAmount, cart.currency)}`,
  ];
  // راهنما: این دستور متغیر/ثابت «rows» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rows: Array<Array<Record<string, unknown>>> = (cart.items ?? []).flatMap((item: any) => [[
    { text: `− ${item.title}`, callback_data: `cartdel:${item.itemId}` },
    { text: `+ ${item.title}`, callback_data: `cartadd:${item.itemId}` },
  ]]);
  // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «rows.push([{ text: "ثبت سفارش", callback_data: "checkout" }], [{ text: "🛍 ادامه خرید", c…».
  rows.push([{ text: "ثبت سفارش", callback_data: "checkout" }], [{ text: "🛍 ادامه خرید", callback_data: "catalog" }]);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, lines.join("\n"), rows)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, lines.join("\n"), rows);
}

// راهنما: این تابع «changeCart» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function changeCart(admin: any, store: any, user: BaleUser | undefined, itemId: string, delta: number) {
  // راهنما: این شرط بررسی می‌کند آیا «!user?.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user?.id) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("user_missing");
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.rpc("bale_cart_change", {
    p_store_id: store.id,
    p_item_id: itemId,
    p_external_user_id: String(user.id),
    p_username: user.username ?? "",
    p_display_name: nameOf(user),
    p_delta: delta,
  });
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «checkout» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function checkout(admin: any, store: any, user: BaleUser | undefined, chatId: number, messageId?: number) {
  // راهنما: این شرط بررسی می‌کند آیا «!user?.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user?.id) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error("user_missing");
  // راهنما: این دستور متغیر/ثابت «{ data, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data, error } = await admin.rpc("bale_checkout_cart", {
    p_store_id: store.id,
    p_external_user_id: String(user.id),
    p_external_conversation_id: String(chatId),
    p_idempotency_key: `bale:checkout:${chatId}:${messageId ?? "no-message"}`,
  });
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «orders» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function orders(admin: any, token: string, chatId: number, store: any, user?: BaleUser) {
  // راهنما: این شرط بررسی می‌کند آیا «!user?.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user?.id) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "کاربر قابل شناسایی نیست.", [])» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "کاربر قابل شناسایی نیست.", []);
  // راهنما: این دستور متغیر/ثابت «{ data: customer, error: customerError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: customer, error: customerError } = await admin.from("StoreCustomer").select("id").eq("storeId", store.id).eq("platform", "bale").eq("externalUserId", String(user.id)).maybeSingle();
  // راهنما: این شرط بررسی می‌کند آیا «customerError» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (customerError) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw customerError;
  // راهنما: این شرط بررسی می‌کند آیا «!customer» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!customer) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "هنوز سفارشی ندارید.", [[{ text: "🛍 محصولات", c…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "هنوز سفارشی ندارید.", [[{ text: "🛍 محصولات", callback_data: "catalog" }]]);
  // راهنما: این دستور متغیر/ثابت «{ data: recentOrders, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const { data: recentOrders, error } = await admin.from("StoreOrder").select("id,status,totalAmount,currency").eq("storeId", store.id).eq("customerId", customer.id).order("createdAt", { ascending: false }).limit(5);
  // راهنما: این شرط بررسی می‌کند آیا «error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (error) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw error;
  // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const text = (recentOrders ?? []).length
    ? ["📦 سفارش‌های شما", ...(recentOrders ?? []).map((order: any) => `#${order.id.slice(0, 8)} — ${order.status} — ${money(order.totalAmount, order.currency)}`)].join("\n")
    : "هنوز سفارشی ندارید.";
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, text, [[{ text: "🛍 محصولات", callback_data: "ca…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, text, [[{ text: "🛍 محصولات", callback_data: "catalog" }]]);
}

// راهنما: این تابع «childrenOf» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function childrenOf(buttons: Button[], parentId: string) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «buttons.filter((button) => button.parentId === parentId).sort((a, b) => a.…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return buttons.filter((button) => button.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
}

// راهنما: این تابع «runMenuAction» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function runMenuAction(admin: any, token: string, chatId: number, store: any, user: BaleUser | undefined, button: Button, buttons: Button[]) {
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "CATALOG"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "CATALOG") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «store ? catalog(admin, token, chatId, store) : sendInline(token, chatId, "…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return store ? catalog(admin, token, chatId, store) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "CART"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "CART") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «store ? showCart(admin, token, chatId, store, user) : sendInline(token, ch…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return store ? showCart(admin, token, chatId, store, user) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "ORDERS"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "ORDERS") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «store ? orders(admin, token, chatId, store, user) : sendInline(token, chat…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return store ? orders(admin, token, chatId, store, user) : sendInline(token, chatId, "فروشگاه فعال نیست.", []);
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "SUPPORT"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "SUPPORT") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, button.actionValue || "اطلاعات پشتیبانی هنوز تنظ…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, button.actionValue || "اطلاعات پشتیبانی هنوز تنظیم نشده است.", []);
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "TEXT"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "TEXT") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, button.actionValue || button.title, [])» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, button.actionValue || button.title, []);
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "URL"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "URL") {
    // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const url = button.actionValue ?? "";
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, button.title, [[{ text: "باز کردن لینک", url }]])» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return sendInline(token, chatId, button.title, [[{ text: "باز کردن لینک", url }]]);
  }
  // راهنما: این شرط بررسی می‌کند آیا «button.actionType === "SUBMENU"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (button.actionType === "SUBMENU") {
    // راهنما: این دستور متغیر/ثابت «children» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const children = childrenOf(buttons, button.id);
    // راهنما: این شرط بررسی می‌کند آیا «!children.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!children.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, "این زیرمنو هنوز گزینه‌ای ندارد.", [])» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return sendInline(token, chatId, "این زیرمنو هنوز گزینه‌ای ندارد.", []);
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, button.actionValue || button.title, children.map…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return sendInline(token, chatId, button.actionValue || button.title, children.map((child) => [{ text: child.title, callback_data: `menu:${child.id}` }]));
  }
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «sendInline(token, chatId, button.actionValue || `گزینه «${button.title}» ا…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return sendInline(token, chatId, button.actionValue || `گزینه «${button.title}» انتخاب شد.`, []);
}

// راهنما: این دستور از نوع ExportAssignment بخشی از کنترل جریان یا تعریف منطق این فایل است.
export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok");

    // راهنما: این دستور متغیر/ثابت «parts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    // راهنما: این دستور متغیر/ثابت «incomingSecret» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const incomingSecret = decodeURIComponent(parts.at(-1) ?? "");
    // راهنما: این دستور متغیر/ثابت «baleBotId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const baleBotId = decodeURIComponent(parts.at(-2) ?? "");
    // راهنما: این شرط بررسی می‌کند آیا «!baleBotId || !incomingSecret» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!baleBotId || !incomingSecret) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("unauthorized", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("unauthorized", { status: 401 });

    // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const admin = ctx.supabaseAdmin;
    // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: bot, error: botError } = await admin
      .from("BaleBot")
      .select("id,workspaceId,tokenCiphertext,welcomeMessage,webhookSecretHash,status")
      .eq("baleBotId", baleBotId)
      .maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «botError || !bot || bot.status !== "ACTIVE" || !bot.webhookSecretHash» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (botError || !bot || bot.status !== "ACTIVE" || !bot.webhookSecretHash) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("not found", { status: 404 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("not found", { status: 404 });

    // راهنما: این دستور متغیر/ثابت «incomingHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const incomingHash = await sha256(incomingSecret);
    // راهنما: این شرط بررسی می‌کند آیا «!constantTimeEqual(incomingHash, bot.webhookSecretHash)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!constantTimeEqual(incomingHash, bot.webhookSecretHash)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("unauthorized", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("unauthorized", { status: 401 });

    // راهنما: این دستور متغیر/ثابت «update» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let update: BaleUpdate;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «update = await request.json()». */ update = await request.json(); } catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok"); }

    // راهنما: این دستور متغیر/ثابت «[{ data: encryptionSecret }, { data: rawButt…» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const [{ data: encryptionSecret }, { data: rawButtons }] = await Promise.all([
      admin.from("AppSecret").select("value").eq("id", "bale_token_encryption").single(),
      admin.from("BaleButton").select("id,parentId,title,actionType,actionValue,sortOrder").eq("botId", bot.id).order("sortOrder"),
    ]);
    // راهنما: این شرط بررسی می‌کند آیا «!encryptionSecret?.value» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!encryptionSecret?.value) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok");

    // راهنما: این دستور متغیر/ثابت «token» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let token: string;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «token = await decrypt(bot.tokenCiphertext, encryptionSecret.value)». */ token = await decrypt(bot.tokenCiphertext, encryptionSecret.value); }
    catch (error) { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale token decrypt failed", error)». */ console.error("bale token decrypt failed", error); /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok"); }

    // راهنما: این دستور متغیر/ثابت «buttons» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const buttons = (rawButtons ?? []) as Button[];
    // راهنما: این دستور متغیر/ثابت «roots» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const roots = buttons.filter((button) => !button.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    // راهنما: این دستور متغیر/ثابت «store» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const store = await storeFor(admin, bot.workspaceId).catch(() => null);
    // راهنما: این دستور متغیر/ثابت «callback» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const callback = update.callback_query;

    // راهنما: این شرط بررسی می‌کند آیا «callback?.data && callback.message?.chat?.id» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (callback?.data && callback.message?.chat?.id) {
      // راهنما: این دستور متغیر/ثابت «chatId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const chatId = callback.message.chat.id;
      // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const data = callback.data;
      // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
      try {
        // راهنما: این شرط بررسی می‌کند آیا «data.startsWith("menu:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (data.startsWith("menu:")) {
          // راهنما: این دستور متغیر/ثابت «button» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
          const button = buttons.find((item) => item.id === data.slice(5));
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این شرط بررسی می‌کند آیا «button» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
          if (button) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await runMenuAction(admin, token, chatId, store, callback.from, button, buttons)». */ await runMenuAction(admin, token, chatId, store, callback.from, button, buttons);
          // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
          return new Response("ok");
        }

        // راهنما: این شرط بررسی می‌کند آیا «!store» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (!store) {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id, "فروشگاه فعال نیست.")».
          await ack(token, callback.id, "فروشگاه فعال نیست.");
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendInline(token, chatId, "فروشگاه فعال نیست.", [])».
          await sendInline(token, chatId, "فروشگاه فعال نیست.", []);
          // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
          return new Response("ok");
        }

        // راهنما: این شرط بررسی می‌کند آیا «data === "catalog"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (data === "catalog") {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await catalog(admin, token, chatId, store)».
          await catalog(admin, token, chatId, store);
        } else /* راهنما: این شرط بررسی می‌کند آیا «data.startsWith("cat:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data.startsWith("cat:")) {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await category(admin, token, chatId, store, data.slice(4))».
          await category(admin, token, chatId, store, data.slice(4));
        } else /* راهنما: این شرط بررسی می‌کند آیا «data.startsWith("product:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data.startsWith("product:")) {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await product(admin, token, chatId, store, data.slice(8))».
          await product(admin, token, chatId, store, data.slice(8));
        } else /* راهنما: این شرط بررسی می‌کند آیا «data.startsWith("cartadd:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data.startsWith("cartadd:")) {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await changeCart(admin, store, callback.from, data.slice(8), 1)».
          await changeCart(admin, store, callback.from, data.slice(8), 1);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id, "به سبد اضافه شد.")».
          await ack(token, callback.id, "به سبد اضافه شد.");
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await showCart(admin, token, chatId, store, callback.from)».
          await showCart(admin, token, chatId, store, callback.from);
        } else /* راهنما: این شرط بررسی می‌کند آیا «data.startsWith("cartdel:")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data.startsWith("cartdel:")) {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await changeCart(admin, store, callback.from, data.slice(8), -1)».
          await changeCart(admin, store, callback.from, data.slice(8), -1);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id, "سبد به‌روزرسانی شد.")».
          await ack(token, callback.id, "سبد به‌روزرسانی شد.");
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await showCart(admin, token, chatId, store, callback.from)».
          await showCart(admin, token, chatId, store, callback.from);
        } else /* راهنما: این شرط بررسی می‌کند آیا «data === "cart"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data === "cart") {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await showCart(admin, token, chatId, store, callback.from)».
          await showCart(admin, token, chatId, store, callback.from);
        } else /* راهنما: این شرط بررسی می‌کند آیا «data === "checkout"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data === "checkout") {
          // راهنما: این دستور متغیر/ثابت «order» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
          const order = await checkout(admin, store, callback.from, chatId, callback.message.message_id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id, order.replayed ? "این سفارش قبلاً ثبت شده است." : "سفارش ثب…».
          await ack(token, callback.id, order.replayed ? "این سفارش قبلاً ثبت شده است." : "سفارش ثبت شد.");
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendInline(token, chatId, `✅ سفارش #${String(order.orderId).slice(0, 8)}\nمبلغ: ${m…».
          await sendInline(token, chatId, `✅ سفارش #${String(order.orderId).slice(0, 8)}\nمبلغ: ${money(order.totalAmount, order.currency)}\nوضعیت: در انتظار پرداخت\n\nدرگاه پرداخت هنوز فعال نشده است؛ وضعیت سفارش خودکار PAID نمی‌شود.`, [[{ text: "📦 سفارش‌های من", callback_data: "orders" }]]);
        } else /* راهنما: این شرط بررسی می‌کند آیا «data === "orders"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if (data === "orders") {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await orders(admin, token, chatId, store, callback.from)».
          await orders(admin, token, chatId, store, callback.from);
        } else {
          // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id)».
          await ack(token, callback.id);
        }
      } catch (error) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale callback failed", error)».
        console.error("bale callback failed", error);
        // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const text = String(error);
        // راهنما: این دستور متغیر/ثابت «message» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const message = text.includes("insufficient_stock")
          ? "موجودی کافی نیست."
          : text.includes("cart_empty")
            ? "سبد خرید خالی است."
            : "عملیات انجام نشد.";
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await ack(token, callback.id, message)».
        await ack(token, callback.id, message);
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendInline(token, chatId, message, []).catch(() => undefined)».
        await sendInline(token, chatId, message, []).catch(() => undefined);
      }
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return new Response("ok");
    }

    // راهنما: این دستور متغیر/ثابت «chatId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const chatId = update.message?.chat?.id;
    // راهنما: این دستور متغیر/ثابت «text» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const text = update.message?.text?.trim();
    // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const user = update.message?.from;
    // راهنما: این شرط بررسی می‌کند آیا «!chatId || !text» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!chatId || !text) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("ok");

    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این شرط بررسی می‌کند آیا «text === "/start" || text.startsWith("/start ")» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (text === "/start" || text.startsWith("/start ")) {
        // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendMenu(token, chatId, bot.welcomeMessage || "سلام! از منوی زیر انتخاب کنید.", roo…».
        await sendMenu(token, chatId, bot.welcomeMessage || "سلام! از منوی زیر انتخاب کنید.", roots);
      } else {
        // راهنما: این دستور متغیر/ثابت «selected» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
        const selected = roots.find((button) => button.title === text);
        // راهنما: این شرط بررسی می‌کند آیا «!selected» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
        if (!selected) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendMenu(token, chatId, "یکی از گزینه‌های منو را انتخاب کنید.", roots)». */ await sendMenu(token, chatId, "یکی از گزینه‌های منو را انتخاب کنید.", roots);
        else /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await runMenuAction(admin, token, chatId, store, user, selected, buttons)». */ await runMenuAction(admin, token, chatId, store, user, selected, buttons);
      }
    } catch (error) {
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «console.error("bale message failed", error)».
      console.error("bale message failed", error);
      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await sendMenu(token, chatId, "در پردازش درخواست مشکلی پیش آمد.", roots).catch(() => unde…».
      await sendMenu(token, chatId, "در پردازش درخواست مشکلی پیش آمد.", roots).catch(() => undefined);
    }

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("ok")» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return new Response("ok");
  }),
};
