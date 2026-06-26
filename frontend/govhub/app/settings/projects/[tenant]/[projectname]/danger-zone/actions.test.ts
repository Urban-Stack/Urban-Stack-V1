import { mutateDeleteProject } from '@/app/_lib/resource-api/graphql/project';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import { deleteProject } from '@/app/settings/projects/[tenant]/[projectname]/danger-zone/actions';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const mutateDeleteProjectMock = mutateDeleteProject as unknown as FuncMock<
  typeof mutateDeleteProject
>;

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  mutateDeleteProject: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const TENANT = 'tenant-1';
const PROJECT = 'project-1';

beforeEach(() => {
  mutateDeleteProjectMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('deleteProject', () => {
  it('invalidates path and returns data on success', async () => {
    mutateDeleteProjectMock.mockResolvedValue({
      data: {
        tenant: {
          deleteProject: PROJECT,
        },
      },
    });

    const state = await deleteProject(TENANT, PROJECT);

    expect(mutateDeleteProjectMock).toHaveBeenCalledWith(TENANT, PROJECT);

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}`,
    );

    expect(state.data).toEqual({});
  });

  it('returns errors if the deletion fails', async () => {
    mutateDeleteProjectMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteProject(TENANT, PROJECT);

    expect(mutateDeleteProjectMock).toHaveBeenCalledWith(TENANT, PROJECT);

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}`,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});
