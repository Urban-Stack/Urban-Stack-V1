import { render } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import DashboardPage from '@/app/dashboards/[slug]/page';
import { notFound, useSearchParams } from 'next/navigation';
import AppDashboardContainer from '@/app/dashboards/[slug]/AppDashboardContainer';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';

const TEST_DASHBOARD_SLUG = 'tenant_vizgroup_name';
const TEST_SUPERSET_URI = 'https://superset.data-hub.local';

jest.mock('@/app/dashboards/[slug]/AppDashboardContainer');

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('@/app/_lib/superset/actions', () => ({
  deleteDashboard: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as unknown as jest.Mock;

const getScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

const notFoundMock = notFound as jest.MockedFunction<() => never>;
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useSearchParams: jest.fn(),
}));

beforeEach(() => {
  getPublicEnvMock.mockReset();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
  getScopesMock.mockReset();
  notFoundMock.mockReset();
});

describe('snapshot', () => {
  it.each([
    {
      testCase: 'with vizGroup admin scope',
      isVizGroupAdmin: true,
      canSeeDashboard: true,
    },
    {
      testCase: 'without vizGroup admin scope',
      isVizGroupAdmin: false,
      canSeeDashboard: true,
    },
    {
      testCase: 'without vizGroup read scope',
      isVizGroupAdmin: false,
      canSeeDashboard: false,
    },
  ])(
    'renders page as expected $testCase',
    async ({ isVizGroupAdmin, canSeeDashboard }) => {
      getScopesMock.mockResolvedValueOnce({
        data: {
          tenants: [
            {
              tenant: 'tenant',
              vizGroups: [
                {
                  vizGroup: 'vizgroup',
                  scopes: {
                    granted: [
                      isVizGroupAdmin
                        ? 'viz-group:admin'
                        : canSeeDashboard
                          ? 'dashboard:view'
                          : '',
                    ],
                  },
                },
              ],
            },
          ],
        },
      } as unknown as AllTenantAndProjectScopes);

      const { container } = render(
        await DashboardPage({
          params: Promise.resolve({ slug: TEST_DASHBOARD_SLUG }),
          searchParams: Promise.resolve({}),
        }),
      );

      if (!canSeeDashboard) {
        expect(notFoundMock).toHaveBeenCalledTimes(1);
      }

      expect(container).toMatchSnapshot();
    },
  );
});

describe('back navigation', () => {
  it('contains link for back navigating to the dashboards overview', async () => {
    getScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: 'test-tenant',
            vizGroups: [
              {
                vizGroup: 'vizgroup',
                scopes: {
                  granted: ['viz-group:admin'],
                },
              },
            ],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    const component = render(
      await DashboardPage({
        params: Promise.resolve({ slug: TEST_DASHBOARD_SLUG }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      component.queryByRole('link', { name: 'Zurück zur Übersicht' }),
    ).toHaveAttribute('href', '/dashboards');
  });
});

describe('props', () => {
  it('calls sub component with correct Superset URI and dashboard slug', async () => {
    getScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: 'test-tenant',
            vizGroups: [
              {
                vizGroup: 'vizgroup',
                scopes: {
                  granted: ['viz-group:admin'],
                },
              },
            ],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    getPublicEnvMock.mockImplementationOnce((name) =>
      name === 'SUPERSET_URI' ? TEST_SUPERSET_URI : '',
    );

    render(
      await DashboardPage({
        params: Promise.resolve({ slug: TEST_DASHBOARD_SLUG }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(AppDashboardContainer).toHaveBeenCalledWith(
      {
        supersetBaseUrl: TEST_SUPERSET_URI,
        slug: TEST_DASHBOARD_SLUG,
        editMode: false,
      },
      undefined,
    );
  });
});
