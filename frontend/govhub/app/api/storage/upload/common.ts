import z from 'zod';

/* c8 ignore start */
const keys = ['bucket', 'key', 'contentType'] as const;
export const SEARCH_PARAMS = Object.freeze(
  Object.fromEntries(keys.map((key) => [key, key])),
) as Readonly<Record<(typeof keys)[number], string>>;
/* c8 ignore stop */

export const PresignedPostSchema = z.object({
  url: z.string(),
  fields: z.record(z.string(), z.string()),
});
export type PresignedPost = z.infer<typeof PresignedPostSchema>;

export const fetchUploadUrl: (
  bucket: string,
  file: File,
) => Promise<PresignedPost> = async (bucket, file) => {
  const params = new URLSearchParams({
    [SEARCH_PARAMS.bucket]: bucket,
    [SEARCH_PARAMS.key]: file.name,
    [SEARCH_PARAMS.contentType]: file.type
      ? file.type
      : 'application/octet-stream',
  });

  return fetch(`/api/storage/upload?${params.toString()}`).then(
    (resp) => resp.json() as Promise<PresignedPost>,
  );
};
