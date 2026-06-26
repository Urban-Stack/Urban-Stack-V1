import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import {
  CreateUserGroup,
  DeleteUserGroup,
  DisableUserGroupShared,
  EnableUserGroupShared,
} from '@/app/_lib/resource-api/graphql/usergroups';
import {
  DeleteUserGroupState,
  ShareUserGroupState,
  UnshareUserGroupState,
} from '@/app/settings/usergroups/actions';

export const FORM_NAMES = {
  userGroupName: 'new-user-group-name',
};

export const CreateUserGroupForm = z.object({
  name: z
    .string()
    .min(3, 'Benutzergruppen-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Benutzergruppen-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      /^[a-z0-9-]+$/,
      'Benutzergruppen-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
});
export type CreateUserGroupForm = z.infer<typeof CreateUserGroupForm>;

export type CreateUserGroupState = {
  data?: {
    name: string;
  };
  errors?: {
    general?: string[];
    name?: string[];
  };
};

export const mkState: (result: CreateUserGroup) => CreateUserGroupState = (
  result,
) =>
  result.error || !result.data?.tenant.createGroup
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          name: result.data.tenant.createGroup.group,
        },
      };

export const mkDeleteState: (
  result: DeleteUserGroup,
) => DeleteUserGroupState = (result) =>
  result.error || !result.data?.tenant.deleteGroup
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };

export const mkUnshareState: (
  result: DisableUserGroupShared,
) => UnshareUserGroupState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };

export const mkShareState: (
  result: EnableUserGroupShared,
) => ShareUserGroupState = (result) =>
  result.error || !result.data
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
