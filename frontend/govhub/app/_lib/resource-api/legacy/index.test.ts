import {
  createDashboard as _createDashboard,
  deleteDashboard as _deleteDashboard,
  fetchPrimaryTenant,
  fetchTenantMeta,
} from '@/app/_lib/resource-api/legacy/internal';
import {
  createDashboard,
  deleteDashboard,
  requireTenant,
  requireTenantMeta,
} from '@/app/_lib/resource-api/legacy/index';
import { FuncMock, mkFetchError } from '@/app/_test/utils';
import { generateMock } from '@anatine/zod-mock';
import { CreateDashboardResponse } from '@/app/_lib/resource-api/legacy/types';

const fetchPrimaryTenantMock = fetchPrimaryTenant as unknown as FuncMock<
  typeof fetchPrimaryTenant
>;
const fetchTenantMetaMock = fetchTenantMeta as unknown as FuncMock<
  typeof fetchTenantMeta
>;
const createDashboardMock = _createDashboard as unknown as FuncMock<
  typeof _createDashboard
>;
const deleteDashboardMock = _deleteDashboard as unknown as FuncMock<
  typeof _deleteDashboard
>;

jest.mock('@/app/_lib/resource-api/legacy/internal', () => ({
  fetchTheme: jest.fn(),
  fetchPrimaryTenant: jest.fn(),
  fetchTenantMeta: jest.fn(),
  createDashboard: jest.fn(),
  deleteDashboard: jest.fn(),
}));

beforeEach(() => {
  fetchPrimaryTenantMock.mockReset();
  fetchTenantMetaMock.mockReset();
  createDashboardMock.mockReset();
  deleteDashboardMock.mockReset();
});

describe('requireTenant', () => {
  it('throws if fetch throws an error', async () => {
    const error = new Error('Network error');
    fetchPrimaryTenantMock.mockRejectedValue(error);

    await expect(requireTenant()).rejects.toThrow(error);
  });

  it('returns tenant if successfully fetched', async () => {
    const tenantName = 'tenant1';
    fetchPrimaryTenantMock.mockResolvedValueOnce(Promise.resolve(tenantName));

    const tenant = await requireTenant();
    expect(tenant).toEqual(tenantName);
  });
});

describe('requireTenantMeta', () => {
  it('returns empty object if fetch throws an error', async () => {
    fetchTenantMetaMock.mockRejectedValue(new Error('Network error'));

    const meta = await requireTenantMeta();
    expect(meta).toEqual({});
  });

  it('returns meta if successfully fetched', async () => {
    const metaExpected = {
      'tenant-image': '/image-url',
      'tenant-name': 'tenant1',
    };
    fetchTenantMetaMock.mockResolvedValueOnce(metaExpected);

    const meta = await requireTenantMeta();
    expect(meta).toEqual(metaExpected);
  });
});

describe('createDashboard', () => {
  const ANY_TENANT = 'ANY_TENANT';
  const ANY_VIZ_GROUP = 'ANY_VIZ_GROUP';
  const ANY_TITLE = 'ANY_TITLE';

  it('throws on error that is not a FetchError', async () => {
    const error = new Error('Network error');
    createDashboardMock.mockRejectedValue(error);

    await expect(() =>
      createDashboard(ANY_TENANT, ANY_VIZ_GROUP, ANY_TITLE),
    ).rejects.toThrow(error);
  });

  it('returns parsed response with error if FetchError is thrown', async () => {
    const fetchError = mkFetchError(409, 'Conflict');
    createDashboardMock.mockRejectedValue(fetchError);

    const response = await createDashboard(
      ANY_TENANT,
      ANY_VIZ_GROUP,
      ANY_TITLE,
    );

    expect(response.data).toBeUndefined();
    expect(response.error).toEqual(fetchError);
  });

  it('returns created dashboard response on success', async () => {
    const responseExpected = generateMock(CreateDashboardResponse);
    createDashboardMock.mockResolvedValueOnce(
      Promise.resolve(responseExpected),
    );

    const response = await createDashboard(
      ANY_TENANT,
      ANY_VIZ_GROUP,
      ANY_TITLE,
    );

    expect(response.data).toEqual(responseExpected);
    expect(response.error).toBeUndefined();
  });
});

describe('deleteDashboard', () => {
  const ANY_TENANT = 'ANY_TENANT';
  const ANY_VIZ_GROUP = 'ANY_VIZ_GROUP';
  const ANY_NAME = 'ANY_NAME';

  it('throws on error that is not a FetchError', async () => {
    const error = new Error('Network error');
    deleteDashboardMock.mockRejectedValue(error);

    await expect(() =>
      deleteDashboard(ANY_TENANT, ANY_VIZ_GROUP, ANY_NAME),
    ).rejects.toThrow(error);
  });

  it('returns parsed response with error if FetchError is thrown', async () => {
    const fetchError = mkFetchError(404, 'Not Found');
    deleteDashboardMock.mockRejectedValue(fetchError);

    const response = await deleteDashboard(ANY_TENANT, ANY_VIZ_GROUP, ANY_NAME);

    expect(response.data).toBeUndefined();
    expect(response.error).toEqual(fetchError);
  });

  it('returns No Content response on success', async () => {
    const noContentResponse = {} as Response;
    deleteDashboardMock.mockResolvedValueOnce(
      Promise.resolve(noContentResponse),
    );

    const response = await deleteDashboard(ANY_TENANT, ANY_VIZ_GROUP, ANY_NAME);

    expect(response.data).toEqual(noContentResponse);
    expect(response.error).toBeUndefined();
  });
});
