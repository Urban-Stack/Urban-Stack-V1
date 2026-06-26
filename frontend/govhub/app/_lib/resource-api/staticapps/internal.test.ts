import {
  type StaticApp,
  type StaticAppInfo,
  type StaticAppInstall,
  fromAll,
  fromInstalled,
  fromNotInstalled,
  internal,
  isStaticApp,
  mkStaticApp,
  toStaticApps,
  StaticApps,
} from './internal';
import { AllAndInstalledStaticApps } from '@/app/_lib/resource-api/graphql/staticapps';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

const TENANT = 'guetersloh';
const ALL_CATEGORIES = CITYTOOL_CATEGORY_ORDER;
const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 3);

describe('mkStaticAppInfo', () => {
  it('creates StaticAppInfo with all fields', () => {
    const info = internal.mkStaticAppInfo(
      'staticApp-1',
      '/new-topic?category=test1',
      {
        displayName: 'City Tool Display Name',
        description: 'City Tool description',
        pictureUri: 'https://city/tool/main/banner.jpg',
        categories: ALL_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: false,
      },
      {
        averageStars: 4.2,
        count: 123,
      },
    );

    const expected: StaticAppInfo = {
      name: 'staticApp-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'City Tool Display Name',
        description: 'City Tool description',
        pictureUri: 'https://city/tool/main/banner.jpg',
        categories: ALL_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: false,
      },
      overallInstalls: {
        averageStars: 4.2,
        count: 123,
      },
      _tag: 'StaticAppInfo',
    };

    expect(info).toEqual(expected);
  });

  it('handles optional fields', () => {
    const info = internal.mkStaticAppInfo(
      'simple-tool',
      '/new-topic?category=test1',
      {
        displayName: 'Simple Tool',
        description: 'No install stats',
        categories: SOME_CATEGORIES,
        showInCitizenHub: false,
        showInGovHub: true,
      },
    );

    expect(info.meta).toMatchObject({
      displayName: 'Simple Tool',
      description: 'No install stats',
      categories: SOME_CATEGORIES,
      showInCitizenHub: false,
      showInGovHub: true,
      pictureUri: undefined,
      indexPath: undefined,
    });

    expect(info.overallInstalls).toEqual({
      averageStars: undefined,
      count: undefined,
    });
  });
});

describe('mkStaticAppInstall', () => {
  it('creates StaticAppInstall correctly', () => {
    const install = internal.mkStaticAppInstall('staticApp-1', '/path/to/tool');

    const expected: StaticAppInstall = {
      name: 'staticApp-1',
      path: '/path/to/tool',
      _tag: 'StaticAppInstall',
    };

    expect(install).toEqual(expected);
  });
});

describe('mkStaticApp', () => {
  it('creates a StaticApp from info and install data', () => {
    const info: StaticAppInfo = {
      name: 'tool-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Tool One',
        description: 'Desc',
        pictureUri: 'https://the/path/to/a/great/picture.png',
        categories: SOME_CATEGORIES,
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {
        averageStars: 5,
        count: 99,
      },
      _tag: 'StaticAppInfo',
    };

    const staticApp = mkStaticApp(info, true, TENANT, 'installed/path');

    const expected: StaticApp = {
      name: 'tool-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: info.meta,
      overallInstalls: info.overallInstalls,
      isInstalled: true,
      finalPath: `${TENANT}/installed/path`,
      _tag: 'StaticApp',
    };

    expect(staticApp).toEqual(expected);
  });

  describe('finalPath', () => {
    const mkTool = (path?: string, indexPath?: string, tenant?: string) => {
      const info: StaticAppInfo = {
        name: 'tool-1',
        requestCityToolLink: '/new-topic?category=test1',
        meta: {
          displayName: 'Tool One',
          description: 'Desc',
          pictureUri: 'https://the/path/to/a/great/picture.png',
          categories: [],
          showInCitizenHub: true,
          showInGovHub: true,
          indexPath,
        },
        overallInstalls: {
          averageStars: 5,
          count: 99,
        },
        _tag: 'StaticAppInfo',
      };

      return mkStaticApp(info, true, tenant, path);
    };
    it('creates StaticApp out of index path and path', () => {
      const staticApp = mkTool('path', '/postfix', TENANT);
      expect(staticApp.finalPath).toEqual(`${TENANT}/path/postfix`);
    });

    it('creates StaticApp without index path and path', () => {
      const staticApp = mkTool('path', undefined, TENANT);
      expect(staticApp.finalPath).toEqual(`${TENANT}/path`);
    });

    it('leaves out finalPath if no path is given', () => {
      const staticApp = mkTool();
      expect(staticApp.finalPath).toBeUndefined();
    });

    it('leaves out finalPath if no tenant is given', () => {
      const staticApp = mkTool('path', undefined, undefined);
      expect(staticApp.finalPath).toBeUndefined();
    });
  });
});

describe('toStaticApps', () => {
  it('maps GraphQL result to StaticApps structure', () => {
    const result: Partial<AllAndInstalledStaticApps> = {
      data: {
        allExisting: [
          {
            citytool: 'tool-1',
            requestCityToolLink: '/new-topic?category=test1',
            info: {
              name: 'City Tool One',
              description: 'First tool',
              pictureUri: 'https://tools.com/tool.jpg',
              categories: ALL_CATEGORIES,
              showInCitizenhub: true,
              showInGovhub: false,
            },
            installs: {
              averageStars: 3.5,
              count: 42,
            },
          },
          {
            citytool: 'tool-2',
            requestCityToolLink: '/new-topic?category=test2',
            info: {
              name: 'City Tool Two',
              description: 'Second tool',
              categories: SOME_CATEGORIES,
              showInCitizenhub: false,
              showInGovhub: true,
            },
            installs: {
              averageStars: null,
              count: 0,
            },
          },
        ],
        installed: {
          tenant: TENANT,
          citytools: [
            {
              citytool: 'tool-1',
              path: '/tool-1',
            },
          ],
        },
      },
    };

    const resultModel = toStaticApps(result as AllAndInstalledStaticApps);

    expect(resultModel).toEqual({
      _tag: 'StaticApps',
      all: new Map([
        [
          'tool-1',
          {
            name: 'tool-1',
            requestCityToolLink: '/new-topic?category=test1',
            meta: {
              displayName: 'City Tool One',
              description: 'First tool',
              pictureUri: 'https://tools.com/tool.jpg',
              categories: ALL_CATEGORIES,
              showInCitizenHub: true,
              showInGovHub: false,
            },
            overallInstalls: {
              averageStars: 3.5,
              count: 42,
            },
            _tag: 'StaticAppInfo',
          },
        ],
        [
          'tool-2',
          {
            name: 'tool-2',
            requestCityToolLink: '/new-topic?category=test2',
            meta: {
              displayName: 'City Tool Two',
              description: 'Second tool',
              pictureUri: undefined,
              categories: SOME_CATEGORIES,
              showInCitizenHub: false,
              showInGovHub: true,
            },
            overallInstalls: {
              averageStars: undefined,
              count: 0,
            },
            _tag: 'StaticAppInfo',
          },
        ],
      ]),
      installed: new Map([
        [
          'tool-1',
          {
            name: 'tool-1',
            path: '/tool-1',
            _tag: 'StaticAppInstall',
          },
        ],
      ]),
      tenant: TENANT,
    });
  });
});

describe('fromInstalled', () => {
  it('returns installed apps with finalPath set', () => {
    const info: StaticAppInfo = {
      name: 'tool-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Tool One',
        description: 'Desc',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
        indexPath: '/index',
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    };
    const staticApps = {
      _tag: 'StaticApps',
      all: new Map([['tool-1', info]]),
      installed: new Map([
        [
          'tool-1',
          { name: 'tool-1', path: 'tool-1', _tag: 'StaticAppInstall' },
        ],
      ]),
      tenant: TENANT,
    } satisfies StaticApps;

    const result = fromInstalled(staticApps);

    expect(result).toEqual([
      {
        name: 'tool-1',
        requestCityToolLink: '/new-topic?category=test1',
        meta: info.meta,
        overallInstalls: info.overallInstalls,
        isInstalled: true,
        finalPath: `${TENANT}/tool-1/index`,
        _tag: 'StaticApp',
      },
    ]);
  });
});

describe('fromNotInstalled', () => {
  it('returns apps missing from installed list', () => {
    const infoInstalled: StaticAppInfo = {
      name: 'tool-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Tool One',
        description: 'Desc',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    };
    const infoNotInstalled: StaticAppInfo = {
      name: 'tool-2',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Tool Two',
        description: 'Desc',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    };
    const staticApps = {
      _tag: 'StaticApps',
      all: new Map([
        ['tool-1', infoInstalled],
        ['tool-2', infoNotInstalled],
      ]),
      installed: new Map([
        [
          'tool-1',
          { name: 'tool-1', path: '/tool-1', _tag: 'StaticAppInstall' },
        ],
      ]),
    } satisfies StaticApps;

    const result = fromNotInstalled(staticApps);

    expect(result).toEqual([
      {
        name: 'tool-2',
        requestCityToolLink: '/new-topic?category=test2',
        meta: infoNotInstalled.meta,
        overallInstalls: infoNotInstalled.overallInstalls,
        isInstalled: false,
        finalPath: undefined,
        _tag: 'StaticApp',
      },
    ]);
  });
});

describe('fromAll', () => {
  it('returns all apps with installed flag and finalPath', () => {
    const infoInstalled: StaticAppInfo = {
      name: 'tool-1',
      requestCityToolLink: '/new-topic?category=test1',
      meta: {
        displayName: 'Tool One',
        description: 'Desc',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
        indexPath: '/home',
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    };
    const infoNotInstalled: StaticAppInfo = {
      name: 'tool-2',
      requestCityToolLink: '/new-topic?category=test2',
      meta: {
        displayName: 'Tool Two',
        description: 'Desc',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      _tag: 'StaticAppInfo',
    };
    const staticApps = {
      _tag: 'StaticApps',
      all: new Map([
        ['tool-1', infoInstalled],
        ['tool-2', infoNotInstalled],
      ]),
      installed: new Map([
        [
          'tool-1',
          { name: 'tool-1', path: 'tool-1', _tag: 'StaticAppInstall' },
        ],
      ]),
      tenant: TENANT,
    } satisfies StaticApps;

    const result = fromAll(staticApps);

    expect(result).toEqual([
      {
        name: 'tool-1',
        requestCityToolLink: '/new-topic?category=test1',
        meta: infoInstalled.meta,
        overallInstalls: infoInstalled.overallInstalls,
        isInstalled: true,
        finalPath: `${TENANT}/tool-1/home`,
        _tag: 'StaticApp',
      },
      {
        name: 'tool-2',
        requestCityToolLink: '/new-topic?category=test2',
        meta: infoNotInstalled.meta,
        overallInstalls: infoNotInstalled.overallInstalls,
        isInstalled: false,
        finalPath: undefined,
        _tag: 'StaticApp',
      },
    ]);
  });
});

describe('isStaticApp', () => {
  it('returns true for valid StaticApp object', () => {
    const staticApp: StaticApp = {
      name: 'test-tool',
      requestCityToolLink: '/new-topic?category=test',
      meta: {
        displayName: 'Test Tool',
        description: 'A test tool',
        pictureUri: 'https://tools.com/tool.jpg',
        categories: [],
        showInCitizenHub: true,
        showInGovHub: true,
      },
      overallInstalls: {},
      isInstalled: true,
      finalPath: '/test/path',
      _tag: 'StaticApp',
    };

    expect(isStaticApp(staticApp)).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['string', 'test'],
    ['number', 123],
    ['boolean', true],
    ['array', []],
    ['object without _tag', { name: 'test' }],
    ['object with wrong _tag', { _tag: 'WrongTag' }],
    ['object with null _tag', { _tag: null }],
    ['object with undefined _tag', { _tag: undefined }],
  ])('returns false for %s', (_, input) => {
    expect(isStaticApp(input)).toBe(false);
  });
});
