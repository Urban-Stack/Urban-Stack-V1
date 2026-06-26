import 'client-only';

export type LocalStorageKey = 'UCH_SIDEBAR_OPEN';

export const getLocalStorage: (key: LocalStorageKey) => string | null = (key) =>
  localStorage.getItem(key);

export const setLocalStorage: (key: LocalStorageKey, value: string) => void = (
  key,
  value,
) => localStorage.setItem(key, value);

export const removeLocalStorage: (key: LocalStorageKey) => void = (key) =>
  localStorage.removeItem(key);
