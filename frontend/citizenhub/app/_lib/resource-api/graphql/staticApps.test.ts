import {
  internal,
  queryPublicStaticApps,
} from '@/app/_lib/resource-api/graphql/staticApps';
import { query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

const queryMock = query as jest.Mock;

const TENANT = 'test-tenant';

describe('queryPublicStaticApps', () => {
  it('calls query with the correct parameters', async () => {
    await queryPublicStaticApps(TENANT);

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.PUBLIC_STATIC_APPS,
      variables: { tenant: TENANT },
    });
  });
});
