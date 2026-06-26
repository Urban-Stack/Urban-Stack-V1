'use server';

import {
  CreateProjectForm,
  CreateProjectState,
  FORM_NAMES,
  mkState,
} from '@/app/settings/projects/form';
import { revalidatePath } from 'next/cache';
import { mutateCreateProject } from '@/app/_lib/resource-api/graphql/project';

export const createProject: (
  _prevState: CreateProjectState,
  formData: FormData,
) => Promise<CreateProjectState> = async (_prevState, formData) => {
  const parsed = CreateProjectForm.safeParse({
    name: formData.get(FORM_NAMES.projectName),
  });

  const result = parsed.success
    ? mkState(await mutateCreateProject(parsed.data.name))
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath('/settings/projects');

  return result;
};
