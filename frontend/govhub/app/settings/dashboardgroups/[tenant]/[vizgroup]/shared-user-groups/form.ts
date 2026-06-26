import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { PermissionName } from '@/app/_lib/resource-api/util/shared-groups';
import { UserGroupPermissionResult } from '@/app/_lib/resource-api/graphql/vizGroups';
import { ActionState } from '@/app/_lib/form/actionstate';

export const FORM_ADD_NAMES = {
  group: 'form-group',
  permission: 'form-permission',
};

export const LABEL_BY_PERMISSION: Record<PermissionName, string> = {
  read: 'Betrachter',
  admin: 'Mitarbeiter',
} as const;

export const LABEL_TO_PERMISSION = Object.fromEntries(
  Object.entries(LABEL_BY_PERMISSION).map(([key, value]) => [value, key]),
) as Readonly<Record<string, PermissionName>>;

export const FORM_UPDATE_NAMES = {
  permission: 'form-change-permission',
};

export const AddPermissionForm = z.object({
  userGroup: z.object({ name: z.string(), tenant: z.string() }),
  permission: z.enum(PermissionName),
});

export const UpdatePermissionForm = AddPermissionForm.pick({
  permission: true,
});

export type ShareVizGroupWithUserGroupState = ActionState & {
  errors?: {
    general?: string[];
    userGroupName?: string[];
    permission?: string[];
  };
};

export type ChangePermissionState = Pick<
  ShareVizGroupWithUserGroupState,
  'data'
> & {
  errors?: Pick<
    NonNullable<ShareVizGroupWithUserGroupState['errors']>,
    'general' | 'permission'
  >;
};

export const mkState: (
  result: UserGroupPermissionResult,
) => ShareVizGroupWithUserGroupState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
