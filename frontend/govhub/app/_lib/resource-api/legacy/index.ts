import {
  createDashboard as _createDashboard,
  deleteDashboard as _deleteDashboard,
  fetchPrimaryTenant,
  fetchTenantMeta,
} from '@/app/_lib/resource-api/legacy/internal';
import {
  CreateDashboardResponse,
  TenantMeta,
} from '@/app/_lib/resource-api/legacy/types';
import {
  asyncMkParsedResponse,
  ParsedResponse,
} from '@/app/_lib/client/fetcher';
import { asyncElse } from 'udp-ui/fp';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const requireTenant: () => Promise<string> = fetchPrimaryTenant;

export const requireTenantMeta = (): Promise<TenantMeta> =>
  asyncElse({})(fetchTenantMeta, isRedirectError);

/**
 * Creates a new dashboard for the given `tenant` and `vizGroup`.
 *
 * @param tenant   tenant to create a new dashboard for
 * @param vizGroup viz-group to create a new dashboard for
 * @param title    title for the dashboard to create
 * @return the parsed response from the Resource API
 * @throws if an error occurs that is not a FetchError
 */
export const createDashboard: (
  tenant: string,
  vizGroup: string,
  title: string,
) => Promise<ParsedResponse<CreateDashboardResponse>> = (
  tenant,
  vizGroup,
  title,
) => asyncMkParsedResponse(() => _createDashboard(tenant, vizGroup, title));

/**
 * Deletes the dashboard of the given `name` for the given `tenant` and `vizGroup`.
 *
 * @param tenant   tenant of the dashboard to delete
 * @param vizGroup viz-group of the dashboard to delete
 * @param name     name of the dashboard to delete
 * @return the parsed response from the Resource API
 * @throws if an error occurs that is not a FetchError
 */
export const deleteDashboard: (
  tenant: string,
  vizGroup: string,
  name: string,
) => Promise<ParsedResponse<Response>> = (tenant, vizGroup, name) =>
  asyncMkParsedResponse(() => _deleteDashboard(tenant, vizGroup, name));
