import {
  Permission,
  Principal,
} from '@/app/_lib/resource-api/legacy/permission/types';
import { getPublicEnv } from '@/app/_lib/env';
import { requireAuth } from '@/app/_lib/auth';
import { fetcher } from '@/app/_lib/client/fetcher';
import { z } from 'zod';
import { Resource } from '@/app/_lib/resource-api/legacy/resources';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

const PermissionResponse = z.object({
  name: z.string(),
  principals: z.custom<Principal>().array(),
  scopes: z.custom<Scope>().array(),
});
export type PermissionResponse = z.infer<typeof PermissionResponse>;

const PermissionDeleteResponse = z.object({
  error: z.string().optional(),
});
export type PermissionDeleteResponse = z.infer<typeof PermissionDeleteResponse>;

export const getPermissions: (
  resource: Resource,
) => Promise<PermissionResponse[]> = async (resource) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcher(z.array(PermissionResponse))(
    permissionsUrl(keycloakUrl)(resource),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

export const setPermission: (
  permission: Permission,
  resource: Resource,
) => Promise<PermissionResponse> = async (permission, resource) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcher(PermissionResponse)(
    permissionUrl(keycloakUrl)(permission, resource),
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: requestPayload(permission),
    },
  );
};

export const deletePermission: (
  permission: Permission,
  resource: Resource,
) => Promise<PermissionDeleteResponse> = async (permission, resource) => {
  const keycloakUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const session = await requireAuth();

  return fetcher(PermissionDeleteResponse)(
    permissionUrl(keycloakUrl)(permission, resource),
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

const requestPayload: (permission: Permission) => string = (permission) =>
  JSON.stringify({
    scopes: permission.scopes,
    principals: permission.principals,
  });

const permissionsUrl: (keycloakUrl: string) => (resource: Resource) => string =
  (keycloakUrl) => (resource) =>
    `${resourceUrl(keycloakUrl)(resource)}/permissions`;

const permissionUrl: (
  keycloakUrl: string,
) => (permission: Permission, resource: Resource) => string =
  (keycloakUrl) => (permission, resource) =>
    `${resourceUrl(keycloakUrl)(resource)}/permissions/${permission.name}`;

const resourceUrl: (keycloakUrl: string) => (resource: Resource) => string =
  (keycloakUrl) => (resource) =>
    `${keycloakUrl}/data-hub/${resourcePath(resource)}`;

const resourcePath: (resource: Resource) => string = (resource) => {
  switch (resource._tag) {
    case 'tenant':
      return `tenants/${resource.name}`;
    case 'viz-group':
      return `tenants/${resource.tenant}/viz-groups/${resource.name}`;
    case 'dashboard':
      return `tenants/${resource.tenant}/viz-groups/${resource.vizGroup}/dashboards/${resource.name}`;
  }
};

export const _internal = {
  permissionUrl,
  permissionsUrl,
  resourceUrl,
  requestPayload,
};
