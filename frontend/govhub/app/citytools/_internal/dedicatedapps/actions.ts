'use server';

import {
  FORM_NAMES,
  InstallDedicatedAppForm,
  InstallDedicatedAppState,
  mkState,
} from '@/app/citytools/_internal/dedicatedapps/form';
import {
  mutateInstallDedicatedApp,
  mutateUninstallDedicatedApp,
} from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { revalidatePath } from 'next/cache';

export const manageInstallation: (
  _: InstallDedicatedAppState,
  formData: FormData,
) => Promise<InstallDedicatedAppState> = async (_, formData) => {
  const parsed = InstallDedicatedAppForm.parse({
    name: formData.get(FORM_NAMES.name),
    mode: formData.get(FORM_NAMES.mode),
  });

  const result = await (parsed.mode === 'install'
    ? mutateInstallDedicatedApp(parsed.name)
    : mutateUninstallDedicatedApp(parsed.name));

  const state = mkState(result);
  revalidatePath('/citytools');
  return state;
};
