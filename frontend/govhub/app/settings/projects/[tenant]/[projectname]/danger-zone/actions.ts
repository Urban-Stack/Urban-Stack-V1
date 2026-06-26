'use server';

import { mutateDeleteProject } from '@/app/_lib/resource-api/graphql/project';
import {
  DeleteProjectState,
  mkDeleteState,
} from '@/app/settings/projects/[tenant]/[projectname]/danger-zone/form';
import { revalidatePath } from 'next/cache';

export const deleteProject: (
  tenant: string,
  project: string,
) => Promise<DeleteProjectState> = async (tenant, project) => {
  const result = mkDeleteState(await mutateDeleteProject(tenant, project));

  revalidatePath(`/settings/projects/${tenant}`);

  return result;
};
