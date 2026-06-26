import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { StaticAppInstallation } from '@/app/_lib/resource-api/graphql/staticapps';
import { z } from 'zod';

export const FORM_NAMES = {
  name: 'citytool-install-name',
  mode: 'citytool-install-mode',
};

export const InstallModes = ['install', 'uninstall'] as const;
type InstallMode = (typeof InstallModes)[number];

export const InstallStaticAppForm = z.object({
  name: z.string(),
  mode: z.enum(InstallModes),
});

export type InstallStaticAppState = ActionState & {
  data?: {
    mode?: InstallMode;
  };
  errors?: {
    general?: string[];
  };
};

export const mkState: (
  result: StaticAppInstallation,
) => InstallStaticAppState = (result) => {
  if (result.error || !result.data?.tenant) {
    return mkError(getResultGeneralErrors(result.error));
  } else return dispatch(result.data);
};

const dispatch: (
  data: NonNullable<NonNullable<StaticAppInstallation>['data']>,
) => InstallStaticAppState = (data) => {
  if ('createCitytool' in data.tenant) return { data: {} };
  if ('deleteCitytool' in data.tenant) return { data: {} };
  else return mkError(['Ein unbekannter Fehler ist aufgetreten.']);
};

const mkError: (errors: string[]) => InstallStaticAppState = (errors) => ({
  errors: { general: errors },
});
