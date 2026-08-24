export type TelegramMiniAppEnv = {
  TELEGRAM_PROJECT_BOT_TOKEN?: string;
};

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: BufferSource, value: string) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

export async function validateTelegramMiniApp(request: Request, env: TelegramMiniAppEnv) {
  if (!env.TELEGRAM_PROJECT_BOT_TOKEN) {
    return json({ ok: false, configured: false, message: 'Telegram project bot token is not configured.' }, 503);
  }

  let body: { initData?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, configured: true, message: 'Invalid request body.' }, 400);
  }

  const initData = typeof body.initData === 'string' ? body.initData : '';
  if (!initData || initData.length > 8192) return json({ ok: false, configured: true, message: 'Telegram initData is missing.' }, 400);

  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash') ?? '';
  if (!/^[0-9a-f]{64}$/i.test(receivedHash)) return json({ ok: false, configured: true, message: 'Telegram signature is missing.' }, 401);

  const authDate = Number(params.get('auth_date') ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate <= 0 || Math.abs(now - authDate) > 3600) {
    return json({ ok: false, configured: true, message: 'Telegram initData has expired.' }, 401);
  }

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), env.TELEGRAM_PROJECT_BOT_TOKEN);
  const expectedHash = hex(await hmacSha256(secretKey, dataCheckString));
  if (!timingSafeEqual(expectedHash.toLowerCase(), receivedHash.toLowerCase())) {
    return json({ ok: false, configured: true, message: 'Telegram signature is invalid.' }, 401);
  }

  let user: TelegramUser | undefined;
  const rawUser = params.get('user');
  if (rawUser) {
    try {
      const candidate = JSON.parse(rawUser) as TelegramUser;
      if (Number.isSafeInteger(candidate.id) && candidate.id > 0 && typeof candidate.first_name === 'string') user = candidate;
    } catch {
      return json({ ok: false, configured: true, message: 'Telegram user payload is invalid.' }, 401);
    }
  }

  if (!user) return json({ ok: false, configured: true, message: 'Telegram user is missing.' }, 401);

  return json({
    ok: true,
    configured: true,
    authDate,
    queryId: params.get('query_id') ?? undefined,
    startParam: params.get('start_param') ?? undefined,
    user,
  });
}
