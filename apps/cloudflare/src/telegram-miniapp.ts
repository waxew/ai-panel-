/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این Type با نام «TelegramMiniAppEnv» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type TelegramMiniAppEnv = {
  TELEGRAM_PROJECT_BOT_TOKEN?: string;
};

// راهنما: این Type با نام «TelegramUser» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

// راهنما: این تابع «json» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function json(data: unknown, status = 200) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Response.json(data, { status, headers: { 'cache-control': 'no-store' }, })» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

// راهنما: این تابع «hex» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function hex(bytes: ArrayBuffer) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// راهنما: این تابع «hmacSha256» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function hmacSha256(key: BufferSource, value: string) {
  // راهنما: این دستور متغیر/ثابت «cryptoKey» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value))» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
}

// راهنما: این تابع «timingSafeEqual» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function timingSafeEqual(left: string, right: string) {
  // راهنما: این شرط بررسی می‌کند آیا «left.length !== right.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (left.length !== right.length) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
  // راهنما: این دستور متغیر/ثابت «diff» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let diff = 0;
  // راهنما: این حلقه مجموعه‌ای از داده‌ها یا یک بازه را پیمایش می‌کند و منطق داخل بدنه را برای هر مرحله اجرا می‌کند.
  for (let index = 0; index < left.length; index += 1) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «diff |= left.charCodeAt(index) ^ right.charCodeAt(index)». */ diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «diff === 0» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return diff === 0;
}

// راهنما: این تابع «validateTelegramMiniApp» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export async function validateTelegramMiniApp(request: Request, env: TelegramMiniAppEnv) {
  // راهنما: این شرط بررسی می‌کند آیا «!env.TELEGRAM_PROJECT_BOT_TOKEN» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!env.TELEGRAM_PROJECT_BOT_TOKEN) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: false, message: 'Telegram project bot token …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, configured: false, message: 'Telegram project bot token is not configured.' }, 503);
  }

  // راهنما: این دستور متغیر/ثابت «body» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let body: { initData?: unknown };
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «body = await request.json()».
    body = await request.json();
  } catch {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Invalid request body.' }, 40…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, configured: true, message: 'Invalid request body.' }, 400);
  }

  // راهنما: این دستور متغیر/ثابت «initData» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const initData = typeof body.initData === 'string' ? body.initData : '';
  // راهنما: این شرط بررسی می‌کند آیا «!initData || initData.length > 8192» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!initData || initData.length > 8192) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram initData is missing…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, configured: true, message: 'Telegram initData is missing.' }, 400);

  // راهنما: این دستور متغیر/ثابت «params» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const params = new URLSearchParams(initData);
  // راهنما: این دستور متغیر/ثابت «receivedHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const receivedHash = params.get('hash') ?? '';
  // راهنما: این شرط بررسی می‌کند آیا «!/^[0-9a-f]{64}$/i.test(receivedHash)» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!/^[0-9a-f]{64}$/i.test(receivedHash)) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram signature is missin…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, configured: true, message: 'Telegram signature is missing.' }, 401);

  // راهنما: این دستور متغیر/ثابت «authDate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const authDate = Number(params.get('auth_date') ?? 0);
  // راهنما: این دستور متغیر/ثابت «now» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const now = Math.floor(Date.now() / 1000);
  // راهنما: این شرط بررسی می‌کند آیا «!Number.isFinite(authDate) || authDate <= 0 || Math.abs(now - authDate) > 3600» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!Number.isFinite(authDate) || authDate <= 0 || Math.abs(now - authDate) > 3600) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram initData has expire…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, configured: true, message: 'Telegram initData has expired.' }, 401);
  }

  // راهنما: این دستور متغیر/ثابت «dataCheckString» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // راهنما: این دستور متغیر/ثابت «secretKey» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), env.TELEGRAM_PROJECT_BOT_TOKEN);
  // راهنما: این دستور متغیر/ثابت «expectedHash» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const expectedHash = hex(await hmacSha256(secretKey, dataCheckString));
  // راهنما: این شرط بررسی می‌کند آیا «!timingSafeEqual(expectedHash.toLowerCase(), receivedHash.toLowerCase())» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!timingSafeEqual(expectedHash.toLowerCase(), receivedHash.toLowerCase())) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram signature is invali…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return json({ ok: false, configured: true, message: 'Telegram signature is invalid.' }, 401);
  }

  // راهنما: این دستور متغیر/ثابت «user» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let user: TelegramUser | undefined;
  // راهنما: این دستور متغیر/ثابت «rawUser» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const rawUser = params.get('user');
  // راهنما: این شرط بررسی می‌کند آیا «rawUser» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (rawUser) {
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try {
      // راهنما: این دستور متغیر/ثابت «candidate» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const candidate = JSON.parse(rawUser) as TelegramUser;
      // راهنما: این شرط بررسی می‌کند آیا «Number.isSafeInteger(candidate.id) && candidate.id > 0 && typeof candidate.firs…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if (Number.isSafeInteger(candidate.id) && candidate.id > 0 && typeof candidate.first_name === 'string') /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «user = candidate». */ user = candidate;
    } catch {
      // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram user payload is inv…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
      return json({ ok: false, configured: true, message: 'Telegram user payload is invalid.' }, 401);
    }
  }

  // راهنما: این شرط بررسی می‌کند آیا «!user» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!user) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: false, configured: true, message: 'Telegram user is missing.' }…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return json({ ok: false, configured: true, message: 'Telegram user is missing.' }, 401);

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «json({ ok: true, configured: true, authDate, queryId: params.get('query_id…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return json({
    ok: true,
    configured: true,
    authDate,
    queryId: params.get('query_id') ?? undefined,
    startParam: params.get('start_param') ?? undefined,
    user,
  });
}
