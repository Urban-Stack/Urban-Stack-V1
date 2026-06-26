import { mkState } from './form';
import { DeletePublishedQuery } from '@/app/_lib/resource-api/graphql/vizGroups';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkState', () => {
  it('returns errors with mapped error messages', () => {
    const result: DeletePublishedQuery = {
      error: mkCombinedGraphQLError('Error 1', 'Error 2'),
      data: undefined,
    };

    const state = mkState(result);

    expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
  });

  it('returns empty object if no errors', () => {
    const result: DeletePublishedQuery = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({});
  });

  it('returns empty object if there is no error', () => {
    const result: DeletePublishedQuery = {
      error: undefined,
      data: undefined,
    };

    const state = mkState(result);

    expect(state).toEqual({});
  });
});
