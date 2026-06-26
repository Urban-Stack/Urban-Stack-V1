import { mkState } from './form';
import { DeleteDataset } from '@/app/_lib/resource-api/graphql/datasets';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkState', () => {
  it('should return a data state on success', () => {
    const result: DeleteDataset = {
      data: { tenant: { project: { deleteDataset: 'filename-123' } } },
    };
    const state = mkState(result);
    expect(state.data).toEqual({});
  });

  it('should return an error state if errors are present', () => {
    const result: DeleteDataset = {
      error: mkCombinedGraphQLError('Error 1', 'Error 2'),
      data: undefined,
    };
    const state = mkState(result);
    expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
  });

  it('should return an error state if data is missing', () => {
    const result: DeleteDataset = {
      data: undefined,
    };
    const state = mkState(result);
    expect(state.errors?.general).toEqual([
      'Dataset konnte nicht gelöscht werden.',
    ]);
  });

  it('should return an error state if data is undefined', () => {
    const result: DeleteDataset = { data: undefined };
    const state = mkState(result);
    expect(state.errors?.general).toEqual([
      'Dataset konnte nicht gelöscht werden.',
    ]);
  });

  it('should return a data state if no error is present and data is present', () => {
    const result: DeleteDataset = {
      data: { tenant: { project: { deleteDataset: 'filename-123' } } },
    };
    const state = mkState(result);
    expect(state.data).toBeDefined();
    expect(state.errors).toBeUndefined();
  });

  it('should prioritize errors over missing data', () => {
    const result: DeleteDataset = {
      error: mkCombinedGraphQLError('Specific Error'),
      data: undefined,
    };
    const state = mkState(result);
    expect(state.errors?.general).toEqual(['Specific Error']);
  });
});
