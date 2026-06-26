import { Color, Palette, twPalette } from '@/lib/tailwind/tw-color-gen.ts';

export type AppThemeRaw = {
  colorPrimary: string;
};

export type AppTheme = {
  'color-primary-950': string;
  'color-primary-900': string;
  'color-primary-800': string;
  'color-primary-700': string;
  'color-primary-600': string;
  'color-primary-500': string;
  'color-primary-400': string;
  'color-primary-300': string;
  'color-primary-200': string;
  'color-primary-100': string;
  'color-primary-50': string;
};

export const DEFAULT_THEME: AppTheme = {
  'color-primary-950': '231, 58%, 29%',
  'color-primary-900': '231, 53%, 34%',
  'color-primary-800': '231, 40%, 40%',
  'color-primary-700': '232, 31%, 47%',
  'color-primary-600': '231, 27%, 54%',
  'color-primary-500': '231, 27%, 60%',
  'color-primary-400': '232, 27%, 67%',
  'color-primary-300': '232, 26%, 73%',
  'color-primary-200': '233, 27%, 80%',
  'color-primary-100': '230, 26%, 87%',
  'color-primary-50': '233, 27%, 94%',
};

export const unsafeMkTheme: (raw: AppThemeRaw) => AppTheme = (raw) => {
  const palette = mkTheme(raw);
  if (palette === undefined)
    throw new Error('unsafeMkTheme: Color could not be parsed into a palette');
  else return palette;
};

export const mkTheme: (raw: AppThemeRaw) => AppTheme | undefined = (raw) => {
  const palette = twPalette(raw.colorPrimary);
  if (palette === undefined) return undefined;
  else return format('primary', palette);
};

const format: (name: string, palette: Palette) => AppTheme = (name, palette) =>
  Object.fromEntries(
    Object.entries(palette).map(([twKey, color]) => [
      `color-${name}-${twKey}`,
      _stringify(color),
    ]),
  ) as AppTheme;

const _stringify: (color: Color) => string = (color) =>
  `${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%`;

export const internal = {
  _stringify,
};
