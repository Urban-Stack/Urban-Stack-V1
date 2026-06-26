import { act, render, RenderResult, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import {
  queryVizGroupGroupPermissions,
  VizGroupGroupPermissions,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  UserGroupPermissionTableTestIds as TableTestIds,
  UserGroupShareButtonTestIds as ShareTestIds,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { mockQueryAllUserGroups } from '@/app/_test/graphql/mock.util';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { TEST_USER_GROUPS } from '@/app/_test/graphql/data.util';
import SharedUserGroupsPage from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/page';

const TEST_TENANT_NAME = 'test-tenant';
const TEST_VIZ_GROUP_NAME = 'test-viz-group';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions',
  () => ({
    addVizGroupPermission: jest.fn(),
    updateVizGroupPermission: jest.fn(),
  }),
);

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const queryVizGroupGroupPermissionsMock: FuncMock<
  typeof queryVizGroupGroupPermissions
> = queryVizGroupGroupPermissions as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  queryVizGroupGroupPermissions: jest.fn(),
}));

const queryAllUserGroupsMock: FuncMock<typeof queryAllUserGroups> =
  queryAllUserGroups as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  queryAllUserGroups: jest.fn(),
}));
const mockUserGroups = mockQueryAllUserGroups(
  queryAllUserGroupsMock,
  TEST_TENANT_NAME,
);

beforeEach(() => {
  getPublicEnvMock.mockReset();
  queryVizGroupGroupPermissionsMock.mockReset();
  queryAllUserGroupsMock.mockReset();
});

type UserGroupPermission = {
  name: string;
  groupPrincipals: { group: string; tenant: string }[];
};

const mockVizGroupGroupPermissions = (
  groupPermissions: UserGroupPermission[],
  error?: CombinedGraphQLErrors,
) => {
  queryVizGroupGroupPermissionsMock.mockResolvedValueOnce({
    data: {
      project: {
        permissions: groupPermissions,
      },
    },
    error: error,
  } as unknown as VizGroupGroupPermissions);
};

const createPermission: (
  name: string,
  userGroups: UserGroup[],
) => UserGroupPermission = (name, userGroups) => ({
  name: name,
  scopes: [],
  groupPrincipals: userGroups.map((group) => ({
    tenant: group.tenant,
    group: group.name,
  })),
});

const renderComponent: () => Promise<RenderResult> = async () =>
  render(
    await SharedUserGroupsPage({
      params: Promise.resolve({
        tenant: TEST_TENANT_NAME,
        vizgroup: TEST_VIZ_GROUP_NAME,
      }),
    }),
  );

describe('snapshot', () => {
  it('renders page as expected', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);
    mockVizGroupGroupPermissions([
      createPermission('admin', [TEST_USER_GROUPS[0]]),
      createPermission('read', [TEST_USER_GROUPS[2], TEST_USER_GROUPS[3]]),
    ]);

    const { container } = await renderComponent();

    expect(container).toMatchSnapshot();
  });
});

describe('share', () => {
  it('viz-group can be shared with user groups not already shared', async () => {
    const tenant = { tenant: TEST_TENANT_NAME };
    const allGroups = TEST_USER_GROUPS.map((g) => ({ ...g, ...tenant }));
    const sharedGroups = [allGroups[1]];
    const expectedGroups = allGroups.filter((g) => !sharedGroups.includes(g));
    mockUserGroups(allGroups);
    mockVizGroupGroupPermissions([createPermission('admin', sharedGroups)]);

    const component = await renderComponent();

    const shareButton = component.getByRole('button', { name: /Freigeben/ });
    act(() => shareButton.click());

    const userGroupSelect = component.getByTestId(ShareTestIds.userGroupSelect);
    expect(within(userGroupSelect).getAllByRole('option')).toHaveLength(
      expectedGroups.length,
    );
    expectedGroups.forEach((group) =>
      expect(userGroupSelect).toHaveTextContent(group.name),
    );
  });
});

describe('content', () => {
  const expectFallback: (
    component: RenderResult,
    title: string,
    description: string,
  ) => void = (component, title, description) => {
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(title);
    expect(fallback).toHaveTextContent(description);
  };

  it('shared user groups overview contains entries for those user groups having viz-group permission', async () => {
    const groupPermissions = [
      createPermission('admin', [TEST_USER_GROUPS[0]]),
      createPermission('read', [TEST_USER_GROUPS[2], TEST_USER_GROUPS[3]]),
    ];
    mockUserGroups([...TEST_USER_GROUPS]);
    mockVizGroupGroupPermissions(groupPermissions);

    const sharedGroupsCount = groupPermissions.flatMap(
      (p) => p.groupPrincipals,
    ).length;
    expect(sharedGroupsCount).toBeLessThan(TEST_USER_GROUPS.length); // ensure filtering is covered

    const component = await renderComponent();

    const table = component.getByTestId(TableTestIds.self);
    expect(table).toBeVisible();
    const tableRows = within(table).queryAllByTestId(TableTestIds.row);
    expect(tableRows).toHaveLength(sharedGroupsCount);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
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
      testCase: 'error occurs when retrieving viz-group user group permissions',
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
      mockVizGroupGroupPermissions(
        groupPermissions.groupPermissions,
        groupPermissions.error,
      );

      const component = await renderComponent();

      expectFallback(
        component,
        'Freigegebene Benutzergruppen konnten nicht geladen werden',
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
      );
      const table = component.queryByTestId(TableTestIds.self);
      expect(table).not.toBeInTheDocument();
    },
  );

  it('shows "Unknown permissions" fallback if shared user groups exist but any has unknown permission', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);
    mockVizGroupGroupPermissions([
      createPermission('test-unknown', [TEST_USER_GROUPS[0]]),
      createPermission('test-more-unknown', [
        TEST_USER_GROUPS[1],
        TEST_USER_GROUPS[2],
      ]),
    ]);

    const component = await renderComponent();

    expectFallback(
      component,
      'Es gibt unbekannte, freigegebene Benutzergruppen',
      'Bitte kontaktieren Sie einen Administrator mit Zugriff auf die Resource API.',
    );
    const table = component.queryByTestId(TableTestIds.self);
    expect(table).not.toBeInTheDocument();
  });

  const noSharedUserGroupsTestCases = [
    {
      testCase: 'no user group permissions',
      groupPermissions: [],
    },
    {
      testCase: 'no user group permission has any principals',
      groupPermissions: [
        createPermission('admin', []),
        createPermission('read', []),
      ],
    },
  ];
  it.each(noSharedUserGroupsTestCases)(
    'shows "No shared user groups" fallback if $testCase',
    async ({ groupPermissions }) => {
      mockUserGroups([...TEST_USER_GROUPS]);
      mockVizGroupGroupPermissions(groupPermissions);

      const component = await renderComponent();

      expectFallback(
        component,
        'Noch keine freigegebenen Benutzergruppen vorhanden',
        'Sie können die Dashboardgruppe hier für eine Benutzergruppe freigeben.',
      );
      const table = component.queryByTestId(TableTestIds.self);
      expect(table).not.toBeInTheDocument();
    },
  );
});
