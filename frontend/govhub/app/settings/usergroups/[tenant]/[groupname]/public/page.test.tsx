import { render, RenderResult, screen } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { mockQueryAllUserGroups } from '@/app/_test/graphql/mock.util';
import {
  TEST_USER_GROUPS,
  TEST_USER_GROUPS_SHARED,
} from '@/app/_test/graphql/data.util';
import UserGroupPage from '@/app/settings/usergroups/[tenant]/[groupname]/public/page';
import { PublicUserGroupTestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/public/testIds';
import { stateUnshareUserGroup } from '@/app/settings/usergroups/actions';
import { toUserGroups } from '@/app/_lib/resource-api/usergroups/usergroups';
import { notFound } from 'next/navigation';

const TENANT_NAME = 'test-tenant-1';
const GROUP_NAME = 'test-group-1';

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const queryAllUserGroupsMock: FuncMock<typeof queryAllUserGroups> =
  queryAllUserGroups as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  queryAllUserGroups: jest.fn(),
}));

const toUserGroupsMock = toUserGroups as jest.Mock;
jest.mock('@/app/_lib/resource-api/usergroups/usergroups', () => ({
  toUserGroups: jest.fn(),
}));

const stateUnshareUserGroupMock = stateUnshareUserGroup as unknown as FuncMock<
  typeof stateUnshareUserGroup
>;
jest.mock('@/app/settings/usergroups/actions', () => ({
  stateUnshareUserGroup: jest.fn(),
}));

const notFoundMock = notFound as jest.MockedFunction<() => never>;
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

const mockUserGroups = mockQueryAllUserGroups(
  queryAllUserGroupsMock,
  TENANT_NAME,
);

beforeEach(() => {
  queryAllUserGroupsMock.mockReset();
  toUserGroupsMock.mockReset();

  stateUnshareUserGroupMock.mockReset();
});

const renderPage: (
  tenant: string,
  groupname: string,
) => Promise<RenderResult> = async (tenant, groupname) =>
  render(
    await UserGroupPage({ params: Promise.resolve({ tenant, groupname }) }),
  );

describe('snapshot', () => {
  it('renders page as expected', async () => {
    mockUserGroups([...TEST_USER_GROUPS_SHARED]);
    toUserGroupsMock.mockReturnValueOnce(TEST_USER_GROUPS_SHARED);

    const { container } = await renderPage(TENANT_NAME, GROUP_NAME);

    expect(container).toMatchSnapshot();
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

  it('shows fallback if usergroup is not shared', async () => {
    const nonSharedUserGroup = {
      ...TEST_USER_GROUPS[0],
      ...{ isShared: false },
    };
    mockUserGroups([nonSharedUserGroup]);
    toUserGroupsMock.mockReturnValueOnce([nonSharedUserGroup]);

    await renderPage(TENANT_NAME, nonSharedUserGroup.name);

    expectFallback(
      `Benutzergruppe ist nur für den Mandanten "${TENANT_NAME}" sichtbar`,
      'Sie können diese Benutzergruppe hier für alle Mandanten sichtbar machen.',
    );
    const table = screen.queryByTestId(PublicUserGroupTestIds.info);
    expect(table).not.toBeInTheDocument();
  });

  it('calls notFound if requested usergroup does not exist', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);
    toUserGroupsMock.mockReturnValueOnce([...TEST_USER_GROUPS]);

    await renderPage(TENANT_NAME, 'non-existing-group-name');

    expect(notFoundMock).toHaveBeenCalled();
  });
});
