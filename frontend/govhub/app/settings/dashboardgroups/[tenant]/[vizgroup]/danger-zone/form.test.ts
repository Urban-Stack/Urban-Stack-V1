import { DeleteVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';
import { mkDeleteState } from './form';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkDeleteState', () => {
  it('should return an error if the result has errors', () => {
    const result: DeleteVizGroup = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkDeleteState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkDeleteState({ data: undefined } as DeleteVizGroup);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the vizGroup data', () => {
    const result = {
      data: {
        tenant: {
          deleteVizGroup: 'vizGroup-1',
        },
      },
    } as DeleteVizGroup;

    const state = mkDeleteState(result);

    expect(state).toEqual({ data: {} });
  });
});
