'use server';

import {
  addVizGroupPermission,
  deleteVizGroupPermission,
  updateVizGroupPermission,
} from '@/app/_lib/resource-api/graphql/project';
import { revalidatePath } from 'next/cache';
import {
  AddPermissionForm,
  ChangePermissionState,
  FORM_ADD_NAMES,
  mkState,
  ShareProjectWithGroupState,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/form';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';

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
  });

  const result = parsed.success
    ? mkState(
        await addVizGroupPermission('viz-group-read')(
          tenant,
          project,
          parsed.data?.group,
        ),
      )
    : { errors: { groupName: parsed.error?.flatten().fieldErrors.group } };

  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);

  return result;
};

export const updateProjectPermission: (
  tenant: string,
  project: string,
  group: Pick<VizGroup, 'name' | 'tenant'>,
  _prevState: ChangePermissionState,
  formData: FormData,
) => Promise<ShareProjectWithGroupState> = async (
  tenant,
  project,
  group,
  _,
  _formData,
) => {
  const result = mkState(
    await updateVizGroupPermission('viz-group-read')(tenant, project, group),
  );

  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);
  return result;
};

export const deleteProjectPermission: (
  tenant: string,
  project: string,
  group: Pick<VizGroup, 'name' | 'tenant'>,
) => Promise<ShareProjectWithGroupState> = async (tenant, project, group) => {
  const result = mkState(
    await deleteVizGroupPermission(tenant, project, group),
  );
  revalidatePath(`/settings/projects/${tenant}/${project}/shared-groups`);
  return result;
};
