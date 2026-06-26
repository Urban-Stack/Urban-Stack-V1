'use server';

import { mkCreateState } from '@/app/filemanager/_internal/dataset/form';
import {
  mutateCreateDataset,
  mutateDeleteDataset,
  mutateRefreshDataset,
} from '@/app/_lib/resource-api/graphql/datasets';
import { DatasetFormat } from '@/app/_lib/resource-api/project/dataset';
import { revalidatePath } from 'next/cache';
import { ActionState } from '@/app/_lib/form/actionstate';
import { mkState } from '@/app/filemanager/_internal/delete/form';
import { newName } from '@/app/_lib/resource-api/util/name';

export const createDataset: (
  tenant: string,
  project: string,
  key: string,
  format: DatasetFormat,
  _prevState?: ActionState,
) => Promise<ActionState> = async (tenant, project, key, format) =>
  await mutateCreateDataset(tenant, project, newName(key), key, format)
    .then(mkCreateState)
    .catch(() => ({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    }));

export const deleteDataset: (
  tenant: string,
  project: string,
  dataset: string,
  _prevState?: ActionState,
) => Promise<ActionState> = async (tenant, project, dataset) =>
  await mutateDeleteDataset(tenant, project, dataset)
    .then(mkState)
    .catch(() => ({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    }));

export const refreshDataset: (
  tenant: string,
  project: string,
  dataset: string,
  bucket: string,
) => Promise<ActionState> = async (tenant, project, dataset, bucket) => {
  const state = await mutateRefreshDataset(tenant, project, dataset)
    .then(mkState)
    .catch(() => ({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    }));
  revalidatePath(`/s3manager?${new URLSearchParams([['bucket', bucket]])}`);
  return state;
};
