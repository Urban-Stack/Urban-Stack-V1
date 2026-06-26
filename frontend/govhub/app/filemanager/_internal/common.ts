const keys = ['bucket'] as const;
export const SEARCH_PARAMS = Object.freeze(
  Object.fromEntries(keys.map((key) => [key, key])),
) as Readonly<Record<(typeof keys)[number], string>>;
