import { mutate, query } from '@/app/_lib/resource-api/client';
import {
  internal,
  mutateCreateDataset,
  mutateDeleteDataset,
  mutateRefreshDataset,
  queryAllDatasets,
} from '@/app/_lib/resource-api/graphql/datasets';
import { ClickHouseFormat } from '@/app/__generated__/types';
import { DatasetFormat } from '@/app/_lib/resource-api/project/dataset';

const { ALL_DATASETS } = internal;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

describe('queryAllDatasets', () => {
  it('should call the client with the correct query', async () => {
    await queryAllDatasets('tenant', 'project');

    expect(mockQuery).toHaveBeenCalledWith({
      query: ALL_DATASETS,
      variables: { tenant: 'tenant', project: 'project' },
    });
  });
});

describe('mutateCreateDataset', () => {
  it.each<(DatasetFormat | ClickHouseFormat)[]>([
    ['csv', ClickHouseFormat.Csv],
    ['json', ClickHouseFormat.Json],
    ['json-compact', ClickHouseFormat.JsonCompact],
  ])(
    'should call the client with the correct mutation',
    async (fmt, clickhouseFmt) => {
      await mutateCreateDataset(
        'tenant',
        'project',
        'name',
        'path',
        fmt as DatasetFormat,
      );

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: internal.CREATE_DATASET,
        variables: {
          tenant: 'tenant',
          project: 'project',
          name: 'name',
          path: 'path',
          format: clickhouseFmt,
        },
      });
    },
  );
});

describe('mutateDeleteDataset', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateDeleteDataset('tenant', 'project', 'dataset');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.DELETE_DATASET,
      variables: { tenant: 'tenant', project: 'project', dataset: 'dataset' },
    });
  });
});

describe('mutateRefreshDataset', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateRefreshDataset('tenant', 'project', 'dataset');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.REFRESH_DATASET,
      variables: { tenant: 'tenant', project: 'project', dataset: 'dataset' },
    });
  });
});
