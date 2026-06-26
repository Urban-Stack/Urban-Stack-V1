import { queryByRole, render } from '@testing-library/react';
import ProjectSettingsPage from '@/app/settings/projects/page';
import { FuncMock } from '@/app/_test/utils';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
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

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-project-search-bar' />),
}));

const queryScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

describe('snapshot', () => {
  it('renders page as expected', async () => {
    queryScopesMock.mockResolvedValue({
      data: {
        tenants: [
          {
            tenant: 'test-tenant',
            scopes: {
              all: ['tenant:admin'],
              granted: ['tenant:admin'],
            },
            projects: [
              {
                project: 'test-project',
                scopes: {
                  all: ['project:admin'],
                  granted: ['project:admin'],
                },
              },
            ],
            groups: [],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    const { container } = render(await ProjectSettingsPage());
    expect(container).toMatchSnapshot();
  });
});

describe('user without permissions cannot see create button', () => {
  it('does not show create button without permissions', async () => {
    queryScopesMock.mockResolvedValue({
      data: {
        tenants: [
          {
            tenant: 'test-tenant',
            scopes: {
              all: [],
              granted: [],
            },
            projects: [
              {
                project: 'test-project',
                scopes: {
                  all: [],
                  granted: [],
                },
              },
            ],
            groups: [],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    const { container } = render(await ProjectSettingsPage());

    const button = queryByRole(container, 'button', { name: 'Neues Projekt' });

    expect(button).toBeNull();
    expect(button).not.toBeInTheDocument();
  });
});
