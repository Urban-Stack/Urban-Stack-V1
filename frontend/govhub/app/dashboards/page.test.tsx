import { render } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import DashboardsPage from '@/app/dashboards/page';
import DashboardsContainer from '@/app/dashboards/DashboardsContainer';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { query } from '@/app/_lib/resource-api/client';
import { queryHasTenantScope } from '../_lib/resource-api/graphql/tenant';

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

const queryHasTenantScopeMock: FuncMock<typeof queryHasTenantScope> =
  queryHasTenantScope as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  queryHasTenantScope: jest.fn(),
}));

beforeEach(() => {
  getPublicEnvMock.mockReset();
  requireTenantMock.mockReset();
  queryHasTenantScopeMock.mockReset();
  queryMock.mockReset();
});

it.each([true, false])(
  'calls DashboardsContainer with correct properties',
  async (isAdmin) => {
    getPublicEnvMock.mockImplementationOnce((name) =>
      name === 'SUPERSET_URI' ? TEST_SUPERSET_URI : '',
    );
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    queryHasTenantScopeMock.mockResolvedValue(isAdmin);
    queryMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: 'guetersloh',
            vizGroups: [
              {
                vizGroup: 'test',
                tenant: 'guetersloh',
                admin: isAdmin,
                dashboardView: isAdmin,
              },
            ],
          },
        ],
      },
    });
    const canCreateDashboard = isAdmin;

    render(await DashboardsPage());

    expect(DashboardsContainer).toHaveBeenCalledWith(
      {
        supersetUri: TEST_SUPERSET_URI,
        canCreateDashboard,
        vizGroups: [
          {
            _tag: 'VizGroup',
            name: 'test',
            tenant: 'guetersloh',
          },
        ],
        adminMap: new Map([['guetersloh', new Map([['test', isAdmin]])]]),
        dashboardViewMap: new Map([
          ['guetersloh', new Map([['test', isAdmin]])],
        ]),
      },
      undefined,
    );
  },
);
