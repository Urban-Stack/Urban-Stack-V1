import { graphql } from '@/app/__generated__';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import {
  AllUserGroupsQuery,
  UserGroupPermissionsQuery,
  UserGroupScopesQuery,
} from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { PermissionName } from '@/app/_lib/resource-api/util/shared-groups';
import { reject } from 'lodash';

const ALL_USER_GROUPS = graphql(`
  query AllUserGroups {
    tenants {
      tenant
      groups {
        group
        keycloakGroupPath
        isMember
        scopes {
          granted
        }
        permissions {
          name
          scopes
          allowAllAuthenticatedUsers
        }
      }
    }
  }
`);

const USER_GROUP_PERMISSIONS = graphql(`
  query UserGroupPermissions($tenant: String!, $group: String!) {
    group(tenant: $tenant, group: $group) {
      permissions {
        name
        groupPrincipals {
          tenant
          group
        }
        scopes
      }
    }
  }
`);

const USER_GROUP_SCOPES = graphql(`
  query UserGroupScopes($tenant: String!, $group: String!) {
    group(tenant: $tenant, group: $group) {
      scopes {
        all
        granted
      }
    }
  }
`);

const CREATE_USER_GROUP = graphql(`
  mutation CreateUserGroup($tenant: String!, $group: String!) {
    tenant(tenant: $tenant) {
      createGroup(group: $group) {
        group
      }
    }
  }
`);

const DELETE_USER_GROUP = graphql(`
  mutation DeleteUserGroup($tenant: String!, $group: String!) {
    tenant(tenant: $tenant) {
      deleteGroup(group: $group)
    }
  }
`);

const ENABLE_USER_GROUP_SHARED = graphql(`
  mutation EnableUserGroupShared($tenant: String!, $group: String!) {
    tenant(tenant: $tenant) {
      group(group: $group) {
        shared: createPermission(
          permission: {
            name: "shared"
            scopes: ["group:view"]
            allowAllAuthenticatedUsers: true
          }
        )
      }
    }
  }
`);

const DISABLE_USER_GROUP_SHARED = graphql(`
  mutation DisableUserGroupShared($tenant: String!, $group: String!) {
    tenant(tenant: $tenant) {
      group(group: $group) {
        deletePermission(permission: "shared")
      }
    }
  }
`);

const MUTATE_USER_GROUP_PERMISSIONS = graphql(`
  mutation UserGroupPermission(
    $tenant: String!
    $group: String!
    $readGroups: [GroupInput!]!
    $adminGroups: [GroupInput!]!
  ) {
    tenant(tenant: $tenant) {
      group(group: $group) {
        read: createPermission(
          permission: {
            name: "read"
            scopes: ["group:read"]
            groupPrincipals: $readGroups
          }
        )
        admin: createPermission(
          permission: {
            name: "admin"
            scopes: ["group:admin"]
            groupPrincipals: $adminGroups
          }
        )
      }
    }
  }
`);

export type AllUserGroups = ApolloClient.QueryResult<
  MaybeMasked<AllUserGroupsQuery>
>;

export const queryAllUserGroups: () => Promise<AllUserGroups> = async () =>
  query({
    query: ALL_USER_GROUPS,
  });

export type UserGroupPermissions = ApolloClient.QueryResult<
  MaybeMasked<UserGroupPermissionsQuery>
>;

export const queryUserGroupPermissions: (
  tenant: string,
  group: string,
) => Promise<UserGroupPermissions> = (tenant, group) =>
  query({
    query: USER_GROUP_PERMISSIONS,
    variables: {
      tenant: tenant,
      group: group,
    },
  });

export type UserGroupScopes = ApolloClient.QueryResult<
  MaybeMasked<UserGroupScopesQuery>
>;

export const queryUserGroupScopes: (
  tenant: string,
  group: string,
) => Promise<UserGroupScopes> = (tenant, group) =>
  query({
    query: USER_GROUP_SCOPES,
    variables: {
      tenant: tenant,
      group: group,
    },
  });

export type CreateUserGroup = Awaited<ReturnType<typeof mutateCreateUserGroup>>;

export const mutateCreateUserGroup = async (name: string) =>
  mutate({
    mutation: CREATE_USER_GROUP,
    variables: {
      tenant: await requireTenant(),
      group: name,
    },
  });

export type DeleteUserGroup = Awaited<ReturnType<typeof mutateDeleteUserGroup>>;

export const mutateDeleteUserGroup = async (group: UserGroup) =>
  mutate({
    mutation: DELETE_USER_GROUP,
    variables: {
      tenant: group.tenant,
      group: group.name,
    },
  });

export type DisableUserGroupShared = Awaited<
  ReturnType<typeof disableUserGroupShared>
>;

export const disableUserGroupShared = (group: UserGroup) =>
  mutate({
    mutation: DISABLE_USER_GROUP_SHARED,
    variables: {
      tenant: group.tenant,
      group: group.name,
    },
  });

export type EnableUserGroupShared = Awaited<
  ReturnType<typeof enableUserGroupShared>
>;

export const enableUserGroupShared = (group: UserGroup) =>
  mutate({
    mutation: ENABLE_USER_GROUP_SHARED,
    variables: {
      tenant: group.tenant,
      group: group.name,
    },
  });

export type Group = {
  name: string;
  tenant: string;
};

export type Principal = {
  tenant: string;
  group: string;
};

export type Permission = {
  name: string;
  groupPrincipals?: Principal[] | null;
};

type GroupPermissions = {
  admin: Principal[];
  read: Principal[];
};

const updateGroup: (
  permission: PermissionName,
) => (allExisting: Permission[], group: Group) => GroupPermissions =
  (permission) => (allExisting, group) => {
    const removed = removeGroup(allExisting, group);
    removed[permission].push({ tenant: group.tenant, group: group.name });
    return removed;
  };

const removeGroup: (
  allExisting: Permission[],
  group: Group,
) => GroupPermissions = (allExisting, group) => {
  const existing = (perm: PermissionName) =>
    allExisting.find((p) => p.name === perm)?.groupPrincipals;
  const rm = (perm: PermissionName) =>
    reject(
      existing(perm),
      (p) => p.group === group.name && p.tenant == group.tenant,
    ).map((p) => ({ tenant: p.tenant, group: p.group }));

  return {
    read: rm('read'),
    admin: rm('admin'),
  };
};

const _updateGroupPermission =
  (action: (existing: Permission[], group: Group) => GroupPermissions) =>
  async (tenant: string, groupName: string, group: Group) => {
    const existingResult = await query({
      query: USER_GROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        group: groupName,
      },
    });

    const existing = existingResult.data?.group?.permissions ?? [];
    const updated = action(existing, group);

    return await mutate({
      mutation: MUTATE_USER_GROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        group: groupName,
        readGroups: updated['read'],
        adminGroups: updated['admin'],
      },
    });
  };

export type GroupPermission = Awaited<
  ReturnType<ReturnType<typeof addGroupPermission>>
>;

export const addGroupPermission = (permission: PermissionName) =>
  _updateGroupPermission(updateGroup(permission));
export const updateGroupPermission = addGroupPermission;
export const deleteGroupPermission = _updateGroupPermission(removeGroup);

export const internal = {
  ALL_USER_GROUPS,
  USER_GROUP_PERMISSIONS,
  USER_GROUP_SCOPES,
  CREATE_USER_GROUP,
  DELETE_USER_GROUP,
  ENABLE_USER_GROUP_SHARED,
  DISABLE_USER_GROUP_SHARED,
  MUTATE_USER_GROUP_PERMISSIONS,
  updateGroup,
  removeGroup,
  updateGroupPermission,
  deleteGroupPermission,
  _updateGroupPermission,
};
