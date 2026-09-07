import { queryByRole, render } from '@testing-library/react';
import ProjectSettingsPage from '@/app/settings/projects/page';
import { FuncMock } from '@/app/_test/utils';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import React from 'react';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock('@/app/settings/projects/actions', () => ({
  createProject: jest.fn(),
}));

jest.mock('@/app/settings/projects/ProjectList', () =>
  jest.fn(() => <div>list of projects</div>),
);

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  queryHasTenantScope: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-project-search-bar' />),
}));

const queryHasTenantScopeMock = queryHasTenantScope as unknown as jest.Mock;

describe('snapshot', () => {
  it('renders page as expected', async () => {
    requireTenantMock.mockResolvedValue('test-tenant');
    queryHasTenantScopeMock.mockResolvedValue(true);

    const { container } = render(await ProjectSettingsPage());
    expect(container).toMatchSnapshot();
  });
});

describe('user without permissions cannot see create button', () => {
  it('does not show create button without permissions', async () => {
    requireTenantMock.mockResolvedValue('test-tenant');
    queryHasTenantScopeMock.mockResolvedValue(false);

    const { container } = render(await ProjectSettingsPage());

    const button = queryByRole(container, 'button', { name: 'Neues Projekt' });

    expect(button).toBeNull();
    expect(button).not.toBeInTheDocument();
  });
});
