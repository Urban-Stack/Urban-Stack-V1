import { mkState } from './form';
import { DeleteSharedApp } from '@/app/_lib/resource-api/graphql/sharedApps';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkState', () => {
  it('returns a data state on success', () => {
    const result: DeleteSharedApp = {
      data: { tenant: { deleteSharedApp: 'my-shared-app' } },
    };
    const state = mkState(result);
    expect(state.data).toEqual({});
    expect(state.errors).toBeUndefined();
  });

  it('returns an error state if GraphQL errors are present', () => {
    const result: DeleteSharedApp = {
      error: mkCombinedGraphQLError('Error 1', 'Error 2'),
      data: undefined,
    };
    const state = mkState(result);
    expect(state.errors?.general).toEqual(['Error 1', 'Error 2']);
  });

  it('returns an error state if data is undefined', () => {
    const result: DeleteSharedApp = { data: undefined };
    const state = mkState(result);
    expect(state.errors?.general).toEqual([
      'Die Shared App konnte nicht gelöscht werden.',
    ]);
  });

  it('returns a data state if no error is present and data is present', () => {
    const result: DeleteSharedApp = {
      data: { tenant: { deleteSharedApp: 'my-shared-app' } },
    };
    const state = mkState(result);
    expect(state.data).toEqual({});
    expect(state.errors).toBeUndefined();
  });
});
