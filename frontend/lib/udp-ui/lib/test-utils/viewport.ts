import { BreakpointObject, Viewport, VIEWPORTS } from '@/lib/tailwind/classes';

/**
 * Returns a viewport smaller than the given breakpoint.
 *
 * @param breakpoint breakpoint to return a smaller viewport for
 * @return a viewport smaller than the given breakpoint
 */
export const getViewportSmallerThan = (breakpoint: BreakpointObject) => {
  return Viewport[VIEWPORTS[breakpoint.valueOf() - 1]]!;
};

/**
 * Returns a viewport larger than the given breakpoint.
 *
 * @param breakpoint breakpoint to return a larger viewport for
 * @return a viewport larger than the given breakpoint
 */
export const getViewportLargerThan = (breakpoint: BreakpointObject) => {
  return Viewport[VIEWPORTS[breakpoint.valueOf()]]!;
};
