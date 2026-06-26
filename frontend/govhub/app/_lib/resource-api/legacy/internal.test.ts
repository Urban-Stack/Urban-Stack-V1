import {
  _internal,
  createDashboard,
  deleteDashboard,
  fetchPrimaryTenant,
  fetchTenantMeta,
} from './internal';
import { getPublicEnv } from '@/app/_lib/env';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { FuncMock, TEST_SESSION } from '@/app/_test/utils';
import { ZodError } from 'zod';
import { CreateDashboardResponse } from '@/app/_lib/resource-api/legacy/types';
import { DEFAULT_THEME } from 'udp-ui/theme';
import { fetchTenantMemberships } from '@/app/_lib/resource-api/graphql/tenantMemberships';

const { fetchTenants, fetchAttributes, fetchTenantAttributes } = _internal;

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/graphql/tenantMemberships', () => ({
  fetchTenantMemberships: jest.fn(),
}));

const mockedFetch = jest.fn();
const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

const fetchTenantMembershipsMock: FuncMock<typeof fetchTenantMemberships> =
  fetchTenantMemberships as unknown as jest.Mock;

const TEST_KEYCLOAK_URL = 'https://keycloak.example.com';

beforeAll(() => {
  global.fetch = mockedFetch;
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  getPublicEnvMock.mockImplementation(() => TEST_KEYCLOAK_URL);
});

beforeEach(() => {
  mockedFetch.mockReset();
});

describe('Resource API', () => {
  describe('fetchTenants', () => {
    it('should fetch tenants successfully', async () => {
      const mockTenants = ['tenant1', 'tenant2'];
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTenants,
      });

      const tenants = await fetchTenants();

      expect(auth).toHaveBeenCalled();
      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/`,
        {
          headers: {
            Authorization: `Bearer ${TEST_SESSION.accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
      expect(tenants).toEqual(mockTenants);
    });
  });

  describe('fetchAttributes', () => {
    it('should fetch attributes successfully for a given tenant', async () => {
      const tenant = 'tenant1';
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => DEFAULT_THEME,
      });

      const attributes = await fetchAttributes(tenant);

      expect(auth).toHaveBeenCalled();
      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_KEYCLOAK_URL}/data-hub/tenants/${tenant}/attributes`,
        {
          headers: {
            Authorization: `Bearer ${TEST_SESSION.accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        },
      );
      expect(attributes).toEqual(DEFAULT_THEME);
    });
  });

  describe('fetchPrimaryTenant', () => {
    it('should fetch the primary tenant successfully', async () => {
      const mockTenants = ['tenant1', 'tenant2'];
      fetchTenantMembershipsMock.mockResolvedValue(mockTenants);

      const primaryTenant = await fetchPrimaryTenant();

      expect(primaryTenant).toEqual(mockTenants[0]);
    });

    it('throws an error if the tenant list is empty', async () => {
      fetchTenantMembershipsMock.mockResolvedValue([]);

      await expect(fetchPrimaryTenant()).rejects.toThrow(
        new Error('Array is empty'),
      );
    });
  });

  describe('fetchTenantAttributes', () => {
    it('returns JSON response for the primary tenant', async () => {
      const response = { foo: 'bar' };
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => response,
      });
      fetchTenantMembershipsMock.mockResolvedValue(['tenant1', 'tenant2']);

      await expect(fetchTenantAttributes()).resolves.toEqual(response);
    });

    it('throws if fetchPrimaryTenant fails', async () => {
      const error = new Error('No primary tenant');
      fetchTenantMembershipsMock.mockRejectedValue(error);

      await expect(fetchTenantAttributes()).rejects.toThrow(error);
    });

    it('throws if fetchAttributes fails', async () => {
      const error = new Error('Error fetching attributes');
      fetchTenantMembershipsMock.mockResolvedValue(['tenant1', 'tenant2']);
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw error;
        },
      });

      await expect(fetchTenantAttributes()).rejects.toThrow(error);
    });
  });

  describe('fetchTenantMeta', () => {
    it('throws if parse fails', async () => {
      fetchTenantMembershipsMock.mockResolvedValue(['tenant1', 'tenant2']);
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 'tenant-image': 123 }),
      });

      await expect(fetchTenantMeta()).rejects.toThrow(ZodError);
    });

    it('returns parsed response', async () => {
      const valid = {
        'tenant-image': 'image.jpg',
        'tenant-name': 'Tenant',
      };
      fetchTenantMembershipsMock.mockResolvedValue(['tenant1', 'tenant2']);
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => valid,
      });

      await expect(fetchTenantMeta()).resolves.toEqual(valid);
    });
  });

  describe('createDashboard', () => {
    const TEST_TENANT = 'testTenant';
    const TEST_VIZ_GROUP = 'testVizGroup';
    const TEST_NAME = 'testDashboardTitle';

    const TEST_TITLE = 'Test Dashboard Title';

    it('creates dashboard for given tenant, viz-group and name', async () => {
      const mockResponse: CreateDashboardResponse = {
        slug: `${TEST_TITLE}_${TEST_VIZ_GROUP}_${TEST_NAME}`,
        dashboardName: TEST_NAME,
      };
      mockedFetch.mockImplementation(async () => ({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }));

      const response = await createDashboard(
        TEST_TENANT,
        TEST_VIZ_GROUP,
        TEST_TITLE,
      );

      const expectedUrl = `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT}/viz-groups/${TEST_VIZ_GROUP}/create-dashboard`;
      expect(auth).toHaveBeenCalled();
      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: `{"title":"${TEST_TITLE}"}`,
      });
      expect(response).toEqual(mockResponse);
    });
  });

  describe('deleteDashboard', () => {
    const TEST_TENANT = 'testTenant';
    const TEST_VIZ_GROUP = 'testVizGroup';
    const TEST_NAME = 'testDashboardName';

    it('deletes dashboard for given tenant, viz-group and dashboard name', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        body: null,
      };
      mockedFetch.mockImplementation(async () => mockResponse);

      const response = await deleteDashboard(
        TEST_TENANT,
        TEST_VIZ_GROUP,
        TEST_NAME,
      );

      const expectedUrl = `${TEST_KEYCLOAK_URL}/data-hub/tenants/${TEST_TENANT}/viz-groups/${TEST_VIZ_GROUP}/dashboards/${TEST_NAME}`;
      expect(auth).toHaveBeenCalled();
      expect(getPublicEnv).toHaveBeenCalledWith('AUTH_KEYCLOAK_ISSUER');
      expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          Authorization: `Bearer ${TEST_SESSION.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      });
      expect(response).toEqual(mockResponse);
    });
  });
});
