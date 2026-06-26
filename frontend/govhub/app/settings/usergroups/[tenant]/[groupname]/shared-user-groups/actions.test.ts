import {
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/form';
import {
  addUserGroupPermission,
  deleteUserGroupPermission,
  updateUserGroupPermission,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import {
  addGroupPermission,
  deleteGroupPermission,
  updateGroupPermission,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const TENANT = 'test-tenant';
const GROUP_NAME = 'test-group';
const SHARED_GROUP = { name: 'shared-name', tenant: 'shared-tenant' };

const addGroupPermissionMock = addGroupPermission as jest.Mock;
const updateGroupPermissionMock = updateGroupPermission as jest.Mock;
const deleteGroupPermissionMock = deleteGroupPermission as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/usergroups', () => ({
  addGroupPermission: jest.fn(),
  updateGroupPermission: jest.fn(),
  deleteGroupPermission: jest.fn(),
}));

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  addGroupPermissionMock.mockReset();
  updateGroupPermissionMock.mockReset();
  deleteGroupPermissionMock.mockReset();
  revalidatePathMock.mockReset();
});

const mkFormData = (entries: string[][] = []): FormData => {
  const formData = new FormData();
  entries.forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

describe('addUserGroupPermission', () => {
  const validFormData = mkFormData([
    [FORM_ADD_NAMES.group, JSON.stringify(SHARED_GROUP)],
    [FORM_ADD_NAMES.permission, 'admin'],
  ]);

  it('adds user group permission successfully', async () => {
    const permission = 'admin';
    const updateMock = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
    addGroupPermissionMock.mockReturnValue(updateMock);

    const state = await addUserGroupPermission(
      TENANT,
      GROUP_NAME,
      {},
      mkFormData([
        [FORM_ADD_NAMES.group, JSON.stringify(SHARED_GROUP)],
        [FORM_ADD_NAMES.permission, permission],
      ]),
    );

    expect(state.data).toEqual({});
    expect(addGroupPermissionMock).toHaveBeenCalledWith(permission);
    expect(updateMock).toHaveBeenCalledWith(TENANT, GROUP_NAME, SHARED_GROUP);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns errors if form is empty', async () => {
    const emptyForm = new FormData();
    const state = await addUserGroupPermission(
      TENANT,
      GROUP_NAME,
      {},
      emptyForm,
    );

    expect(state.errors).toBeDefined();
    expect(addGroupPermissionMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns general errors if adding permission fails', async () => {
    addGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError('error1', 'error2'),
        data: undefined,
      }),
    );

    const state = await addUserGroupPermission(
      TENANT,
      GROUP_NAME,
      {},
      validFormData,
    );

    expect(state.errors).toEqual({ general: ['error1', 'error2'] });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns error state if mutation returns no data', async () => {
    addGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        data: undefined,
        error: undefined,
      }),
    );

    const state = await addUserGroupPermission(
      TENANT,
      GROUP_NAME,
      {},
      validFormData,
    );

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });
});

describe('updateUserGroupPermission', () => {
  const validFormData = mkFormData([[FORM_UPDATE_NAMES.permission, 'admin']]);

  it('updates user group permission successfully', async () => {
    const permission = 'admin';
    const updateMock = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));
    updateGroupPermissionMock.mockReturnValue(updateMock);

    const state = await updateUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
      {},
      mkFormData([[FORM_UPDATE_NAMES.permission, permission]]),
    );

    expect(state.data).toEqual({});
    expect(updateGroupPermissionMock).toHaveBeenCalledWith(permission);
    expect(updateMock).toHaveBeenCalledWith(TENANT, GROUP_NAME, SHARED_GROUP);
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns errors if form is empty', async () => {
    const emptyForm = new FormData();
    const state = await updateUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
      {},
      emptyForm,
    );

    expect(state.errors).toBeDefined();
    expect(updateGroupPermissionMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns general errors if changing permission fails', async () => {
    updateGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError('error3', 'error4'),
        data: undefined,
      }),
    );

    const state = await updateUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
      {},
      validFormData,
    );

    expect(state.errors).toEqual({ general: ['error3', 'error4'] });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns error state if mutation returns no data', async () => {
    updateGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        data: undefined,
        error: undefined,
      }),
    );

    const state = await updateUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
      {},
      validFormData,
    );

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });
});

describe('deleteUserGroupPermission', () => {
  it('deletes user group permission successfully', async () => {
    deleteGroupPermissionMock.mockResolvedValue({ data: { foo: 'bar' } });

    const state = await deleteUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
    );

    expect(state.data).toEqual({});
    expect(deleteGroupPermissionMock).toHaveBeenCalledWith(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns errors if removing permission fails', async () => {
    deleteGroupPermissionMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });

  it('returns error state if mutation returns no data', async () => {
    deleteGroupPermissionMock.mockResolvedValue({
      data: undefined,
      error: undefined,
    });

    const state = await deleteUserGroupPermission(
      TENANT,
      GROUP_NAME,
      SHARED_GROUP,
    );

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/usergroups/${TENANT}/${GROUP_NAME}/shared-user-groups`,
    );
  });
});
