import 'client-only';

export type SessionStorageKey = 'UGH_DISCOURSE_LAST_CHANNEL_ID';

export const getSessionStorage: (key: SessionStorageKey) => string | null = (
  key,
) => sessionStorage.getItem(key);

export const setSessionStorage: (
  key: SessionStorageKey,
  value: string,
) => void = (key, value) => sessionStorage.setItem(key, value);

export const removeSessionStorage: (key: SessionStorageKey) => void = (key) =>
  sessionStorage.removeItem(key);
