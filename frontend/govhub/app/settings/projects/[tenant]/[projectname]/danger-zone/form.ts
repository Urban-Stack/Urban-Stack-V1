import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { DeleteProject } from '@/app/_lib/resource-api/graphql/project';

export type DeleteProjectState = ActionState & {
  errors?: {
    general?: string[];
  };
};

export const mkDeleteState: (result: DeleteProject) => DeleteProjectState = (
  result,
) =>
  result.error || !result.data?.tenant.deleteProject
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
