import 'server-only';
import { fetcher } from '@/app/_lib/client/fetcher';
import { getPublicEnv } from '@/app/_lib/env';
import { requireAuth } from '@/app/_lib/auth';
import z from 'zod';

export const PresignZipUploadSchema = z.object({
  uploadUrl: z.string().url(),
});

export type PresignZipUpload = z.infer<typeof PresignZipUploadSchema>;

export const getPresignedZipUploadUrl: (
  bucket: string,
) => Promise<PresignZipUpload> = async (bucket) => {
  const metadataUrl = getPublicEnv('SENSOR_METADATA_URI');
  const session = await requireAuth();

  return fetcher(PresignZipUploadSchema)(
    `${metadataUrl}/api/v1/zipupload/presign/${bucket}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.idToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};
