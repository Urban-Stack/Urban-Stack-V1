import { auth } from '@/auth';
import { getPublicEnv } from '@/app/_lib/env';
import {
  deletePermission,
  getPermissions,
  hasScope,
  hasTenantAdminScope,
  setPermission,
} from '@/app/_lib/resource-api/legacy/permission/index';
import { Session } from 'next-auth';
import { FuncMock, mkFetchError, TEST_SESSION } from '@/app/_test/utils';
import {
  mkGroupPrincipal,
  mkPermission,
  mkTenantPrincipal,
  Principal,
} from '@/app/_lib/resource-api/legacy/permission/types';
import {
  mkDashboardResource,
  mkTenantResource,
  mkVizGroupResource,
} from '@/app/_lib/resource-api/legacy/resources';
import {
  _internal,
  PermissionDeleteResponse,
  PermissionResponse,
} from '@/app/_lib/resource-api/legacy/permission/internal';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

const { permissionUrl, permissionsUrl, resourceUrl, requestPayload } =
  _internal;

const TEST_TENANT = 'test-tenant';
const TEST_PERMISSION_NAME = 'test-perm';
const TEST_SCOPES: Scope[] = ['tenant:admin', 'group:view'] as const;
const TEST_PRINCIPALS: Principal[] = [
  mkTenantPrincipal(TEST_TENANT),
  mkGroupPrincipal(TEST_TENANT, 'test-group'),
];
const TEST_RESOURCE = mkTenantResource(TEST_TENANT);

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));
const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;

const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const mockedFetch = jest.fn();

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';

beforeAll(() => {
  getPublicEnvMock.mockImplementation(() => TEST_KEYCLOAK_URL);
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  global.fetch = mockedFetch;
});

beforeEach(() => {
  requireTenantMock.mockReset();
  mockedFetch.mockReset();
});

const expectPermissionsRequested: (url: string) => void = (url) => {
  expect(mockedFetch).toHaveBeenCalledWith(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TEST_SESSION.accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

const mockPermissionResponsesFromScopes: (scopesList: Scope[][]) => void = (
  scopesList,
) =>
  mockedFetch.mockImplementation(async () => ({
    ok: true,
    status: 200,
    json: async () =>
      scopesList.map((scopes, index) => ({
        name: 'permission' + index,
        scopes: scopes,
        principals: TEST_PRINCIPALS,
      })),
  }));

describe('getPermissions', () => {
  it('retrieves permissions of user for resource', async () => {
    const mockResponse: PermissionResponse[] = [
      {
        name: TEST_PERMISSION_NAME,
        scopes: TEST_SCOPES,
        principals: TEST_PRINCIPALS,
      },
    ];
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    }));

    const response = await getPermissions(TEST_RESOURCE);

    expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
    expect(auth).toHaveBeenCalled();
    expectPermissionsRequested(
      permissionsUrl(TEST_KEYCLOAK_URL)(TEST_RESOURCE),
    );
    expect(response.data).toEqual(mockResponse);
  });
});

describe('hasScope', () => {
  const TEST_SCOPE: Scope = 'tenant:admin';
  const otherScopes = ['tenant:view', 'group:admin'];

  it.each([
    {
      testCase: 'scope is included in any permission',
      scopesList: [otherScopes, [TEST_SCOPE]] as Scope[][],
      expected: true,
    },
    {
      testCase: 'scope is not included in any permission',
      scopesList: [otherScopes, ['dashboard:view']] as Scope[][],
      expected: false,
    },
  ])(
    `returns $expected if $testCase of the user for the given resource`,
    async ({ scopesList, expected }) => {
      mockPermissionResponsesFromScopes(scopesList);

      const result = await hasScope(TEST_SCOPE, TEST_RESOURCE);

      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(auth).toHaveBeenCalled();
      expectPermissionsRequested(
        permissionsUrl(TEST_KEYCLOAK_URL)(TEST_RESOURCE),
      );
      expect(result).toBe(expected);
    },
  );

  it('returns false if permission request results in 403 Forbidden', async () => {
    const fetchError = mkFetchError(403, 'Forbidden');
    mockedFetch.mockRejectedValue(fetchError);

    const result = await hasScope(TEST_SCOPE, TEST_RESOURCE);

    expect(result).toBeFalsy();
  });

  it('throws error if permission request fails due to any non-Forbidden error response', async () => {
    const fetchError = mkFetchError(404, 'Not Found');
    mockedFetch.mockRejectedValue(fetchError);

    await expect(hasScope(TEST_SCOPE, TEST_RESOURCE)).rejects.toThrow(
      fetchError,
    );
  });
});

describe('hasTenantAdminScope', () => {
  const TENANT_ADMIN_SCOPE: Scope = 'tenant:admin';
  const otherScopes = ['tenant:view', 'group:admin'];

  it.each([
    {
      testCase: 'tenant admin scope is included in any permission',
      scopesList: [otherScopes, [TENANT_ADMIN_SCOPE]] as Scope[][],
      expected: true,
    },
    {
      testCase: 'tenant admin scope is not included in any permission',
      scopesList: [otherScopes, ['dashboard:view']] as Scope[][],
      expected: false,
    },
  ])(
    `returns $expected if $testCase of the user`,
    async ({ scopesList, expected }) => {
      requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
      mockPermissionResponsesFromScopes(scopesList);

      const result = await hasTenantAdminScope();

      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(auth).toHaveBeenCalled();
      expectPermissionsRequested(
        permissionsUrl(TEST_KEYCLOAK_URL)(mkTenantResource(TEST_TENANT)),
      );
      expect(result).toBe(expected);
    },
  );

  it('returns false if permission request results in 403 Forbidden', async () => {
    const fetchError = mkFetchError(403, 'Forbidden');
    mockedFetch.mockRejectedValue(fetchError);

    const result = await hasTenantAdminScope();

    expect(result).toBeFalsy();
  });

  it('throws error if permission request fails due to any non-Forbidden error response', async () => {
    const fetchError = mkFetchError(404, 'Not Found');
    mockedFetch.mockRejectedValue(fetchError);

    await expect(hasTenantAdminScope()).rejects.toThrow(fetchError);
  });
});

describe('setPermissions', () => {
  it('puts user permission to given scopes and principals', async () => {
    const mockResponse: PermissionResponse = {
      name: TEST_PERMISSION_NAME,
      scopes: TEST_SCOPES,
      principals: TEST_PRINCIPALS,
    };
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      status: 201,
      json: async () => mockResponse,
    }));
    const permission = mkPermission(
      TEST_PERMISSION_NAME,
      TEST_SCOPES,
      TEST_PRINCIPALS,
    );

    const response = await setPermission(permission, TEST_RESOURCE);

    const expectedUrl = permissionUrl(TEST_KEYCLOAK_URL)(
      permission,
      TEST_RESOURCE,
    );
    expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
    expect(auth).toHaveBeenCalled();
    expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TEST_SESSION.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: requestPayload(permission),
    });
    expect(response.data).toEqual(mockResponse);
  });
});

describe('deletePermission', () => {
  it('deletes user permission for specific resource', async () => {
    const mockResponse: PermissionDeleteResponse = {};
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      status: 204,
      json: async () => mockResponse,
    }));
    const permission = mkPermission(
      TEST_PERMISSION_NAME,
      TEST_SCOPES,
      TEST_PRINCIPALS,
    );

    const response = await deletePermission(permission, TEST_RESOURCE);

    const expectedUrl = permissionUrl(TEST_KEYCLOAK_URL)(
      permission,
      TEST_RESOURCE,
    );
    expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
    expect(auth).toHaveBeenCalled();
    expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TEST_SESSION.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    expect(response.data).toEqual(mockResponse);
  });
});

describe('internal', () => {
  const TEST_TENANT_NAME = 'test-tenant';
  const TEST_VIZ_GROUP_NAME = 'test-viz-group';
  const TEST_DASHBOARD_NAME = 'test-dashboard';

  describe('permissionsUrl', () => {
    it('returns correct permissions URL for tenant', () => {
      const tenant = mkTenantResource(TEST_TENANT_NAME);

      const url = permissionsUrl(TEST_KEYCLOAK_URL)(tenant);

      expect(url).toEqual(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/permissions`,
      );
    });

    it('returns correct permissions URL for viz-group', () => {
      const vizGroup = mkVizGroupResource(
        TEST_TENANT_NAME,
        TEST_VIZ_GROUP_NAME,
      );

      const url = permissionsUrl(TEST_KEYCLOAK_URL)(vizGroup);

      expect(url).toEqual(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/viz-groups/${TEST_VIZ_GROUP_NAME}/permissions`,
      );
    });

    it('returns correct permissions URL for dashboard', () => {
      const dashboard = mkDashboardResource(
        TEST_TENANT_NAME,
        TEST_VIZ_GROUP_NAME,
        TEST_DASHBOARD_NAME,
      );

      const url = permissionsUrl(TEST_KEYCLOAK_URL)(dashboard);

      expect(url).toEqual(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/viz-groups/${TEST_VIZ_GROUP_NAME}/dashboards/${TEST_DASHBOARD_NAME}/permissions`,
      );
    });
  });

  describe('permissionUrl', () => {
    describe('resourceUrl', () => {
      it('returns correct resource URL for tenant', () => {
        const tenant = mkTenantResource(TEST_TENANT_NAME);

        const url = resourceUrl(TEST_KEYCLOAK_URL)(tenant);

        expect(url).toEqual(
          `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}`,
        );
      });
    });

    it('returns correct resource URL for viz-group', () => {
      const vizGroup = mkVizGroupResource(
        TEST_TENANT_NAME,
        TEST_VIZ_GROUP_NAME,
      );

      const url = resourceUrl(TEST_KEYCLOAK_URL)(vizGroup);

      expect(url).toEqual(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/viz-groups/${TEST_VIZ_GROUP_NAME}`,
      );
    });

    it('returns correct resource URL for dashboard', () => {
      const dashboard = mkDashboardResource(
        TEST_TENANT_NAME,
        TEST_VIZ_GROUP_NAME,
        TEST_DASHBOARD_NAME,
      );

      const url = resourceUrl(TEST_KEYCLOAK_URL)(dashboard);

      expect(url).toEqual(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/viz-groups/${TEST_VIZ_GROUP_NAME}/dashboards/${TEST_DASHBOARD_NAME}`,
      );
    });
  });
});
