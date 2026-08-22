interface Env {
  ASSETS: Fetcher;
}

type TelegramBotIdentity = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function parseTelegramToken(token: string) {
  const match = token.match(/^(\d{5,15}):([A-Za-z0-9_-]{20,})$/);
  if (!match) return null;
  return {
    botId: match[1],
    maskedToken: `${match[1]}:${'*'.repeat(10)}${match[2].slice(-4)}`,
  };
}

async function telegramGetMe(token: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    return (await response.json()) as TelegramApiResponse<TelegramBotIdentity>;
  } finally {
    clearTimeout(timeout);
  }
}

async function handleApi(request: Request) {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/health') {
    return json({
      ok: true,
      service: 'ai-panel-cloudflare',
      runtime: 'cloudflare-workers',
      timestamp: new Date().toISOString(),
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/modules') {
    return json({
      modules: [
        { key: 'telegram', enabled: true, phase: 1 },
        { key: 'instagram', enabled: false, phase: 2 },
        { key: 'scheduler', enabled: false, phase: 2 },
        { key: 'analytics', enabled: false, phase: 2 },
      ],
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/telegram/connect') {
    let body: { token?: unknown };
    try {
      body = (await request.json()) as { token?: unknown };
    } catch {
      return json({ ok: false, message: 'درخواست معتبر نیست.' }, { status: 400 });
    }

    if (typeof body.token !== 'string') {
      return json({ ok: false, message: 'توکن واردشده معتبر نیست.' }, { status: 400 });
    }

    const token = body.token.trim();
    const parsed = parseTelegramToken(token);
    if (!parsed) {
      return json({ ok: false, message: 'فرمت توکن BotFather صحیح نیست.' }, { status: 400 });
    }

    let identity: TelegramApiResponse<TelegramBotIdentity>;
    try {
      identity = await telegramGetMe(token);
    } catch {
      return json({ ok: false, message: 'ارتباط با Telegram برقرار نشد. دوباره تلاش کنید.' }, { status: 502 });
    }

    if (!identity.ok || !identity.result?.is_bot) {
      return json({
        ok: false,
        message: 'Telegram این توکن را تأیید نکرد. توکن BotFather را بررسی کنید.',
      }, { status: 401 });
    }

    return json({
      ok: true,
      demoMode: true,
      status: 'connected',
      token: parsed.maskedToken,
      bot: {
        id: `tg-${identity.result.id}`,
        telegramBotId: String(identity.result.id),
        username: identity.result.username,
        displayName: identity.result.first_name,
        status: 'ACTIVE',
      },
    });
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health' || url.pathname.startsWith('/api/')) {
      const response = await handleApi(request);
      if (response) return response;
    }

    return env.ASSETS.fetch(request);
  },
};
