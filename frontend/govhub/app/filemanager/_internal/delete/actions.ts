'use server';

import { deleteObject } from '@/app/_lib/storage/server';
import { revalidatePath } from 'next/cache';
import { ActionState } from '@/app/_lib/form/actionstate';
import { mutateDeleteDataset } from '@/app/_lib/resource-api/graphql/datasets';
import { mkState } from '@/app/filemanager/_internal/delete/form';

export const deleteS3Object: (
  tenant: string,
  project: string,
  bucket: string,
  key: string,
  dataset?: string,
  _prev?: ActionState,
) => Promise<ActionState> = async (tenant, project, bucket, key, dataset) => {
  if (dataset) {
    const state = await mutateDeleteDataset(tenant, project, dataset)
      .then(mkState)
      .catch(() => ({
        errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
      }));
    if (state.errors) return state;
  }
  const isSuccess = await deleteObject(bucket, key);
  revalidatePath(`/s3manager?${new URLSearchParams([['bucket', bucket]])}`);
  return isSuccess ? { data: {} } : { errors: {} };
};
