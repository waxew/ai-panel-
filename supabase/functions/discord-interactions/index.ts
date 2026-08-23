import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.4.1";
import nacl from "npm:tweetnacl@1.0.3";

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) return new Uint8Array();
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function interactionResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const url = new URL(request.url);
    const applicationId = url.pathname.split("/").filter(Boolean).pop();
    if (!applicationId) return new Response("Not found", { status: 404 });

    const signature = request.headers.get("x-signature-ed25519") ?? "";
    const timestamp = request.headers.get("x-signature-timestamp") ?? "";
    if (!signature || !timestamp) return new Response("Unauthorized", { status: 401 });

    const admin = ctx.supabaseAdmin;
    const { data: bot, error: botError } = await admin.from("DiscordBot")
      .select("id,applicationId,publicKey,status")
      .eq("applicationId", applicationId)
      .maybeSingle();
    if (botError || !bot || bot.status !== "ACTIVE") return new Response("Not found", { status: 404 });

    const rawBody = await request.text();
    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + rawBody),
      hexToBytes(signature),
      hexToBytes(bot.publicKey),
    );
    if (!ok) return new Response("Unauthorized", { status: 401 });

    let interaction: any;
    try { interaction = JSON.parse(rawBody); }
    catch { return new Response("Bad request", { status: 400 }); }

    if (interaction.type === 1) return interactionResponse({ type: 1 });

    if (interaction.type === 2) {
      const name = String(interaction.data?.name ?? "").toLowerCase();
      const { data: command, error } = await admin.from("DiscordCommand")
        .select("id,responseText,responseEphemeral,isActive,executions")
        .eq("botId", bot.id)
        .eq("name", name)
        .maybeSingle();
      if (error || !command || !command.isActive) {
        return interactionResponse({ type: 4, data: { content: "این فرمان در AI Panel فعال نیست.", flags: 64 } });
      }

      await admin.from("DiscordCommand").update({
        executions: Number(command.executions ?? 0) + 1,
        lastUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).eq("id", command.id);

      return interactionResponse({
        type: 4,
        data: {
          content: command.responseText || "فرمان اجرا شد.",
          ...(command.responseEphemeral ? { flags: 64 } : {}),
        },
      });
    }

    return interactionResponse({ type: 4, data: { content: "این Interaction هنوز در AI Panel پشتیبانی نمی‌شود.", flags: 64 } });
  }),
};
