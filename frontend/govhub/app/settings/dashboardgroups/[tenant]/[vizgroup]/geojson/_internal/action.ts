'use server';

import {
  DeletePublishedQueryState,
  mkState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/form';
import { mutateDeletePublishedQuery } from '@/app/_lib/resource-api/graphql/vizGroups';
import { revalidatePath } from 'next/cache';

export const deletePublishedQuery: (
  tenant: string,
  vizGroup: string,
  queryName: string,
) => Promise<DeletePublishedQueryState> = async (
  tenant,
  vizGroup,
  queryName,
) => {
  const result = mkState(
    await mutateDeletePublishedQuery(tenant, vizGroup, queryName),
  );
  revalidatePath(`/settings/dashboardgroups/${tenant}/${vizGroup}/geojson`);
  return result;
};
