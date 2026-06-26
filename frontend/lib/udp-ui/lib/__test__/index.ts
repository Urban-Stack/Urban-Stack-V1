import { expect } from 'vitest';

export const closeTo = (
  actual: number | undefined,
  expected: number,
  precision = 2,
) => {
  expect(actual).toBeCloseTo(expected, precision);
};
