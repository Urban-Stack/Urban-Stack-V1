'use server';

import { revalidatePath } from 'next/cache';
import {
  CreateVizGroupForm,
  CreateVizGroupState,
  FORM_NAMES,
  mkState,
} from '@/app/settings/dashboardgroups/form';
import { mutateCreateVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';

export const createVizGroup: (
  _prevState: CreateVizGroupState,
  formData: FormData,
) => Promise<CreateVizGroupState> = async (_prevState, formData) => {
  const parsed = CreateVizGroupForm.safeParse({
    name: formData.get(FORM_NAMES.vizGroupName),
  });

  const result = parsed.success
    ? mkState(await mutateCreateVizGroup(parsed.data.name))
    : { errors: parsed.error?.flatten().fieldErrors };

  revalidatePath('/settings/dashboardgroups');

  return result;
};
