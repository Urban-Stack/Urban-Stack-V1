import ProjectSettingsLayout from '@/app/settings/projects/[tenant]/[projectname]/layout';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
  fetchTenantDisplayName,
} from '@/app/_lib/resource-api/graphql/tenant';
import { FuncMock } from '@/app/_test/utils';
import { render } from '@testing-library/react';
import { notFound, useParams, usePathname } from 'next/navigation';

const useParamsMock: FuncMock<typeof useParams> =
  useParams as unknown as jest.Mock;

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;

const getScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
  fetchTenantDisplayName: jest.fn(),
}));

const tenantNameMock: FuncMock<typeof fetchTenantDisplayName> =
  fetchTenantDisplayName as unknown as jest.Mock;

const notFoundMock = notFound as jest.MockedFunction<() => never>;
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

beforeEach(() => {
  getScopesMock.mockReset();
  tenantNameMock.mockReset();
  notFoundMock.mockReset();
  useParamsMock.mockReset();
  usePathnameMock.mockReset();

  getScopesMock.mockResolvedValue({
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
                granted: ['project:admin'],
              },
            },
          ],
          groups: [],
        },
      ],
    },
  } as unknown as AllTenantAndProjectScopes);

  useParamsMock.mockReturnValue({
    tenant: 'test-tenant',
    projectname: 'test-project',
  });

  usePathnameMock.mockReturnValue('/');
});

describe('permissions', () => {
  const renderLayout = async () => {
    tenantNameMock.mockResolvedValueOnce('Test Tenant');
    return render(
      await ProjectSettingsLayout({
        children: [],
        params: Promise.resolve({
          tenant: 'test-tenant',
          projectname: 'test-project',
        }),
      }),
    );
  };

  it('does not redirect when given sufficient permissions', async () => {
    await renderLayout();

    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('redirects when attempting to load the layout with insufficient permissions', async () => {
    getScopesMock.mockResolvedValueOnce({
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
                  granted: ['project:read'],
                },
              },
            ],
            groups: [],
          },
        ],
      },
    } as unknown as AllTenantAndProjectScopes);

    await renderLayout();

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
