/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این Type با نام «PlatformModuleKey» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleKey =
  | 'telegram'
  | 'instagram'
  | 'whatsapp'
  | 'bale'
  | 'rubika'
  | 'discord'
  | 'booking'
  | 'scheduler'
  | 'analytics'
  | 'twitter';

// راهنما: این Type با نام «PlatformModuleStatus» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleStatus = 'live' | 'partial' | 'planned';
// راهنما: این Type با نام «PlatformModuleKind» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleKind = 'channel' | 'business-tool' | 'platform-tool';
// راهنما: این Type با نام «PlatformModuleUiRuntime» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleUiRuntime = 'react' | 'legacy-html' | 'none';

// راهنما: این Type با نام «PlatformModuleDefinition» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleDefinition = {
  key: PlatformModuleKey;
  labelFa: string;
  labelEn: string;
  shortCode: string;
  descriptionFa: string;
  kind: PlatformModuleKind;
  status: PlatformModuleStatus;
  phase: number;
  customerRoute: string | null;
  apiPrefix: string | null;
  uiRuntime: PlatformModuleUiRuntime;
  commerceEnabled: boolean;
  capabilities: readonly string[];
};

// راهنما: این دستور متغیر/ثابت «platformModules» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
export const platformModules: readonly PlatformModuleDefinition[] = [
  {
    key: 'telegram', labelFa: 'تلگرام', labelEn: 'Telegram', shortCode: 'TG',
    descriptionFa: 'اتصال و Runtime تلگرام با فروشگاه‌ساز مشترک چندپیام‌رسانی', kind: 'channel', status: 'live', phase: 1,
    customerRoute: '/app/telegram', apiPrefix: '/api/telegram', uiRuntime: 'react', commerceEnabled: true,
    capabilities: ['connection', 'webhook', 'unified-bot-commerce', 'catalog', 'cart', 'orders'],
  },
  {
    key: 'instagram', labelFa: 'اینستاگرام', labelEn: 'Instagram', shortCode: 'IG',
    descriptionFa: 'دایرکت هوشمند، کامنت، Webhook و Ruleهای اتوماسیون', kind: 'channel', status: 'partial', phase: 2,
    customerRoute: '/app/instagram', apiPrefix: '/api/instagram', uiRuntime: 'react', commerceEnabled: false,
    capabilities: ['oauth', 'webhook', 'comment-to-dm', 'dm-keyword', 'story-reply'],
  },
  {
    key: 'whatsapp', labelFa: 'واتساپ', labelEn: 'WhatsApp', shortCode: 'WA',
    descriptionFa: 'WhatsApp Business، Inbox، Template و پاسخ خودکار', kind: 'channel', status: 'partial', phase: 2,
    customerRoute: '/app/whatsapp', apiPrefix: '/api/whatsapp', uiRuntime: 'react', commerceEnabled: false,
    capabilities: ['connection', 'webhook', 'inbox', 'templates', 'keyword-rules'],
  },
  {
    key: 'bale', labelFa: 'بله', labelEn: 'Bale', shortCode: 'BA',
    descriptionFa: 'Adapter بله برای Webhook و Commerce Core / Bot Commerce مشترک', kind: 'channel', status: 'partial', phase: 2,
    customerRoute: '/app/bale', apiPrefix: '/api/bale', uiRuntime: 'react', commerceEnabled: true,
    capabilities: ['connection', 'webhook', 'unified-bot-commerce', 'catalog', 'cart', 'orders'],
  },
  {
    key: 'rubika', labelFa: 'روبیکا', labelEn: 'Rubika', shortCode: 'RU',
    descriptionFa: 'Adapter روبیکا برای Webhook و Commerce Core / Bot Commerce مشترک', kind: 'channel', status: 'partial', phase: 2,
    customerRoute: '/app/rubika', apiPrefix: '/api/rubika', uiRuntime: 'react', commerceEnabled: true,
    capabilities: ['connection', 'webhook', 'unified-bot-commerce', 'catalog', 'cart', 'orders'],
  },
  {
    key: 'discord', labelFa: 'دیسکورد', labelEn: 'Discord', shortCode: 'DC',
    descriptionFa: 'Bot install، Interactions و Slash Commands', kind: 'channel', status: 'partial', phase: 2,
    customerRoute: '/app/discord', apiPrefix: '/api/discord', uiRuntime: 'react', commerceEnabled: false,
    capabilities: ['connection', 'interactions', 'slash-commands', 'command-sync'],
  },
  {
    key: 'booking', labelFa: 'نوبت‌دهی', labelEn: 'Booking', shortCode: 'BK',
    descriptionFa: 'نوبت، پرسنل، CRM، مالی، گزارش، باشگاه مشتریان، سایت و مرکز پیام', kind: 'business-tool', status: 'partial', phase: 2,
    customerRoute: '/app/booking', apiPrefix: '/api/booking', uiRuntime: 'react', commerceEnabled: false,
    capabilities: ['appointments', 'staff', 'customers', 'finance', 'reports', 'feedback', 'automations', 'loyalty', 'business-site', 'inbox'],
  },
  {
    key: 'scheduler', labelFa: 'زمان‌بندی', labelEn: 'Scheduler', shortCode: 'SC',
    descriptionFa: 'صف مشترک انتشار و اجرای کارهای زمان‌بندی‌شده', kind: 'platform-tool', status: 'planned', phase: 3,
    customerRoute: null, apiPrefix: '/api/scheduler', uiRuntime: 'none', commerceEnabled: false,
    capabilities: ['scheduled-jobs', 'publishing-queue'],
  },
  {
    key: 'analytics', labelFa: 'آنالیز', labelEn: 'Analytics', shortCode: 'AN',
    descriptionFa: 'شاخص‌های یکپارچه کانال‌ها، Instagram، فروشگاه و Booking', kind: 'platform-tool', status: 'partial', phase: 3,
    customerRoute: '/app/analytics', apiPrefix: '/api/customer/dashboard', uiRuntime: 'react', commerceEnabled: false,
    capabilities: ['normalized-metrics', 'channel-health', 'instagram-kpis', 'operations-overview', 'cross-channel-reports'],
  },
  {
    key: 'twitter', labelFa: 'توییتر / X', labelEn: 'X / Twitter', shortCode: 'X',
    descriptionFa: 'ماژول بعدی شبکه اجتماعی بر اساس قرارداد مشترک پلتفرم', kind: 'channel', status: 'planned', phase: 3,
    customerRoute: null, apiPrefix: '/api/twitter', uiRuntime: 'none', commerceEnabled: false,
    capabilities: [],
  },
];

// راهنما: این دستور متغیر/ثابت «customerNavigationModules» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
export const customerNavigationModules = platformModules.filter(
  (module) => module.customerRoute !== null && module.status !== 'planned',
);

// راهنما: این تابع «getPlatformModule» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export function getPlatformModule(key: PlatformModuleKey) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «platformModules.find((module) => module.key === key) ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return platformModules.find((module) => module.key === key) ?? null;
}
