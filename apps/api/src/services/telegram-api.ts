// شکل عمومی پاسخ‌های Telegram Bot API را تعریف می‌کنیم؛ T نوع result را برای هر Method مشخص می‌کند.
type TelegramApiResponse<T> = {
  // اگر Telegram درخواست را پذیرفته باشد true است.
  ok: boolean;
  // داده اصلی پاسخ در صورت موفقیت.
  result?: T;
  // توضیح متنی خطا در صورت شکست.
  description?: string;
  // کد عددی خطای Telegram در صورت وجود.
  error_code?: number;
};

// Type اطلاعات هویتی ربات که Method getMe برمی‌گرداند.
export type TelegramBotIdentity = {
  // شناسه عددی ربات در Telegram.
  id: number;
  // مشخص می‌کند Account واقعاً Bot است.
  is_bot: boolean;
  // نام نمایشی اصلی ربات.
  first_name: string;
  // Username ربات بدون @؛ ممکن است در بعضی Typeها Optional باشد.
  username?: string;
  // قابلیت Join شدن به Groupها.
  can_join_groups?: boolean;
  // قابلیت خواندن همه پیام‌های Group در صورت تنظیم دسترسی مناسب.
  can_read_all_group_messages?: boolean;
  // پشتیبانی از Inline Query.
  supports_inline_queries?: boolean;
};

// Type پاسخ Method مربوط به توضیحات پروفایل ربات.
export type TelegramBotDescription = {
  // متن Description فعلی ربات.
  description: string;
};

// تابع عمومی برای صدا زدن یک Method از Telegram Bot API.
async function callTelegram<T>(token: string, method: string): Promise<TelegramApiResponse<T>> {
  // AbortController می‌سازیم تا بتوانیم درخواست طولانی را قطع کنیم.
  const controller = new AbortController();
  // اگر Telegram ظرف 8 ثانیه پاسخ ندهد، Request را Abort می‌کنیم.
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    // URL رسمی Bot API از Token ربات و نام Method ساخته می‌شود و Request ارسال می‌شود.
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      // Methodهای مورد استفاده این Helper با GET فراخوانی می‌شوند.
      method: 'GET',
      // Signal مربوط به AbortController به fetch داده می‌شود تا Timeout کار کند.
      signal: controller.signal,
      // از Telegram درخواست پاسخ JSON می‌کنیم.
      headers: { accept: 'application/json' },
    });

    // Body پاسخ JSON خوانده شده و به Type عمومی TelegramApiResponse تبدیل می‌شود.
    const payload = (await response.json()) as TelegramApiResponse<T>;
    // پاسخ پردازش‌شده به Caller برگردانده می‌شود.
    return payload;
  } finally {
    // چه درخواست موفق شود چه خطا دهد، Timer پاک می‌شود تا Resource اضافه باقی نماند.
    clearTimeout(timeout);
  }
}

// این تابع Token واردشده توسط مشتری را با Telegram بررسی می‌کند و هویت ربات را برمی‌گرداند.
export async function verifyTelegramBot(token: string) {
  // ابتدا Method رسمی getMe را اجرا می‌کنیم؛ معتبر بودن Token از همین پاسخ مشخص می‌شود.
  const identity = await callTelegram<TelegramBotIdentity>(token, 'getMe');

  // اگر پاسخ موفق نیست یا Account برگشتی Bot نیست، اتصال را رد می‌کنیم.
  if (!identity.ok || !identity.result?.is_bot) {
    return {
      // as const باعث می‌شود TypeScript مقدار ok را literal false نگه دارد.
      ok: false as const,
      // کد خطای Telegram برای Debug/نمایش مناسب‌تر منتقل می‌شود.
      errorCode: identity.error_code,
      // پیام اصلی Telegram یا پیام پیش‌فرض پروژه برگردانده می‌شود.
      message: identity.description ?? 'Telegram rejected this bot token.',
    };
  }

  // Description اختیاری است؛ ابتدا undefined در نظر گرفته می‌شود.
  let description: string | undefined;
  try {
    // اگر Token معتبر بود، Description فعلی ربات را هم از Telegram می‌گیریم.
    const result = await callTelegram<TelegramBotDescription>(token, 'getMyDescription');
    // فقط در پاسخ موفق Description ذخیره می‌شود؛ رشته خالی به undefined تبدیل می‌شود.
    if (result.ok) description = result.result?.description || undefined;
  } catch {
    // گرفتن Description برای اتصال ضروری نیست؛ معتبر بودن getMe برای تأیید Token کافی است.
  }

  // نتیجه موفق اتصال به Caller برگردانده می‌شود.
  return {
    // literal true برای Type narrowing بهتر در TypeScript.
    ok: true as const,
    // اطلاعات هویتی ربات تأییدشده.
    bot: identity.result,
    // توضیحات اختیاری پروفایل ربات.
    description,
  };
}
