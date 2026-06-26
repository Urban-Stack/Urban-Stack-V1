import { fetchInstalled, fetchInstalledStaticAndDedicated } from './server';
import { CityTool, filterCityTools } from '@/app/_lib/citytools/internal';
import { CitytoolCategory } from '@/app/__generated__/types';
import { queryStaticApps } from '@/app/_lib/resource-api/graphql/staticapps';
import { queryDedicatedApps } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import {
  queryGetPublicSharedApps,
  queryGetSharedAppsByTenant,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { DedicatedApp } from '@/app/_lib/resource-api/dedicatedapps/internal';
import { StaticApp } from '@/app/_lib/resource-api/staticapps/internal';
import { toStaticApps } from '@/app/_lib/resource-api/staticapps';
import { toDedicatedApps } from '@/app/_lib/resource-api/dedicatedapps';
import {
  PublicSharedApp,
  SharedApp,
  toPublicSharedApps,
  toSharedApps,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/graphql/staticapps', () => ({
  queryStaticApps: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/graphql/dedicatedApps', () => ({
  queryDedicatedApps: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/graphql/sharedApps', () => ({
  queryGetPublicSharedApps: jest.fn(),
  queryGetSharedAppsByTenant: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/staticapps', () => ({
  ...jest.requireActual('@/app/_lib/resource-api/staticapps'),
  toStaticApps: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/dedicatedapps', () => ({
  ...jest.requireActual('@/app/_lib/resource-api/dedicatedapps'),
  toDedicatedApps: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/sharedapps/internal', () => ({
  ...jest.requireActual('@/app/_lib/resource-api/sharedapps/internal'),
  toPublicSharedApps: jest.fn(),
  toSharedApps: jest.fn(),
}));
jest.mock('@/app/_lib/citytools/internal', () => ({
  filterCityTools: jest.fn(),
}));

const requireTenantMock = requireTenant as unknown as jest.Mock;
const queryStaticAppsMock = queryStaticApps as unknown as jest.Mock;
const queryDedicatedAppsMock = queryDedicatedApps as unknown as jest.Mock;
const queryGetPublicSharedAppsMock =
  queryGetPublicSharedApps as unknown as jest.Mock;
const queryGetSharedAppsByTenantMock =
  queryGetSharedAppsByTenant as unknown as jest.Mock;
const toStaticAppsMock = toStaticApps as unknown as jest.Mock;
const toDedicatedAppsMock = toDedicatedApps as unknown as jest.Mock;
const toPublicSharedAppsMock = toPublicSharedApps as unknown as jest.Mock;
const toSharedAppsMock = toSharedApps as unknown as jest.Mock;
const filterCityToolsMock = filterCityTools as unknown as jest.Mock;

const CATEGORIES: CitytoolCategory[] = [];

const mkStaticApp = (overrides?: Partial<StaticApp>) =>
  ({
    name: 'static',
    requestCityToolLink: '/new-topic?category=static',
    meta: {
      displayName: 'Static',
      description: 'Static description',
      categories: CATEGORIES,
      showInCitizenHub: true,
      showInGovHub: true,
    },
    overallInstalls: {},
    isInstalled: true,
    finalPath: 'static',
    _tag: 'StaticApp',
    ...overrides,
  }) satisfies StaticApp;

const mkDedicatedApp = (overrides?: Partial<DedicatedApp>) =>
  ({
    name: 'dedicated',
    requestCityToolLink: '/new-topic?category=dedicated',
    meta: {
      displayName: 'Dedicated',
      description: 'Dedicated description',
      categories: CATEGORIES,
    },
    url: 'https://dedicated.example.com',
    isInstalled: true,
    _tag: 'DedicatedApp',
    ...overrides,
  }) satisfies DedicatedApp;

const mkSharedApp = (overrides?: Partial<SharedApp>) =>
  ({
    name: 'shared-1',
    displayName: 'Shared 1',
    description: 'Shared description',
    categories: CATEGORIES,
    adminContact: 'admin@shared.test',
    url: 'https://shared.example.com',
    status: 'running',
    ready: true,
    _tag: 'SharedApp',
    ...overrides,
  }) satisfies SharedApp;

const mkPublicSharedApp = (overrides?: Partial<PublicSharedApp>) =>
  ({
    name: 'public-1',
    displayName: 'Public 1',
    description: 'Public description',
    categories: CATEGORIES,
    adminContact: 'admin@public.test',
    tenant: 'tenant-1',
    url: 'https://public.example.com',
    _tag: 'PublicSharedApp',
    ...overrides,
  }) satisfies PublicSharedApp;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('fetchInstalledStaticAndDedicated', () => {
  it('returns an empty array if no tools are returned', async () => {
    const staticApps = { staticApps: true };
    const dedicatedApps = { dedicatedApps: true };
    const staticResult = { static: 'data' };
    const dedicatedResult = { dedicated: 'data' };

    requireTenantMock.mockResolvedValue('tenant-1');
    queryStaticAppsMock.mockResolvedValue(staticResult);
    toStaticAppsMock.mockReturnValue(staticApps);
    queryDedicatedAppsMock.mockResolvedValue(dedicatedResult);
    const toDedicatedAppsMapper = jest.fn().mockReturnValue(dedicatedApps);
    toDedicatedAppsMock.mockReturnValue(toDedicatedAppsMapper);
    filterCityToolsMock.mockReturnValue([]);

    const result = await fetchInstalledStaticAndDedicated();

    expect(result).toEqual([]);
    expect(requireTenantMock).toHaveBeenCalled();
    expect(queryStaticAppsMock).toHaveBeenCalled();
    expect(toStaticAppsMock).toHaveBeenCalledWith(staticResult);
    expect(queryDedicatedAppsMock).toHaveBeenCalled();
    expect(toDedicatedAppsMock).toHaveBeenCalledWith('tenant-1');
    expect(toDedicatedAppsMapper).toHaveBeenCalledWith(dedicatedResult);
    expect(filterCityToolsMock).toHaveBeenCalledWith(
      staticApps,
      [],
      [],
      dedicatedApps,
      { installed: 'installed' },
    );
  });

  it('filters to static and dedicated apps only', async () => {
    const staticApps = { staticApps: true };
    const dedicatedApps = { dedicatedApps: true };
    const staticResult = { static: 'data' };
    const dedicatedResult = { dedicated: 'data' };
    const staticApp = mkStaticApp({ name: 'static' });
    const dedicatedApp = mkDedicatedApp({ name: 'dedicated' });
    const sharedApp = mkSharedApp({ name: 'shared' });

    requireTenantMock.mockResolvedValue('tenant-1');
    queryStaticAppsMock.mockResolvedValue(staticResult);
    toStaticAppsMock.mockReturnValue(staticApps);
    queryDedicatedAppsMock.mockResolvedValue(dedicatedResult);
    const toDedicatedAppsMapper = jest.fn().mockReturnValue(dedicatedApps);
    toDedicatedAppsMock.mockReturnValue(toDedicatedAppsMapper);
    filterCityToolsMock.mockReturnValue([sharedApp, dedicatedApp, staticApp]);

    const result = await fetchInstalledStaticAndDedicated();

    expect(result).toEqual([dedicatedApp, staticApp]);
  });
});

describe('fetchInstalled', () => {
  it('combines installed static/dedicated with shared and filtered public shared apps', async () => {
    const staticApps = { staticApps: true };
    const dedicatedApps = { dedicatedApps: true };
    const staticResult = { static: 'data' };
    const dedicatedResult = { dedicated: 'data' };
    const installedApps = [
      mkStaticApp({ name: 'static' }),
      mkDedicatedApp({ name: 'dedicated' }),
    ] satisfies CityTool[];
    const sharedApps = [
      mkSharedApp({ name: 'shared-1' }),
      mkSharedApp({ name: 'shared-2' }),
    ] satisfies SharedApp[];
    const publicSharedApps = [
      mkPublicSharedApp({ name: 'public-1' }),
      mkPublicSharedApp({ name: 'shared-2' }),
    ] satisfies PublicSharedApp[];

    requireTenantMock.mockResolvedValue('tenant-1');
    queryStaticAppsMock.mockResolvedValue(staticResult);
    toStaticAppsMock.mockReturnValue(staticApps);
    queryDedicatedAppsMock.mockResolvedValue(dedicatedResult);
    const toDedicatedAppsMapper = jest.fn().mockReturnValue(dedicatedApps);
    toDedicatedAppsMock.mockReturnValue(toDedicatedAppsMapper);
    filterCityToolsMock.mockReturnValue([
      installedApps[0],
      installedApps[1],
      mkSharedApp({ name: 'shared' }),
    ]);
    const sharedResult = { shared: 'result' };
    const publicResult = { public: 'result' };
    queryGetSharedAppsByTenantMock.mockResolvedValue(sharedResult);
    toSharedAppsMock.mockReturnValue(sharedApps);
    queryGetPublicSharedAppsMock.mockResolvedValue(publicResult);
    toPublicSharedAppsMock.mockReturnValue(publicSharedApps);

    const result = await fetchInstalled('tenant-1');

    expect(requireTenantMock).toHaveBeenCalled();
    expect(queryStaticAppsMock).toHaveBeenCalled();
    expect(toStaticAppsMock).toHaveBeenCalledWith(staticResult);
    expect(queryDedicatedAppsMock).toHaveBeenCalled();
    expect(toDedicatedAppsMock).toHaveBeenCalledWith('tenant-1');
    expect(toDedicatedAppsMapper).toHaveBeenCalledWith(dedicatedResult);
    expect(filterCityToolsMock).toHaveBeenCalledWith(
      staticApps,
      [],
      [],
      dedicatedApps,
      { installed: 'installed' },
    );
    expect(queryGetSharedAppsByTenantMock).toHaveBeenCalledWith('tenant-1');
    expect(toSharedAppsMock).toHaveBeenCalledWith(sharedResult);
    expect(queryGetPublicSharedAppsMock).toHaveBeenCalled();
    expect(toPublicSharedAppsMock).toHaveBeenCalledWith(publicResult);
    expect(result).toEqual([
      ...installedApps,
      ...sharedApps,
      mkPublicSharedApp({ name: 'public-1' }),
    ]);
  });
});
