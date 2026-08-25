// توابع رمزنگاری داخلی Node.js را وارد می‌کنیم: ساخت Cipher، Hash کردن Secret و تولید بایت تصادفی.
import { createCipheriv, createHash, randomBytes } from 'node:crypto';

// الگوریتم رمزنگاری این پروژه AES-256-GCM است؛ GCM علاوه بر محرمانگی، صحت داده را هم با Auth Tag بررسی می‌کند.
const ALGORITHM = 'aes-256-gcm';

// این تابع کلید رمزنگاری نهایی را از Secret محیطی پروژه می‌سازد.
function getKey() {
  // Secret اصلی از متغیر محیطی خوانده می‌شود تا داخل GitHub ذخیره نشود.
  const secret = process.env.APP_ENCRYPTION_KEY;
  // اگر Secret تعریف نشده یا کوتاه‌تر از حداقل موردنظر باشد، اجرای رمزنگاری متوقف می‌شود.
  if (!secret || secret.length < 32) {
    // خطای واضح می‌دهیم تا توسعه‌دهنده بداند متغیر محیطی باید اصلاح شود.
    throw new Error('APP_ENCRYPTION_KEY must be at least 32 characters');
  }
  // Secret با SHA-256 به یک کلید ثابت 32 بایتی مناسب AES-256 تبدیل می‌شود.
  return createHash('sha256').update(secret).digest();
}

// این تابع یک متن حساس مثل Token ربات را می‌گیرد و نسخه رمز‌شده قابل ذخیره در دیتابیس را برمی‌گرداند.
export function encryptSecret(plaintext: string) {
  // یک IV تصادفی 12 بایتی برای هر عملیات رمزنگاری تولید می‌شود؛ IV نباید بین رمزنگاری‌های GCM تکرار شود.
  const iv = randomBytes(12);
  // Cipher با الگوریتم مشخص، کلید پروژه و IV تصادفی ساخته می‌شود.
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  // متن ورودی UTF-8 رمز می‌شود و خروجی نهایی Cipher به Buffer اصلی چسبانده می‌شود.
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  // Auth Tag مربوط به GCM گرفته می‌شود تا بعداً هنگام رمزگشایی صحت داده قابل بررسی باشد.
  const authTag = cipher.getAuthTag();

  // خروجی نهایی را به یک رشته نسخه‌دار تبدیل می‌کنیم تا اجزای لازم برای رمزگشایی همراه داده ذخیره شوند.
  return [
    // نسخه فرمت رمزنگاری؛ اگر در آینده الگوریتم یا ساختار عوض شود می‌توان نسخه جدید تعریف کرد.
    'v1',
    // IV به Base64URL تبدیل می‌شود تا داخل متن/دیتابیس به‌راحتی ذخیره شود.
    iv.toString('base64url'),
    // Auth Tag نیز به Base64URL تبدیل می‌شود.
    authTag.toString('base64url'),
    // متن رمز‌شده هم به Base64URL تبدیل می‌شود.
    encrypted.toString('base64url'),
  // چهار بخش بالا با نقطه از هم جدا می‌شوند و یک رشته واحد می‌سازند.
  ].join('.');
}
