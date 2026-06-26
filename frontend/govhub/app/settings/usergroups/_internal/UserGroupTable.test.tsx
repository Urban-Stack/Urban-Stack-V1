import { screen, within } from '@testing-library/react';
import UserGroupTable from '@/app/settings/usergroups/_internal/UserGroupTable';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { UserGroupTableTestIds as TestIds } from '@/app/settings/usergroups/testIds';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import { TEST_USER_GROUPS } from '@/app/_test/graphql/data.util';
import {
  deleteUserGroup,
  shareUserGroup,
  unshareUserGroup,
} from '@/app/settings/usergroups/actions';
import { UdpToast } from 'udp-ui/components';
import { FuncMock } from '@/app/_test/utils';
import { AllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { redirect, useSearchParams } from 'next/navigation';
import { createRender } from 'udp-ui/test-utils';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const KEYCLOAK_URL = 'https://keycloak.example.com';
const USER_GROUP = TEST_USER_GROUPS[0];
const TENANT = 'test-tenant';

const mkScopes = (groupScope: Scope) =>
  ({
    data: {
      tenants: [
        {
          tenant: 'test-tenant',
          scopes: {
            all: ['tenant:admin'],
            granted: ['tenant:admin'],
          },
          projects: [],
          groups: [
            {
              group: 'test-group',
              scopes: {
                all: [groupScope],
                granted: [groupScope],
              },
            },
          ],
        },
      ],
    },
  }) as unknown as AllTenantAndProjectScopes;

const UdpToastMock = UdpToast as unknown as jest.Mock;
const deleteUserGroupMock: FuncMock<typeof deleteUserGroup> =
  deleteUserGroup as unknown as jest.Mock;
const shareUserGroupMock: FuncMock<typeof shareUserGroup> =
  shareUserGroup as unknown as jest.Mock;
const unshareUserGroupMock: FuncMock<typeof unshareUserGroup> =
  unshareUserGroup as unknown as jest.Mock;
const redirectMock = redirect as unknown as jest.Mock;

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpToast: jest.fn(),
}));

jest.mock('@/app/settings/usergroups/actions', () => ({
  deleteUserGroup: jest.fn(),
  toggleIsGroupShared: jest.fn(),
  shareUserGroup: jest.fn(),
  unshareUserGroup: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

beforeEach(() => {
  UdpToastMock.mockReset().mockImplementation((_, type) =>
    type === 'error' ? errorToastMock : successToastMock,
  );
  successToastMock.mockReset();
  errorToastMock.mockReset();

  deleteUserGroupMock.mockReset();
  shareUserGroupMock.mockReset();
  unshareUserGroupMock.mockReset();

  redirectMock.mockReset();

  useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
});

const renderTable = createRender(UserGroupTable, {
  userGroups: [...TEST_USER_GROUPS],
  keycloakBaseUrl: KEYCLOAK_URL,
  scopes: mkScopes('group:admin'),
  tenant: TENANT,
  isTenantAdmin: true,
});

describe('snapshot', () => {
  it('renders list overview as expected', () => {
    const { container } = renderTable();

    expect(container).toMatchSnapshot();
  });

  it('usergroup list entry matches snapshot when enabled', () => {
    renderTable({ userGroups: [USER_GROUP], isTenantAdmin: true });
    const [_thead, tbody] = screen.getAllByRole('rowgroup');

    const row = within(tbody).getByRole('row');
    expect(row).toHaveClass('cursor-pointer');
    expect(row).toMatchSnapshot();
  });

  it('usergroup list entry matches snapshot when disabled', () => {
    const readOnlyGroup = {
      ...USER_GROUP,
      ...{ scopes: { granted: ['group:view'] } },
    } as UserGroup;
    renderTable({ userGroups: [readOnlyGroup], isTenantAdmin: false });
    const [_thead, tbody] = screen.getAllByRole('rowgroup');

    const row = within(tbody).getByRole('row');
    expect(row).not.toHaveClass('cursor-pointer');
    expect(row).toMatchSnapshot();
  });
});

describe('content', () => {
  it('user group list table contains as many entries as user groups given', () => {
    renderTable({ userGroups: [...TEST_USER_GROUPS] });

    const items = screen.queryAllByTestId(TestIds.row);
    expect(items).toHaveLength(TEST_USER_GROUPS.length);
  });
});

describe('navigation', () => {
  const ADMIN_TEST_CASES = [
    {
      testCase: 'group admin only',
      props: { scopes: mkScopes('group:admin'), isTenantAdmin: false },
    },
    {
      testCase: 'tenant admin only',
      props: { scopes: mkScopes('group:view'), isTenantAdmin: true },
    },
    {
      testCase: 'group admin and tenant admin',
      props: { scopes: mkScopes('group:admin'), isTenantAdmin: true },
    },
  ];

  describe('click', () => {
    it.each(ADMIN_TEST_CASES)(
      'click on table row redirects to corresponding usergroup page ($testCase)',
      async ({ props }) => {
        renderTable({ userGroups: [USER_GROUP], ...props });
        const [_thead, tbody] = screen.getAllByRole('rowgroup');

        await USER.click(within(tbody).getByRole('row'));

        expect(redirectMock).toHaveBeenCalledWith(
          `/settings/usergroups/${USER_GROUP.tenant}/${USER_GROUP.name}`,
        );
      },
    );

    it('click on table row does not redirect for non-admins', async () => {
      const readOnlyGroup = {
        ...USER_GROUP,
        ...{ scopes: { granted: ['group:view'] } },
      } as UserGroup;
      renderTable({ userGroups: [readOnlyGroup], isTenantAdmin: false });

      await USER.click(screen.getAllByRole('row')[0]);

      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe('key', () => {
    it.each(ADMIN_TEST_CASES)(
      'enter on table row redirects to corresponding usergroup page ($testCase)',
      async ({ props }) => {
        renderTable({ userGroups: [USER_GROUP], ...props });
        const [_thead, tbody] = screen.getAllByRole('rowgroup');

        within(tbody).getByRole('row').focus();
        await USER.keyboard('{Enter}');

        expect(redirectMock).toHaveBeenCalledWith(
          `/settings/usergroups/${USER_GROUP.tenant}/${USER_GROUP.name}`,
        );
      },
    );

    it('enter on table row does not redirect for non-admins', async () => {
      const readOnlyGroup = {
        ...USER_GROUP,
        ...{ scopes: { granted: ['group:view'] } },
      } as UserGroup;
      renderTable({ userGroups: [readOnlyGroup], isTenantAdmin: false });

      screen.getAllByRole('row')[0].focus();
      await USER.keyboard('{Enter}');

      expect(redirectMock).not.toHaveBeenCalled();
    });

    it.each(ADMIN_TEST_CASES)(
      'space on table row redirects to corresponding usergroup page ($testCase)',
      async ({ props }) => {
        renderTable({ userGroups: [USER_GROUP], ...props });
        const [_thead, tbody] = screen.getAllByRole('rowgroup');

        within(tbody).getByRole('row').focus();
        await USER.keyboard(' ');

        expect(redirectMock).toHaveBeenCalledWith(
          `/settings/usergroups/${USER_GROUP.tenant}/${USER_GROUP.name}`,
        );
      },
    );

    it('space on table row does not redirect for non-admins', async () => {
      const readOnlyGroup = {
        ...USER_GROUP,
        ...{ scopes: { granted: ['group:view'] } },
      } as UserGroup;
      renderTable({ userGroups: [readOnlyGroup], isTenantAdmin: false });

      screen.getAllByRole('row')[0].focus();
      await USER.keyboard(' ');

      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe('link', () => {
    it('click on admin area link does not trigger redirect', async () => {
      renderTable({ scopes: mkScopes('group:admin'), isTenantAdmin: true });

      const adminAreaLink = screen.getAllByTestId(TestIds.adminAreaLink)[0];
      await USER.click(adminAreaLink);

      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('enter on admin area link does not trigger redirect', async () => {
      renderTable({ scopes: mkScopes('group:admin'), isTenantAdmin: true });

      const adminAreaLink = screen.getAllByTestId(TestIds.adminAreaLink)[0];
      adminAreaLink.focus();
      await USER.keyboard('{Enter}');

      expect(redirectMock).not.toHaveBeenCalled();
    });
  });
});

describe('columns', () => {
  const queryColumnHeader = (name: string) =>
    screen.queryByRole('columnheader', { name });

  describe('scope', () => {
    const scopeTestCases: {
      testCase: string;
      grantedScopes: Scope[];
      expectedLabel: string;
    }[] = [
      {
        testCase: 'admin scope',
        grantedScopes: ['group:admin'],
        expectedLabel: 'Admin',
      },
      {
        testCase: 'view scope only',
        grantedScopes: ['group:view'],
        expectedLabel: 'Betrachter',
      },
      {
        testCase: 'all scopes',
        grantedScopes: ['group:admin', 'group:view'],
        expectedLabel: 'Admin',
      },
      {
        testCase: 'no scopes',
        grantedScopes: [],
        expectedLabel: 'Betrachter',
      },
    ];
    it.each(scopeTestCases)(
      'shows scope label "$expectedLabel" for user group having $testCase',
      ({ grantedScopes, expectedLabel }) => {
        const testGroup: UserGroup = {
          ...USER_GROUP,
          ...{ scopes: { granted: grantedScopes } },
        };

        renderTable({ userGroups: [testGroup] });

        const scopesCell = screen.queryByTestId(TestIds.scopes);
        expect(scopesCell).toHaveTextContent(expectedLabel);
      },
    );
  });

  describe('member', () => {
    it('has no member initial state', () => {
      renderTable({ userGroups: [USER_GROUP] });

      const shared = screen.queryByTestId(TestIds.member);
      expect(shared).toBeEmptyDOMElement();
    });

    it('has member initial state', () => {
      renderTable({ userGroups: [{ ...USER_GROUP, isMember: true }] });

      const shared = screen.getByTestId(TestIds.member);
      expect(shared).not.toBeEmptyDOMElement();
    });
  });

  const ADMIN_SCOPE_TEST_CASES = [
    {
      testCase: 'tenant admin only',
      props: { scopes: mkScopes('group:read'), isTenantAdmin: true },
    },
    {
      testCase: 'group admin only',
      props: { scopes: mkScopes('group:admin'), isTenantAdmin: false },
    },
    {
      testCase: 'tenant admin and group admin',
      props: { scopes: mkScopes('group:admin'), isTenantAdmin: true },
    },
  ];

  describe('share', () => {
    it('has unshared initial state', () => {
      renderTable({ userGroups: [USER_GROUP] });

      const sharedHeader = queryColumnHeader('Geteilt');
      expect(sharedHeader).toBeInTheDocument();
      const sharedCell = screen.getByTestId(TestIds.shared);
      expect(sharedCell).toBeEmptyDOMElement();
    });

    it('has shared initial state', () => {
      renderTable({ userGroups: [{ ...USER_GROUP, isShared: true }] });

      const sharedHeader = queryColumnHeader('Geteilt');
      expect(sharedHeader).toBeInTheDocument();
      const sharedCell = screen.getByTestId(TestIds.shared);
      expect(sharedCell).not.toBeEmptyDOMElement();
    });

    it.each(ADMIN_SCOPE_TEST_CASES)(
      'shows shared column if user is $testCase',
      ({ props }) => {
        renderTable({ userGroups: [USER_GROUP], ...props });

        const sharedHeader = queryColumnHeader('Geteilt');
        expect(sharedHeader).toBeInTheDocument();
        const sharedCell = screen.queryByTestId(TestIds.shared);
        expect(sharedCell).toBeInTheDocument();
      },
    );

    it('does not show shared column if user is neither tenant nor group admin', () => {
      renderTable({ scopes: mkScopes('group:read'), isTenantAdmin: false });

      const sharedHeader = queryColumnHeader('Geteilt');
      expect(sharedHeader).not.toBeInTheDocument();
      const sharedCell = screen.queryByTestId(TestIds.shared);
      expect(sharedCell).not.toBeInTheDocument();
    });
  });

  describe('admin area', () => {
    it.each(ADMIN_SCOPE_TEST_CASES)(
      'shows external link to admin area if user is $testCase',
      ({ props }) => {
        renderTable({
          keycloakBaseUrl: KEYCLOAK_URL,
          userGroups: [USER_GROUP],
          ...props,
        });

        const adminAreaLink = screen.queryByTestId(TestIds.adminAreaLink);
        expect(adminAreaLink).toHaveAttribute(
          'href',
          `${KEYCLOAK_URL}/admin/udh/console/#/udh/groups/${USER_GROUP.keycloakGroupPath}`,
        );
        expect(adminAreaLink).toHaveAttribute('target', '_blank');
        expect(adminAreaLink).toBeInTheDocument();
      },
    );

    it('does not show external link to admin area for non-admins', () => {
      const readOnlyGroup = {
        ...USER_GROUP,
        ...{ scopes: { granted: ['group:view'] } },
      } as UserGroup;
      renderTable({ userGroups: [readOnlyGroup], isTenantAdmin: false });

      const adminAreaLink = screen.queryByTestId(TestIds.adminAreaLink);
      expect(adminAreaLink).not.toBeInTheDocument();
    });
  });
});

describe('user group search', () => {
  it('Filters user groups by names matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=group-2'));
    renderTable({ userGroups: [...TEST_USER_GROUPS] });
    const items = screen.queryAllByTestId(TestIds.row);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('test-group-2');
  });

  it('Filters user groups by tenant matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('?search=tenant-1'),
    );
    renderTable({ userGroups: [...TEST_USER_GROUPS] });
    const items = screen.queryAllByTestId(TestIds.row);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('test-tenant-1');
    expect(items[1]).toHaveTextContent('test-tenant-1');
  });

  it('Lists no user groups when none match the search parameter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=xyz'));
    renderTable({ userGroups: [...TEST_USER_GROUPS] });
    const items = screen.queryAllByTestId(TestIds.row);
    expect(items).toHaveLength(0);
  });
});
