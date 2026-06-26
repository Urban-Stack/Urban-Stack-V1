import { act, render, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import ShareVizGroups from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/page';
import {
  ProjectVizGroupPermissions,
  queryProjectVizGroupPermissions,
} from '@/app/_lib/resource-api/graphql/project';
import { queryAllVizGroups } from '@/app/_lib/resource-api/graphql/vizGroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  GroupTableTestIds,
  VizGroupShareTestIds as ShareTestIds,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { mockQueryAllVizGroups } from '@/app/_test/graphql/mock.util';
import { TEST_VIZ_GROUPS } from '@/app/_test/graphql/data.util';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';

const TEST_TENANT_NAME = 'test-tenant';
const TEST_PROJECT_NAME = 'test-project';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

jest.mock(
  '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions',
  () => ({
    addProjectPermission: jest.fn(),
  }),
);

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  queryProjectVizGroupPermissions: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  queryAllVizGroups: jest.fn(),
}));

const queryProjectVizGroupPermissionsMock: FuncMock<
  typeof queryProjectVizGroupPermissions
> = queryProjectVizGroupPermissions as unknown as jest.Mock;

const queryAllVizGroupsMock: FuncMock<typeof queryAllVizGroups> =
  queryAllVizGroups as unknown as jest.Mock;

const mockVizGroups = mockQueryAllVizGroups(
  queryAllVizGroupsMock,
  TEST_TENANT_NAME,
);

beforeEach(() => {
  queryProjectVizGroupPermissionsMock.mockReset();
  queryAllVizGroupsMock.mockReset();
});

type VizGroupPermission = {
  name: string;
  vizGroupPrincipals: { tenant: string; vizGroup: string }[];
};

const mockProjectVizGroupPermissions = (
  groupPermissions: VizGroupPermission[],
  error?: CombinedGraphQLErrors,
) => {
  queryProjectVizGroupPermissionsMock.mockResolvedValueOnce({
    data: {
      project: {
        permissions: groupPermissions,
      },
    },
    error: error,
  } as unknown as ProjectVizGroupPermissions);
};

const createPermission: (groups: VizGroup[]) => VizGroupPermission = (
  groups,
) => ({
  name: 'viz-group-read',
  vizGroupPrincipals: groups.map((group) => ({
    tenant: group.tenant,
    vizGroup: group.name,
  })),
});

const renderComponent = async () =>
  render(
    await ShareVizGroups({
      params: Promise.resolve({
        tenant: TEST_TENANT_NAME,
        projectname: TEST_PROJECT_NAME,
      }),
    }),
  );

describe('pseudo snapshot', () => {
  it('renders page as expected', async () => {
    mockVizGroups([...TEST_VIZ_GROUPS]);
    mockProjectVizGroupPermissions([createPermission([TEST_VIZ_GROUPS[0]])]);

    const component = await renderComponent();

    const shareBtn = component.getByRole('button', { name: /Freigeben/ });
    expect(shareBtn).toBeInTheDocument();

    const table = component.getByTestId(GroupTableTestIds.self);
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Name')).toBeInTheDocument();
    expect(within(table).getByText('Mandant')).toBeInTheDocument();

    const row = component.getByTestId(GroupTableTestIds.row);
    expect(row).toBeInTheDocument();
    expect(within(row).getByText('test-group-1')).toBeInTheDocument();
    expect(within(row).getByText('test-tenant-1')).toBeInTheDocument();
  });
});

describe('share', () => {
  it('project can be shared with viz groups not already shared', async () => {
    const tenant = { tenant: TEST_TENANT_NAME };
    const allGroups = TEST_VIZ_GROUPS.map((g) => ({ ...g, ...tenant }));
    const sharedGroups = [allGroups[1]];
    const expectedGroups = allGroups.filter((g) => !sharedGroups.includes(g));
    mockVizGroups(allGroups);
    mockProjectVizGroupPermissions([createPermission(sharedGroups)]);

    const component = await renderComponent();
    const shareButton = component.getByRole('button', { name: /Freigeben/ });
    act(() => shareButton.click());

    const vizGroupSelect = component.getByTestId(ShareTestIds.vizGroupSelect);
    expect(within(vizGroupSelect).getAllByRole('option')).toHaveLength(
      expectedGroups.length,
    );
    expectedGroups.forEach((group) =>
      expect(vizGroupSelect).toHaveTextContent(group.name),
    );
  });
});

describe('content', () => {
  it('displays correct shared viz groups', async () => {
    mockVizGroups([...TEST_VIZ_GROUPS]);
    mockProjectVizGroupPermissions([
      createPermission([TEST_VIZ_GROUPS[0]]),
      createPermission([TEST_VIZ_GROUPS[2], TEST_VIZ_GROUPS[3]]),
    ]);

    const component = await renderComponent();

    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows fallback if no shared groups exist', async () => {
    mockVizGroups([...TEST_VIZ_GROUPS]);
    mockProjectVizGroupPermissions([createPermission([])]);

    const component = await renderComponent();

    const fallback = component.getByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Noch keine freigegebenen Gruppen vorhanden',
    );
  });

  it('shows error fallback if query fails', async () => {
    mockVizGroups([]);
    mockProjectVizGroupPermissions(
      [],
      new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    );

    const component = await renderComponent();

    const fallback = component.getByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Freigegebene Gruppen konnten nicht geladen werden',
    );
  });
});
