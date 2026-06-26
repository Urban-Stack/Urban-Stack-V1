import { render } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import DashboardsPage from '@/app/dashboards/page';
import DashboardsContainer from '@/app/dashboards/DashboardsContainer';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { query } from '@/app/_lib/resource-api/client';
import { VIZ_GROUPS } from '@/app/dashboards/_internal/testUtils';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import {
  hasScopeForTenant,
  tenantPermissionMap,
  vizGroupPermissionMap,
} from '@/app/_lib/resource-api/permission/scope';

const TEST_SUPERSET_URI = 'https://superset.data-hub.local';
const TEST_TENANT = 'guetersloh';

jest.mock('@/app/dashboards/DashboardsContainer');

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const queryMock = query as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

const getScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

beforeEach(() => {
  getPublicEnvMock.mockReset();
  requireTenantMock.mockReset();
  getScopesMock.mockReset();
  queryMock.mockReset();
});

const VIZGROUP_ADMIN_SCOPES = {
  data: {
    tenants: [
      {
        tenant: 'guetersloh',
        scopes: {
          all: [],
          granted: ['tenant:admin', 'viz-group:admin'],
        },
        groups: [],
        vizGroups: [],
        projects: [],
      },
      {
        tenant: 'detmold',
        scopes: {
          all: [],
          granted: ['tenant:admin', 'viz-group:admin'],
        },
        groups: [],
        vizGroups: [],
        projects: [],
      },
    ],
  },
} as unknown as AllTenantAndProjectScopes;

const VIZGROUP_ADMIN_SCOPES_BLOCKED = {
  data: {
    tenants: [
      {
        tenant: 'guetersloh',
        scopes: {
          all: [],
          granted: ['tenant:read', 'viz-group:read'],
        },
        groups: [],
        vizGroups: [],
        projects: [],
      },
      {
        tenant: 'detmold',
        scopes: {
          all: [],
          granted: ['tenant:read', 'viz-group:read'],
        },
        groups: [],
        vizGroups: [],
        projects: [],
      },
    ],
  },
} as unknown as AllTenantAndProjectScopes;

it.each([VIZGROUP_ADMIN_SCOPES, VIZGROUP_ADMIN_SCOPES_BLOCKED])(
  'calls DashboardsContainer with correct properties',
  async (scopes) => {
    getPublicEnvMock.mockImplementationOnce((name) =>
      name === 'SUPERSET_URI' ? TEST_SUPERSET_URI : '',
    );
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    getScopesMock.mockResolvedValueOnce(scopes);
    queryMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            vizGroups: VIZ_GROUPS.map((vg) => ({
              vizGroup: vg.name,
              tenant: vg.tenant,
            })),
          },
        ],
      },
    });
    const canCreateDashboard = hasScopeForTenant(
      tenantPermissionMap(scopes),
      'viz-group:admin',
      TEST_TENANT,
    );
    const vizGroupsScopeMap = vizGroupPermissionMap(scopes);

    render(await DashboardsPage());

    expect(DashboardsContainer).toHaveBeenCalledWith(
      {
        supersetUri: TEST_SUPERSET_URI,
        canCreateDashboard,
        vizGroups: VIZ_GROUPS,
        vizGroupScopeMap: vizGroupsScopeMap,
      },
      undefined,
    );
  },
);
