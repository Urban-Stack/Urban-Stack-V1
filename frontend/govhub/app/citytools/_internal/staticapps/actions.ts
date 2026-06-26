'use server';

import {
  FORM_NAMES,
  InstallStaticAppForm,
  InstallStaticAppState,
  mkState,
} from '@/app/citytools/_internal/staticapps/form';
import {
  mutateInstallStaticApp,
  mutateUninstallStaticApp,
} from '@/app/_lib/resource-api/graphql/staticapps';
import { revalidatePath } from 'next/cache';
import { PresignZipUpload } from '@/app/_lib/citytools/static';
import { getPresignedZipUploadUrl } from '@/app/_lib/citytools/static';

export const manageInstallation: (
  _: InstallStaticAppState,
  formData: FormData,
) => Promise<InstallStaticAppState> = async (_, formData) => {
  // these inputs are not user-facing, so we use parse instead of safeParse
  const parsed = InstallStaticAppForm.parse({
    name: formData.get(FORM_NAMES.name),
    mode: formData.get(FORM_NAMES.mode),
  });

  const result = await (parsed.mode === 'install'
    ? mutateInstallStaticApp(parsed.name)
    : mutateUninstallStaticApp(parsed.name));

  const state = mkState(result);
  revalidatePath('/citytools');
  return state;
};

export const requestPresignedZipUploadUrl: (
  bucket: string,
) => Promise<PresignZipUpload> = async (bucket) =>
  getPresignedZipUploadUrl(bucket);
