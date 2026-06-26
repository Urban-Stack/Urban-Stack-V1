'use server';

import {
  CreateDashboard,
  CreateDashboardState,
  DeleteDashboardState,
  FORM_NAMES,
  mkTitleError,
} from '@/app/_lib/superset/types';
import {
  createDashboard as postCreateDashboard,
  deleteDashboard as deleteDeleteDashboard,
} from '@/app/_lib/resource-api/legacy';
import { redirect } from 'next/navigation';
import { mkHelpdeskRedirectHref } from '@/app/_lib/helpdesk/util';
import { mkDashboardHref } from '@/app/_lib/superset/util';
import { ParsedResponse } from '@/app/_lib/client/fetcher';
import { CreateDashboardResponse } from '@/app/_lib/resource-api/legacy/types';

export const createDashboard = async (
  _prevState: CreateDashboardState,
  formData: FormData,
): Promise<CreateDashboardState> => {
  const formEntries = Object.fromEntries(formData.entries());
  const vizGroupString = formEntries[FORM_NAMES.vizGroup] as string | undefined;
  const parsed = CreateDashboard.safeParse({
    title: formData.get(FORM_NAMES.dashboardTitle),
    vizGroup: vizGroupString && (JSON.parse(vizGroupString) as object),
  });

  return parsed.success
    ? await _createDashboard(parsed.data)
    : { errors: parsed.error?.flatten().fieldErrors };
};

const onCreateError = (resp: ParsedResponse<CreateDashboardResponse>) => {
  if (resp.data) return redirect(mkDashboardHref(resp.data.slug, true));
  if (resp.error?.status === 409)
    return mkTitleError('Ein Dashboard mit diesem Namen existiert bereits.');
  else redirect(mkHelpdeskRedirectHref('Dashboard kann nicht erstellt werden'));
};

const _createDashboard: (
  data: CreateDashboard,
) => Promise<CreateDashboardState> = async (data) => {
  const { tenant, name: vizGroup } = data.vizGroup;

  const resp = await postCreateDashboard(tenant, vizGroup, data.title);
  return onCreateError(resp);
};

const onDeleteError = (resp: ParsedResponse<Response>) => {
  if (resp.error?.status === 404)
    return { error: 'Ein Dashboard mit diesem Namen existiert nicht.' };
  if (resp.error)
    redirect(mkHelpdeskRedirectHref('Dashboard kann nicht gelöscht werden'));
  else redirect('/dashboards');
};
export const deleteDashboard: (
  name: string,
  vizGroup: string,
  tenant: string,
) => Promise<DeleteDashboardState> = async (name, vizGroup, tenant) => {
  const resp = await deleteDeleteDashboard(tenant, vizGroup, name);
  return onDeleteError(resp);
};
