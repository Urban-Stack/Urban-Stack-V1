import { deleteS3Object } from './actions';
import { deleteObject } from '@/app/_lib/storage/server';
import { revalidatePath } from 'next/cache';
import { mutateDeleteDataset } from '@/app/_lib/resource-api/graphql/datasets';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FuncMock } from '@/app/_test/utils';

jest.mock('@/app/_lib/storage/server', () => ({ deleteObject: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/app/_lib/resource-api/graphql/datasets', () => ({
  mutateDeleteDataset: jest.fn(),
}));

const mockMutateDeleteDataset = mutateDeleteDataset as FuncMock<
  typeof mutateDeleteDataset
>;

describe('deleteS3Object', () => {
  beforeEach(() => {
    (deleteObject as jest.Mock).mockReset();
    (revalidatePath as jest.Mock).mockReset();
    mockMutateDeleteDataset.mockReset();
  });

  it('returns data state and calls revalidatePath when deleteObject resolves true', async () => {
    (deleteObject as jest.Mock).mockResolvedValue(true);

    const result = await deleteS3Object('tenant', 'project', 'bucket', 'key');

    expect(result).toEqual({ data: {} });
    expect(revalidatePath).toHaveBeenCalledWith('/s3manager?bucket=bucket');
  });

  it('returns error state and calls revalidatePath when deleteObject resolves false', async () => {
    (deleteObject as jest.Mock).mockResolvedValue(false);

    const result = await deleteS3Object('tenant', 'project', 'bucket', 'key');

    expect(result).toEqual({ errors: {} });
    expect(revalidatePath).toHaveBeenCalledWith('/s3manager?bucket=bucket');
  });

  it('returns error state when delete object throws', async () => {
    mockMutateDeleteDataset.mockRejectedValue('unknown error');

    const result = await deleteS3Object(
      'tenant',
      'project',
      'bucket',
      'key',
      'dataset',
    );

    expect(result).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
    expect(revalidatePath).not.toHaveBeenCalledWith('/s3manager?bucket=bucket');
  });

  it('deletes dataset and s3 object when dataset exists and both succeed', async () => {
    mockMutateDeleteDataset.mockResolvedValue({
      data: { tenant: { project: { deleteDataset: 'dataset' } } },
    });
    (deleteObject as jest.Mock).mockResolvedValue(true);

    const result = await deleteS3Object(
      'tenant',
      'project',
      'bucket',
      'key',
      'dataset',
    );

    expect(mutateDeleteDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'dataset',
    );
    expect(deleteObject).toHaveBeenCalledWith('bucket', 'key');
    expect(result).toEqual({ data: {} });
    expect(revalidatePath).toHaveBeenCalledWith('/s3manager?bucket=bucket');
  });

  it('returns error state when dataset deletion fails', async () => {
    mockMutateDeleteDataset.mockResolvedValue({
      error: mkCombinedGraphQLError('Dataset deletion failed'),
      data: undefined,
    });

    const result = await deleteS3Object(
      'tenant',
      'project',
      'bucket',
      'key',
      'dataset',
    );

    expect(mutateDeleteDataset).toHaveBeenCalledWith(
      'tenant',
      'project',
      'dataset',
    );
    expect(deleteObject).not.toHaveBeenCalled();
    expect(result).toEqual({
      errors: { general: ['Dataset deletion failed'] },
    });
    expect(revalidatePath).not.toHaveBeenCalledWith('/s3manager?bucket=bucket');
  });
});
