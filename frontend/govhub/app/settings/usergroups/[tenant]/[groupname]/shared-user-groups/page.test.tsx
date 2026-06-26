import {
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import SharedGroupsPage from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/page';
import {
  queryAllUserGroups,
  queryUserGroupPermissions,
  UserGroupPermissions,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  ShareGroupTableTestIds as TableTestIds,
  UserGroupShareTestIds as ShareTestIds,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { mockQueryAllUserGroups } from '@/app/_test/graphql/mock.util';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { TEST_USER_GROUPS } from '@/app/_test/graphql/data.util';
import userEvent from '@testing-library/user-event';

const USER = userEvent.setup();

const TENANT = 'test-tenant';
const GROUP_NAME = 'test-group-name';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions',
  () => ({
    addUserGroupPermission: jest.fn(),
    updateUserGroupPermission: jest.fn(),
  }),
);

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const queryAllUserGroupsMock: FuncMock<typeof queryAllUserGroups> =
  queryAllUserGroups as unknown as jest.Mock;
const queryUserGroupPermissionsMock: FuncMock<
  typeof queryUserGroupPermissions
> = queryUserGroupPermissions as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  queryAllUserGroups: jest.fn(),
  queryUserGroupPermissions: jest.fn(),
}));

beforeEach(() => {
  queryAllUserGroupsMock.mockReset();
  queryUserGroupPermissionsMock.mockReset();
});

type GroupPermission = {
  name: string;
  groupPrincipals: { group: string; tenant: string }[];
};

const createPermission: (
  name: string,
  groups: UserGroup[],
) => GroupPermission = (name, groups) => ({
  name: name,
  scopes: [],
  groupPrincipals: groups.map((group) => ({
    tenant: group.tenant,
    group: group.name,
  })),
});

const mockUserGroupPermissions = (
  groupPermissions: GroupPermission[],
  error?: CombinedGraphQLErrors,
) => {
  queryUserGroupPermissionsMock.mockResolvedValueOnce({
    data: {
      group: {
        permissions: groupPermissions,
      },
    },
    error: error,
  } as UserGroupPermissions);
};

const mockUserGroups = mockQueryAllUserGroups(queryAllUserGroupsMock, TENANT);

const renderPage: (
  tenant?: string,
  groupName?: string,
) => Promise<RenderResult> = async (tenant = TENANT, groupName = GROUP_NAME) =>
  render(
    await SharedGroupsPage({
      params: Promise.resolve({
        tenant: tenant,
        groupname: groupName,
      }),
    }),
  );

describe('snapshot', () => {
  it('renders page as expected', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);
    mockUserGroupPermissions([
      createPermission('admin', [TEST_USER_GROUPS[0]]),
      createPermission('read', [TEST_USER_GROUPS[2], TEST_USER_GROUPS[3]]),
    ]);

    const { container } = await renderPage();

    expect(container).toMatchSnapshot();
  });
});

describe('share', () => {
  it('user group can be shared with other user groups not already shared', async () => {
    const tenant = { tenant: TENANT };
    const allGroups = TEST_USER_GROUPS.map((g) => ({ ...g, ...tenant }));
    const currentGroup = allGroups[1];
    const sharedGroups = [allGroups[2]];
    const expectedGroups = allGroups.filter(
      (g) => ![currentGroup, ...sharedGroups].includes(g),
    );
    mockUserGroups(allGroups);
    mockUserGroupPermissions([createPermission('admin', sharedGroups)]);

    await renderPage(currentGroup.tenant, currentGroup.name);

    const shareButton = screen.getByRole('button', { name: /Freigeben/ });
    await USER.click(shareButton);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());

    const userGroupSelect = screen.getByTestId(ShareTestIds.userGroupSelect);
    expect(userGroupSelect).not.toHaveTextContent(currentGroup.name);
    expect(userGroupSelect).not.toHaveTextContent(sharedGroups[0].name);
    expectedGroups.forEach((group) =>
      expect(userGroupSelect).toHaveTextContent(group.name),
    );
    expect(within(userGroupSelect).getAllByRole('option')).toHaveLength(
      expectedGroups.length,
    );
  });
});

describe('content', () => {
  const expectFallback: (title: string, description: string) => void = (
    title,
    description,
  ) => {
    const fallback = screen.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(title);
    expect(fallback).toHaveTextContent(description);
  };

  it('shared groups overview contains entries for those user groups having user group permission', async () => {
    const groupPermissions = [
      createPermission('admin', [TEST_USER_GROUPS[0]]),
      createPermission('read', [TEST_USER_GROUPS[2], TEST_USER_GROUPS[3]]),
    ];
    mockUserGroups([...TEST_USER_GROUPS]);
    mockUserGroupPermissions(groupPermissions);

    const sharedGroupsCount = groupPermissions.flatMap(
      (p) => p.groupPrincipals,
    ).length;
    expect(sharedGroupsCount).toBeLessThan(TEST_USER_GROUPS.length); // ensure filtering is covered

    await renderPage();

    const table = screen.getByTestId(TableTestIds.self);
    expect(table).toBeVisible();
    const tableRows = within(table).queryAllByTestId(TableTestIds.row);
    expect(tableRows).toHaveLength(sharedGroupsCount);
    const fallback = screen.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).not.toBeInTheDocument();
  });

  const fetchErrorTestCases = [
    {
      testCase: 'error occurs when retrieving user groups',
      userGroups: {
        groups: [],
        error: new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
      },
      groupPermissions: { groupPermissions: [] },
    },
    {
      testCase: 'error occurs when retrieving user group permissions',
      userGroups: { groups: [...TEST_USER_GROUPS] },
      groupPermissions: {
        groupPermissions: [],
        error: new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
      },
    },
  ];
  it.each(fetchErrorTestCases)(
    'shows "Fetch error" fallback if $testCase',
    async ({ userGroups, groupPermissions }) => {
      mockUserGroups(userGroups.groups, userGroups.error);
      mockUserGroupPermissions(
        groupPermissions.groupPermissions,
        groupPermissions.error,
      );

      await renderPage();

      expectFallback(
        'Freigegebene Gruppen konnten nicht geladen werden',
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
      );
      const table = screen.queryByTestId(TableTestIds.self);
      expect(table).not.toBeInTheDocument();
    },
  );

  it('shows "Unknown permissions" fallback if shared groups exist but any has unknown permission', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);
    mockUserGroupPermissions([
      createPermission('test-unknown', [TEST_USER_GROUPS[0]]),
      createPermission('test-more-unknown', [
        TEST_USER_GROUPS[1],
        TEST_USER_GROUPS[2],
      ]),
    ]);

    await renderPage();

    expectFallback(
      'Es gibt unbekannte, freigegebene Gruppen',
      'Bitte kontaktieren Sie einen Administrator mit Zugriff auf die Resource API.',
    );
    const table = screen.queryByTestId(TableTestIds.self);
    expect(table).not.toBeInTheDocument();
  });

  const noSharedGroupsTestCases = [
    {
      testCase: 'no group permissions',
      groupPermissions: [],
    },
    {
      testCase: 'no group permission has any principals',
      groupPermissions: [
        createPermission('admin', []),
        createPermission('read', []),
      ],
    },
  ];
  it.each(noSharedGroupsTestCases)(
    'shows "No shared groups" fallback if $testCase',
    async ({ groupPermissions }) => {
      mockUserGroups([...TEST_USER_GROUPS]);
      mockUserGroupPermissions(groupPermissions);

      await renderPage();

      expectFallback(
        'Noch keine freigegebenen Gruppen vorhanden',
        'Sie können die Benutzergruppe hier für eine andere Benutzergruppe freigeben.',
      );
      const table = screen.queryByTestId(TableTestIds.self);
      expect(table).not.toBeInTheDocument();
    },
  );
});
