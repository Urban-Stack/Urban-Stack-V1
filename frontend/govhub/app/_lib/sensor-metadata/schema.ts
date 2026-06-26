/* c8 ignore start */
import z from 'zod';

export const MetadataSchema = z.object({
  count: z.number(),
});
export type Metadata = z.infer<typeof MetadataSchema>;

export const PresignUploadSchema = z.object({
  uploadUrl: z.string().url(),
  expiresAt: z.number(),
});
export type PresignUpload = z.infer<typeof PresignUploadSchema>;

export const PresignDownloadSchema = z.object({
  downloadUrl: z.string().url(),
  expiresAt: z.number(),
});
export type PresignDownload = z.infer<typeof PresignDownloadSchema>;
/* c8 ignore end */
