import {
  type DedicatedAppInfo,
  type DedicatedAppInstall,
  DedicatedApps,
  fromAll,
  fromInstalled,
  fromNotInstalled,
  toDedicatedApps,
} from './index';
import {
  DedicatedApp,
  isDedicatedApp,
} from '@/app/_lib/resource-api/dedicatedapps/internal';
import { AllAndInstalledDedicatedApps } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

const TENANT = 'guetersloh';
const ALL_CATEGORIES = CITYTOOL_CATEGORY_ORDER;
const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(0, 2);

describe('toDedicatedApps', () => {
  it('maps GraphQL result to DedicatedApps structure', () => {
    const result: Partial<AllAndInstalledDedicatedApps> = {
      data: {
        all: [
          {
            dedicatedApp: 'app-1',
            requestCityToolLink: '/new-topic?category=test1',
            info: {
              name: 'App One',
              description: 'First app',
              categories: ALL_CATEGORIES,
              pictureUri: 'https://example.com/app.png',
              indexPath: '/home',
            },
          },
          {
            dedicatedApp: 'app-2',
            requestCityToolLink: '/new-topic?category=test2',
            info: {
              name: 'App Two',
              description: 'Second app',
              categories: SOME_CATEGORIES,
              pictureUri: null,
              indexPath: null,
            },
          },
        ],
        installed: {
          tenant: TENANT,
          dedicatedApps: [
            {
              dedicatedApp: 'app-1',
              url: 'https://app.example',
            },
          ],
        },
      },
    };

    const resultModel = toDedicatedApps(TENANT)(
      result as AllAndInstalledDedicatedApps,
    );

    expect(resultModel).toEqual({
      _tag: 'DedicatedApps',
      tenant: TENANT,
      all: new Map([
        [
          'app-1',
          {
            name: 'app-1',
            requestCityToolLink: '/new-topic?category=test1',
            meta: {
              displayName: 'App One',
              description: 'First app',
              categories: ALL_CATEGORIES,
              pictureUri: 'https://example.com/app.png',
              indexPath: '/home',
            },
            _tag: 'DedicatedAppInfo',
          },
        ],
        [
          'app-2',
          {
            name: 'app-2',
            requestCityToolLink: '/new-topic?category=test2',
            meta: {
              displayName: 'App Two',
              description: 'Second app',
              categories: SOME_CATEGORIES,
              pictureUri: undefined,
              indexPath: undefined,
            },
            _tag: 'DedicatedAppInfo',
          },
        ],
      ]),
      installed: new Map([
        [
          'app-1',
          {
            name: 'app-1',
            url: 'https://app.example',
            _tag: 'DedicatedAppInstall',
          },
        ],
      ]),
    } satisfies DedicatedApps);
  });

  it('handles missing installed data', () => {
    const result: Partial<AllAndInstalledDedicatedApps> = {
      data: {
        all: [
          {
            dedicatedApp: 'app-1',
            requestCityToolLink: '/new-topic?category=test1',
            info: {
              name: 'App One',
              description: 'First app',
              categories: SOME_CATEGORIES,
            },
          },
        ],
        installed: null,
      },
    };

    const resultModel = toDedicatedApps(TENANT)(
      result as AllAndInstalledDedicatedApps,
    );

    expect(resultModel.installed.size).toBe(0);
  });
});

describe('fromInstalled', () => {
  it('returns installed apps', () => {
    const info: DedicatedAppInfo = {
      name: 'app-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'App One',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    };
    const install: DedicatedAppInstall = {
      name: 'app-1',
      url: 'https://app.example',
      _tag: 'DedicatedAppInstall',
    };
    const dedicatedApps = {
      _tag: 'DedicatedApps',
      tenant: TENANT,
      all: new Map([['app-1', info]]),
      installed: new Map([['app-1', install]]),
    } as const satisfies DedicatedApps;

    const result = fromInstalled(dedicatedApps);

    expect(result).toEqual([
      {
        name: 'app-1',
        requestCityToolLink: '/new-topic?category=test1',
        meta: info.meta,
        url: 'https://app.example',
        isInstalled: true,
        _tag: 'DedicatedApp',
      },
    ] satisfies DedicatedApp[]);
  });

  it('throws when installed app is missing from all apps', () => {
    const install: DedicatedAppInstall = {
      name: 'missing-app',
      url: 'https://app.example',
      _tag: 'DedicatedAppInstall',
    };
    const dedicatedApps = {
      _tag: 'DedicatedApps',
      tenant: TENANT,
      all: new Map<string, DedicatedAppInfo>(),
      installed: new Map([['missing-app', install]]),
    } as const satisfies DedicatedApps;

    expect(() => fromInstalled(dedicatedApps)).toThrow(
      'missing-app not found in all dedicated apps. Installed dedicated apps must be in all dedicated apps.',
    );
  });
});

describe('fromNotInstalled', () => {
  it('returns apps not in installed list', () => {
    const installedInfo: DedicatedAppInfo = {
      name: 'app-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'App One',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    };
    const notInstalledInfo: DedicatedAppInfo = {
      name: 'app-2',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'App Two',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    };
    const dedicatedApps = {
      _tag: 'DedicatedApps',
      tenant: TENANT,
      all: new Map([
        ['app-1', installedInfo],
        ['app-2', notInstalledInfo],
      ]),
      installed: new Map([
        [
          'app-1',
          {
            name: 'app-1',
            url: 'https://app.example',
            _tag: 'DedicatedAppInstall',
          },
        ],
      ]),
    } as const satisfies DedicatedApps;

    const result = fromNotInstalled(dedicatedApps);

    expect(result).toEqual([
      {
        name: 'app-2',
        requestCityToolLink: '/new-topic?category=test2',
        meta: notInstalledInfo.meta,
        url: undefined,
        isInstalled: false,
        _tag: 'DedicatedApp',
      },
    ] satisfies DedicatedApp[]);
  });
});

describe('fromAll', () => {
  it('returns all apps with installed flag', () => {
    const installedInfo: DedicatedAppInfo = {
      name: 'app-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'App One',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    };
    const notInstalledInfo: DedicatedAppInfo = {
      name: 'app-2',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'App Two',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      _tag: 'DedicatedAppInfo',
    };
    const dedicatedApps = {
      _tag: 'DedicatedApps',
      tenant: TENANT,
      all: new Map([
        ['app-1', installedInfo],
        ['app-2', notInstalledInfo],
      ]),
      installed: new Map([
        [
          'app-1',
          {
            name: 'app-1',
            url: 'https://app.example',
            _tag: 'DedicatedAppInstall',
          },
        ],
      ]),
    } as const satisfies DedicatedApps;

    const result = fromAll(dedicatedApps);

    expect(result).toEqual([
      {
        name: 'app-1',
        requestCityToolLink: '/new-topic?category=test1',
        meta: installedInfo.meta,
        url: 'https://app.example',
        isInstalled: true,
        _tag: 'DedicatedApp',
      },
      {
        name: 'app-2',
        requestCityToolLink: '/new-topic?category=test2',
        meta: notInstalledInfo.meta,
        url: undefined,
        isInstalled: false,
        _tag: 'DedicatedApp',
      },
    ] satisfies DedicatedApp[]);
  });
});

describe('isDedicatedApp', () => {
  it('returns true for DedicatedApp objects', () => {
    const app = {
      name: 'app-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'App One',
        description: 'Desc',
        categories: SOME_CATEGORIES,
      },
      url: 'https://app.example',
      isInstalled: true,
      _tag: 'DedicatedApp',
    } satisfies DedicatedApp;

    expect(isDedicatedApp(app)).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['string', 'app'],
    ['number', 1],
    ['array', []],
    ['object without _tag', { name: 'app' }],
    ['object with wrong _tag', { _tag: 'WrongTag' }],
  ])('returns false for %s', (_, input) => {
    expect(isDedicatedApp(input)).toBe(false);
  });
});
