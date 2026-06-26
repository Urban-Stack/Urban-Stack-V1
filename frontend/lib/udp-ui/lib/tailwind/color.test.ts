import { describe, it, expect } from 'vitest';
import { _internal, Hsl, hslToHex, parseRgb, Rgb, rgbToHSL } from './color.ts';
import { closeTo } from '@/lib/__test__';

const { mkRgb, mkHsl } = _internal;

describe('parseRgb', () => {
  it.each([
    ['000000', { r: 0, g: 0, b: 0, _tag: 'RGB' }],
    ['ffffff', { r: 255, g: 255, b: 255, _tag: 'RGB' }],
    ['FFFFFF', { r: 255, g: 255, b: 255, _tag: 'RGB' }],
    ['ff0000', { r: 255, g: 0, b: 0, _tag: 'RGB' }],
    ['00ff00', { r: 0, g: 255, b: 0, _tag: 'RGB' }],
    ['0000ff', { r: 0, g: 0, b: 255, _tag: 'RGB' }],
    ['123456', { r: 18, g: 52, b: 86, _tag: 'RGB' }],
  ])('parses RGB from hex %p', (hex, expected) => {
    const rgb = parseRgb(hex);
    expect(rgb).toEqual(expected);
  });

  it.each(['ff00', 'xxyyzz'])(
    'returns undefined for invalid hex',
    (invalid) => {
      const rgb = parseRgb(invalid);
      expect(rgb).toBe(undefined);
    },
  );

  it.each([
    ['#000000', { r: 0, g: 0, b: 0, _tag: 'RGB' }],
    ['#ffffff', { r: 255, g: 255, b: 255, _tag: 'RGB' }],
    ['#ff0000', { r: 255, g: 0, b: 0, _tag: 'RGB' }],
    ['#00ff00', { r: 0, g: 255, b: 0, _tag: 'RGB' }],
    ['#0000ff', { r: 0, g: 0, b: 255, _tag: 'RGB' }],
    ['#123456', { r: 18, g: 52, b: 86, _tag: 'RGB' }],
  ])('supports # prefix', (hex, expected) => {
    const rgb = parseRgb(hex);
    expect(rgb).toEqual(expected);
  });
});

describe('rgbToHSL', () => {
  it.each<[string, Rgb, Hsl]>([
    [
      'Black',
      { r: 0, g: 0, b: 0, _tag: 'RGB' },
      { h: 0, s: 0, l: 0, _tag: 'HSL' },
    ],
    [
      'White',
      { r: 255, g: 255, b: 255, _tag: 'RGB' },
      { h: 0, s: 0, l: 1, _tag: 'HSL' },
    ],
    [
      'Red',
      { r: 255, g: 0, b: 0, _tag: 'RGB' },
      { h: 0, s: 1, l: 0.5, _tag: 'HSL' },
    ],
    [
      'Green',
      { r: 0, g: 255, b: 0, _tag: 'RGB' },
      { h: 120, s: 1, l: 0.5, _tag: 'HSL' },
    ],
    [
      'Blue',
      { r: 0, g: 0, b: 255, _tag: 'RGB' },
      { h: 240, s: 1, l: 0.5, _tag: 'HSL' },
    ],
    [
      '#aabbcc approximate test',
      { r: 170, g: 187, b: 204, _tag: 'RGB' },
      { h: 210, s: 0.25, l: 0.73, _tag: 'HSL' },
    ],
    [
      '#123456 approximate test',
      { r: 18, g: 52, b: 86, _tag: 'RGB' },
      { h: 210, s: 0.65, l: 0.2, _tag: 'HSL' },
    ],
    [
      '#fedcba approximate test',
      { r: 254, g: 220, b: 186, _tag: 'RGB' },
      { h: 30, s: 0.97, l: 0.86, _tag: 'HSL' },
    ],
    [
      'handles negative hue values, e.g. #ff0080',
      { r: 255, g: 0, b: 128, _tag: 'RGB' },
      { h: 329.88, s: 1, l: 0.5, _tag: 'HSL' },
    ],
  ])('converts %s correctly', (_, inputRgb, expectedHsl) => {
    const result = rgbToHSL(inputRgb);

    closeTo(result.h, expectedHsl.h);
    closeTo(result.s, expectedHsl.s);
    closeTo(result.l, expectedHsl.l);
  });
});

describe('hslToHex', () => {
  it.each<[string, Hsl, string]>([
    ['Black -> #000000', { h: 0, s: 0, l: 0, _tag: 'HSL' }, '#000000'],
    ['White -> #ffffff', { h: 0, s: 0, l: 1, _tag: 'HSL' }, '#ffffff'],
    ['Red -> #ff0000', { h: 0, s: 1, l: 0.5, _tag: 'HSL' }, '#ff0000'],
    ['Green -> #00ff00', { h: 120, s: 1, l: 0.5, _tag: 'HSL' }, '#00ff00'],
    ['Blue -> #0000ff', { h: 240, s: 1, l: 0.5, _tag: 'HSL' }, '#0000ff'],
    [
      'h=210, s=0.25, l=0.73 -> #aabbcc',
      { h: 210, s: 0.25, l: 0.7333, _tag: 'HSL' },
      '#aabbcc',
    ],
    [
      'h=30, s=0.97, l=0.86 -> #fedbb9',
      { h: 30, s: 0.97, l: 0.86, _tag: 'HSL' },
      '#fedbb9',
    ],
  ])('converts %s correctly', (_, hsl, expected) => {
    const result = hslToHex(hsl);
    expect(result.toLowerCase()).toBe(expected);
  });
});

describe('mkRgb', () => {
  it('creates RGB object', () => {
    const rgb = mkRgb(0.1, 0.2, 0.3);
    expect(rgb).toEqual({ r: 0.1, g: 0.2, b: 0.3, _tag: 'RGB' });
  });
});

describe('mkHsl', () => {
  it('creates HSL object', () => {
    const hsl = mkHsl(0.1, 0.2, 0.3);
    expect(hsl).toEqual({ h: 0.1, s: 0.2, l: 0.3, _tag: 'HSL' });
  });
});
