import { render } from '@testing-library/react';
import UserGroupsSettingsPage from '@/app/settings/usergroups/page';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import UserGroupList from '@/app/settings/usergroups/UserGroupList';
import {
  AllTenantAndProjectScopes,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { mutate, query } from '@/app/_lib/resource-api/client';
import React from 'react';

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';
const TENANT = 'test-tenant';
const TEST_SCOPES = {
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
        groups: [
          {
            group: 'test-group',
            scopes: {
              all: ['group:admin'],
              granted: ['group:admin'],
            },
          },
        ],
      },
    ],
  },
} as unknown as AllTenantAndProjectScopes;

jest.mock('@/app/meta', () => ({
  mkMetadata: jest.fn(),
}));

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('@/app/settings/usergroups/actions', () => ({
  createUserGroup: jest.fn(),
}));

jest.mock('@/app/settings/usergroups/UserGroupList', () =>
  jest.fn(() => <div>list of user groups</div>),
);

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/tenant', () => ({
  GetAllTenantAndProjectScopes: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-usergroup-search-bar' />),
}));

const queryScopesMock: FuncMock<typeof GetAllTenantAndProjectScopes> =
  GetAllTenantAndProjectScopes as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));
const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  getPublicEnvMock.mockReset();
  queryScopesMock.mockReset();
  requireTenantMock.mockReset();
  mockQuery.mockReset();
  mockMutate.mockReset();
});

describe('snapshot', () => {
  it('renders page as expected', async () => {
    requireTenantMock.mockResolvedValue(TENANT);
    queryScopesMock.mockResolvedValue(TEST_SCOPES);

    const { container } = render(await UserGroupsSettingsPage());

    expect(container).toMatchSnapshot();
  });
});

describe('subcomponents', () => {
  it('calls UserGroupList with correct Keycloak URL', async () => {
    getPublicEnvMock.mockImplementationOnce((name) =>
      name === 'KEYCLOAK_URI' ? TEST_KEYCLOAK_URL : '',
    );

    requireTenantMock.mockResolvedValue(TENANT);
    queryScopesMock.mockResolvedValue(TEST_SCOPES);

    render(await UserGroupsSettingsPage());

    expect(UserGroupList).toHaveBeenCalledWith(
      {
        keycloakBaseUrl: TEST_KEYCLOAK_URL,
        scopes: TEST_SCOPES,
        tenant: TENANT,
        isTenantAdmin: true,
      },
      undefined,
    );
  });
});
