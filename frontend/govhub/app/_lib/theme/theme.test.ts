import { DEFAULT_THEME } from 'udp-ui/theme';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { internal, themeOrDefault } from '@/app/_lib/theme/theme';
import { ThemeAttributes } from '@/app/_lib/resource-api/graphql/attributes';
import { query } from '@/app/_lib/resource-api/client';

const COLOR = '#123456';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockRequireTenant = requireTenant as jest.Mock;

beforeAll(() => {
  mockRequireTenant.mockResolvedValue('test-tenant');
});

beforeEach(() => {
  mockQuery.mockReset();
});

describe('themeOrDefault', () => {
  it('returns the default theme if no primary color', async () => {
    mockQuery.mockResolvedValue({ data: { tenant: null } });

    const result = await themeOrDefault();

    expect(result).toEqual(DEFAULT_THEME);
  });

  it('returns the fetched theme if unsafeTheme succeeds', async () => {
    mockQuery.mockResolvedValue({
      data: {
        tenant: {
          colorPrimary: COLOR,
        },
      },
    });
    const result = await themeOrDefault();

    expectPalette(result);
  });
});

describe('unsafeTheme', () => {
  it('fetches theme attributes and transforms them into AppThemeRaw', async () => {
    mockQuery.mockResolvedValue({
      data: { tenant: { colorPrimary: COLOR } },
    });

    const result = await internal.unsafeTheme();

    expect(mockRequireTenant).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith({
      query: expect.any(Object),
      variables: {
        tenant: 'test-tenant',
      },
    });

    expectPalette(result);
  });

  it('throws an error if required attributes are missing', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        tenant: {
          colorPrimary: null,
        },
      },
    });

    await expect(internal.unsafeTheme()).rejects.toThrow();
  });
});

describe('unsafeThemeRaw', () => {
  it.each([
    { data: { tenant: null } },
    { data: { tenant: { colorPrimary: null } } },
  ] as unknown as ThemeAttributes[])(
    'throws if primary color is missing',
    (invalidRawTheme) => {
      expect(() => internal.unsafeThemeRaw(invalidRawTheme)).toThrow();
    },
  );

  it('returns raw theme if primary color is present', () => {
    const result = internal.unsafeThemeRaw({
      data: { tenant: { colorPrimary: COLOR } },
    } as unknown as ThemeAttributes);

    expect(result).toEqual({ colorPrimary: COLOR });
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
