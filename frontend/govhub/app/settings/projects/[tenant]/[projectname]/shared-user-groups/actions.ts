'use server';

import {
  addGroupPermission,
  deleteGroupPermission,
  updateGroupPermission,
} from '@/app/_lib/resource-api/graphql/project';
import {
  AddPermissionForm,
  ChangePermissionState,
  FORM_ADD_NAMES,
  FORM_UPDATE_NAMES,
  mkState,
  ShareProjectWithGroupState,
  UpdatePermissionForm,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-user-groups/form';
import { revalidatePath } from 'next/cache';
import { SharedGroup } from '@/app/_lib/resource-api/util/shared-groups';

export const addProjectPermission: (
  tenant: string,
  project: string,
  _prevState: ShareProjectWithGroupState,
  formData: FormData,
) => Promise<ShareProjectWithGroupState> = async (
  tenant,
  project,
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
    ? mkState(
        await addGroupPermission(parsed.data.permission)(
          tenant,
          project,
          parsed.data?.group,
        ),
      )
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);

  return result;
};

export const updateProjectPermission: (
  tenant: string,
  project: string,
  group: Pick<SharedGroup, 'name' | 'tenant'>,
  _prevState: ChangePermissionState,
  formData: FormData,
) => Promise<ShareProjectWithGroupState> = async (
  tenant,
  project,
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
        await updateGroupPermission(parsed.data.permission)(
          tenant,
          project,
          group,
        ),
      )
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);

  return result;
};

export const deleteProjectPermission: (
  tenant: string,
  project: string,
  group: Pick<SharedGroup, 'name' | 'tenant'>,
) => Promise<ShareProjectWithGroupState> = async (tenant, project, group) => {
  const result = mkState(await deleteGroupPermission(tenant, project, group));
  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);
  return result;
};
