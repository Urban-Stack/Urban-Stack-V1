'use server';

import {
  addGroupPermission,
  deleteGroupPermission,
  updateGroupPermission,
} from '@/app/_lib/resource-api/graphql/usergroups';
import {
  AddPermissionForm,
  ChangePermissionState,
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
  mkState,
  ShareGroupWithGroupState,
  UpdatePermissionForm,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/form';
import { revalidatePath } from 'next/cache';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';
import { mkUserGroupHref } from '@/app/settings/usergroups/_internal/util';

export const addUserGroupPermission: (
  tenant: string,
  groupName: string,
  _prevState: ShareGroupWithGroupState,
  formData: FormData,
) => Promise<ShareGroupWithGroupState> = async (
  tenant,
  groupName,
  _,
  formData,
) => {
  const formEntries = Object.fromEntries(formData.entries());
  const groupString = formEntries[FORM_ADD_NAMES.group] as string | undefined;
  const parsed = AddPermissionForm.safeParse({
    group: groupString && (JSON.parse(groupString) as object),
    permission: formEntries[FORM_ADD_NAMES.permission] as string,
  });

  const result = parsed.success
    ? await addGroupPermission(parsed.data.permission)(
        tenant,
        groupName,
        parsed.data?.group,
      )
        .then(mkState)
        .catch(() => ({
          errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
        }))
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidateUserGroupPath(tenant, groupName);

  return result;
};

export const updateUserGroupPermission: (
  tenant: string,
  groupName: string,
  sharedGroup: Pick<SharedGroup, 'name' | 'tenant'>,
  _prevState: ChangePermissionState,
  formData: FormData,
) => Promise<ShareGroupWithGroupState> = async (
  tenant,
  groupName,
  sharedGroup,
  _,
  formData,
) => {
  const formEntries = Object.fromEntries(formData.entries());
  const parsed = UpdatePermissionForm.safeParse({
    permission: formEntries[FORM_UPDATE_NAMES.permission] as string,
  });

  const result = parsed.success
    ? await updateGroupPermission(parsed.data.permission)(
        tenant,
        groupName,
        sharedGroup,
      )
        .then(mkState)
        .catch(() => ({
          errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
        }))
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidateUserGroupPath(tenant, groupName);

  return result;
};

export const deleteUserGroupPermission: (
  tenant: string,
  groupName: string,
  sharedGroup: Pick<SharedGroup, 'name' | 'tenant'>,
) => Promise<ShareGroupWithGroupState> = async (tenant, groupName, group) => {
  const result = await deleteGroupPermission(tenant, groupName, group)
    .then(mkState)
    .catch(() => ({
      errors: { general: ['Ein unbekannter Fehler ist aufgetreten.'] },
    }));
  revalidateUserGroupPath(tenant, groupName);
  return result;
};

const revalidateUserGroupPath = (tenant: string, groupName: string) =>
  revalidatePath(`${mkUserGroupHref(tenant, groupName)}/shared-user-groups`);
