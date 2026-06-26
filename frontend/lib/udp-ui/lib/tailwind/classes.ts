const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
export type BreakpointType = (typeof BREAKPOINTS)[number];

export type BreakpointObject = {
  readonly name: BreakpointType;
  readonly valueOf: () => number;
  readonly toString: () => string;
};

export const Breakpoint = BREAKPOINTS.reduce(
  (bps, name) => {
    bps[name] = {
      name,
      toString: () => name,
      valueOf: () => VIEWPORT_RANKS[name],
    };
    return bps;
  },
  {} as Record<BreakpointType, BreakpointObject>,
);

export const VIEWPORTS = ['base', ...Object.keys(Breakpoint)] as const;
type ViewportType = (typeof VIEWPORTS)[number];

export type ViewportObject = {
  readonly name: ViewportType;
  readonly valueOf: () => number;
  readonly toString: () => string;
};

export const Viewport = VIEWPORTS.reduce(
  (vps, name) => {
    vps[name] = {
      name,
      toString: () => name,
      valueOf: () => VIEWPORT_RANKS[name],
    };
    return vps;
  },
  {} as Record<ViewportType, ViewportObject>,
);

/*
 * Numerical values for the individual viewports.
 * Used as a common basis for mutual comparison of viewports and breakpoints.
 */
const VIEWPORT_RANKS = Object.fromEntries(
  VIEWPORTS.map((name, index) => [name, index]),
) as Record<ViewportType, number>;
