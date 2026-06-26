import {
  internal,
  queryPublicAttributes,
} from '@/app/_lib/resource-api/graphql/publicAttributes';
import { query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

const queryMock = query as jest.Mock;

const TENANT = 'test-tenant';

describe('queryPublicAttributes', () => {
  it('calls query with the correct parameters', async () => {
    await queryPublicAttributes(TENANT);

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.PUBLIC_ATTRIBUTES,
      variables: { tenant: TENANT },
    });
  });
});
