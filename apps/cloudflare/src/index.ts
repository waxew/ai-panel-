interface Env {
  ASSETS: Fetcher;
}

const SUPABASE_URL = 'https://spncmjuvnvfkrahjnyjm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_W31Jq3eRekpGRiYcDPxI1Q_69QxsLQs';
const ACCESS_COOKIE = 'ai_panel_access';
const REFRESH_COOKIE = 'ai_panel_refresh';

type AuthTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id?: string; email?: string };
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function parseCookies(request: Request) {
  const result = new Map<string, string>();
  const raw = request.headers.get('cookie') ?? '';
  for (const part of raw.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result.set(key, decodeURIComponent(value));
  }
  return result;
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie(name: string) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function authHeaders(request: Request, extra: HeadersInit = {}) {
  const headers = new Headers(extra);
  headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('x-forwarded-for', ip);
  return headers;
}

async function readAuthResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as AuthTokens;
  if (!response.ok) {
    const message = data.error_description ?? data.msg ?? data.message ?? data.error ?? 'خطای احراز هویت.';
    return { ok: false as const, status: response.status, message };
  }
  return { ok: true as const, data };
}

function withSessionCookies(response: Response, tokens: AuthTokens) {
  const headers = new Headers(response.headers);
  if (tokens.access_token) headers.append('set-cookie', cookie(ACCESS_COOKIE, tokens.access_token, Math.max(60, Number(tokens.expires_in ?? 3600))));
  if (tokens.refresh_token) headers.append('set-cookie', cookie(REFRESH_COOKIE, tokens.refresh_token, 60 * 60 * 24 * 30));
  return new Response(response.body, { status: response.status, headers });
}

async function refreshSession(request: Request, refreshToken: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(request, { 'content-type': 'application/json' }),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const result = await readAuthResponse(response);
  if (!result.ok || !result.data.access_token) return null;
  return result.data;
}

async function getAccessToken(request: Request) {
  const cookies = parseCookies(request);
  const accessToken = cookies.get(ACCESS_COOKIE);
  const refreshToken = cookies.get(REFRESH_COOKIE);

  if (accessToken) {
    const check = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders(request, { authorization: `Bearer ${accessToken}` }),
    });
    if (check.ok) return { token: accessToken, refreshed: null as AuthTokens | null };
  }

  if (refreshToken) {
    const refreshed = await refreshSession(request, refreshToken);
    if (refreshed?.access_token) return { token: refreshed.access_token, refreshed };
  }

  return null;
}

async function proxyFunction(request: Request, slug: string, method = request.method) {
  const session = await getAccessToken(request);
  if (!session) return json({ ok: false, message: 'ابتدا وارد حساب شوید.' }, { status: 401 });

  const headers = authHeaders(request, {
    authorization: `Bearer ${session.token}`,
    accept: 'application/json',
  });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const sourceUrl = new URL(request.url);
  const upstreamUrl = new URL(`${SUPABASE_URL}/functions/v1/${slug}`);
  sourceUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl.toString(), { method, headers, body });
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set('cache-control', 'no-store');
  responseHeaders.delete('set-cookie');
  let response = new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  if (session.refreshed) response = withSessionCookies(response, session.refreshed);
  return response;
}

async function handleSignup(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, message: 'درخواست معتبر نیست.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !email.includes('@')) return json({ ok: false, message: 'ایمیل معتبر وارد کنید.' }, { status: 400 });
  if (password.length < 8) return json({ ok: false, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' }, { status: 400 });

  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(request, { 'content-type': 'application/json' }),
    body: JSON.stringify({ email, password }),
  });
  const result = await readAuthResponse(response);
  if (!result.ok) return json({ ok: false, message: result.message }, { status: result.status });

  if (!result.data.access_token) {
    return json({ ok: true, requiresConfirmation: true, message: 'حساب ساخته شد. ایمیل تأیید را باز کنید و سپس وارد شوید.' }, { status: 201 });
  }

  return withSessionCookies(json({ ok: true, requiresConfirmation: false }, { status: 201 }), result.data);
}

async function handleSignin(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, message: 'درخواست معتبر نیست.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return json({ ok: false, message: 'ایمیل و رمز عبور را وارد کنید.' }, { status: 400 });

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(request, { 'content-type': 'application/json' }),
    body: JSON.stringify({ email, password }),
  });
  const result = await readAuthResponse(response);
  if (!result.ok) return json({ ok: false, message: 'ایمیل یا رمز عبور صحیح نیست.' }, { status: result.status });
  if (!result.data.access_token) return json({ ok: false, message: 'ورود انجام نشد.' }, { status: 401 });
  return withSessionCookies(json({ ok: true }), result.data);
}

async function handleSignout(request: Request) {
  const session = await getAccessToken(request);
  if (session) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: authHeaders(request, { authorization: `Bearer ${session.token}` }),
    }).catch(() => undefined);
  }
  const headers = new Headers();
  headers.append('set-cookie', clearCookie(ACCESS_COOKIE));
  headers.append('set-cookie', clearCookie(REFRESH_COOKIE));
  return json({ ok: true }, { headers });
}

async function handleSession(request: Request) {
  const session = await getAccessToken(request);
  if (!session) return json({ ok: false, authenticated: false }, { status: 401 });

  const upstream = await fetch(`${SUPABASE_URL}/functions/v1/customer-dashboard`, {
    headers: authHeaders(request, { authorization: `Bearer ${session.token}`, accept: 'application/json' }),
  });
  if (!upstream.ok) return json({ ok: false, authenticated: false }, { status: upstream.status });
  const data = await upstream.json() as { user?: { id?: string; email?: string; displayName?: string; role?: string } };
  let response = json({ ok: true, authenticated: true, user: data.user ?? null });
  if (session.refreshed) response = withSessionCookies(response, session.refreshed);
  return response;
}

async function handleApi(request: Request) {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/health') {
    return json({ ok: true, service: 'ai-panel-cloudflare', runtime: 'cloudflare-workers', timestamp: new Date().toISOString() });
  }

  if (request.method === 'GET' && url.pathname === '/api/modules') {
    return json({ modules: [
      { key: 'telegram', enabled: true, phase: 1 },
      { key: 'instagram', enabled: true, phase: 2 },
      { key: 'whatsapp', enabled: false, phase: 2 },
      { key: 'bale', enabled: false, phase: 2 },
      { key: 'rubika', enabled: false, phase: 2 },
      { key: 'discord', enabled: false, phase: 2 },
      { key: 'scheduler', enabled: false, phase: 2 },
      { key: 'analytics', enabled: true, phase: 2 },
    ] });
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/signup') return handleSignup(request);
  if (request.method === 'POST' && url.pathname === '/api/auth/signin') return handleSignin(request);
  if (request.method === 'POST' && url.pathname === '/api/auth/signout') return handleSignout(request);
  if (request.method === 'GET' && url.pathname === '/api/session') return handleSession(request);
  if (url.pathname === '/api/customer/dashboard' && request.method === 'GET') return proxyFunction(request, 'customer-dashboard');
  if (url.pathname === '/api/store' && (request.method === 'GET' || request.method === 'POST')) return proxyFunction(request, 'store-manage');
  if (url.pathname === '/api/store/orders' && (request.method === 'GET' || request.method === 'POST')) return proxyFunction(request, 'store-orders');
  if (url.pathname === '/api/admin/dashboard' && request.method === 'GET') return proxyFunction(request, 'admin-dashboard');
  if (url.pathname === '/api/telegram/connect' && request.method === 'POST') return proxyFunction(request, 'telegram-connect');
  if (url.pathname === '/api/telegram/manage' && (request.method === 'GET' || request.method === 'POST')) return proxyFunction(request, 'telegram-manage');
  if (url.pathname === '/api/instagram/manage' && (request.method === 'GET' || request.method === 'POST')) return proxyFunction(request, 'instagram-manage');

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health' || url.pathname.startsWith('/api/')) {
      const response = await handleApi(request);
      if (response) return response;
      return json({ ok: false, message: 'API route not found.' }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
