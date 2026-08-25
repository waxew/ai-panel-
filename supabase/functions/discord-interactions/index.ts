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
// راهنما: این دستور nacl را از ماژول «npm:tweetnacl@1.0.3» وارد می‌کند تا در این فایل قابل استفاده باشد.
import nacl from "npm:tweetnacl@1.0.3";

// راهنما: این تابع «hexToBytes» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function hexToBytes(hex: string) {
  // راهنما: این شرط بررسی می‌کند آیا «!/^[0-9a-f]+$/i.test(hex) || hex.length % 2» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Uint8Array()» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Uint8Array();
  // راهنما: این دستور متغیر/ثابت «bytes» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const bytes = new Uint8Array(hex.length / 2);
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let i = 0; i < bytes.length; i += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)». */ bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «bytes» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return bytes;
}

// راهنما: این تابع «interactionResponse» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function interactionResponse(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: { "content-type": "application/json…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

// راهنما: این دستور از نوع ExportAssignment بخشی از کنترل جریان یا تعریف منطق این فایل است.
export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    // راهنما: این شرط بررسی می‌کند آیا «request.method !== "POST"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (request.method !== "POST") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Method not allowed", { status: 405 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Method not allowed", { status: 405 });
    // راهنما: این دستور متغیر/ثابت «url» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const url = new URL(request.url);
    // راهنما: این دستور متغیر/ثابت «applicationId» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const applicationId = url.pathname.split("/").filter(Boolean).pop();
    // راهنما: این شرط بررسی می‌کند آیا «!applicationId» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!applicationId) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Not found", { status: 404 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Not found", { status: 404 });

    // راهنما: این دستور متغیر/ثابت «signature» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const signature = request.headers.get("x-signature-ed25519") ?? "";
    // راهنما: این دستور متغیر/ثابت «timestamp» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const timestamp = request.headers.get("x-signature-timestamp") ?? "";
    // راهنما: این شرط بررسی می‌کند آیا «!signature || !timestamp» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!signature || !timestamp) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Unauthorized", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Unauthorized", { status: 401 });

    // راهنما: این دستور متغیر/ثابت «admin» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const admin = ctx.supabaseAdmin;
    // راهنما: این دستور متغیر/ثابت «{ data: bot, error: botError }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const { data: bot, error: botError } = await admin.from("DiscordBot")
      .select("id,applicationId,publicKey,status")
      .eq("applicationId", applicationId)
      .maybeSingle();
    // راهنما: این شرط بررسی می‌کند آیا «botError || !bot || bot.status !== "ACTIVE"» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (botError || !bot || bot.status !== "ACTIVE") /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Not found", { status: 404 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Not found", { status: 404 });

    // راهنما: این دستور متغیر/ثابت «rawBody» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const rawBody = await request.text();
    // راهنما: این دستور متغیر/ثابت «ok» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + rawBody),
      hexToBytes(signature),
      hexToBytes(bot.publicKey),
    );
    // راهنما: این شرط بررسی می‌کند آیا «!ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (!ok) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Unauthorized", { status: 401 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Unauthorized", { status: 401 });

    // راهنما: این دستور متغیر/ثابت «interaction» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    let interaction: any;
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try { /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «interaction = JSON.parse(rawBody)». */ interaction = JSON.parse(rawBody); }
    catch { /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «new Response("Bad request", { status: 400 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return new Response("Bad request", { status: 400 }); }

    // راهنما: این شرط بررسی می‌کند آیا «interaction.type === 1» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (interaction.type === 1) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «interactionResponse({ type: 1 })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return interactionResponse({ type: 1 });

    // راهنما: این شرط بررسی می‌کند آیا «interaction.type === 2» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (interaction.type === 2) {
      // راهنما: این دستور متغیر/ثابت «name» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const name = String(interaction.data?.name ?? "").toLowerCase();
      // راهنما: این دستور متغیر/ثابت «{ data: command, error }» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const { data: command, error } = await admin.from("DiscordCommand")
        .select("id,responseText,responseEphemeral,isActive,executions")
        .eq("botId", bot.id)
        .eq("name", name)
        .maybeSingle();
      // راهنما: این شرط بررسی می‌کند آیا «error || !command || !command.isActive» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (error || !command || !command.isActive) {
        // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «interactionResponse({ type: 4, data: { content: "این فرمان در AI Panel فعا…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
        return interactionResponse({ type: 4, data: { content: "این فرمان در AI Panel فعال نیست.", flags: 64 } });
      }

      // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await admin.from("DiscordCommand").update({ executions: Number(command.executions ?? 0) +…».
      await admin.from("DiscordCommand").update({
        executions: Number(command.executions ?? 0) + 1,
        lastUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).eq("id", command.id);

      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «interactionResponse({ type: 4, data: { content: command.responseText || "ف…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return interactionResponse({
        type: 4,
        data: {
          content: command.responseText || "فرمان اجرا شد.",
          ...(command.responseEphemeral ? { flags: 64 } : {}),
        },
      });
    }

    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «interactionResponse({ type: 4, data: { content: "این Interaction هنوز در A…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return interactionResponse({ type: 4, data: { content: "این Interaction هنوز در AI Panel پشتیبانی نمی‌شود.", flags: 64 } });
  }),
};
