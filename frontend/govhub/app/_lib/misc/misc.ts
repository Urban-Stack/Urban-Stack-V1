import { tryUndefined, unsafeParseFloat, unsafeParseInt } from 'udp-ui/fp';

/**
 * Parse any value to a number, if possible. Otherwise, return null.
 * @param num The value to parse.
 */
export const parseNumber: (num: unknown) => number | null = (num) => {
  const parsed = Number(num);
  return num === null || num === undefined || isNaN(parsed) ? null : parsed;
};

export interface MapCoords {
  x: number;
  y: number;
  zoom?: number;
}

export const parseCoords = (coordStr: string): MapCoords | undefined => {
  const [xStr, yStr, zoomStr] = coordStr.split(':');
  return tryUndefined(() => ({
    x: unsafeParseFloat(xStr),
    y: unsafeParseFloat(yStr),
    zoom: zoomStr ? unsafeParseInt(zoomStr) : undefined,
  }));
};

export interface SizeHumanReadableOptions {
  /** I18n locale passed to Intl.NumberFormat. Default: "de-DE" */
  locale?: string;
  base?: 1000 | 1024;
  maximumFractionDigits?: number;
}

const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export const sizeHumanReadable = (
  sizeInBytes: number,
  {
    locale = 'de-DE',
    base = 1024,
    maximumFractionDigits = 2,
  }: SizeHumanReadableOptions = {},
): string | undefined => {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) return undefined;

  let value = sizeInBytes;
  let unitIndex = 0;

  while (value >= base && unitIndex < UNITS.length - 1) {
    value /= base;
    unitIndex += 1;
  }

  const formattedNumber = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);

  return `${formattedNumber} ${UNITS[unitIndex]}`;
};

/** https://stackoverflow.com/a/7616484/7462991 */
/* c8 ignore start */
export const genHash: (str: string) => number = (str) => {
  let hash = 0;
  for (const char of str) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
};
/* c8 ignore end */
