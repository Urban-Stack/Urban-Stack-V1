import { toPublicSharedApps, toSharedApps } from './internal';
import {
  GetPublicSharedApps,
  GetSharedApps,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import { DeepPartial } from 'ts-essentials';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

const ALL_CATEGORIES = CITYTOOL_CATEGORY_ORDER;
const SOME_CATEGORIES = CITYTOOL_CATEGORY_ORDER.slice(1, 3);

describe('toSharedApps', () => {
  it('returns empty array if tenant is undefined', () => {
    const result: DeepPartial<GetSharedApps> = { data: { tenant: undefined } };
    expect(toSharedApps(result as GetSharedApps)).toEqual([]);
  });

  it('returns empty array if sharedApps is undefined', () => {
    const result: DeepPartial<GetSharedApps> = {
      data: { tenant: { sharedApps: undefined } },
    };
    expect(toSharedApps(result as GetSharedApps)).toEqual([]);
  });

  it('returns sharedApps correctly with all status branches', () => {
    const result: DeepPartial<GetSharedApps> = {
      data: {
        tenant: {
          sharedApps: [
            {
              sharedApp: 'app1',
              config: {
                displayName: 'App 1',
                description: 'desc1',
                pictureUri: 'https://pictures.org/picture0001.png',
                categories: ALL_CATEGORIES,
                adminContact: 'admin1',
              },
              url: 'http://app1',
              containerStatus: { running: true, waiting: false, ready: true },
            },
            {
              sharedApp: 'app2',
              config: {
                displayName: 'App 2',
                description: 'desc2',
                pictureUri: 'https://pictures.org/picture0002.png',
                categories: SOME_CATEGORIES,
                adminContact: 'admin2',
              },
              url: 'http://app2',
              containerStatus: { running: false, waiting: true, ready: false },
            },
            {
              sharedApp: 'app3',
              config: {
                displayName: 'App 3',
                description: 'desc3',
                pictureUri: 'https://pictures.org/picture0003.png',
                categories: SOME_CATEGORIES,
                adminContact: 'admin3',
              },
              url: 'http://app3',
              containerStatus: { running: false, waiting: false, ready: false },
            },
            {
              sharedApp: 'app4',
              config: {
                displayName: 'App 4',
                description: 'desc4',
                pictureUri: 'https://pictures.org/picture0004.png',
                categories: [],
                adminContact: 'admin4',
              },
              url: 'http://app4',
              containerStatus: null,
            },
            {
              sharedApp: 'app5',
              config: {
                displayName: 'App 5',
                description: 'desc5',
                pictureUri: 'https://pictures.org/picture0005.png',
                categories: ALL_CATEGORIES,
                adminContact: 'admin5',
              },
              url: 'http://app5',
            },
          ],
        },
      },
    };

    const apps = toSharedApps(result as GetSharedApps);

    expect(apps).toHaveLength(5);
    expect(apps[0]).toMatchObject({
      name: 'app1',
      status: 'running',
      ready: true,
    });
    expect(apps[1]).toMatchObject({
      name: 'app2',
      status: 'waiting',
      ready: false,
    });
    expect(apps[2]).toMatchObject({
      name: 'app3',
      status: 'unknown',
      ready: false,
    });
    expect(apps[3]).toMatchObject({
      name: 'app4',
      status: 'unknown',
      ready: false,
    });
    expect(apps[4]).toMatchObject({
      name: 'app5',
      status: 'unknown',
      ready: false,
    });
  });
});

describe('toPublicSharedApps', () => {
  it('returns empty array if publicSharedApps is undefined', () => {
    const result: DeepPartial<GetPublicSharedApps> = {
      data: { publicSharedApps: undefined },
    };
    expect(toPublicSharedApps(result as GetPublicSharedApps)).toEqual([]);
  });

  it('returns publicSharedApps correctly', () => {
    const result: DeepPartial<GetPublicSharedApps> = {
      data: {
        publicSharedApps: [
          {
            sharedApp: 'app1',
            displayName: 'App 1',
            description: 'desc1',
            categories: ALL_CATEGORIES,
            adminContact: 'admin1',
            tenant: 'tenant1',
            tenantDisplayName: 'Tenant 1',
            url: 'http://app1',
          },
          {
            sharedApp: 'app2',
            displayName: 'App 2',
            description: 'desc2',
            categories: SOME_CATEGORIES,
            adminContact: 'admin2',
            tenant: 'tenant2',
            url: 'http://app2',
          },
        ],
      },
    };

    const apps = toPublicSharedApps(result as GetPublicSharedApps);

    expect(apps).toHaveLength(2);
    expect(apps[0]).toMatchObject({
      name: 'app1',
      displayName: 'App 1',
      categories: ALL_CATEGORIES,
      tenantDisplayName: 'Tenant 1',
      _tag: 'PublicSharedApp',
    });
    expect(apps[1]).toMatchObject({
      name: 'app2',
      displayName: 'App 2',
      categories: SOME_CATEGORIES,
      tenantDisplayName: undefined,
      _tag: 'PublicSharedApp',
    });
  });
});
