import ProjectSettingsLayout from '@/app/settings/projects/[tenant]/[projectname]/layout';
import {
  fetchTenantDisplayName,
  queryHasTenantScope,
} from '@/app/_lib/resource-api/graphql/tenant';
import { FuncMock } from '@/app/_test/utils';
import { render } from '@testing-library/react';
import { notFound, useParams, usePathname } from 'next/navigation';
import { getPublicEnv } from '@/app/_lib/env';
import { queryHasProjectScope } from '@/app/_lib/resource-api/graphql/project';

const useParamsMock: FuncMock<typeof useParams> =
  useParams as unknown as jest.Mock;

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;

const queryHasTenantScopeMock: FuncMock<typeof queryHasTenantScope> =
  queryHasTenantScope as unknown as jest.Mock;
const queryHasProjectScopeMock: FuncMock<typeof queryHasProjectScope> =
  queryHasProjectScope as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  fetchTenantDisplayName: jest.fn(),
  queryHasTenantScope: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  queryHasProjectScope: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

beforeAll(() => {
  getPublicEnvMock.mockReturnValue('something');
});

const tenantNameMock: FuncMock<typeof fetchTenantDisplayName> =
  fetchTenantDisplayName as unknown as jest.Mock;

const notFoundMock = notFound as jest.MockedFunction<() => never>;
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(),
}));

beforeEach(() => {
  tenantNameMock.mockReset();
  notFoundMock.mockReset();
  useParamsMock.mockReset();
  usePathnameMock.mockReset();
  queryHasTenantScopeMock.mockResolvedValue(true);
  queryHasProjectScopeMock.mockReset();

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
    queryHasProjectScopeMock.mockResolvedValue(true);
    await renderLayout();

    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('redirects when attempting to load the layout with insufficient permissions', async () => {
    queryHasProjectScopeMock.mockResolvedValue(false);
    await renderLayout();

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
