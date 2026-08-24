import baseWorker from './index';
import { validateTelegramMiniApp, type TelegramMiniAppEnv } from './telegram-miniapp';

type Env = TelegramMiniAppEnv & {
  ASSETS: Fetcher;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type AuthTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

const SUPABASE_URL = 'https://spncmjuvnvfkrahjnyjm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_W31Jq3eRekpGRiYcDPxI1Q_69QxsLQs';
const ACCESS_COOKIE = 'ai_panel_access';
const REFRESH_COOKIE = 'ai_panel_refresh';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
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

function withSessionCookies(response: Response, tokens: AuthTokens) {
  const headers = new Headers(response.headers);
  if (tokens.access_token) headers.append('set-cookie', cookie(ACCESS_COOKIE, tokens.access_token, Math.max(60, Number(tokens.expires_in ?? 3600))));
  if (tokens.refresh_token) headers.append('set-cookie', cookie(REFRESH_COOKIE, tokens.refresh_token, 60 * 60 * 24 * 30));
  return new Response(response.body, { status: response.status, headers });
}

async function verifiedTelegramUser(request: Request, env: Env) {
  const validation = await validateTelegramMiniApp(request.clone(), env);
  const data = (await validation.clone().json().catch(() => ({}))) as { ok?: boolean; user?: TelegramUser };
  if (!validation.ok || !data.ok || !data.user) return { ok: false as const, response: validation };
  return { ok: true as const, user: data.user };
}

function serviceHeaders(env: Env, extra: HeadersInit = {}) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const headers = new Headers(extra);
  headers.set('apikey', env.SUPABASE_SERVICE_ROLE_KEY);
  headers.set('authorization', `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
  return headers;
}

async function currentAuthUser(request: Request) {
  const accessToken = parseCookies(request).get(ACCESS_COOKIE);
  if (!accessToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${accessToken}`, accept: 'application/json' },
  });
  if (!response.ok) return null;
  const user = (await response.json().catch(() => ({}))) as { id?: string; email?: string };
  return user.id ? user : null;
}

async function rest(env: Env, path: string, init: RequestInit = {}) {
  const headers = serviceHeaders(env, init.headers);
  if (!headers) return null;
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers });
}

async function handleLink(request: Request, env: Env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, configured: false, message: 'Supabase service-role secret is not configured.' }, 503);
  const verified = await verifiedTelegramUser(request, env);
  if (!verified.ok) return verified.response;
  const authUser = await currentAuthUser(request);
  if (!authUser?.id) return json({ ok: false, message: 'ابتدا وارد حساب AI Panel شوید.' }, 401);

  const telegramUserId = String(verified.user.id);
  const existingResponse = await rest(env, `TelegramIdentityLink?telegramUserId=eq.${encodeURIComponent(telegramUserId)}&select=userId&limit=1`);
  if (!existingResponse?.ok) return json({ ok: false, message: 'بررسی اتصال Telegram انجام نشد.' }, 502);
  const existing = (await existingResponse.json()) as Array<{ userId: string }>;
  if (existing[0]?.userId && existing[0].userId !== authUser.id) return json({ ok: false, message: 'این حساب Telegram قبلاً به حساب دیگری متصل شده است.' }, 409);

  const oldLinkResponse = await rest(env, `TelegramIdentityLink?userId=eq.${encodeURIComponent(authUser.id)}&telegramUserId=neq.${encodeURIComponent(telegramUserId)}`, { method: 'DELETE' });
  if (!oldLinkResponse?.ok) return json({ ok: false, message: 'اتصال قبلی حساب پاک نشد.' }, 502);

  const now = new Date().toISOString();
  const saveResponse = await rest(env, 'TelegramIdentityLink?on_conflict=telegramUserId', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ telegramUserId, userId: authUser.id, username: verified.user.username ?? null, firstName: verified.user.first_name, lastName: verified.user.last_name ?? null, photoUrl: verified.user.photo_url ?? null, linkedAt: now, lastSeenAt: now, updatedAt: now }),
  });
  if (!saveResponse?.ok) return json({ ok: false, message: 'اتصال Telegram به حساب ذخیره نشد.' }, 502);
  return json({ ok: true, linked: true });
}

async function linkedEmail(env: Env, telegramUserId: string) {
  const linkResponse = await rest(env, `TelegramIdentityLink?telegramUserId=eq.${encodeURIComponent(telegramUserId)}&select=userId&limit=1`);
  if (!linkResponse?.ok) return null;
  const links = (await linkResponse.json()) as Array<{ userId?: string }>;
  const userId = links[0]?.userId;
  if (!userId) return null;
  const userResponse = await rest(env, `User?id=eq.${encodeURIComponent(userId)}&select=id,email&limit=1`);
  if (!userResponse?.ok) return null;
  const users = (await userResponse.json()) as Array<{ email?: string }>;
  return users[0]?.email ?? null;
}

async function generateMagicTokenHash(env: Env, email: string) {
  const headers = serviceHeaders(env, { 'content-type': 'application/json', accept: 'application/json' });
  if (!headers) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, { method: 'POST', headers, body: JSON.stringify({ type: 'magiclink', email }) });
  if (!response.ok) return null;
  const data = (await response.json().catch(() => ({}))) as { properties?: { hashed_token?: string; action_link?: string }; hashed_token?: string };
  let tokenHash = data.properties?.hashed_token ?? data.hashed_token;
  if (!tokenHash && data.properties?.action_link) {
    try { tokenHash = new URL(data.properties.action_link).searchParams.get('token') ?? undefined; } catch { /* malformed link */ }
  }
  return tokenHash ?? null;
}

async function verifyMagicToken(tokenHash: string) {
  for (const type of ['email', 'magiclink']) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/verify`, { method: 'POST', headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ token_hash: tokenHash, type }) });
    const data = (await response.json().catch(() => ({}))) as AuthTokens;
    if (response.ok && data.access_token && data.refresh_token) return data;
  }
  return null;
}

async function handleAutoLogin(request: Request, env: Env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, configured: false, message: 'Supabase service-role secret is not configured.' }, 503);
  const verified = await verifiedTelegramUser(request, env);
  if (!verified.ok) return verified.response;
  const telegramUserId = String(verified.user.id);
  const email = await linkedEmail(env, telegramUserId);
  if (!email) return json({ ok: false, linked: false, message: 'Telegram account is not linked yet.' }, 404);
  const tokenHash = await generateMagicTokenHash(env, email);
  if (!tokenHash) return json({ ok: false, message: 'نشست خودکار ساخته نشد.' }, 502);
  const tokens = await verifyMagicToken(tokenHash);
  if (!tokens?.access_token || !tokens.refresh_token) return json({ ok: false, message: 'ورود خودکار تأیید نشد.' }, 502);
  await rest(env, `TelegramIdentityLink?telegramUserId=eq.${encodeURIComponent(telegramUserId)}`, { method: 'PATCH', body: JSON.stringify({ username: verified.user.username ?? null, firstName: verified.user.first_name, lastName: verified.user.last_name ?? null, photoUrl: verified.user.photo_url ?? null, lastSeenAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) });
  return withSessionCookies(json({ ok: true, linked: true, autoLogin: true }), tokens);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/api/telegram-miniapp/link') return handleLink(request, env);
    if (request.method === 'POST' && url.pathname === '/api/telegram-miniapp/auto-login') return handleAutoLogin(request, env);
    return baseWorker.fetch(request, env);
  },
};
