import { createDashboard, deleteDashboard } from '@/app/_lib/superset/actions';
import { FORM_NAMES } from '@/app/_lib/superset/types';
import {
  createDashboard as postCreateDashboard,
  deleteDashboard as deleteDeleteDashboard,
  requireTenant,
} from '@/app/_lib/resource-api/legacy';
import { FuncMock, mkFetchError, TEST_SESSION } from '@/app/_test/utils';
import { redirect } from 'next/navigation';
import { getPublicEnv } from '@/app/_lib/env';
import { auth } from '@/auth';
import { Session } from 'next-auth';

const TEST_TENANT = 'test-tenant';
const TEST_SLUG = 'test-slug';
const TEST_DASHBOARD_NAME = 'test-dashboard-name';
const TEST_TITLE = 'Example dashboard title';
const TEST_VIZ_GROUP = { name: 'sccon', tenant: TEST_TENANT } as const;

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;

const postCreateDashboardMock: FuncMock<typeof postCreateDashboard> =
  postCreateDashboard as unknown as jest.Mock;
const deleteDeleteDashboardMock: FuncMock<typeof deleteDeleteDashboard> =
  deleteDeleteDashboard as unknown as jest.Mock;
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  createDashboard: jest.fn(),
  deleteDashboard: jest.fn(),
  requireTenant: jest.fn(),
}));

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

beforeAll(() => {
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
  getPublicEnvMock.mockReturnValue('http://superset.data-hub.local');
});

beforeEach(() => {
  postCreateDashboardMock.mockReset();
  deleteDeleteDashboardMock.mockReset();
  requireTenantMock.mockReset();
  redirectMock.mockReset();
});

describe('createDashboard', () => {
  const mkFormData: (
    title: string,
    vizGroup?: { name: string; tenant: string },
  ) => FormData = (title, vizGroup) => {
    const formData: FormData = new FormData();
    formData.append(FORM_NAMES.dashboardTitle, title);
    if (vizGroup) {
      formData.append(FORM_NAMES.vizGroup, JSON.stringify(vizGroup));
    }
    return formData;
  };

  it('returns parsing errors for invalid title', async () => {
    const formData = mkFormData('kb', TEST_VIZ_GROUP);

    const actual = await createDashboard({}, formData);

    expect(actual.errors?.title).toBeDefined();
    expect(actual.errors?.vizGroup).toBeUndefined();
  });

  it('returns parsing errors for missing vizGroup', async () => {
    const formData = mkFormData('teutonet');

    const actual = await createDashboard({}, formData);

    expect(actual.errors?.title).toBeUndefined();
    expect(actual.errors?.vizGroup).toBeDefined();
  });

  it('returns error response for conflict on creation', async () => {
    const formData = mkFormData(TEST_TITLE, TEST_VIZ_GROUP);
    postCreateDashboardMock.mockResolvedValueOnce({
      error: mkFetchError(409, 'Conflict'),
    });

    const actual = await createDashboard({}, formData);

    expect(redirectMock).not.toHaveBeenCalled();
    expect(actual).toEqual({
      errors: { title: ['Ein Dashboard mit diesem Namen existiert bereits.'] },
    });
  });

  it('redirects to Helpdesk page on any non-conflict error', async () => {
    const formData = mkFormData(TEST_TITLE, TEST_VIZ_GROUP);
    postCreateDashboardMock.mockResolvedValue({
      error: mkFetchError(400, 'Bad Request'),
    });

    const actual = await createDashboard({}, formData);

    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith(
      '/helpdesk?error=Dashboard+kann+nicht+erstellt+werden',
    );
    expect(actual).toBeUndefined();
  });

  it('creates dashboard and redirects to correct URL for valid form data', async () => {
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    postCreateDashboardMock.mockResolvedValueOnce({
      data: { slug: TEST_SLUG, dashboardName: TEST_DASHBOARD_NAME },
    });
    const formData = mkFormData(TEST_TITLE, TEST_VIZ_GROUP);

    const actual = await createDashboard({}, formData);

    expect(postCreateDashboardMock).toHaveBeenCalledWith(
      TEST_TENANT,
      'sccon',
      TEST_TITLE,
    );
    expect(redirectMock).toHaveBeenCalledWith(
      `/dashboards/${TEST_SLUG}?edit=true`,
    );
    expect(actual).toBeUndefined();
  });
});

describe('deleteDashboard', () => {
  const expectDashboardDeleted = (
    tenant: string,
    vizGroup: string,
    name: string,
  ) => {
    expect(deleteDeleteDashboardMock).toHaveBeenCalledWith(
      tenant,
      vizGroup,
      name,
    );
  };

  it('deletes dashboard and redirects to dashboards overview', async () => {
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    deleteDeleteDashboardMock.mockResolvedValueOnce({ data: undefined });

    const actual = await deleteDashboard(
      TEST_DASHBOARD_NAME,
      TEST_VIZ_GROUP.name,
      TEST_TENANT,
    );

    expectDashboardDeleted(TEST_TENANT, 'sccon', TEST_DASHBOARD_NAME);
    expect(redirectMock).toHaveBeenCalledWith('/dashboards');
    expect(actual).toBeUndefined();
  });

  it('returns error response for non-existing dashboard resource', async () => {
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    deleteDeleteDashboardMock.mockResolvedValue({
      error: mkFetchError(404, 'Not Found'),
    });

    const actual = await deleteDashboard(
      TEST_DASHBOARD_NAME,
      TEST_VIZ_GROUP.name,
      TEST_TENANT,
    );

    expectDashboardDeleted(TEST_TENANT, 'sccon', TEST_DASHBOARD_NAME);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(actual).toEqual({
      error: 'Ein Dashboard mit diesem Namen existiert nicht.',
    });
  });

  it('redirects to Helpdesk page on any non-NotFound error', async () => {
    requireTenantMock.mockResolvedValueOnce(TEST_TENANT);
    deleteDeleteDashboardMock.mockResolvedValue({
      error: mkFetchError(500, 'Internal Server Error'),
    });

    const actual = await deleteDashboard(
      TEST_DASHBOARD_NAME,
      TEST_VIZ_GROUP.name,
      TEST_TENANT,
    );

    expectDashboardDeleted(TEST_TENANT, 'sccon', TEST_DASHBOARD_NAME);
    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith(
      '/helpdesk?error=Dashboard+kann+nicht+gel%C3%B6scht+werden',
    );
    expect(actual).toBeUndefined();
  });
});
