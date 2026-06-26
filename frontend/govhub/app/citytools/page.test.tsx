import { render, screen } from '@testing-library/react';
import {
  AllAndInstalledStaticApps,
  queryStaticApps,
} from '@/app/_lib/resource-api/graphql/staticapps';
import ToolCards from '@/app/citytools/_internal/ToolCards';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import { type FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import CityToolsPage from '@/app/citytools/page';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import {
  GetPublicSharedApps,
  GetSharedApps,
  queryGetPublicSharedApps,
  queryGetSharedAppsByTenant,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import {
  AllAndInstalledDedicatedApps,
  queryDedicatedApps,
} from '@/app/_lib/resource-api/graphql/dedicatedApps';
import type { TenantScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { queryTenantScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import {
  DedicatedApps,
  toDedicatedApps,
} from '@/app/_lib/resource-api/dedicatedapps';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/staticapps', () => ({
  queryStaticApps: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/sharedApps', () => ({
  queryGetSharedAppsByTenant: jest.fn(),
  queryGetPublicSharedApps: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/dedicatedApps', () => ({
  queryDedicatedApps: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/dedicatedapps', () => ({
  ...jest.requireActual('@/app/_lib/resource-api/dedicatedapps'),
  toDedicatedApps: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  queryTenantScopes: jest.fn(),
}));

jest.mock('@/app/citytools/_internal/ToolCards', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/app/citytools/_internal/Filter', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockQueryStaticApps = queryStaticApps as unknown as FuncMock<
  typeof queryStaticApps
>;

const mockQueryGetSharedAppsByTenant =
  queryGetSharedAppsByTenant as unknown as FuncMock<
    typeof queryGetSharedAppsByTenant
  >;

const mockQueryGetPublicSharedApps =
  queryGetPublicSharedApps as unknown as FuncMock<
    typeof queryGetPublicSharedApps
  >;

const mockQueryDedicatedApps = queryDedicatedApps as unknown as FuncMock<
  typeof queryDedicatedApps
>;

const mockToDedicatedApps = toDedicatedApps as unknown as FuncMock<
  typeof toDedicatedApps
>;

const mockQueryTenantScopes = queryTenantScopes as unknown as FuncMock<
  typeof queryTenantScopes
>;

const TENANT = 'guetersloh';

beforeEach(() => {
  jest.resetAllMocks();
  (getPublicEnv as jest.Mock).mockImplementation((env: string) =>
    env == 'CITYTOOLS_URI' ? 'https://citytools.urbanstack.de' : 'WRONG ENV',
  );
  (requireTenant as jest.Mock).mockResolvedValue(TENANT);
});

describe('CityToolsPage', () => {
  const mockStaticAppsResult: Partial<AllAndInstalledStaticApps> = {
    data: {
      allExisting: [
        {
          citytool: 'tool1',
          requestCityToolLink: '/new-topic?category=test',
          info: {
            name: 'Tool 1',
            description: 'Description 1',
            categories: [],
            showInCitizenhub: true,
            showInGovhub: false,
          },
          installs: {
            averageStars: 4.5,
            count: 10,
          },
        },
      ],
      installed: {
        tenant: 'guetersloh',
        citytools: [
          {
            citytool: 'tool1',
            path: '/tool1',
          },
        ],
      },
    },
  };

  const mockSharedAppResult: Partial<GetSharedApps> = {
    data: {
      tenant: {
        sharedApps: [
          {
            sharedApp: 'sharedapp1',
            url: 'https://sharedapp.example.com',
            config: {
              description: 'A shared app',
              categories: [],
              displayName: 'Shared App 1',
              adminContact: 'admin@contact.com',
            },
            containerStatus: {
              running: true,
              ready: true,
              waiting: false,
            },
          },
        ],
      },
    },
  };

  const mockPublicSharedAppResult: Partial<GetPublicSharedApps> = {
    data: {
      publicSharedApps: [
        {
          sharedApp: 'publicapp1',
          displayName: 'Public App 1',
          description: 'A public shared app',
          categories: [],
          adminContact: 'admin@contact.com',
          tenant: 'guetersloh',
          tenantDisplayName: 'Gütersloh',
          url: 'https://publicapp.example.com',
        },
      ],
    },
  };

  const mockDedicatedAppsResult: Partial<AllAndInstalledDedicatedApps> = {
    data: {
      all: [
        {
          dedicatedApp: 'dedicated-1',
          requestCityToolLink: '/new-topic?category=test',
          info: {
            name: 'Dedicated 1',
            description: 'Dedicated description',
            categories: [],
          },
        },
      ],
      installed: {
        tenant: 'guetersloh',
        dedicatedApps: [
          {
            dedicatedApp: 'dedicated-1',
            url: 'https://dedicated.example.com',
          },
        ],
      },
    },
  };

  const dedicatedAppsModel = {
    all: new Map(),
    installed: new Map(),
    tenant: TENANT,
    _tag: 'DedicatedApps',
  } satisfies DedicatedApps;

  const mockTenantScopesResult: (
    granted: Scope[] | null,
  ) => Partial<TenantScopes> = (g) => ({
    data: {
      tenant: {
        scopes: {
          all: [],
          granted: g ?? [],
        },
      },
    },
  });

  it('renders page heading and passes static apps to CityToolCards', async () => {
    mockQueryStaticApps.mockResolvedValue(
      mockStaticAppsResult as AllAndInstalledStaticApps,
    );
    mockQueryGetSharedAppsByTenant.mockResolvedValue(
      mockSharedAppResult as GetSharedApps,
    );
    mockQueryGetPublicSharedApps.mockResolvedValue(
      mockPublicSharedAppResult as GetPublicSharedApps,
    );
    mockQueryDedicatedApps.mockResolvedValue(
      mockDedicatedAppsResult as AllAndInstalledDedicatedApps,
    );
    mockToDedicatedApps.mockReturnValue(() => dedicatedAppsModel);
    mockQueryTenantScopes.mockResolvedValue(
      mockTenantScopesResult([
        'citytool:admin',
        'shared-app:admin',
        'dedicated-app:admin',
      ]) as TenantScopes,
    );

    render(await CityToolsPage());

    expect(mockQueryStaticApps).toHaveBeenCalled();

    expect(ToolCards as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        staticApps: expect.objectContaining({
          all: expect.any(Map),
          installed: expect.any(Map),
          _tag: 'StaticApps',
        }),
        dedicatedApps: expect.objectContaining({
          all: expect.any(Map),
          installed: expect.any(Map),
          _tag: 'DedicatedApps',
        }),
        sharedApps: expect.any(Array),
        staticAppBaseUrl: 'https://citytools.urbanstack.de',
        isCitytoolAdmin: true,
        isSharedAppAdmin: true,
        isDedicatedAppAdmin: true,
      }),
      undefined,
    );

    expect(AppSearchBar as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: 'City Tools durchsuchen',
        paramKey: 'search',
      }),
      undefined,
    );
  });

  it('passes isCitytoolAdmin correctly to ToolCards', async () => {
    mockQueryStaticApps.mockResolvedValue(
      mockStaticAppsResult as AllAndInstalledStaticApps,
    );
    mockQueryGetSharedAppsByTenant.mockResolvedValue(
      mockSharedAppResult as GetSharedApps,
    );
    mockQueryGetPublicSharedApps.mockResolvedValue(
      mockPublicSharedAppResult as GetPublicSharedApps,
    );
    mockQueryDedicatedApps.mockResolvedValue(
      mockDedicatedAppsResult as AllAndInstalledDedicatedApps,
    );
    mockToDedicatedApps.mockReturnValue(() => dedicatedAppsModel);
    mockQueryTenantScopes.mockResolvedValue(
      mockTenantScopesResult(null) as TenantScopes,
    );

    render(await CityToolsPage());

    expect(mockQueryStaticApps).toHaveBeenCalled();

    expect(ToolCards as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: TENANT,
        staticApps: expect.objectContaining({
          all: expect.any(Map),
          installed: expect.any(Map),
          _tag: 'StaticApps',
        }),
        dedicatedApps: expect.objectContaining({
          all: expect.any(Map),
          installed: expect.any(Map),
          _tag: 'DedicatedApps',
        }),
        sharedApps: expect.any(Array),
        staticAppBaseUrl: 'https://citytools.urbanstack.de',
        isCitytoolAdmin: false,
        isSharedAppAdmin: false,
        isDedicatedAppAdmin: false,
      }),
      undefined,
    );
  });

  it('renders create button which leads to creation form', async () => {
    (requireTenant as jest.Mock).mockResolvedValue('guetersloh');
    mockQueryStaticApps.mockResolvedValue(
      mockStaticAppsResult as AllAndInstalledStaticApps,
    );
    mockQueryGetSharedAppsByTenant.mockResolvedValue(
      mockSharedAppResult as GetSharedApps,
    );
    mockQueryGetPublicSharedApps.mockResolvedValue(
      mockPublicSharedAppResult as GetPublicSharedApps,
    );
    mockQueryDedicatedApps.mockResolvedValue(
      mockDedicatedAppsResult as AllAndInstalledDedicatedApps,
    );
    mockToDedicatedApps.mockReturnValue(() => dedicatedAppsModel);
    mockQueryTenantScopes.mockResolvedValue(
      mockTenantScopesResult(['shared-app:admin']) as TenantScopes,
    );

    render(await CityToolsPage());

    const createButton = screen.getByRole('button', {
      name: /Neues City Tool erstellen/,
    });

    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute(
      'href',
      '/citytools/shared-app/guetersloh/new',
    );
  });

  it('hides create button for non-admin users', async () => {
    mockQueryStaticApps.mockResolvedValue(
      mockStaticAppsResult as AllAndInstalledStaticApps,
    );
    mockQueryGetSharedAppsByTenant.mockResolvedValue(
      mockSharedAppResult as GetSharedApps,
    );
    mockQueryGetPublicSharedApps.mockResolvedValue(
      mockPublicSharedAppResult as GetPublicSharedApps,
    );
    mockQueryDedicatedApps.mockResolvedValue(
      mockDedicatedAppsResult as AllAndInstalledDedicatedApps,
    );
    mockToDedicatedApps.mockReturnValue(() => dedicatedAppsModel);
    mockQueryTenantScopes.mockResolvedValue({
      data: {
        tenant: {
          scopes: {
            all: [],
            granted: ['citytool:view'],
          },
        },
      },
    } as Partial<TenantScopes> as TenantScopes);

    render(await CityToolsPage());

    expect(
      screen.queryByRole('button', {
        name: /Neues City Tool erstellen/,
      }),
    ).not.toBeInTheDocument();
  });
});
