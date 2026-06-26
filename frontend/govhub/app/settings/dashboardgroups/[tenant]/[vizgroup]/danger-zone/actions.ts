'use server';

import { mutateDeleteVizGroup } from '@/app/_lib/resource-api/graphql/vizGroups';
import {
  DeleteVizGroupState,
  mkDeleteState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/danger-zone/form';
import { revalidatePath } from 'next/cache';

export const deleteVizGroup: (
  tenant: string,
  name: string,
) => Promise<DeleteVizGroupState> = async (tenant, name) => {
  const result = mkDeleteState(await mutateDeleteVizGroup(name));

  revalidatePath(`/settings/dashboardgroups/${tenant}`);

  return result;
};
