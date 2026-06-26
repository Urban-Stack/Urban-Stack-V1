import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { GroupVizPermission } from '@/app/_lib/resource-api/graphql/project';
import { ActionState } from '@/app/_lib/form/actionstate';

export const FORM_ADD_NAMES = {
  group: 'form-group',
  permission: 'form-permission',
};

export const AddPermissionForm = z.object({
  group: z.object({ name: z.string(), tenant: z.string() }),
});

export type ShareProjectWithGroupState = ActionState & {
  errors?: {
    general?: string[];
    groupName?: string[];
    permission?: string[];
  };
};

export type ChangePermissionState = Pick<ShareProjectWithGroupState, 'data'> & {
  errors?: Pick<
    NonNullable<ShareProjectWithGroupState['errors']>,
    'general' | 'permission'
  >;
};

export const mkState: (
  result: GroupVizPermission,
) => ShareProjectWithGroupState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
