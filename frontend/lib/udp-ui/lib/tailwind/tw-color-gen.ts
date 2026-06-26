import { _internal, Hsl, hslToHex, parseRgb, rgbToHSL } from './color.ts';

const TAILWIND_LIGHTNESS_BASELINE: Record<number, number> = {
  50: 0.95,
  100: 0.9,
  200: 0.8,
  300: 0.7,
  400: 0.6,
  500: 0.5,
  600: 0.4,
  700: 0.3,
  800: 0.2,
  900: 0.1,
  950: 0.05,
};

export type Palette = Record<number, Color>;

export type Color = {
  hex: string;
  hsl: {
    h: number;
    s: number;
    l: number;
  };
};

/**
 * Returns a Tailwind-like color scale (keys 50..950), ensuring
 * the user-supplied color ends up in the shade that best matches its lightness.
 */
export const twPalette: (hex: string) => Palette | undefined = (hex) => {
  const rgb = parseRgb(hex);
  if (rgb === undefined) return undefined;

  const hsl = rgbToHSL(rgb);

  return Object.fromEntries(_twPalette(hsl));
};

const _twPalette: (hsl: Hsl) => ReadonlyMap<number, Color> = ({
  h,
  s,
  l: inputL,
}) => {
  let actualShade: number = 50;
  let minDiff = Infinity;

  for (const shadeString of Object.keys(TAILWIND_LIGHTNESS_BASELINE)) {
    const shade = Number(shadeString);
    const baselineL = TAILWIND_LIGHTNESS_BASELINE[shade];
    const diff = Math.abs(baselineL - inputL);
    if (diff < minDiff) {
      minDiff = diff;
      actualShade = shade;
    }
  }

  const shadeBaselineL = TAILWIND_LIGHTNESS_BASELINE[actualShade];
  const shift = inputL - shadeBaselineL;

  const palette: Map<number, Color> = new Map();
  for (const shadeString of Object.keys(TAILWIND_LIGHTNESS_BASELINE)) {
    const shade = Number(shadeString);
    let newL = TAILWIND_LIGHTNESS_BASELINE[shade] + shift;

    newL = Math.min(Math.max(newL, 0), 1);

    const hsl = _internal.mkHsl(h, s, newL);
    const color: Color = {
      hex: hslToHex(hsl),
      hsl,
    };
    palette.set(shade, color);
  }

  return palette;
};
