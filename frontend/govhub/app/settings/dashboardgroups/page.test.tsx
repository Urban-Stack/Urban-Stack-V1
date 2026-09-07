import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardGroupsSettingsPage from '@/app/settings/dashboardgroups/page';
import { FuncMock } from '@/app/_test/utils';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
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
  queryHasTenantScope: jest.fn(),
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

const queryHasTenantScopeMock = queryHasTenantScope as unknown as jest.Mock;

beforeEach(() => {
  requireTenantMock.mockReset();
  queryHasTenantScopeMock.mockReset();
});

describe('snapshot', () => {
  it('renders page as expected', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryHasTenantScopeMock.mockResolvedValue(true);

    const { container } = render(await DashboardGroupsSettingsPage());

    expect(container).toMatchSnapshot();
  });
});

describe('create button permissions', () => {
  it('shows create button to admin user', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryHasTenantScopeMock.mockResolvedValue(true);

    render(await DashboardGroupsSettingsPage());

    expect(screen.getByTestId(CREATE_BUTTON_ID)).toBeVisible();
  });

  it('does not show create button to non-admin user', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryHasTenantScopeMock.mockResolvedValue(false);

    render(await DashboardGroupsSettingsPage());

    expect(screen.queryByTestId(CREATE_BUTTON_ID)).not.toBeInTheDocument();
  });
});
