import { deletePublishedQuery } from './action';
import { mutateDeletePublishedQuery } from '@/app/_lib/resource-api/graphql/vizGroups';
import { revalidatePath } from 'next/cache';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FuncMock } from '@/app/_test/utils';

jest.mock('@/app/_lib/resource-api/graphql/vizGroups', () => ({
  mutateDeletePublishedQuery: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockMutateDeletePublishedQuery = mutateDeletePublishedQuery as FuncMock<
  typeof mutateDeletePublishedQuery
>;
const mockRevalidatePath = revalidatePath as FuncMock<typeof revalidatePath>;

const TENANT = 'test-tenant';
const VIZ_GROUP = 'test-viz-group';
const QUERY_NAME = 'test-query';

beforeEach(() => {
  mockMutateDeletePublishedQuery.mockReset();
  mockRevalidatePath.mockReset();
});

describe('deletePublishedQuery', () => {
  it('calls mutateDeletePublishedQuery and mkState, then revalidates path', async () => {
    mockMutateDeletePublishedQuery.mockResolvedValue({
      data: { tenant: { vizGroup: { deletePublishedQuery: 'query1' } } },
    });

    const result = await deletePublishedQuery(TENANT, VIZ_GROUP, QUERY_NAME);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/geojson`,
    );
    expect(result).toEqual({});
  });

  it('returns errors if mutation fails', async () => {
    mockMutateDeletePublishedQuery.mockResolvedValue({
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    });
    const result = await deletePublishedQuery(TENANT, VIZ_GROUP, QUERY_NAME);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/settings/dashboardgroups/${TENANT}/${VIZ_GROUP}/geojson`,
    );
    expect(result.errors).toEqual({ general: ['error1', 'error2'] });
  });
});
