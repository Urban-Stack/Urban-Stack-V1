import { mutateDeleteVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import { deleteVizGroup } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/danger-zone/actions';

const mutateDeleteVizGroupMock = mutateDeleteVizGroup as unknown as FuncMock<
  typeof mutateDeleteVizGroup
>;

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  mutateDeleteVizGroup: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const TENANT = 'tenant-1';
const VIZGROUP = 'vizgroup-1';

beforeEach(() => {
  mutateDeleteVizGroupMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('deleteVizGroup', () => {
  it('invalidates path and returns data on success', async () => {
    mutateDeleteVizGroupMock.mockResolvedValue({
      data: {
        tenant: {
          deleteVizGroup: VIZGROUP,
        },
      },
    });

    const state = await deleteVizGroup(TENANT, VIZGROUP);

    expect(mutateDeleteVizGroupMock).toHaveBeenCalledWith(VIZGROUP);

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}`,
    );

    expect(state.data).toEqual({});
  });

  it('returns errors if the deletion fails', async () => {
    mutateDeleteVizGroupMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteVizGroup(TENANT, VIZGROUP);

    expect(mutateDeleteVizGroupMock).toHaveBeenCalledWith(VIZGROUP);

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}`,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});
