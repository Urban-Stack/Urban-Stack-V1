import {
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/form';
import {
  addProjectPermission,
  deleteProjectPermission,
  updateProjectPermission,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/actions';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import {
  addGroupPermission,
  deleteGroupPermission,
  updateGroupPermission,
} from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const addGroupPermissionMock = addGroupPermission as jest.Mock;
const updateGroupPermissionMock = updateGroupPermission as jest.Mock;
const deleteGroupPermissionMock = deleteGroupPermission as jest.Mock;
const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  addGroupPermission: jest.fn(),
  updateGroupPermission: jest.fn(),
  deleteGroupPermission: jest.fn(),
}));
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

describe('addProjectPermission', () => {
  it('returns errors if the form is empty', async () => {
    const formData = new FormData();
    const state = await addProjectPermission(
      'tenant1',
      'project1',
      {},
      formData,
    );
    expect(state.errors).toBeDefined();
  });

  it('returns general errors if adding permission fails', async () => {
    const formData = mkFormData([
      [
        FORM_ADD_NAMES.group,
        JSON.stringify({ name: 'group1', tenant: 'tenant1' }),
      ],
      [FORM_ADD_NAMES.permission, 'admin'],
    ]);

    addGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError('error1', 'error2'),
        data: undefined,
      }),
    );

    const state = await addProjectPermission(
      'tenant1',
      'project1',
      {},
      formData,
    );

    expect(state.errors).toEqual({ general: ['error1', 'error2'] });
  });

  describe('successful group permission addition', () => {
    beforeEach(() => {
      addGroupPermissionMock.mockReturnValue(() =>
        Promise.resolve({ data: {} }),
      );
    });

    it('invalidates path after successful operation', async () => {
      const formData = mkFormData([
        [
          FORM_ADD_NAMES.group,
          JSON.stringify({ name: 'group1', tenant: 'tenant1' }),
        ],
        [FORM_ADD_NAMES.permission, 'admin'],
      ]);

      await addProjectPermission('tenant1', 'project1', {}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith(
        '/settings/projects/tenant1/project1/shared-groups',
      );
    });

    it('returns data after successful operation', async () => {
      const formData = mkFormData([
        [
          FORM_ADD_NAMES.group,
          JSON.stringify({ name: 'group1', tenant: 'tenant1' }),
        ],
        [FORM_ADD_NAMES.permission, 'admin'],
      ]);

      const state = await addProjectPermission(
        'tenant1',
        'project1',
        {},
        formData,
      );

      expect(state.data).toEqual({});
    });
  });
});

describe('updateProjectPermission', () => {
  it('returns errors if the form is invalid', async () => {
    const formData = new FormData();
    const state = await updateProjectPermission(
      'tenant1',
      'project1',
      { name: 'group1', tenant: 'tenant1' },
      {},
      formData,
    );

    expect(state.errors).toBeDefined();
  });

  it('returns general errors if changing permission fails', async () => {
    const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'read']]);

    updateGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({
        error: mkCombinedGraphQLError('error3', 'error4'),
        data: undefined,
      }),
    );

    const state = await updateProjectPermission(
      'tenant1',
      'project1',
      { name: 'group1', tenant: 'tenant1' },
      {},
      formData,
    );

    expect(state.errors).toEqual({ general: ['error3', 'error4'] });
  });

  describe('successful permission change', () => {
    beforeEach(() => {
      updateGroupPermissionMock.mockReturnValue(() =>
        Promise.resolve({ data: {} }),
      );
    });

    it('invalidates path after successful operation', async () => {
      const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'admin']]);

      await updateProjectPermission(
        'tenant1',
        'project1',
        { name: 'group1', tenant: 'tenant1' },
        {},
        formData,
      );

      expect(revalidatePathMock).toHaveBeenCalledWith(
        '/settings/projects/tenant1/project1/shared-groups',
      );
    });

    it('returns data after successful operation', async () => {
      const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'admin']]);

      const state = await updateProjectPermission(
        'tenant1',
        'project1',
        { name: 'group1', tenant: 'tenant1' },
        {},
        formData,
      );

      expect(state.data).toEqual({});
    });
  });
});

describe('deleteProjectPermission', () => {
  it('calls deleteGroupPermission and revalidates path on success', async () => {
    deleteGroupPermissionMock.mockResolvedValue({ data: { foo: 'bar' } });

    const state = await deleteProjectPermission('tenant1', 'project1', {
      name: 'group1',
      tenant: 'tenant1',
    });

    expect(deleteGroupPermissionMock).toHaveBeenCalledWith(
      'tenant1',
      'project1',
      { name: 'group1', tenant: 'tenant1' },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      '/settings/projects/tenant1/project1/shared-groups',
    );
    expect(state.data).toEqual({});
  });

  it('returns errors if deleteGroupPermission fails', async () => {
    deleteGroupPermissionMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteProjectPermission('tenant1', 'project2', {
      name: 'group5',
      tenant: 'tenant1',
    });

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      '/settings/projects/tenant1/project2/shared-groups',
    );
  });
});
