import { FORM_ADD_NAMES } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/form';
import {
  addProjectPermission,
  deleteProjectPermission,
  updateProjectPermission,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import {
  addVizGroupPermission,
  deleteVizGroupPermission,
  updateVizGroupPermission,
} from '@/app/_lib/resource-api/graphql/project';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FORM_UPDATE_NAMES } from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/form';

const addVizGroupPermissionMock = addVizGroupPermission as jest.Mock;
const updateVizGroupPermissionMock = updateVizGroupPermission as jest.Mock;
const deleteVizGroupPermissionMock = deleteVizGroupPermission as jest.Mock;
const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  addVizGroupPermission: jest.fn(),
  updateVizGroupPermission: jest.fn(),
  deleteVizGroupPermission: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  addVizGroupPermissionMock.mockReset();
  updateVizGroupPermissionMock.mockReset();
  deleteVizGroupPermissionMock.mockReset();
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
    ]);

    addVizGroupPermissionMock.mockReturnValue(() =>
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
      addVizGroupPermissionMock.mockReturnValue(() =>
        Promise.resolve({ data: {} }),
      );
    });

    it('invalidates path after successful operation', async () => {
      const formData = mkFormData([
        [
          FORM_ADD_NAMES.group,
          JSON.stringify({ name: 'group1', tenant: 'tenant1' }),
        ],
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
  beforeEach(() => {
    updateVizGroupPermissionMock.mockReturnValue(() =>
      Promise.resolve({ data: {} }),
    );
  });

  it('returns general errors if changing permission fails', async () => {
    const formData = mkFormData([[FORM_UPDATE_NAMES.permission, 'read']]);

    updateVizGroupPermissionMock.mockReturnValue(() =>
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

describe('deleteProjectPermission', () => {
  it('calls deleteVizGroupPermission and revalidates path on success', async () => {
    deleteVizGroupPermissionMock.mockResolvedValue({ data: {} });

    await deleteProjectPermission('tenant1', 'project1', {
      name: 'group1',
      tenant: 'tenant1',
    });

    expect(deleteVizGroupPermissionMock).toHaveBeenCalledWith(
      'tenant1',
      'project1',
      {
        name: 'group1',
        tenant: 'tenant1',
      },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      '/settings/projects/tenant1/project1/shared-groups',
    );
  });

  it('returns errors if deleting viz group permission fails', async () => {
    deleteVizGroupPermissionMock.mockResolvedValue({
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
