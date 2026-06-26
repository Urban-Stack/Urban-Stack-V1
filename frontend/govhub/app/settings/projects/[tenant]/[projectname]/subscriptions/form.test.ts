import { mkDeleteState } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/form';
import { DeleteSubscription } from '@/app/_lib/resource-api/graphql/subscriptions';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

describe('mkDeleteState', () => {
  it('should return an error if the result has errors', () => {
    const result: DeleteSubscription = {
      error: mkCombinedGraphQLError('error1', 'error2'),
      data: undefined,
    };

    const state = mkDeleteState(result);

    expect(state).toEqual({ errors: { general: ['error1', 'error2'] } });
  });

  it('should return unknown error when data is undefined', () => {
    const state = mkDeleteState({ data: undefined } as DeleteSubscription);

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });

  it('should return the project data', () => {
    const result = {
      data: {
        tenant: {
          project: {
            deleteSensorSubscription: 'subscriptions-name',
          },
        },
      },
    } as DeleteSubscription;

    const state = mkDeleteState(result);

    expect(state).toEqual({ data: {} });
  });
});
