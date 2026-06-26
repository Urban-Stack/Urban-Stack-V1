import { render, RenderResult, within } from '@testing-library/react';
import { FuncMock } from '@/app/_test/utils';
import { NetworkStatus } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { UserGroupTableTestIds as TestIds } from '@/app/settings/usergroups/testIds';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import UserGroupList from '@/app/settings/usergroups/UserGroupList';
import { queryAllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { mockQueryAllUserGroups } from '@/app/_test/graphql/mock.util';
import { TEST_USER_GROUPS } from '@/app/_test/graphql/data.util';
import { AllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { useSearchParams } from 'next/navigation';

jest.mock('@/app/settings/usergroups/actions', () => ({
  toggleIsGroupShared: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const TEST_TENANT = 'test-tenant';
const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';
const TEST_SCOPES = {
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
              all: ['group:admin'],
              granted: ['group:admin'],
            },
          },
        ],
        vizGroups: [],
      },
    ],
  },
  loading: false,
  networkStatus: NetworkStatus.ready,
} as unknown as AllTenantAndProjectScopes;

const queryAllUserGroupsMock: FuncMock<typeof queryAllUserGroups> =
  queryAllUserGroups as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  queryAllUserGroups: jest.fn(),
}));
const mockUserGroups = mockQueryAllUserGroups(
  queryAllUserGroupsMock,
  TEST_TENANT,
);
const useSearchParamsMock = useSearchParams as jest.Mock;

const renderComponent: () => Promise<RenderResult> = async () =>
  render(
    await UserGroupList({
      keycloakBaseUrl: TEST_KEYCLOAK_URL,
      scopes: TEST_SCOPES,
      tenant: TEST_TENANT,
      isTenantAdmin: true,
    }),
  );

beforeEach(() => {
  queryAllUserGroupsMock.mockReset();
  useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);

    const { container } = await renderComponent();

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('user groups overview contains as many list entries as user groups retrieved', async () => {
    mockUserGroups([...TEST_USER_GROUPS]);

    const component = await renderComponent();

    const table = component.getByTestId(TestIds.self);
    expect(table).toBeVisible();
    const tableRows = within(table).queryAllByTestId(TestIds.row);
    expect(tableRows).toHaveLength(TEST_USER_GROUPS.length);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows "No user groups" fallback if no user groups retrieved', async () => {
    mockUserGroups([]);

    const component = await renderComponent();

    const table = component.queryByTestId(TestIds.self);
    expect(table).not.toBeInTheDocument();
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Noch keine Benutzergruppen vorhanden');
    expect(fallback).toHaveTextContent(
      'Sie können hier eine neue Benutzergruppe erstellen.',
    );
  });

  it('shows "Fetch error" fallback if error occurs when retrieving user groups', async () => {
    mockUserGroups(
      undefined,
      new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    );

    const component = await renderComponent();

    const table = component.queryByTestId(TestIds.self);
    expect(table).not.toBeInTheDocument();
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent(
      'Benutzergruppen konnten nicht geladen werden',
    );
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});
