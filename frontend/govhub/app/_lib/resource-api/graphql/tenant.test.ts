import {
  fetchTenantDisplayName,
  internal,
  queryHasTenantScope,
} from './tenant';
import { mutate, query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

beforeEach(() => {
  mockQuery.mockReset();
});

describe('fetchTenantDisplayName', () => {
  it('returns the display name if one exists', async () => {
    mockQuery.mockResolvedValue({
      data: { tenant: { attribute: 'Tenant 1' } },
    });

    const displayName = await fetchTenantDisplayName('tenant1');

    expect(displayName).toEqual('Tenant 1');
  });

  it('returns undefined if no display name exist', async () => {
    mockQuery.mockResolvedValue({ data: { tenant: {} } });

    const displayName = await fetchTenantDisplayName('tenant1');

    expect(displayName).toBeUndefined();
  });
});

describe('fetchAttribute', () => {
  it('should call the client with the correct query', async () => {
    await internal.fetchAttribute('tenant1', 'attribute1');

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.SINGLE_ATTRIBUTE,
      variables: {
        tenant: 'tenant1',
        attribute: 'attribute1',
      },
    });
  });
});

describe('queryHasTenantScope', () => {
  it('should call the client with the correct query', async () => {
    mockQuery.mockResolvedValue({
      data: { tenant: { hasScopes: false } },
    });

    await queryHasTenantScope('guetersloh', 'tenant:admin');

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.HAS_TENANT_SCOPE,
      variables: {
        tenant: 'guetersloh',
        scope: 'tenant:admin',
      },
    });
  });
});
