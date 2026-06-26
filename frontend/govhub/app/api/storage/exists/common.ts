/* c8 ignore start */
const keys = ['bucket', 'key'] as const;
export const SEARCH_PARAMS = Object.freeze(
  Object.fromEntries(keys.map((key) => [key, key])),
) as Readonly<Record<(typeof keys)[number], string>>;
/* c8 ignore stop */

export const fetchExistsFile = async (
  bucket: string,
  key: string,
): Promise<boolean> => {
  const params = new URLSearchParams({
    [SEARCH_PARAMS.bucket]: bucket,
    [SEARCH_PARAMS.key]: key,
  });
  return fetch(`/api/storage/exists?${params.toString()}`)
    .then((res) => res.json())
    .then((o: { exists: boolean }) => o.exists);
};
