import { DeleteSharedApp } from '@/app/_lib/resource-api/graphql/sharedApps';
import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';

export const mkState: (result: DeleteSharedApp) => ActionState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(
            result.error,
            'Die Shared App konnte nicht gelöscht werden.',
          ),
        },
      }
    : { data: {} };
