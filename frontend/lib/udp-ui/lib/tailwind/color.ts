import { unsafeParseInt } from '../fp';

export type Rgb = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly _tag: 'RGB';
};

export type Hsl = {
  readonly h: number;
  readonly s: number;
  readonly l: number;
  readonly _tag: 'HSL';
};

export const parseRgb: (hex: string) => Rgb | undefined = (hex) => {
  const _hex = hex.replace(/^#/, '');
  if (_hex.length !== 6) return undefined;

  try {
    const r = unsafeParseInt(_hex.substring(0, 2), 16);
    const g = unsafeParseInt(_hex.substring(2, 4), 16);
    const b = unsafeParseInt(_hex.substring(4, 6), 16);
    return mkRgb(r, g, b);
  } catch (_) {
    return undefined;
  }
};

export const rgbToHSL: (rgb: Rgb) => Hsl = ({ r, g, b }) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case rNorm:
        h = 60 * (((gNorm - bNorm) / delta) % 6);
        break;
      case gNorm:
        h = 60 * ((bNorm - rNorm) / delta + 2);
        break;
      case bNorm:
        h = 60 * ((rNorm - gNorm) / delta + 4);
        break;
    }
  }

  if (h < 0) {
    h += 360;
  }

  return mkHsl(h, s, l);
};

export const hslToHex: (hsl: Hsl) => string = ({ h, s, l }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1;
  let g1;
  let b1;

  if (0 <= h && h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (60 <= h && h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (120 <= h && h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (180 <= h && h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (240 <= h && h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  const toHex = (val: number) => val.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mkRgb = (r: number, g: number, b: number): Rgb => ({
  r,
  g,
  b,
  _tag: 'RGB',
});

const mkHsl = (h: number, s: number, l: number): Hsl => ({
  h,
  s,
  l,
  _tag: 'HSL',
});

export const _internal = {
  mkRgb,
  mkHsl,
};
