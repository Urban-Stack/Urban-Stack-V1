import 'server-only';
import {
  type Metadata,
  type PresignUpload,
  MetadataSchema,
  PresignUploadSchema,
  PresignDownload,
  PresignDownloadSchema,
} from '@/app/_lib/sensor-metadata/schema';
import { fetcher, fetcherRaw } from '@/app/_lib/client/fetcher';
import { getPublicEnv } from '@/app/_lib/env';
import { requireAuth } from '@/app/_lib/auth';

export const getMetadata: (
  tenant: string,
  project: string,
) => Promise<Metadata> = async (tenant, project) => {
  const metadataUrl = getPublicEnv('SENSOR_METADATA_URI');
  const session = await requireAuth();

  return fetcher(MetadataSchema)(
    `${metadataUrl}/api/v1/metadata/${tenant}/${project}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

export const deleteMetadata: (
  tenant: string,
  project: string,
) => Promise<void> = async (tenant, project) => {
  const metadataUrl = getPublicEnv('SENSOR_METADATA_URI');
  const session = await requireAuth();

  await fetcherRaw(`${metadataUrl}/api/v1/metadata/${tenant}/${project}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
};

export const getPresignedUploadUrl: (
  tenant: string,
  project: string,
) => Promise<PresignUpload> = async (tenant, project) => {
  const metadataUrl = getPublicEnv('SENSOR_METADATA_URI');
  const session = await requireAuth();

  return fetcher(PresignUploadSchema)(
    `${metadataUrl}/api/v1/metadata/${tenant}/${project}/presign/upload-token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

export const getPresignedDownloadUrl: (
  tenant: string,
  project: string,
) => Promise<PresignDownload> = async (tenant, project) => {
  const metadataUrl = getPublicEnv('SENSOR_METADATA_URI');
  const session = await requireAuth();

  return fetcher(PresignDownloadSchema)(
    `${metadataUrl}/api/v1/metadata/${tenant}/${project}/presign/download-token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};
