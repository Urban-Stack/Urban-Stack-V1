'use server';

import { ActionState } from '@/app/_lib/form/actionstate';
import { mutateDeleteSharedApp } from '@/app/_lib/resource-api/graphql/sharedApps';
import { mkState } from '@/app/citytools/_internal/sharedapps/form';

export const deleteSharedApp: (
  tenant: string,
  name: string,
  _prevState?: ActionState,
) => Promise<ActionState> = async (tenant, name) =>
  mutateDeleteSharedApp(tenant, name)
    .then(mkState)
    .catch(() => ({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    }));
