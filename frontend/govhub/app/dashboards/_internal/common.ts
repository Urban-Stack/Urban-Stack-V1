/**
 * Enumeration of the type of the Dashboard view.
 */
export enum ViewType {
  list,
  card,
}

export const DEFAULT_VIEW = ViewType.card;

const keys = ['search', 'view', 'favorites', 'status', 'vizgroups'] as const;
export const SEARCH_PARAMS = Object.freeze(
  Object.fromEntries(keys.map((key) => [key, key])),
) as Readonly<Record<(typeof keys)[number], string>>;
