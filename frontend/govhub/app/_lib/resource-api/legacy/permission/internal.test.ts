import { auth } from '@/auth';
import { getPublicEnv } from '@/app/_lib/env';
import { Session } from 'next-auth';
import { FuncMock, TEST_SESSION } from '@/app/_test/utils';
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
  deletePermission,
  getPermissions,
  PermissionDeleteResponse,
  PermissionResponse,
  setPermission,
} from '@/app/_lib/resource-api/legacy/permission/internal';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

const { permissionUrl, permissionsUrl, resourceUrl, requestPayload } =
  _internal;

const TEST_TENANT_NAME = 'test-tenant';
const TEST_VIZ_GROUP_NAME = 'test-viz-group';
const TEST_DASHBOARD_NAME = 'test-dashboard';
const TEST_PERMISSION_NAME = 'test-perm';
const TEST_SCOPES: Scope[] = ['tenant:admin', 'group:view'] as const;
const TEST_PRINCIPALS: Principal[] = [
  mkTenantPrincipal(TEST_TENANT_NAME),
  mkGroupPrincipal(TEST_TENANT_NAME, 'test-group'),
];
const TEST_RESOURCE = mkTenantResource(TEST_TENANT_NAME);

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));
const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;

const mockedFetch = jest.fn();

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';

beforeAll(() => {
  getPublicEnvMock.mockImplementation(() => TEST_KEYCLOAK_URL);
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  global.fetch = mockedFetch;
});

beforeEach(() => {
  mockedFetch.mockReset();
});

describe('getPermissions', () => {
  it('retrieves permissions of user for resource', async () => {
    const mockResponse: PermissionResponse[] = [
      {
        name: TEST_PERMISSION_NAME,
        principals: TEST_PRINCIPALS,
        scopes: TEST_SCOPES,
      },
    ];
    mockedFetch.mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    }));

    const response = await getPermissions(TEST_RESOURCE);

    const expectedUrl = permissionsUrl(TEST_KEYCLOAK_URL)(TEST_RESOURCE);
    expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
    expect(auth).toHaveBeenCalled();
    expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TEST_SESSION.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    expect(response).toEqual(mockResponse);
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
    expect(response).toEqual(mockResponse);
  });
});

describe('deletePermissions', () => {
  it('deletes given permission for given resource', async () => {
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
    expect(response).toEqual(mockResponse);
  });
});

describe('permissionsUrl', () => {
  it('returns correct permissions URL for tenant', () => {
    const tenant = mkTenantResource(TEST_TENANT_NAME);

    const url = permissionsUrl(TEST_KEYCLOAK_URL)(tenant);

    expect(url).toEqual(
      `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT_NAME}/permissions`,
    );
  });

  it('returns correct permissions URL for viz-group', () => {
    const vizGroup = mkVizGroupResource(TEST_TENANT_NAME, TEST_VIZ_GROUP_NAME);

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
    const vizGroup = mkVizGroupResource(TEST_TENANT_NAME, TEST_VIZ_GROUP_NAME);

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

describe('requestPayload', () => {
  const p1_tenantName = 'principal1-tenant';
  const p2_tenantName = 'principal2-tenant';
  const p2_groupName = 'principal2-group';

  it('returns correct payload object', () => {
    const principal1 = mkTenantPrincipal(p1_tenantName);
    const principal2 = mkGroupPrincipal(p2_tenantName, p2_groupName);
    const permission = mkPermission(TEST_PERMISSION_NAME, TEST_SCOPES, [
      principal1,
      principal2,
    ]);

    const payload = requestPayload(permission);

    expect(payload).toEqual(
      JSON.stringify({
        scopes: TEST_SCOPES,
        principals: [
          {
            tenant: p1_tenantName,
            _tag: 'tenant',
          },
          {
            tenant: p2_tenantName,
            group: p2_groupName,
            _tag: 'group',
          },
        ],
      }),
    );
  });
});
