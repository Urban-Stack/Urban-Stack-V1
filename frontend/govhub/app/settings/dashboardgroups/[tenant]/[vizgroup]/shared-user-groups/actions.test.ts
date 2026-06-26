import {
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/form';
import { revalidatePath } from 'next/cache';
import {
  addVizGroupPermission,
  deleteVizGroupPermission,
  updateVizGroupPermission,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions';
import {
  addUserGroupPermission,
  deleteUserGroupPermission,
  updateUserGroupPermission,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const addUserGroupPermissionMock = addUserGroupPermission as jest.Mock;
const deleteUserGroupPermissionMock = deleteUserGroupPermission as jest.Mock;
const updateUserGroupPermissionMock = updateUserGroupPermission as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  addUserGroupPermission: jest.fn(),
  deleteUserGroupPermission: jest.fn(),
  updateUserGroupPermission: jest.fn(),
}));

const revalidatePathMock = revalidatePath as jest.Mock;
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  addUserGroupPermissionMock.mockReset();
  deleteUserGroupPermissionMock.mockReset();
  updateUserGroupPermissionMock.mockReset();
  revalidatePathMock.mockReset();
});

const TENANT = 'test-tenant';
const VIZ_GROUP = 'test-viz-group';
const USER_GROUP = 'test-user-group';
const ERRORS = ['error #1', 'error #2'];

const mkFormData = (entries: string[][] = []): FormData => {
  const formData = new FormData();
  entries.forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

describe('addVizGroupPermission', () => {
  const mockFormData = () =>
    mkFormData([
      [
        FORM_ADD_NAMES.group,
        JSON.stringify({ name: USER_GROUP, tenant: TENANT }),
      ],
      [FORM_ADD_NAMES.permission, 'admin'],
    ]);

  it('returns errors if the form is empty', async () => {
    const emptyFormData = new FormData();

    const state = await addVizGroupPermission(
      TENANT,
      VIZ_GROUP,
      {},
      emptyFormData,
    );

    expect(state.errors).toBeDefined();
  });

  it('returns general errors if adding permission fails', async () => {
    addUserGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError(...ERRORS),
        data: undefined,
      }),
    );

    const state = await addVizGroupPermission(
      TENANT,
      VIZ_GROUP,
      {},
      mockFormData(),
    );

    expect(state.errors).toEqual({ general: ERRORS });
  });

  describe('successful group permission addition', () => {
    beforeEach(() => {
      addUserGroupPermissionMock.mockReturnValue(() =>
        Promise.resolve({ data: {} }),
      );
    });

    it('revalidates path after successful operation', async () => {
      await addVizGroupPermission(TENANT, VIZ_GROUP, {}, mockFormData());

      expect(revalidatePathMock).toHaveBeenCalledWith(
        `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/shared-user-groups`,
      );
    });

    it('returns data after successful operation', async () => {
      const state = await addVizGroupPermission(
        TENANT,
        VIZ_GROUP,
        {},
        mockFormData(),
      );

      expect(state.data).toEqual({});
    });
  });
});

describe('updateVizGroupPermission', () => {
  it('returns errors if the form is empty', async () => {
    const emptyFormData = new FormData();

    const state = await updateVizGroupPermission(
      TENANT,
      VIZ_GROUP,
      { name: USER_GROUP, tenant: TENANT },
      {},
      emptyFormData,
    );

    expect(state.errors).toBeDefined();
  });

  it('returns general errors if changing permission fails', async () => {
    const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'read']]);

    updateUserGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError(...ERRORS),
        data: undefined,
      }),
    );

    const state = await updateVizGroupPermission(
      TENANT,
      VIZ_GROUP,
      { name: USER_GROUP, tenant: TENANT },
      {},
      formData,
    );

    expect(state.errors).toEqual({ general: ERRORS });
  });

  describe('successful permission change', () => {
    beforeEach(() => {
      updateUserGroupPermissionMock.mockReturnValue(() =>
        Promise.resolve({ data: {} }),
      );
    });

    it('revalidates path after successful operation', async () => {
      const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'admin']]);

      await updateVizGroupPermission(
        TENANT,
        VIZ_GROUP,
        { name: USER_GROUP, tenant: TENANT },
        {},
        formData,
      );

      expect(revalidatePathMock).toHaveBeenCalledWith(
        `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/shared-user-groups`,
      );
    });

    it('returns data after successful operation', async () => {
      const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'admin']]);

      const state = await updateVizGroupPermission(
        TENANT,
        VIZ_GROUP,
        { name: USER_GROUP, tenant: TENANT },
        {},
        formData,
      );

      expect(state.data).toEqual({});
    });
  });
});

describe('deleteVizGroupPermission', () => {
  it('requests deletion of user group permission and revalidates path on success', async () => {
    deleteUserGroupPermissionMock.mockResolvedValue({ data: {} });

    const state = await deleteVizGroupPermission(TENANT, VIZ_GROUP, {
      name: USER_GROUP,
      tenant: TENANT,
    });

    expect(deleteUserGroupPermissionMock).toHaveBeenCalledWith(
      TENANT,
      VIZ_GROUP,
      { name: USER_GROUP, tenant: TENANT },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/shared-user-groups`,
    );
    expect(state.data).toEqual({});
  });

  it('returns errors if deletion request fails', async () => {
    deleteUserGroupPermissionMock.mockResolvedValue({
      error: mkCombinedGraphQLError(...ERRORS),
      data: undefined,
    });

    const state = await deleteVizGroupPermission(TENANT, VIZ_GROUP, {
      name: USER_GROUP,
      tenant: TENANT,
    });

    expect(state.errors).toEqual({ general: ERRORS });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/shared-user-groups`,
    );
  });
});
