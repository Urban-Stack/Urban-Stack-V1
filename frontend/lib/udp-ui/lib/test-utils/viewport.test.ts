import { describe, expect, it } from 'vitest';
import { Breakpoint } from '@/lib/tailwind/classes';
import {
  getViewportLargerThan,
  getViewportSmallerThan,
} from '@/lib/test-utils/viewport';

describe('getViewportSmallerThan', () => {
  it.each(Object.values(Breakpoint))(
    "returns a viewport smaller than given breakpoint '%s'",
    (breakpoint) => {
      const viewport = getViewportSmallerThan(breakpoint);

      expect(viewport.valueOf()).lessThan(breakpoint.valueOf());
    },
  );
});

describe('getViewportLargerThan', () => {
  it.each(Object.values(Breakpoint))(
    "returns a viewport larger than given breakpoint '%s'",
    (breakpoint) => {
      const viewport = getViewportLargerThan(breakpoint);

      expect(viewport.valueOf()).greaterThanOrEqual(breakpoint.valueOf());
    },
  );
});
