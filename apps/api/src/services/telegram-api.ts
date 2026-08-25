/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// شکل عمومی پاسخ‌های Telegram Bot API را تعریف می‌کنیم؛ T نوع result را برای هر Method مشخص می‌کند.
// راهنما: این Type با نام «TelegramApiResponse» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
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
// راهنما: این Type با نام «TelegramBotIdentity» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
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
// راهنما: این Type با نام «TelegramBotDescription» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type TelegramBotDescription = {
  // متن Description فعلی ربات.
  description: string;
};

// تابع عمومی برای صدا زدن یک Method از Telegram Bot API.
// راهنما: این تابع «callTelegram» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function callTelegram<T>(token: string, method: string): Promise<TelegramApiResponse<T>> {
  // AbortController می‌سازیم تا بتوانیم درخواست طولانی را قطع کنیم.
  // راهنما: این دستور متغیر/ثابت «controller» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const controller = new AbortController();
  // اگر Telegram ظرف 8 ثانیه پاسخ ندهد، Request را Abort می‌کنیم.
  // راهنما: این دستور متغیر/ثابت «timeout» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const timeout = setTimeout(() => controller.abort(), 8000);

  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // URL رسمی Bot API از Token ربات و نام Method ساخته می‌شود و Request ارسال می‌شود.
    // راهنما: این متغیر «response» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      // Methodهای مورد استفاده این Helper با GET فراخوانی می‌شوند.
      method: 'GET',
      // Signal مربوط به AbortController به fetch داده می‌شود تا Timeout کار کند.
      signal: controller.signal,
      // از Telegram درخواست پاسخ JSON می‌کنیم.
      headers: { accept: 'application/json' },
    });

    // Body پاسخ JSON خوانده شده و به Type عمومی TelegramApiResponse تبدیل می‌شود.
    // راهنما: این دستور متغیر/ثابت «payload» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const payload = (await response.json()) as TelegramApiResponse<T>;
    // پاسخ پردازش‌شده به Caller برگردانده می‌شود.
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «payload» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return payload;
  } finally {
    // چه درخواست موفق شود چه خطا دهد، Timer پاک می‌شود تا Resource اضافه باقی نماند.
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «clearTimeout(timeout)».
    clearTimeout(timeout);
  }
}

// این تابع Token واردشده توسط مشتری را با Telegram بررسی می‌کند و هویت ربات را برمی‌گرداند.
// راهنما: این تابع «verifyTelegramBot» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export async function verifyTelegramBot(token: string) {
  // ابتدا Method رسمی getMe را اجرا می‌کنیم؛ معتبر بودن Token از همین پاسخ مشخص می‌شود.
  // راهنما: این دستور متغیر/ثابت «identity» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const identity = await callTelegram<TelegramBotIdentity>(token, 'getMe');

  // اگر پاسخ موفق نیست یا Account برگشتی Bot نیست، اتصال را رد می‌کنیم.
  // راهنما: این شرط بررسی می‌کند آیا «!identity.ok || !identity.result?.is_bot» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!identity.ok || !identity.result?.is_bot) {
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ // as const باعث می‌شود TypeScript مقدار ok را literal false نگه دارد. o…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
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
  // راهنما: این دستور متغیر/ثابت «description» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  let description: string | undefined;
  // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
  try {
    // اگر Token معتبر بود، Description فعلی ربات را هم از Telegram می‌گیریم.
    // راهنما: این دستور متغیر/ثابت «result» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const result = await callTelegram<TelegramBotDescription>(token, 'getMyDescription');
    // فقط در پاسخ موفق Description ذخیره می‌شود؛ رشته خالی به undefined تبدیل می‌شود.
    // راهنما: این شرط بررسی می‌کند آیا «result.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if (result.ok) /* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «description = result.result?.description || undefined». */ description = result.result?.description || undefined;
  } catch {
    // گرفتن Description برای اتصال ضروری نیست؛ معتبر بودن getMe برای تأیید Token کافی است.
  }

  // نتیجه موفق اتصال به Caller برگردانده می‌شود.
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ // literal true برای Type narrowing بهتر در TypeScript. ok: true as cons…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return {
    // literal true برای Type narrowing بهتر در TypeScript.
    ok: true as const,
    // اطلاعات هویتی ربات تأییدشده.
    bot: identity.result,
    // توضیحات اختیاری پروفایل ربات.
    description,
  };
}
