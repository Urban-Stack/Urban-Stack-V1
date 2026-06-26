import { describe, it, expect } from 'vitest';
import { Color, twPalette } from './tw-color-gen.ts';
import { closeTo } from '@/lib/__test__';

describe('twPalette', () => {
  const contains = (palette: Record<number, Color>, hex: Color['hex']) =>
    Object.values(palette)
      .map((c) => c.hex)
      .includes(hex);

  const expectEqColor: (hsl1: Color | undefined, hsl2: Color) => void = (
    hsl1,
    hsl2,
  ) => {
    closeTo(hsl1?.hsl.h, hsl2.hsl.h, 0);
    closeTo(hsl1?.hsl.s, hsl2.hsl.s, 2);
    closeTo(hsl1?.hsl.l, hsl2.hsl.l, 2);
  };

  it('returns undefined for short hex (#abc)', () => {
    const result = twPalette('#abc');
    expect(result).toBeUndefined();
  });

  it('returns undefined for invalid chars (#zzzzzz)', () => {
    const result = twPalette('#zzzzzz');
    expect(result).toBeUndefined();
  });

  const length = (palette: Record<number, Color> | undefined) =>
    Object.keys(palette ?? {}).length;

  it.each(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#aabbcc'])(
    'returns a palette for %s, which should also contain itself',
    (col) => {
      const palette = twPalette(col);
      expect(palette).toBeDefined();
      expect(length(palette)).toBe(11);

      const hasCol = palette && contains(palette, col);
      expect(hasCol).toBe(true);
    },
  );

  it('returns correct palette for #293785', () => {
    const palette = twPalette('#293785');
    expect(palette).toBeDefined();
    expect(length(palette)).toBe(11);

    const expected = [
      { key: 50, val: { hex: '#fcfcfe', hsl: { h: 231, s: 0.53, l: 0.99 } } },
      { key: 100, val: { hex: '#e8eaf8', hsl: { h: 231, s: 0.53, l: 0.94 } } },
      { key: 200, val: { hex: '#c1c8ec', hsl: { h: 231, s: 0.53, l: 0.84 } } },
      { key: 300, val: { hex: '#9aa5e0', hsl: { h: 231, s: 0.53, l: 0.74 } } },
      { key: 400, val: { hex: '#7382d4', hsl: { h: 231, s: 0.53, l: 0.64 } } },
      { key: 500, val: { hex: '#4c5fc8', hsl: { h: 231, s: 0.53, l: 0.54 } } },
      { key: 600, val: { hex: '#3547ac', hsl: { h: 231, s: 0.53, l: 0.44 } } },
      { key: 700, val: { hex: '#293785', hsl: { h: 231, s: 0.53, l: 0.34 } } },
      { key: 800, val: { hex: '#1d275e', hsl: { h: 231, s: 0.53, l: 0.24 } } },
      { key: 900, val: { hex: '#111737', hsl: { h: 231, s: 0.53, l: 0.14 } } },
      { key: 950, val: { hex: '#0b0f24', hsl: { h: 231, s: 0.53, l: 0.09 } } },
    ];

    expected.forEach(({ key, val }) => {
      expect(palette).toBeDefined();
      expectEqColor(palette && palette[key], val);
    });
  });

  it('returns correct palette for #f7ce12', () => {
    const palette = twPalette('#f7ce12');
    expect(palette).toBeDefined();
    expect(length(palette)).toBe(11);

    const expected = [
      { key: 50, val: { hex: '#fefcf0', hsl: { h: 49, s: 0.93, l: 0.97 } } },
      {
        key: 100,
        val: { hex: '#fef7d7', hsl: { h: 49.14, s: 0.93, l: 0.92 } },
      },
      { key: 200, val: { hex: '#fceda6', hsl: { h: 49.5, s: 0.93, l: 0.82 } } },
      {
        key: 300,
        val: { hex: '#fae275', hsl: { h: 49.14, s: 0.93, l: 0.72 } },
      },
      {
        key: 400,
        val: { hex: '#f9d843', hsl: { h: 49.08, s: 0.93, l: 0.62 } },
      },
      {
        key: 500,
        val: { hex: '#f7ce12', hsl: { h: 49.26, s: 0.93, l: 0.52 } },
      },
      {
        key: 600,
        val: { hex: '#cfab07', hsl: { h: 49.14, s: 0.93, l: 0.42 } },
      },
      {
        key: 700,
        val: { hex: '#9e8205', hsl: { h: 49.02, s: 0.93, l: 0.32 } },
      },
      {
        key: 800,
        val: { hex: '#6c5a04', hsl: { h: 49.56, s: 0.93, l: 0.22 } },
      },
      {
        key: 900,
        val: { hex: '#3b3102', hsl: { h: 49.38, s: 0.93, l: 0.12 } },
      },
      {
        key: 950,
        val: { hex: '#221c01', hsl: { h: 49.08, s: 0.93, l: 0.07 } },
      },
    ];

    expected.forEach(({ key, val }) => {
      expect(palette).toBeDefined();
      expectEqColor(palette && palette[key], val);
    });
  });
});
