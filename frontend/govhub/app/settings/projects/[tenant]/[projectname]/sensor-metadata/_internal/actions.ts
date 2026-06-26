'use server';

import { ActionState } from '@/app/_lib/form/actionstate';
import {
  deleteMetadata,
  getPresignedUploadUrl,
} from '@/app/_lib/sensor-metadata';
import { constant } from 'lodash';
import { PresignUpload } from '@/app/_lib/sensor-metadata/schema';

export const deleteSensorMetadata: (
  tenant: string,
  project: string,
  _prev?: ActionState,
) => Promise<ActionState> = async (tenant, project) =>
  await deleteMetadata(tenant, project)
    .then(constant({ data: {} }))
    .catch(
      constant({
        errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
      }),
    );

export const requestPresignedUploadUrl: (
  tenant: string,
  project: string,
) => Promise<PresignUpload> = async (tenant, project) =>
  getPresignedUploadUrl(tenant, project);
