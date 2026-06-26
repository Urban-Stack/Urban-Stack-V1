/* c8 ignore start */
const keys = ['tenant', 'project'] as const;
export const SEARCH_PARAMS = Object.freeze(
  Object.fromEntries(keys.map((key) => [key, key])),
) as Readonly<Record<(typeof keys)[number], string>>;
/* c8 ignore stop */
