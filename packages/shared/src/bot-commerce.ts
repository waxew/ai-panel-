export const botCommerceProviders = ['telegram', 'bale', 'rubika'] as const;
export type BotCommerceProvider = (typeof botCommerceProviders)[number];

export const botCommerceActionTypes = [
  'CATALOG',
  'SEARCH',
  'CART',
  'ORDERS',
  'TRACK_ORDER',
  'ACCOUNT',
  'WALLET',
  'MY_SERVICES',
  'PRICING',
  'REFERRAL',
  'TUTORIAL',
  'SUPPORT',
  'TEXT',
  'URL',
  'SUBMENU',
] as const;

export type BotCommerceActionType = (typeof botCommerceActionTypes)[number];
export type BotCommerceRuntimeStatus = 'live' | 'foundation';
export type BotCommerceValueKind = 'none' | 'text' | 'url';

export type BotCommerceActionDefinition = {
  key: BotCommerceActionType;
  labelFa: string;
  descriptionFa: string;
  runtime: BotCommerceRuntimeStatus;
  valueKind: BotCommerceValueKind;
};

export const botCommerceActionDefinitions: readonly BotCommerceActionDefinition[] = [
  { key: 'CATALOG', labelFa: 'محصولات / فروشگاه', descriptionFa: 'نمایش دسته‌بندی‌ها و محصولات فعال Commerce Core', runtime: 'live', valueKind: 'none' },
  { key: 'SEARCH', labelFa: 'جستجوی محصول', descriptionFa: 'جستجو در کاتالوگ فروشگاه', runtime: 'foundation', valueKind: 'none' },
  { key: 'CART', labelFa: 'سبد خرید', descriptionFa: 'سبد خرید همان کاربر در کانال جاری', runtime: 'live', valueKind: 'none' },
  { key: 'ORDERS', labelFa: 'سفارش‌های من', descriptionFa: 'فهرست سفارش‌های همان مشتری', runtime: 'live', valueKind: 'none' },
  { key: 'TRACK_ORDER', labelFa: 'پیگیری سفارش', descriptionFa: 'پیگیری وضعیت سفارش با شناسه', runtime: 'foundation', valueKind: 'none' },
  { key: 'ACCOUNT', labelFa: 'حساب کاربری', descriptionFa: 'نمایه مشتری فروشگاه و خلاصه فعالیت', runtime: 'foundation', valueKind: 'none' },
  { key: 'WALLET', labelFa: 'کیف پول', descriptionFa: 'کیف پول مشتری فروشگاه؛ مستقل از کیف پول مالک AI Panel', runtime: 'foundation', valueKind: 'none' },
  { key: 'MY_SERVICES', labelFa: 'سرویس‌های من', descriptionFa: 'محصولات/سرویس‌های خریداری‌شده مشتری', runtime: 'foundation', valueKind: 'none' },
  { key: 'PRICING', labelFa: 'تعرفه‌ها', descriptionFa: 'نمایش پلن‌ها و قیمت‌های فروشگاه', runtime: 'foundation', valueKind: 'none' },
  { key: 'REFERRAL', labelFa: 'زیرمجموعه‌گیری', descriptionFa: 'کد و لینک معرفی مشتری فروشگاه', runtime: 'foundation', valueKind: 'none' },
  { key: 'TUTORIAL', labelFa: 'آموزش', descriptionFa: 'متن راهنما یا سناریوی آموزشی', runtime: 'foundation', valueKind: 'text' },
  { key: 'SUPPORT', labelFa: 'پشتیبانی', descriptionFa: 'راه ارتباطی یا متن پشتیبانی', runtime: 'live', valueKind: 'text' },
  { key: 'TEXT', labelFa: 'پیام متنی', descriptionFa: 'نمایش متن سفارشی', runtime: 'live', valueKind: 'text' },
  { key: 'URL', labelFa: 'لینک', descriptionFa: 'باز کردن آدرس HTTP/HTTPS', runtime: 'live', valueKind: 'url' },
  { key: 'SUBMENU', labelFa: 'زیرمنو', descriptionFa: 'ساخت ساختار منوی چندسطحی؛ شناسه مسیر Runtime هنگام Publish توسط Adapter ساخته می‌شود', runtime: 'live', valueKind: 'none' },
] as const;

export type BotCommerceMenuNode = {
  id: string;
  parentId: string | null;
  title: string;
  actionType: BotCommerceActionType;
  actionValue: string | null;
  sortOrder: number;
  enabled: boolean;
};

export type BotCommerceTarget = {
  provider: BotCommerceProvider;
  botId: string;
  enabled: boolean;
};

export type BotCommerceTemplate = {
  schemaVersion: 1;
  presetKey: BotCommercePresetKey;
  name: string;
  welcomeMessage: string;
  menu: BotCommerceMenuNode[];
  targets: BotCommerceTarget[];
  settings: {
    columns: 1 | 2;
    showPrices: boolean;
    showInventory: boolean;
  };
};

export type BotCommercePresetKey = 'commerce' | 'services' | 'digital';

export type BotCommercePreset = {
  key: BotCommercePresetKey;
  labelFa: string;
  descriptionFa: string;
  template: BotCommerceTemplate;
};

const node = (
  id: string,
  title: string,
  actionType: BotCommerceActionType,
  sortOrder: number,
  enabled = true,
  actionValue: string | null = null,
  parentId: string | null = null,
): BotCommerceMenuNode => ({ id, parentId, title, actionType, actionValue, sortOrder, enabled });

export const botCommercePresets: readonly BotCommercePreset[] = [
  {
    key: 'commerce',
    labelFa: 'فروشگاه کامل',
    descriptionFa: 'الگوی مرجع فروشگاه پیام‌رسان بر پایه جریان Babba و Commerce Core مشترک AI Panel.',
    template: {
      schemaVersion: 1,
      presetKey: 'commerce',
      name: 'فروشگاه پیام‌رسان',
      welcomeMessage: 'سلام! به فروشگاه خوش آمدید. از منوی زیر یکی از گزینه‌ها را انتخاب کنید.',
      menu: [
        node('products', '🛍 محصولات', 'CATALOG', 10),
        node('search', '🔎 جستجوی محصول', 'SEARCH', 20, false),
        node('cart', '🛒 سبد خرید', 'CART', 30),
        node('orders', '📦 سفارش‌های من', 'ORDERS', 40),
        node('tracking', '🚚 پیگیری سفارش', 'TRACK_ORDER', 50, false),
        node('account', '👤 حساب کاربری', 'ACCOUNT', 60, false),
        node('wallet', '💳 کیف پول', 'WALLET', 70, false),
        node('support', '☎️ پشتیبانی', 'SUPPORT', 80, true, 'اطلاعات پشتیبانی هنوز تنظیم نشده است.'),
      ],
      targets: [],
      settings: { columns: 2, showPrices: true, showInventory: true },
    },
  },
  {
    key: 'services',
    labelFa: 'فروش خدمات و اشتراک',
    descriptionFa: 'مناسب سرویس، تمدید، اشتراک و کسب‌وکارهای خدماتی.',
    template: {
      schemaVersion: 1,
      presetKey: 'services',
      name: 'ربات خدمات',
      welcomeMessage: 'سلام! برای خرید یا مدیریت سرویس خود یکی از گزینه‌های زیر را انتخاب کنید.',
      menu: [
        node('services', '🛍 خرید سرویس', 'CATALOG', 10),
        node('my-services', '📦 سرویس‌های من', 'MY_SERVICES', 20, false),
        node('pricing', '💰 تعرفه‌ها', 'PRICING', 30, false),
        node('orders', '🧾 سفارش‌های من', 'ORDERS', 40),
        node('referral', '👥 زیرمجموعه‌گیری', 'REFERRAL', 50, false),
        node('support', '☎️ پشتیبانی', 'SUPPORT', 60, true, 'اطلاعات پشتیبانی هنوز تنظیم نشده است.'),
      ],
      targets: [],
      settings: { columns: 2, showPrices: true, showInventory: false },
    },
  },
  {
    key: 'digital',
    labelFa: 'محصول دیجیتال',
    descriptionFa: 'برای فایل، کد، لایسنس و تحویل خودکار پس از پرداخت.',
    template: {
      schemaVersion: 1,
      presetKey: 'digital',
      name: 'فروشگاه دیجیتال',
      welcomeMessage: 'سلام! محصولات دیجیتال را انتخاب کنید؛ وضعیت سفارش از همین ربات قابل پیگیری است.',
      menu: [
        node('products', '🎁 محصولات دیجیتال', 'CATALOG', 10),
        node('cart', '🛒 سبد خرید', 'CART', 20),
        node('orders', '📦 سفارش‌ها و تحویل‌ها', 'ORDERS', 30),
        node('tutorial', '📚 راهنما', 'TUTORIAL', 40, false, 'راهنمای خرید هنوز تنظیم نشده است.'),
        node('support', '☎️ پشتیبانی', 'SUPPORT', 50, true, 'اطلاعات پشتیبانی هنوز تنظیم نشده است.'),
      ],
      targets: [],
      settings: { columns: 2, showPrices: true, showInventory: true },
    },
  },
] as const;

export const defaultBotCommerceTemplate: BotCommerceTemplate = JSON.parse(JSON.stringify(botCommercePresets[0].template));

export function getBotCommerceAction(actionType: BotCommerceActionType) {
  return botCommerceActionDefinitions.find((action) => action.key === actionType) ?? null;
}

export function getBotCommercePreset(key: BotCommercePresetKey) {
  return botCommercePresets.find((preset) => preset.key === key) ?? null;
}
