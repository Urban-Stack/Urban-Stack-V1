import { CreateDataset } from '@/app/_lib/resource-api/graphql/datasets';
import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';

export const mkCreateState: (result: CreateDataset) => ActionState = (
  result,
) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
