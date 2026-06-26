import { Permission } from '@/app/_lib/resource-api/legacy/permission/types';
import {
  asyncMkParsedResponse,
  FetchError,
  ParsedResponse,
} from '@/app/_lib/client/fetcher';
import {
  mkTenantResource,
  Resource,
} from '@/app/_lib/resource-api/legacy/resources';
import {
  deletePermission as _deletePermission,
  getPermissions as _getPermissions,
  PermissionDeleteResponse,
  PermissionResponse,
  setPermission as _setPermission,
} from '@/app/_lib/resource-api/legacy/permission/internal';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

/**
 * Returns the permissions of the user for the given resource.
 *
 * @param resource resource to get the user's permissions for
 * @return the permissions of the user for the given resource
 */
export const getPermissions: (
  resource: Resource,
) => Promise<ParsedResponse<PermissionResponse[]>> = (resource) =>
  asyncMkParsedResponse(() => _getPermissions(resource));

/**
 * Checks whether the user has the given permission scope for the given resource.
 *
 * @param scope    scope to check for being granted to the user for the given resource
 * @param resource resource to check the given scope for
 * @return `true` if the given user has the given permission scope for the given resource - `false` otherwise
 * @throws Error if any unexpected error occurred (i.e. any error that cannot be related to permissions)
 */
export const hasScope: (
  scope: Scope,
  resource: Resource,
) => Promise<boolean> = async (scope, resource) =>
  _getPermissions(resource)
    .then((permissions) =>
      permissions.some((permission) => permission.scopes.includes(scope)),
    )
    .catch((e) => {
      if (e instanceof FetchError && e.status === 403) {
        return false;
      }
      throw e;
    });

/**
 * Checks whether the user has admin permission for the current tenant.
 *
 * @return `true` if the given user has admin permission for the current tenant - `false` otherwise
 * @throws Error if any unexpected error occurred (i.e. any error that cannot be related to permissions)
 */
export const hasTenantAdminScope: () => Promise<boolean> = async () => {
  const tenant = await requireTenant();
  return hasScope('tenant:admin', mkTenantResource(tenant));
};

/**
 * Permits the user according to the given permission.
 * <p>
 * Permission will be granted for the resource of the given `permission`
 * and overwrite any existing permission for the permission's name.
 *
 * @param permission permission for the user
 * @param resource   resource to grant the given permission for
 * @return the granted permission
 */
export const setPermission: (
  permission: Permission,
  resource: Resource,
) => Promise<ParsedResponse<PermissionResponse>> = (permission, resource) =>
  asyncMkParsedResponse(() => _setPermission(permission, resource));

/**
 * Deletes the given permission from the given resource.
 *
 * @param permission permission of the resource
 * @param resource   resource to delete the given permission for
 * @return response from the keycloak resource API
 */
export const deletePermission: (
  permission: Permission,
  resource: Resource,
) => Promise<ParsedResponse<PermissionDeleteResponse>> = (
  permission,
  resource,
) => asyncMkParsedResponse(() => _deletePermission(permission, resource));
