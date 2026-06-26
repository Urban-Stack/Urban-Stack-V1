import {
  parseCoords,
  parseNumber,
  sizeHumanReadable,
} from '@/app/_lib/misc/misc';

describe('parseNumber', () => {
  it('parses a number', () => {
    expect(parseNumber('123')).toEqual(123);
  });

  it('returns null for non-numbers', () => {
    expect(parseNumber('abc')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseNumber(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseNumber(null)).toBeNull();
  });
});

describe('parseCoords', () => {
  it('parses correct coordinates', () => {
    const coords = '51.936:8.873:13';
    const parsedCoords = parseCoords(coords);

    expect(parsedCoords).toEqual({
      x: 51.936,
      y: 8.873,
      zoom: 13,
    });
  });

  it('parses coordinates without zoom', () => {
    const coords = '51.936:8.873';
    const parsedCoords = parseCoords(coords);

    expect(parsedCoords).toEqual({
      x: 51.936,
      y: 8.873,
    });
  });

  it('parses coordinates even if extra arguments are provided', () => {
    const coords = '51.936:8.873:13:extra';
    const parsedCoords = parseCoords(coords);

    expect(parsedCoords).toEqual({
      x: 51.936,
      y: 8.873,
      zoom: 13,
    });
  });

  it.each(['51.936:8.873:extra', '51.936:x8.873', 'x51.936:8.873', '51.936'])(
    'returns null if coordinates are invalid',
    (coords) => {
      const parsedCoords = parseCoords(coords);

      expect(parsedCoords).toBeUndefined();
    },
  );
});

describe('sizeHumanReadable', () => {
  describe('invalid inputs', () => {
    test.each([-1, -100, Number.NaN, Infinity, -Infinity])(
      'returns undefined for for invalid input %p',
      (val) => {
        expect(sizeHumanReadable(val)).toBeUndefined();
      },
    );
  });

  describe('default options (de-DE, base 1024, max 2 digits)', () => {
    test.each<readonly [number, string]>([
      [0, '0 B'],
      [1, '1 B'],
      [512, '512 B'],
      [1023, '1.023 B'],
      [1024, '1 KB'],
      [1536, '1,5 KB'],
      [1024 ** 2, '1 MB'],
      [3 * 1024 ** 2, '3 MB'],
      [3 * 1024 ** 3, '3 GB'],
    ])('formats %i bytes → %s', (bytes, expected) => {
      expect(sizeHumanReadable(bytes)).toBe(expected);
    });
  });

  describe('locale override', () => {
    it('formats using en-US conventions', () => {
      const bytes = 1536; // 1.5 KiB
      const expected = '1.5 KB';
      expect(sizeHumanReadable(bytes, { locale: 'en-US' })).toBe(expected);
    });
  });

  describe('base override (1000)', () => {
    it('converts using decimal kilobyte', () => {
      const bytes = 1500; // 1.5 kB (decimal)
      const expected = '1,5 KB';
      expect(sizeHumanReadable(bytes, { base: 1000 })).toBe(expected);
    });
  });

  describe('maximumFractionDigits override', () => {
    it('respects rounding rules', () => {
      const bytes = 1536; // 1.5 KiB
      expect(sizeHumanReadable(bytes, { maximumFractionDigits: 0 })).toBe(
        '2 KB',
      );
    });
  });

  describe('values beyond GB', () => {
    it('reports large sizes in GB when cap reached', () => {
      const bytes = 5 * 1024 ** 4; // 5 TiB → 5 * 1024 GiB
      const expected = '5.120 GB';
      expect(sizeHumanReadable(bytes)).toBe(expected);
    });
  });
});
