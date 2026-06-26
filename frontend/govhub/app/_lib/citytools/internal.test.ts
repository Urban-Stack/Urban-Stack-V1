import {
  cmpDisplayName,
  filterCityTools,
  getDescription,
  getDisplayName,
  getHref,
  toCitytoolLink,
} from './internal';
import {
  mkStaticApp,
  StaticApp,
  StaticAppInfo,
  StaticAppInstall,
  StaticApps,
} from '@/app/_lib/resource-api/staticapps';
import {
  DedicatedApp,
  DedicatedAppInfo,
  DedicatedAppInstall,
  DedicatedApps,
} from '@/app/_lib/resource-api/dedicatedapps';
import {
  PublicSharedApp,
  SharedApp,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

const TENANT = 'guetersloh';
const ALL_CATEGORIES = CITYTOOL_CATEGORY_ORDER;
const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(2, 4);

describe('filterCityTools', () => {
  const infos: Record<string, StaticAppInfo> = {
    'tool-a': {
      name: 'tool-a',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Tool A',
        description: 'Some description',
        categories: ALL_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: { averageStars: 4.5, count: 10 },
      _tag: 'StaticAppInfo',
    },
    'tool-b': {
      name: 'tool-b',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Tool B',
        description: 'Another one',
        categories: [ALL_CATEGORIES[0]],
        showInCitizenHub: false,
        showInGovHub: true,
      },
      overallInstalls: { averageStars: 3.7, count: 5 },
      _tag: 'StaticAppInfo',
    },
    hamster: {
      name: 'hamster',
      requestCityToolLink: '/new-topic?category=hamster',
      meta: {
        displayName: 'Hamster City',
        description: 'Pet your Hamster.',
        categories: SOME_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: false,
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    },
    'citizen-data': {
      name: 'citizen-data',
      requestCityToolLink: '/new-topic?category=citizen',
      meta: {
        displayName: 'Citizen Dashboard',
        description: 'Shows citizen stats',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: false,
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    },
  };

  const installs: Record<string, StaticAppInstall> = {
    'tool-a': {
      name: 'tool-a',
      path: '/tools/a',
      _tag: 'StaticAppInstall',
    },
    'citizen-data': {
      name: 'citizen-data',
      path: '/citizen/data',
      _tag: 'StaticAppInstall',
    },
  };

  const staticApps: StaticApps = {
    all: new Map(Object.entries(infos)),
    installed: new Map(Object.entries(installs)),
    tenant: TENANT,
    _tag: 'StaticApps',
  };

  const sharedApps: SharedApp[] = [
    {
      name: 'shared-app-1',
      displayName: 'Shared App 1',
      description: 'First shared app',
      categories: SOME_CATEGORIES,
      adminContact: 'admin1@test.com',
      url: 'https://shared1.example.com',
      status: 'running',
      ready: true,
      _tag: 'SharedApp',
    },
    {
      name: 'shared-app-2',
      displayName: 'Analytics Tool',
      description: 'Data analytics dashboard',
      categories: [],
      adminContact: 'admin2@test.com',
      url: 'https://shared2.example.com',
      status: 'waiting',
      ready: false,
      _tag: 'SharedApp',
    },
  ];

  const publicSharedApps: PublicSharedApp[] = [
    {
      name: 'public-app-1',
      displayName: 'Public App 1',
      description: 'First public app',
      categories: ALL_CATEGORIES,
      adminContact: 'public1@test.com',
      tenant: 'other-tenant',
      tenantDisplayName: 'Other Tenant',
      url: 'https://public1.example.com',
      _tag: 'PublicSharedApp',
    },
    {
      name: 'shared-app-1',
      displayName: 'Duplicate Shared App',
      description: 'This should be filtered out',
      categories: [],
      adminContact: 'duplicate@test.com',
      tenant: 'another-tenant',
      url: 'https://duplicate.example.com',
      _tag: 'PublicSharedApp',
    },
  ];

  const dedicatedInfos: Record<string, DedicatedAppInfo> = {
    'dedicated-a': {
      name: 'dedicated-a',
      requestCityToolLink: '/new-topic?category=ded-a',
      meta: {
        displayName: 'Dedicated A',
        description: 'Dedicated description',
        categories: [ALL_CATEGORIES[0]],
      },
      _tag: 'DedicatedAppInfo',
    },
    'dedicated-b': {
      name: 'dedicated-b',
      requestCityToolLink: '/new-topic?category=ded-b',
      meta: {
        displayName: 'Dedicated B',
        description: 'Second dedicated',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    },
  };

  const dedicatedInstalls: Record<string, DedicatedAppInstall> = {
    'dedicated-a': {
      name: 'dedicated-a',
      url: 'https://dedicated-a.example.com',
      _tag: 'DedicatedAppInstall',
    },
  };

  const dedicatedApps: DedicatedApps = {
    all: new Map(Object.entries(dedicatedInfos)),
    installed: new Map(Object.entries(dedicatedInstalls)),
    tenant: TENANT,
    _tag: 'DedicatedApps',
  };

  it('returns all tools if no filters applied', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {},
    );
    expect(result).toHaveLength(9);
    expect(result).toContainEqual(
      mkStaticApp(infos['tool-a'], true, TENANT, '/tools/a'),
    );
    expect(result).toContainEqual(
      mkStaticApp(infos['tool-b'], false, TENANT, undefined),
    );
    expect(result).toContainEqual(
      mkStaticApp(infos['hamster'], false, TENANT, undefined),
    );
    expect(result).toContainEqual(
      mkStaticApp(infos['citizen-data'], true, TENANT, '/citizen/data'),
    );
    expect(result).toContainEqual({
      ...dedicatedInfos['dedicated-a'],
      url: 'https://dedicated-a.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    });
    expect(result).toContainEqual({
      ...dedicatedInfos['dedicated-b'],
      url: undefined,
      isInstalled: false,
      _tag: 'DedicatedApp',
    });
    expect(result).toContainEqual(sharedApps[0]);
    expect(result).toContainEqual(sharedApps[1]);
    expect(result).toContainEqual(publicSharedApps[0]);
  });

  it('filters duplicate public shared apps', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {},
    );
    const sharedAppOneOccurrences = result.filter(
      (app) => app.name === 'shared-app-1',
    );
    expect(sharedAppOneOccurrences).toHaveLength(1);
    expect(sharedAppOneOccurrences[0]._tag).toBe('SharedApp');
  });

  it('filters by search text matching CityTool name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'tool-a',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      mkStaticApp(infos['tool-a'], true, TENANT, '/tools/a'),
    );
  });

  it('filters by search text matching CityTool display name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'citizen dashboard',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      mkStaticApp(infos['citizen-data'], true, TENANT, '/citizen/data'),
    );
  });

  it('filters by search text matching CityTool description', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'pet your hamster',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mkStaticApp(infos['hamster'], false, TENANT));
  });

  it('filters by search text matching SharedApp name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'shared-app-1',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sharedApps[0]);
  });

  it('filters by search text matching SharedApp display name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'analytics',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sharedApps[1]);
  });

  it('filters by search text matching SharedApp description', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'data analytics',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sharedApps[1]);
  });

  it('filters by search text matching PublicSharedApp name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'public-app-1',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(publicSharedApps[0]);
  });

  it('filters by search text matching PublicSharedApp display name', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'public app 1',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(publicSharedApps[0]);
  });

  it('filters by search text matching PublicSharedApp description', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'first public',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(publicSharedApps[0]);
  });

  it('filters by search text matching DedicatedApp description', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'dedicated description',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...dedicatedInfos['dedicated-a'],
      url: 'https://dedicated-a.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    });
  });

  it('returns empty array if no match', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'no-results',
      },
    );
    expect(result).toEqual([]);
  });

  it('is case-insensitive', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'TOOL A',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      mkStaticApp(infos['tool-a'], true, TENANT, '/tools/a'),
    );
  });

  it('filters only installed tools and shared apps', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'installed',
      },
    );
    expect(result).toHaveLength(5);
    expect(result).toContainEqual(
      mkStaticApp(infos['tool-a'], true, TENANT, '/tools/a'),
    );
    expect(result).toContainEqual(
      mkStaticApp(infos['citizen-data'], true, TENANT, '/citizen/data'),
    );
    expect(result).toContainEqual({
      ...dedicatedInfos['dedicated-a'],
      url: 'https://dedicated-a.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    });
    expect(result).toContainEqual(sharedApps[0]);
    expect(result).toContainEqual(sharedApps[1]);
  });

  it('filters installed tools by search text', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'installed',
        searchText: 'tool-a',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      mkStaticApp(infos['tool-a'], true, TENANT, '/tools/a'),
    );
  });

  it('filters installed shared apps by search text', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'installed',
        searchText: 'analytics',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sharedApps[1]);
  });

  it('returns empty array when installed filter applies but no match for search', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'installed',
        searchText: 'no-results',
      },
    );
    expect(result).toEqual([]);
  });

  it('filters only not-installed tools', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'not-installed',
      },
    );
    expect(result).toHaveLength(3);
    expect(result).toContainEqual(
      mkStaticApp(infos['tool-b'], false, undefined),
    );
    expect(result).toContainEqual(
      mkStaticApp(infos['hamster'], false, undefined),
    );
    expect(result).toContainEqual({
      ...dedicatedInfos['dedicated-b'],
      url: undefined,
      isInstalled: false,
      _tag: 'DedicatedApp',
    });
  });

  it('filters not-installed tools by search text', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'not-installed',
        searchText: 'hamster',
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mkStaticApp(infos['hamster'], false, undefined));
  });

  it('returns empty array when not-installed filter applies but no match for search', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        installed: 'not-installed',
        searchText: 'tool-a',
      },
    );
    expect(result).toEqual([]);
  });

  it('filters by category of some categories', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        categories: [SOME_CATEGORIES[0]],
      },
    );
    const expectedNames = [
      'tool-a',
      'hamster',
      'shared-app-1',
      'public-app-1',
      'dedicated-b',
    ];
    const matchedNames = result.map((value) => value.name);
    expect(matchedNames).toHaveLength(expectedNames.length);
    expect(matchedNames).toEqual(expect.arrayContaining(expectedNames));
  });

  it('filters by category of all categories', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        categories: [ALL_CATEGORIES[1]],
      },
    );
    const expectedNames = ['tool-a', 'public-app-1'];
    const matchedNames = result.map((value) => value.name);
    expect(matchedNames).toHaveLength(expectedNames.length);
    expect(matchedNames).toEqual(expect.arrayContaining(expectedNames));
  });

  it('filters by multiple categories', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        categories: ALL_CATEGORIES.slice(0, 1),
      },
    );
    const expectedNames = ['tool-a', 'tool-b', 'public-app-1', 'dedicated-a'];
    const matchedNames = result.map((value) => value.name);
    expect(matchedNames).toHaveLength(expectedNames.length);
    expect(matchedNames).toEqual(expect.arrayContaining(expectedNames));
  });

  it('filters by multiple categories and search text', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'Tool',
        categories: ALL_CATEGORIES.slice(0, 1),
      },
    );
    const expectedNames = ['tool-a', 'tool-b'];
    const matchedNames = result.map((value) => value.name);
    expect(matchedNames).toHaveLength(expectedNames.length);
    expect(matchedNames).toEqual(expect.arrayContaining(expectedNames));
  });

  it('filters installed tools by multiple categories and search text', () => {
    const result = filterCityTools(
      staticApps,
      sharedApps,
      publicSharedApps,
      dedicatedApps,
      {
        searchText: 'Tool',
        installed: 'installed',
        categories: ALL_CATEGORIES.slice(0, 1),
      },
    );
    const expectedNames = ['tool-a'];
    const matchedNames = result.map((value) => value.name);
    expect(matchedNames).toHaveLength(expectedNames.length);
    expect(matchedNames).toEqual(expect.arrayContaining(expectedNames));
  });

  it('filters public shared apps by tenant when myCity is true', () => {
    const myCityPublicSharedApp: PublicSharedApp = {
      name: 'public-app-2',
      displayName: 'Public App 2',
      description: 'Second public app',
      adminContact: 'public2@test.com',
      tenant: TENANT,
      tenantDisplayName: 'Guetersloh',
      url: 'https://public2.example.com',
      categories: [],
      _tag: 'PublicSharedApp',
    };

    const result = filterCityTools(
      staticApps,
      sharedApps,
      [publicSharedApps[0], myCityPublicSharedApp],
      dedicatedApps,
      {
        myCity: true,
        tenant: TENANT,
      },
    );

    expect(result).toContainEqual(myCityPublicSharedApp);
    expect(result).not.toContainEqual(publicSharedApps[0]);
  });
});

describe('cmpDisplayName', () => {
  it('returns 0 for equal display names', () => {
    const a: StaticApp = {
      name: 'a',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Same',
        description: '',
        categories: SOME_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    const b: StaticApp = {
      name: 'b',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Same',
        description: '',
        categories: ALL_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    expect(cmpDisplayName(a, b)).toBe(0);
  });

  it('returns <0 if a < b', () => {
    const a: StaticApp = {
      name: 'a',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Alpha',
        description: '',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    const b: StaticApp = {
      name: 'b',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Beta',
        description: '',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    expect(cmpDisplayName(a, b)).toBeLessThan(0);
  });

  it('returns >0 if a > b', () => {
    const a: StaticApp = {
      name: 'a',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Zulu',
        description: '',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    const b: StaticApp = {
      name: 'b',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Beta',
        description: '',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    expect(cmpDisplayName(a, b)).toBeGreaterThan(0);
  });

  it('compares SharedApp and PublicSharedApp display names', () => {
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Shared',
      description: '',
      categories: [],
      adminContact: '',
      url: '',
      status: 'running',
      ready: true,
      _tag: 'SharedApp',
    };
    const publicSharedApp: PublicSharedApp = {
      name: 'public',
      displayName: 'Public',
      description: '',
      categories: [],
      adminContact: '',
      tenant: '',
      url: '',
      _tag: 'PublicSharedApp',
    };
    expect(cmpDisplayName(sharedApp, publicSharedApp)).toBeGreaterThan(0);
    expect(cmpDisplayName(publicSharedApp, sharedApp)).toBeLessThan(0);
  });

  it('compares CityTool with SharedApp', () => {
    const staticApp: StaticApp = {
      name: 'ct',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Alpha',
        description: '',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Beta',
      description: '',
      categories: [],
      adminContact: '',
      url: '',
      status: 'running',
      ready: true,
      _tag: 'SharedApp',
    };
    expect(cmpDisplayName(staticApp, sharedApp)).toBeLessThan(0);
    expect(cmpDisplayName(sharedApp, staticApp)).toBeGreaterThan(0);
  });
});

describe('getDisplayName', () => {
  it('returns displayName for static app', () => {
    const staticApp: StaticApp = {
      name: 'static',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Static App',
        description: 'Static description',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };

    expect(getDisplayName(staticApp)).toBe('Static App');
  });

  it('returns displayName for dedicated app', () => {
    const dedicatedApp: DedicatedApp = {
      name: 'dedicated',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Dedicated App',
        description: 'Dedicated description',
        categories: [],
      },
      url: 'https://dedicated.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    };

    expect(getDisplayName(dedicatedApp)).toBe('Dedicated App');
  });

  it('returns displayName for shared app', () => {
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Shared App',
      description: 'Shared description',
      adminContact: 'admin@shared',
      url: 'https://shared.example.com',
      status: 'running',
      ready: true,
      categories: [],
      _tag: 'SharedApp',
    };

    expect(getDisplayName(sharedApp)).toBe('Shared App');
  });

  it('returns displayName for public shared app', () => {
    const publicSharedApp: PublicSharedApp = {
      name: 'public',
      displayName: 'Public App',
      description: 'Public description',
      adminContact: 'admin@public',
      tenant: 'tenant-1',
      url: 'https://public.example.com',
      categories: [],
      _tag: 'PublicSharedApp',
    };

    expect(getDisplayName(publicSharedApp)).toBe('Public App');
  });
});

describe('getDescription', () => {
  it('returns description for static app', () => {
    const staticApp: StaticApp = {
      name: 'static',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Static App',
        description: 'Static description',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: false,
      finalPath: undefined,
      _tag: 'StaticApp',
    };

    expect(getDescription(staticApp)).toBe('Static description');
  });

  it('returns description for dedicated app', () => {
    const dedicatedApp: DedicatedApp = {
      name: 'dedicated',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Dedicated App',
        description: 'Dedicated description',
        categories: [],
      },
      url: 'https://dedicated.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    };

    expect(getDescription(dedicatedApp)).toBe('Dedicated description');
  });

  it('returns description for shared app', () => {
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Shared App',
      description: 'Shared description',
      adminContact: 'admin@shared',
      url: 'https://shared.example.com',
      status: 'running',
      ready: true,
      categories: [],
      _tag: 'SharedApp',
    };

    expect(getDescription(sharedApp)).toBe('Shared description');
  });

  it('returns description for public shared app', () => {
    const publicSharedApp: PublicSharedApp = {
      name: 'public',
      displayName: 'Public App',
      description: 'Public description',
      adminContact: 'admin@public',
      tenant: 'tenant-1',
      url: 'https://public.example.com',
      categories: [],
      _tag: 'PublicSharedApp',
    };

    expect(getDescription(publicSharedApp)).toBe('Public description');
  });
});

describe('toCitytoolLink', () => {
  const mkLink = toCitytoolLink('/static');

  it('creates a static app link with the static app base url', () => {
    const staticApp: StaticApp = {
      name: 'static',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Static App',
        description: 'Static description',
        showInCitizenHub: true,
        showInGovHub: true,
        categories: [],
      },
      overallInstalls: {},
      isInstalled: true,
      finalPath: 'static-app',
      _tag: 'StaticApp',
    };

    expect(mkLink(staticApp)).toEqual({
      displayName: 'Static App',
      href: '/static/static-app',
    });
  });

  it('creates a shared app link with the app url', () => {
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Shared App',
      description: 'Shared description',
      adminContact: 'admin@shared',
      url: 'https://shared.example.com',
      status: 'running',
      ready: true,
      categories: [],
      _tag: 'SharedApp',
    };

    expect(mkLink(sharedApp)).toEqual({
      displayName: 'Shared App',
      href: 'https://shared.example.com',
    });
  });

  it('creates a public shared app link with the app url', () => {
    const publicSharedApp: PublicSharedApp = {
      name: 'public',
      displayName: 'Public App',
      description: 'Public description',
      adminContact: 'admin@public',
      tenant: 'tenant-1',
      url: 'https://public.example.com',
      categories: [],
      _tag: 'PublicSharedApp',
    };

    expect(mkLink(publicSharedApp)).toEqual({
      displayName: 'Public App',
      href: 'https://public.example.com',
    });
  });

  it('creates a dedicated app link with the app url', () => {
    const dedicatedApp: DedicatedApp = {
      name: 'dedicated',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Dedicated App',
        description: 'Dedicated description',
        categories: [],
      },
      url: 'https://dedicated.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    };

    expect(mkLink(dedicatedApp)).toEqual({
      displayName: 'Dedicated App',
      href: 'https://dedicated.example.com',
    });
  });
});

describe('getHref', () => {
  const mkHref = getHref('/static', TENANT);

  it('returns a static app href when finalPath is set', () => {
    const staticApp: StaticApp = {
      name: 'static',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Static App',
        description: 'Static description',
        showInCitizenHub: true,
        showInGovHub: true,
        categories: [],
      },
      overallInstalls: {},
      isInstalled: true,
      finalPath: 'static-app',
      _tag: 'StaticApp',
    };

    expect(mkHref(staticApp)).toBe('/static/static-app');
  });

  it('returns undefined for static app when finalPath is missing', () => {
    const staticApp: StaticApp = {
      name: 'static',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Static App',
        description: 'Static description',
        showInCitizenHub: true,
        showInGovHub: true,
        categories: [],
      },
      overallInstalls: {},
      isInstalled: true,
      finalPath: undefined,
      _tag: 'StaticApp',
    };

    expect(mkHref(staticApp)).toBeUndefined();
  });

  it('returns the dedicated app url', () => {
    const dedicatedApp: DedicatedApp = {
      name: 'dedicated',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Dedicated App',
        description: 'Dedicated description',
        categories: [],
      },
      url: 'https://dedicated.example.com',
      isInstalled: true,
      _tag: 'DedicatedApp',
    };

    expect(mkHref(dedicatedApp)).toBe('https://dedicated.example.com');
  });

  it('returns the shared app href', () => {
    const sharedApp: SharedApp = {
      name: 'shared',
      displayName: 'Shared App',
      description: 'Shared description',
      adminContact: 'admin@shared',
      url: 'https://shared.example.com',
      status: 'running',
      ready: true,
      categories: [],
      _tag: 'SharedApp',
    };

    expect(mkHref(sharedApp)).toBe(`/citytools/shared-app/${TENANT}/shared`);
  });

  it('returns the public shared app url', () => {
    const publicSharedApp: PublicSharedApp = {
      name: 'public',
      displayName: 'Public App',
      description: 'Public description',
      adminContact: 'admin@public',
      tenant: 'tenant-1',
      url: 'https://public.example.com',
      categories: [],
      _tag: 'PublicSharedApp',
    };

    expect(mkHref(publicSharedApp)).toBe('https://public.example.com');
  });
});
