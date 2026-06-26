import { ActionState } from '@/app/_lib/form/actionstate';
import { DedicatedAppInstallation } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { z } from 'zod';

export const FORM_NAMES = {
  name: 'dedicatedapp-install-name',
  mode: 'dedicatedapp-install-mode',
};

export const InstallModes = ['install', 'uninstall'] as const;
export type InstallMode = (typeof InstallModes)[number];

export const InstallDedicatedAppForm = z.object({
  name: z.string(),
  mode: z.enum(InstallModes),
});

export type InstallDedicatedAppState = ActionState & {
  data?: {
    mode?: InstallMode;
  };
  errors?: {
    general?: string[];
  };
};

export const mkState: (
  result: DedicatedAppInstallation,
) => InstallDedicatedAppState = (result) => {
  if (result.error || !result.data?.tenant) {
    return mkError(
      result.error
        ? [result.error.message]
        : ['Ein unbekannter Fehler ist aufgetreten.'],
    );
  } else return dispatch(result.data);
};

const dispatch: (
  data: NonNullable<NonNullable<DedicatedAppInstallation>['data']>,
) => InstallDedicatedAppState = (data) => {
  if ('createDedicatedApp' in data.tenant) return { data: {} };
  if ('deleteDedicatedApp' in data.tenant) return { data: {} };
  else return mkError(['Ein unbekannter Fehler ist aufgetreten.']);
};

const mkError: (errors: string[]) => InstallDedicatedAppState = (errors) => ({
  errors: { general: errors },
});
