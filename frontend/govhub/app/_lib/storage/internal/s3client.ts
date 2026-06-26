import { authWithRefresh } from '@/auth';
import { STS } from '@aws-sdk/client-sts';
import {
  DeleteObjectCommandOutput,
  S3,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { unsafeGetDefined } from 'udp-ui/assertion';
import { StorageObject, toS3Objects } from '@/app/_lib/storage/common';
import { getPublicEnv } from '@/app/_lib/env';
import { constants as httpStatus } from 'node:http2';
import { Either, left, right } from 'udp-ui/fp';
import { constant } from 'lodash';

export const mkS3Client = async () => {
  const session = await authWithRefresh();
  const idToken = unsafeGetDefined(
    session?.idToken,
    'ID token is required for S3 access',
  );

  const awsDefaultOptions = {
    region: 'none',
    forcePathStyle: true,
    endpoint: getPublicEnv('STORAGE_URI'),
  } as const;

  const mCredentials = unsafeGetDefined(
    (
      await new STS(awsDefaultOptions).assumeRoleWithWebIdentity({
        RoleArn: 'arn:aws:iam::RGW99999999999999999:role/usercode',
        RoleSessionName: 'usercode',
        WebIdentityToken: idToken,
      })
    ).Credentials,
    'Credentials are required for S3 access',
  );

  const credentials = {
    accessKeyId: unsafeGetDefined(
      mCredentials.AccessKeyId,
      'Access Key ID is required for S3 access',
    ),
    secretAccessKey: unsafeGetDefined(
      mCredentials.SecretAccessKey,
      'Secret Access Key is required for S3 access',
    ),
    sessionToken: unsafeGetDefined(
      mCredentials.SessionToken,
      'Session Token is required for S3 access',
    ),
  };

  return new S3({
    ...awsDefaultOptions,
    credentials,
  });
};

export type FetchObjectsError = {
  name: 'AccessDenied' | 'Unknown';
  e: unknown;
};

export const fetchObjects = async (
  bucket: string,
  s3client?: S3,
): Promise<Either<FetchObjectsError, StorageObject[]>> => {
  const client = s3client ?? (await mkS3Client());
  return client
    .listObjects({
      Bucket: bucket,
    })
    .then(toS3Objects)
    .then(right)
    .catch(fetchObjectsError);
};

const fetchObjectsError = (
  error: unknown,
): Either<FetchObjectsError, never> => {
  const mkError = (name: 'AccessDenied' | 'Unknown') =>
    left({
      name,
      e: error,
    });
  return error instanceof S3ServiceException && error.name === 'AccessDenied'
    ? mkError('AccessDenied')
    : mkError('Unknown');
};

export const deleteObject = async (
  bucket: string,
  key: string,
  s3client?: S3,
): Promise<boolean> => {
  const client = s3client ?? (await mkS3Client());
  const isNoContent = (resp: DeleteObjectCommandOutput) =>
    resp.$metadata.httpStatusCode === httpStatus.HTTP_STATUS_NO_CONTENT;
  return client
    .deleteObject({ Bucket: bucket, Key: key })
    .then(isNoContent)
    .catch(constant(false));
};
