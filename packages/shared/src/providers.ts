/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { platformModules, type PlatformModuleDefinition, type PlatformModule… را از ماژول «./modules» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { platformModules, type PlatformModuleDefinition, type PlatformModuleKey, type PlatformModuleStatus } from './modules';

// راهنما: این Type با نام «ProviderControlOperation» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type ProviderControlOperation = 'connect' | 'manage';

// راهنما: این Type با نام «ProviderModuleContract» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type ProviderModuleContract = {
  key: PlatformModuleKey;
  status: PlatformModuleStatus;
  phase: number;
  customerRoute: string;
  apiPrefix: string;
  connectRoute: string;
  manageRoute: string;
  capabilities: readonly string[];
  commerceEnabled: boolean;
};

// راهنما: این Type با نام «PlatformModuleManifestEntry» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
export type PlatformModuleManifestEntry = Pick<
  PlatformModuleDefinition,
  'key' | 'labelFa' | 'labelEn' | 'shortCode' | 'kind' | 'status' | 'phase' | 'customerRoute' | 'apiPrefix' | 'uiRuntime' | 'commerceEnabled'
> & {
  capabilities: readonly string[];
};

// راهنما: این دستور متغیر/ثابت «platformModuleManifest» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
export const platformModuleManifest: readonly PlatformModuleManifestEntry[] = platformModules.map((module) => ({
  key: module.key,
  labelFa: module.labelFa,
  labelEn: module.labelEn,
  shortCode: module.shortCode,
  kind: module.kind,
  status: module.status,
  phase: module.phase,
  customerRoute: module.customerRoute,
  apiPrefix: module.apiPrefix,
  uiRuntime: module.uiRuntime,
  commerceEnabled: module.commerceEnabled,
  capabilities: module.capabilities,
}));

// راهنما: این دستور متغیر/ثابت «providerModuleContracts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
export const providerModuleContracts: readonly ProviderModuleContract[] = platformModules
  .filter((module) => module.kind === 'channel' && module.customerRoute !== null && module.apiPrefix !== null && module.status !== 'planned')
  .map((module) => ({
    key: module.key,
    status: module.status,
    phase: module.phase,
    customerRoute: module.customerRoute as string,
    apiPrefix: module.apiPrefix as string,
    connectRoute: `${module.apiPrefix}/connect`,
    manageRoute: `${module.apiPrefix}/manage`,
    capabilities: module.capabilities,
    commerceEnabled: module.commerceEnabled,
  }));

// راهنما: این تابع «getProviderContract» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export function getProviderContract(key: PlatformModuleKey) {
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «providerModuleContracts.find((provider) => provider.key === key) ?? null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return providerModuleContracts.find((provider) => provider.key === key) ?? null;
}

// راهنما: این تابع «getProviderApiRoute» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export function getProviderApiRoute(key: PlatformModuleKey, operation: ProviderControlOperation) {
  // راهنما: این دستور متغیر/ثابت «provider» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const provider = getProviderContract(key);
  // راهنما: این شرط بررسی می‌کند آیا «!provider» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!provider) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «null» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return null;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «operation === 'connect' ? provider.connectRoute : provider.manageRoute» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return operation === 'connect' ? provider.connectRoute : provider.manageRoute;
}

// راهنما: این تابع «moduleStatusLabelFa» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export function moduleStatusLabelFa(status: PlatformModuleStatus) {
  // راهنما: این شرط بررسی می‌کند آیا «status === 'live'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (status === 'live') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'فعال'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'فعال';
  // راهنما: این شرط بررسی می‌کند آیا «status === 'partial'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (status === 'partial') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'در حال توسعه'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'در حال توسعه';
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'برنامه‌ریزی‌شده'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return 'برنامه‌ریزی‌شده';
}

// راهنما: این تابع «isModuleRouteActive» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export function isModuleRouteActive(pathname: string, customerRoute: string | null) {
  // راهنما: این شرط بررسی می‌کند آیا «!customerRoute» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if (!customerRoute) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «pathname === customerRoute || pathname.startsWith(`${customerRoute}/`)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return pathname === customerRoute || pathname.startsWith(`${customerRoute}/`);
}
