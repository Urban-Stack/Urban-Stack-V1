'use server';

import {
  EditPublishedQueryForm,
  FORM_NAMES,
  mkStateCreate,
  mkStateSingle,
  PublishedQueryState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/[name]/_internal/form';
import {
  mutateCreatePublishedQuery,
  querySinglePublishedQuery,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { revalidatePath } from 'next/cache';
import { deletePublishedQuery } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/action';

export const createPublishedQuery: (
  tenant: string,
  vizgroup: string,
  _prevState: PublishedQueryState,
  formData: FormData,
) => Promise<PublishedQueryState> = async (
  tenant,
  vizgroup,
  _prevState,
  formData,
) => {
  const parsed = EditPublishedQueryForm.safeParse({
    name: formData.get(FORM_NAMES.name),
    sql: formData.get(FORM_NAMES.sql),
  });
  return parsed.success
    ? await createQuery(tenant, vizgroup, parsed.data)
    : {
        data: {
          name: formData.get(FORM_NAMES.name),
          sql: formData.get(FORM_NAMES.sql),
        } as PublishedQueryState['data'],
        errors: parsed.error.flatten().fieldErrors,
      };
};

export const updatePublishedQuery: (
  tenant: string,
  vizgroup: string,
  name: string,
  _prevState: PublishedQueryState,
  formData: FormData,
) => Promise<PublishedQueryState> = async (
  tenant,
  vizgroup,
  name,
  _prevState,
  formData,
) => {
  const parsed = EditPublishedQueryForm.safeParse({
    name,
    sql: formData.get(FORM_NAMES.sql),
  });
  if (parsed.success) {
    const state = await deletePublishedQuery(tenant, vizgroup, name);
    return state.errors ? state : createQuery(tenant, vizgroup, parsed.data);
  } else
    return {
      data: {
        name,
        sql: _prevState.data?.sql ?? '',
      },
      errors: parsed.error.flatten().fieldErrors,
    };
};

export const getPublishedQuery: (
  tenant: string,
  vizgroup: string,
  name: string,
) => Promise<PublishedQueryState> = async (tenant, vizgroup, name) =>
  mkStateSingle(await querySinglePublishedQuery(tenant, vizgroup, name));

const createQuery: (
  tenant: string,
  vizgroup: string,
  query: EditPublishedQueryForm,
) => Promise<PublishedQueryState> = async (tenant, vizgroup, query) => {
  const result = mkStateCreate(
    await mutateCreatePublishedQuery(tenant, vizgroup, query.name, query.sql),
  );
  revalidatePath(`/settings/dashboardgroups/${tenant}/${vizgroup}/geojson`);
  return result;
};
