import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/* c8 ignore start */
export const fetchDownloadUrl: (
  s3: S3,
  bucket: string,
  key: string,
  ttlSeconds?: number,
) => Promise<string> = async (s3, bucket, key, ttlSeconds = 60) => {
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    /* Tell the browser to download instead of previewing */
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
      key.split('/').pop()!,
    )}"`,
  });

  return getSignedUrl(s3, cmd, { expiresIn: ttlSeconds });
};
/* c8 ignore stop */
