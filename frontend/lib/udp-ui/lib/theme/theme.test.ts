import { describe, expect, it } from 'vitest';
import { AppThemeRaw, mkTheme, unsafeMkTheme } from '@/lib/theme/theme.ts';
import { assertDefined } from '@/lib/assertion';

const COLOR_PRIMARY = '#293785';

describe('unsafeMkTheme', () => {
  it('throws an error if invalid color', () => {
    const raw: AppThemeRaw = {
      colorPrimary: 'not-a-color',
    };

    expect(() => unsafeMkTheme(raw)).toThrowError(
      'unsafeMkTheme: Color could not be parsed into a palette',
    );
  });

  it('returns a theme object for a valid color', () => {
    const raw: AppThemeRaw = {
      colorPrimary: COLOR_PRIMARY,
    };

    const result = unsafeMkTheme(raw);

    expectPalette(result);
  });
});

describe('mkTheme', () => {
  it('returns undefined if invalid color', () => {
    const raw: AppThemeRaw = {
      colorPrimary: 'not-a-color',
    };

    expect(mkTheme(raw)).toBeUndefined();
  });

  it('returns a theme object for a valid color', () => {
    const raw: AppThemeRaw = {
      colorPrimary: COLOR_PRIMARY,
    };

    const result = mkTheme(raw);

    assertDefined(result);
    expectPalette(result);
  });
});

const expectPalette = (result: Record<string, string>) => {
  expect(Object.keys(result)).toHaveLength(11);
  expect(result['color-primary-50']).toBe('231, 53%, 99%');
  expect(result['color-primary-100']).toBe('231, 53%, 94%');
  expect(result['color-primary-200']).toBe('231, 53%, 84%');
  expect(result['color-primary-300']).toBe('231, 53%, 74%');
  expect(result['color-primary-400']).toBe('231, 53%, 64%');
  expect(result['color-primary-500']).toBe('231, 53%, 54%');
  expect(result['color-primary-600']).toBe('231, 53%, 44%');
  expect(result['color-primary-700']).toBe('231, 53%, 34%');
  expect(result['color-primary-800']).toBe('231, 53%, 24%');
  expect(result['color-primary-900']).toBe('231, 53%, 14%');
  expect(result['color-primary-950']).toBe('231, 53%, 9%');
};
