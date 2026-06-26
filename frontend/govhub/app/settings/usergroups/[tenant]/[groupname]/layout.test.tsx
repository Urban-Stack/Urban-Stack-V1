import { fetchTenantDisplayName } from '@/app/_lib/resource-api/graphql/tenant';
import { FuncMock } from '@/app/_test/utils';
import { render } from '@testing-library/react';
import { notFound, usePathname } from 'next/navigation';
import UserGroupLayout from '@/app/settings/usergroups/[tenant]/[groupname]/layout';
import {
  queryUserGroupScopes,
  UserGroupScopes,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import { UdpTabs } from 'udp-ui/components';
import { Breakpoint } from 'udp-ui/tailwind';
import { mkUserGroupHref } from '@/app/settings/usergroups/_internal/util';

const TENANT = 'test-tenant';
const GROUP_NAME = 'test-group-name';

const fetchTenantDisplayNameMock: FuncMock<typeof fetchTenantDisplayName> =
  fetchTenantDisplayName as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  fetchTenantDisplayName: jest.fn(),
}));

const notFoundMock = notFound as jest.MockedFunction<() => never>;
const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  usePathname: jest.fn(),
}));

const queryUserGroupScopesMock = queryUserGroupScopes as unknown as FuncMock<
  typeof queryUserGroupScopes
>;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  queryUserGroupScopes: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpTabs: jest.fn(),
}));

beforeEach(() => {
  fetchTenantDisplayNameMock.mockReset();
  notFoundMock.mockReset();
  usePathnameMock.mockReset().mockReturnValue('/');
});

const mockQueryUserGroupScopes = (scopes: Scope[], error?: Error) =>
  queryUserGroupScopesMock.mockResolvedValueOnce({
    data: {
      group: {
        scopes: {
          all: scopes,
          granted: scopes,
        },
      },
    },
    error: error,
  } as UserGroupScopes);

const renderLayout = async (
  tenant: string = TENANT,
  groupname: string = GROUP_NAME,
) =>
  render(
    await UserGroupLayout({
      children: [],
      params: Promise.resolve({ tenant, groupname }),
    }),
  );

describe('content', () => {
  beforeEach(() => {
    mockQueryUserGroupScopes(['group:admin']);
  });

  it('has correct texts', async () => {
    const tenantDisplayName = 'Test Tenant Display Name';
    fetchTenantDisplayNameMock.mockResolvedValueOnce(tenantDisplayName);

    const { getByText } = await renderLayout('test-tenant', 'test-group');

    expect(getByText('Zurück zur Übersicht')).toBeInTheDocument();
    expect(getByText(tenantDisplayName)).toBeInTheDocument();
    expect(getByText('Test-Group')).toBeInTheDocument();
  });

  it('has correct tabs', async () => {
    const activeTabIdx = 0;
    const expectedTabs = {
      'Freigabe Benutzergruppen': `${mkUserGroupHref(TENANT, GROUP_NAME)}/shared-user-groups`,
      Teilen: `${mkUserGroupHref(TENANT, GROUP_NAME)}/public`,
      'Danger Zone': `${mkUserGroupHref(TENANT, GROUP_NAME)}/danger-zone`,
    };
    usePathnameMock.mockReturnValue(Object.values(expectedTabs)[activeTabIdx]);

    await renderLayout(TENANT, GROUP_NAME);

    expect(UdpTabs).toHaveBeenCalledWith(
      expect.objectContaining({
        tabsData: expectedTabs,
        activeLabel: Object.keys(expectedTabs)[activeTabIdx],
        breakpoint: Breakpoint.md,
      }),
      undefined,
    );
  });
});

describe('access', () => {
  it('does not show error page if user has admin scope for group', async () => {
    mockQueryUserGroupScopes(['group:admin']);

    await renderLayout();

    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('shows error page if user does not have admin scope for group', async () => {
    mockQueryUserGroupScopes(['group:read', 'group:view']);

    await renderLayout();

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('shows error page if requesting user group scopes fails', async () => {
    mockQueryUserGroupScopes(['group:admin', 'group:read'], new Error('error'));

    await renderLayout();

    expect(notFoundMock).toHaveBeenCalled();
  });
});
