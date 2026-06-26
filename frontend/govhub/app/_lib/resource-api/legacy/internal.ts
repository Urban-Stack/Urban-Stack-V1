import { fetcher, fetcherRaw } from '@/app/_lib/client/fetcher';
import { getPublicEnv } from '@/app/_lib/env';
import {
  CreateDashboardResponse,
  KeycloakTenants,
  TenantMeta,
} from '@/app/_lib/resource-api/legacy/types';
import { requireAuth } from '@/app/_lib/auth';
import { unsafeHead } from 'udp-ui/fp';
import { fetchTenantMemberships } from '../graphql/tenantMemberships';

export const fetchTenantMeta: () => Promise<TenantMeta> = async () =>
  fetchTenantAttributes().then((attr) => TenantMeta.parse(attr));

export const fetchPrimaryTenant: () => Promise<string> = () =>
  fetchTenantMemberships()
    .then(unsafeHead)
    .catch((e) => {
      console.error('Error fetching primary tenant: ', e);
      throw e;
    });

type CreateDashboardRequest = {
  title: string;
};

export const createDashboard: (
  tenant: string,
  vizGroup: string,
  title: string,
) => Promise<CreateDashboardResponse> = async (tenant, vizGroup, title) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  const payload: CreateDashboardRequest = { title };
  return fetcher(CreateDashboardResponse)(
    `${keycloakUrl}/data-hub/tenants/${tenant}/viz-groups/${vizGroup}/create-dashboard`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
};

export const deleteDashboard: (
  tenant: string,
  vizGroup: string,
  name: string,
) => Promise<Response> = async (tenant, vizGroup, name) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcherRaw(
    `${keycloakUrl}/data-hub/tenants/${tenant}/viz-groups/${vizGroup}/dashboards/${name}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

const fetchTenants: () => Promise<KeycloakTenants> = async () => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcher(KeycloakTenants)(`${keycloakUrl}/data-hub/tenants/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

const fetchTenantAttributes: () => Promise<unknown> = async () =>
  fetchPrimaryTenant().then(fetchAttributes);

const fetchAttributes: (tenant: string) => Promise<unknown> = async (
  tenant: string,
) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcherRaw(`${keycloakUrl}/data-hub/tenants/${tenant}/attributes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

export const _internal = {
  fetchTenantAttributes,
  fetchAttributes,
  fetchTenants,
};
