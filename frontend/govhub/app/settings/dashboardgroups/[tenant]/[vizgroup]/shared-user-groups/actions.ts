'use server';

import { revalidatePath } from 'next/cache';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';
import {
  AddPermissionForm,
  ChangePermissionState,
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
  mkState,
  ShareVizGroupWithUserGroupState,
  UpdatePermissionForm,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/form';
import {
  addUserGroupPermission,
  deleteUserGroupPermission,
  updateUserGroupPermission,
} from '@/app/_lib/resource-api/graphql/vizGroups';

export const addVizGroupPermission: (
  tenant: string,
  vizGroup: string,
  _prevState: ShareVizGroupWithUserGroupState,
  formData: FormData,
) => Promise<ShareVizGroupWithUserGroupState> = async (
  tenant,
  vizGroup,
  _,
  formData,
) => {
  const formEntries = Object.fromEntries(formData.entries());
  const groupString = formEntries[FORM_ADD_NAMES.group] as string | undefined;
  const parsed = AddPermissionForm.safeParse({
    userGroup: groupString && (JSON.parse(groupString) as object),
    permission: formEntries[FORM_ADD_NAMES.permission] as string,
  });

  const result = parsed.success
    ? mkState(
        await addUserGroupPermission(parsed.data.permission)(
          tenant,
          vizGroup,
          parsed.data?.userGroup,
        ),
      )
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath(
    `/settings/dashboardgroups/${tenant}/${vizGroup}/shared-user-groups`,
  );

  return result;
};

export const updateVizGroupPermission: (
  tenant: string,
  vizGroup: string,
  group: Pick<SharedGroup, 'name' | 'tenant'>,
  _prevState: ChangePermissionState,
  formData: FormData,
) => Promise<ShareVizGroupWithUserGroupState> = async (
  tenant,
  vizGroup,
  group,
  _,
  formData,
) => {
  const formEntries = Object.fromEntries(formData.entries());
  const parsed = UpdatePermissionForm.safeParse({
    permission: formEntries[FORM_UPDATE_NAMES.permission] as string,
  });

  const result = parsed.success
    ? mkState(
        await updateUserGroupPermission(parsed.data.permission)(
          tenant,
          vizGroup,
          group,
        ),
      )
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath(
    `/settings/dashboardgroups/${tenant}/${vizGroup}/shared-user-groups`,
  );

  return result;
};

export const deleteVizGroupPermission: (
  tenant: string,
  vizGroup: string,
  userGroup: Pick<SharedGroup, 'name' | 'tenant'>,
) => Promise<ShareVizGroupWithUserGroupState> = async (
  tenant,
  vizGroup,
  userGroup,
) => {
  const result = mkState(
    await deleteUserGroupPermission(tenant, vizGroup, userGroup),
  );
  revalidatePath(
    `/settings/dashboardgroups/${tenant}/${vizGroup}/shared-user-groups`,
  );
  return result;
};
