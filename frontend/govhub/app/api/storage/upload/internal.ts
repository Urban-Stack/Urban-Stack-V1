import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3 } from '@aws-sdk/client-s3';
import { PresignedPost } from './common';

/* c8 ignore start */
/**
 * Build a presigned POST so the browser can upload directly to S3.
 * `ttlSeconds` – how long the form remains valid (default 60 s).
 */
export const fetchUploadPost = async (
  s3: S3,
  bucket: string,
  key: string,
  contentType: string,
  ttlSeconds = 60,
  maxMiB = 5_000,
): Promise<PresignedPost> =>
  createPresignedPost(s3, {
    Bucket: bucket,
    Key: key,
    Expires: ttlSeconds,
    Fields: { 'Content-Type': contentType },
    Conditions: [
      ['content-length-range', 0, maxMiB * 1024 ** 2],
      ['eq', '$Content-Type', contentType],
    ],
  });
/* c8 ignore stop */
