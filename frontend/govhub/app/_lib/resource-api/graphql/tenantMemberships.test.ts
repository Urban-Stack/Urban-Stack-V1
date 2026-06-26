import { fetchTenantMemberships } from './tenantMemberships';
import { query } from '@/app/_lib/resource-api/client';

const mockQuery = query as unknown as jest.Mock;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  mockQuery.mockReset();
});

describe('fetchTenantMemberships', () => {
  it('deduplicates and sorts the result', async () => {
    mockQuery.mockResolvedValue({
      data: {
        keycloakGroupMemberships: [
          {
            __typename: 'Group',
            tenant: 'knuffingen123',
          },
          {
            __typename: 'Tenant',
            tenant: 'knuffingen123',
          },
          {
            __typename: 'Tenant',
            tenant: 'guetersloh',
          },
          {
            __typename: 'Tenant',
            tenant: 'detmold',
          },
        ],
      },
    });

    await expect(fetchTenantMemberships()).resolves.toEqual([
      'detmold',
      'guetersloh',
      'knuffingen123',
    ]);
  });

  it('works when there are no tenants', async () => {
    mockQuery.mockResolvedValue({
      data: { keycloakGroupMemberships: [] },
    });

    await expect(fetchTenantMemberships()).resolves.toEqual([]);
  });
});
