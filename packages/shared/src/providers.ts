import { platformModules, type PlatformModuleDefinition, type PlatformModuleKey, type PlatformModuleStatus } from './modules';

export type ProviderControlOperation = 'connect' | 'manage';

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

export type PlatformModuleManifestEntry = Pick<
  PlatformModuleDefinition,
  'key' | 'labelFa' | 'labelEn' | 'shortCode' | 'kind' | 'status' | 'phase' | 'customerRoute' | 'apiPrefix' | 'uiRuntime' | 'commerceEnabled'
> & {
  capabilities: readonly string[];
};

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

export function getProviderContract(key: PlatformModuleKey) {
  return providerModuleContracts.find((provider) => provider.key === key) ?? null;
}

export function getProviderApiRoute(key: PlatformModuleKey, operation: ProviderControlOperation) {
  const provider = getProviderContract(key);
  if (!provider) return null;
  return operation === 'connect' ? provider.connectRoute : provider.manageRoute;
}

export function moduleStatusLabelFa(status: PlatformModuleStatus) {
  if (status === 'live') return 'فعال';
  if (status === 'partial') return 'در حال توسعه';
  return 'برنامه‌ریزی‌شده';
}

export function isModuleRouteActive(pathname: string, customerRoute: string | null) {
  if (!customerRoute) return false;
  return pathname === customerRoute || pathname.startsWith(`${customerRoute}/`);
}
