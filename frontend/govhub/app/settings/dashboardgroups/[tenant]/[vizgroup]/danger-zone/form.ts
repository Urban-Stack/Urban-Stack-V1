import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { DeleteVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';

export type DeleteVizGroupState = ActionState;

export const mkDeleteState: (result: DeleteVizGroup) => DeleteVizGroupState = (
  result,
) =>
  result.error || !result.data?.tenant.deleteVizGroup
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
