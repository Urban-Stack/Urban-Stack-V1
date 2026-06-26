import { _Object, ListObjectsCommandOutput } from '@aws-sdk/client-s3';
import { Project } from '@/app/_lib/resource-api/project';
import { isDefined } from 'udp-ui/fp';

export interface StorageObject {
  readonly key: string;
  readonly lastModified: Date;
  readonly sizeInBytes: number;
  readonly downloadHref: string;
  readonly filetype?: string;
  readonly _tag: 'StorageObject';
}

export const toS3Objects: (
  result: ListObjectsCommandOutput,
) => StorageObject[] = ({ Name: name, Contents: contents }) =>
  name && contents
    ? contents
        .filter(
          (o): o is Required<_Object> =>
            !!(o.Key && o.Size != undefined && o.LastModified),
        )
        .map(({ Key: key, LastModified: lastModified, Size: sizeInBytes }) =>
          mkStorageObject(key, lastModified, sizeInBytes, name),
        )
        .filter(isDefined)
    : [];

const DATASET_FILETYPES: Readonly<Set<string>> = new Set(['csv', 'json']);
export const canBeUsedForDataset: (so: StorageObject) => boolean = (so) =>
  !!so.filetype &&
  DATASET_FILETYPES.has(so.filetype) &&
  so.sizeInBytes > 0 &&
  validDatasetFilename(so.key);

const mkStorageObject: (
  key: string,
  lastModified: Date,
  sizeInBytes: number,
  bucket: string,
) => StorageObject | undefined = (key, lastModified, sizeInBytes, bucket) => {
  const ft = filetype(key);
  return validFilename(key)
    ? {
        key,
        lastModified,
        sizeInBytes,
        downloadHref: mkDownloadUrl(bucket, key),
        filetype: ft,
        _tag: 'StorageObject',
      }
    : undefined;
};

const filetype: (key: string) => string | undefined = (
  key,
): string | undefined => {
  const parts = key
    .toLowerCase()
    .split('.')
    .filter((w) => w.length > 0);
  return parts.length > 1 ? parts.pop() : undefined;
};

export const validFilename = (filename: string) =>
  /^[\sa-zA-Z0-9()+,.;:=@_/-]+$/.test(filename);

export const validDatasetFilename = (filename: string) =>
  /^[a-zA-Z0-9()+,.;:=@_/-]+\.[a-zA-Z0-9]+$/.test(filename);

const mkDownloadUrl: (bucket: string, key: string) => string = (
  bucket,
  key,
) => {
  const params = new URLSearchParams({
    bucket,
    key,
  });
  return `/api/storage/download?${params.toString()}`;
};

export const bucketName: (project: Project) => string = (p) =>
  `${p.tenant}.${p.name}`;

export const splitBucketName: (bucket: string) =>
  | {
      tenant: string;
      project: string;
    }
  | undefined = (bucket) => {
  const parts = bucket.split('.');
  if (parts.length !== 2) return undefined;

  const [tenant, project] = parts;
  if (!tenant || !project) return undefined;
  return { tenant, project };
};

export const cmpByDateDesc = (a: StorageObject, b: StorageObject) =>
  b.lastModified.getTime() - a.lastModified.getTime();

export const internal = {
  mkStorageObject,
  mkDownloadUrl,
  filetype,
};
