import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardGroupsSettingsPage from '@/app/settings/dashboardgroups/page';
import { FuncMock } from '@/app/_test/utils';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

const CREATE_BUTTON_ID = 'create-button';
const TENANT = 'test-tenant';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock('@/app/settings/dashboardgroups/CreateVizGroupButton', () =>
  jest.fn(() => (
    <div data-testid={CREATE_BUTTON_ID}>mocked create viz group popover</div>
  )),
);

jest.mock('@/app/settings/dashboardgroups/VizGroupsList', () =>
  jest.fn(() => <div>mocked viz groups list</div>),
);

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-vizgroup-search-bar' />),
}));

const queryScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

beforeEach(() => {
  requireTenantMock.mockReset();
  queryScopesMock.mockReset();
});

describe('snapshot', () => {
  it('renders page as expected', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryScopesMock.mockResolvedValue({
      data: {
        tenants: [
          {
            tenant: TENANT,
            scopes: {
              all: ['tenant:admin'],
              granted: ['tenant:admin', 'viz-group:admin'],
            },
            projects: [],
            vizGroups: [
              {
                vizGroup: 'test-group',
                scopes: {
                  all: ['viz-group:admin'],
                  granted: ['viz-group:admin'],
                },
              },
            ],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    const { container } = render(await DashboardGroupsSettingsPage());

    expect(container).toMatchSnapshot();
  });
});

describe('create button permissions', () => {
  it('shows create button to admin user', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: TENANT,
            scopes: {
              all: [],
              granted: ['tenant:admin', 'viz-group:admin'],
            },
            projects: [],
            groups: [],
            vizGroups: [],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    render(await DashboardGroupsSettingsPage());

    expect(screen.getByTestId(CREATE_BUTTON_ID)).toBeVisible();
  });

  it('does not show create button to non-admin user', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryScopesMock.mockResolvedValueOnce({
      data: {
        tenants: [
          {
            tenant: TENANT,
            scopes: {
              all: [],
              granted: ['tenant:read'],
            },
            projects: [],
            groups: [],
            vizGroups: [],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    render(await DashboardGroupsSettingsPage());

    expect(screen.queryByTestId(CREATE_BUTTON_ID)).not.toBeInTheDocument();
  });
});
