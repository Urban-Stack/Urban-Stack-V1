import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import {
  DeleteDataset,
  RefreshDataset,
} from '@/app/_lib/resource-api/graphql/datasets';

export const mkState: (
  result: DeleteDataset | RefreshDataset,
) => ActionState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(
            result.error,
            'Dataset konnte nicht gelöscht werden.',
          ),
        },
      }
    : { data: {} };
