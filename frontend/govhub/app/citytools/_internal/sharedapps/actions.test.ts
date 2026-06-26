import { deleteSharedApp } from './actions';
import { mutateDeleteSharedApp } from '@/app/_lib/resource-api/graphql/sharedApps';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

jest.mock('@/app/_lib/resource-api/graphql/sharedApps', () => ({
  mutateDeleteSharedApp: jest.fn(),
}));

describe('deleteSharedApp', () => {
  beforeEach(() => {
    (mutateDeleteSharedApp as jest.Mock).mockReset();
  });

  it('returns data state on successful deletion', async () => {
    (mutateDeleteSharedApp as jest.Mock).mockResolvedValue({
      error: undefined,
      data: { tenant: { deleteSharedApp: 'shared-app' } },
    });

    const state = await deleteSharedApp('tenant-1', 'shared-app-1');

    expect(mutateDeleteSharedApp).toHaveBeenCalledWith(
      'tenant-1',
      'shared-app-1',
    );
    expect(state).toEqual({ data: {} });
  });

  it('maps GraphQL errors into general errors via mkState', async () => {
    (mutateDeleteSharedApp as jest.Mock).mockResolvedValue({
      error: mkCombinedGraphQLError('cannot delete'),
      data: undefined,
    });

    const state = await deleteSharedApp('tenant-1', 'shared-app-1');

    expect(state).toEqual({ errors: { general: ['cannot delete'] } });
  });

  it('returns a generic error when mutation rejects', async () => {
    (mutateDeleteSharedApp as jest.Mock).mockRejectedValue(
      new Error('network error'),
    );

    const state = await deleteSharedApp('tenant-1', 'shared-app-1');

    expect(state).toEqual({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    });
  });
});
