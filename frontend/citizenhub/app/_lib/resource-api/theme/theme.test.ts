import { DEFAULT_THEME } from 'udp-ui/theme';
import { themeOrDefault } from '@/app/_lib/resource-api/theme/theme';
import { query } from '@/app/_lib/resource-api/client';
import { internal } from '@/app/_lib/resource-api/graphql/publicAttributes';
import { TEST_PUBLIC_ATTRIBUTES_QUERIED } from '@/app/_test/attributes';

const { PUBLIC_ATTRIBUTES } = internal;

const TEST_TENANT = 'test-tenant';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));
const queryMock = query as jest.Mock;

beforeEach(() => {
  queryMock.mockReset();
});

describe('themeOrDefault', () => {
  it('retrieves the public attributes for the given tenant and returns the corresponding theme', async () => {
    queryMock.mockResolvedValue({
      data: {
        publicAttributes: TEST_PUBLIC_ATTRIBUTES_QUERIED,
      },
    });

    const result = await themeOrDefault(TEST_TENANT);

    expectPalette(result);
    expect(queryMock).toHaveBeenCalledWith({
      query: PUBLIC_ATTRIBUTES,
      variables: { tenant: TEST_TENANT },
    });
  });

  it('returns the default theme if primary color is missing', async () => {
    queryMock.mockResolvedValue({
      data: {
        publicAttributes: [
          ...TEST_PUBLIC_ATTRIBUTES_QUERIED,
          { key: 'uch-color-primary', value: undefined },
        ],
      },
    });

    const result = await themeOrDefault(TEST_TENANT);

    expect(result).toEqual(DEFAULT_THEME);
  });

  it('returns the default theme if any error occurs while querying the public attributes', async () => {
    queryMock.mockRejectedValue(new Error('any error'));

    const result = await themeOrDefault(TEST_TENANT);

    expect(result).toEqual(DEFAULT_THEME);
  });
});

const expectPalette = (result: Record<string, string>) => {
  expect(Object.keys(result)).toHaveLength(11);
  expect(result['color-primary-50']).toBe('210, 65%, 95%');
  expect(result['color-primary-100']).toBe('210, 65%, 90%');
  expect(result['color-primary-200']).toBe('210, 65%, 80%');
  expect(result['color-primary-300']).toBe('210, 65%, 70%');
  expect(result['color-primary-400']).toBe('210, 65%, 60%');
  expect(result['color-primary-500']).toBe('210, 65%, 50%');
  expect(result['color-primary-600']).toBe('210, 65%, 40%');
  expect(result['color-primary-700']).toBe('210, 65%, 30%');
  expect(result['color-primary-800']).toBe('210, 65%, 20%');
  expect(result['color-primary-900']).toBe('210, 65%, 10%');
  expect(result['color-primary-950']).toBe('210, 65%, 5%');
};
