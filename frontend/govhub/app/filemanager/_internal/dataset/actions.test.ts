import { createDataset, deleteDataset, refreshDataset } from './actions';
import {
  mutateCreateDataset,
  mutateDeleteDataset,
  mutateRefreshDataset,
} from '@/app/_lib/resource-api/graphql/datasets';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { revalidatePath } from 'next/cache';

jest.mock('@/app/_lib/resource-api/graphql/datasets', () => ({
  mutateCreateDataset: jest.fn(),
  mutateDeleteDataset: jest.fn(),
  mutateRefreshDataset: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockMutateCreateDataset = mutateCreateDataset as jest.Mock;
const mockMutateDeleteDataset = mutateDeleteDataset as jest.Mock;
const mockMutateRefreshDataset = mutateRefreshDataset as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

beforeEach(() => {
  mockMutateCreateDataset.mockReset();
  mockMutateDeleteDataset.mockReset();
  mockMutateRefreshDataset.mockReset();
  mockRevalidatePath.mockReset();
});

describe('createDataset', () => {
  it('returns success state when mutation succeeds', async () => {
    mockMutateCreateDataset.mockResolvedValue({
      data: { tenant: { project: { createDataset: { dataset: 'test' } } } },
      error: undefined,
    });

    const result = await createDataset('tenant', 'project', 'key', 'csv');

    expect(result).toEqual({ data: {} });
    expect(mockMutateCreateDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'key',
      'key',
      'csv',
    );
  });

  it('returns error state when mutation returns errors', async () => {
    mockMutateCreateDataset.mockResolvedValue({
      data: undefined,
      error: mkCombinedGraphQLError('Validation failed'),
    });

    const result = await createDataset('tenant', 'project', 'key', 'csv');

    expect(result).toEqual({ errors: { general: ['Validation failed'] } });
  });

  it('returns error state when mutation returns no data', async () => {
    mockMutateCreateDataset.mockResolvedValue({
      data: undefined,
      error: undefined,
    });

    const result = await createDataset('tenant', 'project', 'key', 'csv');

    expect(result).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('returns error state when mutation throws exception', async () => {
    mockMutateCreateDataset.mockRejectedValue(new Error('Network error'));

    const result = await createDataset('tenant', 'project', 'key', 'csv');

    expect(result).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('handles different dataset formats', async () => {
    mockMutateCreateDataset.mockResolvedValue({
      data: { tenant: { project: { createDataset: { dataset: 'test' } } } },
      error: undefined,
    });

    await createDataset('tenant', 'project', 'key', 'json');

    expect(mockMutateCreateDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'key',
      'key',
      'json',
    );
  });
});

describe('deleteDataset', () => {
  beforeEach(() => {
    mockMutateDeleteDataset.mockReset();
  });

  it('returns success state when mutation succeeds', async () => {
    mockMutateDeleteDataset.mockResolvedValue({
      data: { tenant: { project: { deleteDataset: { dataset: 'deleted' } } } },
      error: undefined,
    });

    const result = await deleteDataset('tenant', 'project', 'dataset-id');

    expect(result).toEqual({ data: {} });
    expect(mockMutateDeleteDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'dataset-id',
    );
  });

  it('returns error state when mutation returns errors', async () => {
    mockMutateDeleteDataset.mockResolvedValue({
      data: undefined,
      error: mkCombinedGraphQLError('Delete failed'),
    });

    const result = await deleteDataset('tenant', 'project', 'dataset-id');

    expect(result).toEqual({
      errors: { general: ['Delete failed'] },
    });
  });

  it('returns error state when mutation returns no data', async () => {
    mockMutateDeleteDataset.mockResolvedValue({
      data: undefined,
      error: undefined,
    });

    const result = await deleteDataset('tenant', 'project', 'dataset-id');

    expect(result).toEqual({
      errors: { general: ['Dataset konnte nicht gelöscht werden.'] },
    });
  });

  it('returns error state when mutation throws exception', async () => {
    mockMutateDeleteDataset.mockRejectedValue(new Error('Network error'));

    const result = await deleteDataset('tenant', 'project', 'dataset-id');

    expect(result).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });
});

describe('refreshDataset', () => {
  it('returns success state when mutation succeeds', async () => {
    mockMutateRefreshDataset.mockResolvedValue({
      data: {
        tenant: { project: { refreshDataset: { dataset: 'refreshed' } } },
      },
      error: undefined,
    });

    const result = await refreshDataset(
      'tenant',
      'project',
      'dataset-id',
      'bucket',
    );

    expect(result).toEqual({ data: {} });
    expect(mockMutateRefreshDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'dataset-id',
    );
  });

  it('returns error state when mutation returns errors', async () => {
    mockMutateRefreshDataset.mockResolvedValue({
      data: undefined,
      error: mkCombinedGraphQLError('Refresh failed'),
    });

    const result = await refreshDataset(
      'tenant',
      'project',
      'dataset-id',
      'bucket',
    );

    expect(result).toEqual({
      errors: { general: ['Refresh failed'] },
    });
  });

  it('returns error state when mutation returns no data', async () => {
    mockMutateRefreshDataset.mockResolvedValue({
      data: undefined,
      error: undefined,
    });

    const result = await refreshDataset(
      'tenant',
      'project',
      'dataset-id',
      'bucket',
    );

    expect(result).toEqual({
      errors: { general: ['Dataset konnte nicht gelöscht werden.'] },
    });
  });

  it('returns error state when mutation throws exception', async () => {
    mockMutateRefreshDataset.mockRejectedValue(new Error('Network error'));

    const result = await refreshDataset(
      'tenant',
      'project',
      'dataset-id',
      'bucket',
    );

    expect(result).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });
});
