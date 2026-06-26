/* c8 ignore start */
import { graphql } from '@/app/__generated__';
import { ApolloClient, ApolloLink, MaybeMasked } from '@apollo/client';
import {
  AllVizGroupsQuery,
  CreateVizGroupMutation,
  GetPublishedQueryQuery,
  PublishedQueriesQuery,
  VizGroupDashboardsQuery,
  VizGroupGroupPermissionsQuery,
  VizGroupsByTenantQuery,
} from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { PermissionName } from '@/app/_lib/resource-api/util/shared-groups';
import { reject } from 'lodash';

export const ALL_VIZ_GROUPS = graphql(`
  query AllVizGroups {
    tenants {
      tenant
      vizGroups {
        vizGroup
        tenant
      }
    }
  }
`);

export const VIZ_GROUPS_BY_TENANT = graphql(`
  query VizGroupsByTenant($tenant: String!) {
    tenant(tenant: $tenant) {
      vizGroups {
        vizGroup
        tenant
      }
    }
  }
`);

const CREATE_VIZ_GROUP = graphql(`
  mutation createVizGroup($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      createVizGroup(vizGroup: $name) {
        tenant
        vizGroup
      }
    }
  }
`);

const DELETE_VIZ_GROUP = graphql(`
  mutation deleteVizGroup($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      deleteVizGroup(vizGroup: $name)
    }
  }
`);

export const VIZ_GROUP_DASHBOARDS = graphql(`
  query VizGroupDashboards($tenant: String!, $vizGroup: String!) {
    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {
      tenant
      vizGroup
      dashboards {
        slug
        dashboard
      }
    }
  }
`);

const VIZ_GROUP_GROUP_PERMISSIONS = graphql(`
  query VizGroupGroupPermissions($tenant: String!, $vizGroup: String!) {
    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {
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

const MUTATE_VIZ_GROUP_PERMISSIONS = graphql(`
  mutation VizGroupPermission(
    $tenant: String!
    $vizGroup: String!
    $readUserGroups: [GroupInput!]!
    $adminUserGroups: [GroupInput!]!
  ) {
    tenant(tenant: $tenant) {
      vizGroup(vizGroup: $vizGroup) {
        read: createPermission(
          permission: {
            name: "read"
            scopes: ["viz-group:read"]
            groupPrincipals: $readUserGroups
          }
        )
        admin: createPermission(
          permission: {
            name: "admin"
            scopes: ["viz-group:admin"]
            groupPrincipals: $adminUserGroups
          }
        )
      }
    }
  }
`);

const PUBLISHED_QUERIES = graphql(`
  query PublishedQueries($tenant: String!, $vizGroup: String!) {
    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {
      publishedQueries {
        publishedQuery
        config {
          sql
        }
      }
    }
  }
`);

const DELETE_PUBLISHED_QUERY = graphql(`
  mutation DeletePublishedQuery(
    $tenant: String!
    $vizGroup: String!
    $name: String!
  ) {
    tenant(tenant: $tenant) {
      vizGroup(vizGroup: $vizGroup) {
        deletePublishedQuery(publishedQuery: $name)
      }
    }
  }
`);

const CREATE_PUBLISHED_QUERY = graphql(`
  mutation CreatePublishedQuery(
    $tenant: String!
    $vizGroup: String!
    $name: String!
    $sql: String!
  ) {
    tenant(tenant: $tenant) {
      vizGroup(vizGroup: $vizGroup) {
        createPublishedQuery(publishedQuery: $name, config: { sql: $sql }) {
          publishedQuery
          config {
            sql
          }
        }
      }
    }
  }
`);

const GET_PUBLISHED_QUERY = graphql(`
  query GetPublishedQuery(
    $tenant: String!
    $vizGroup: String!
    $name: String!
  ) {
    publishedQuery(
      tenant: $tenant
      vizGroup: $vizGroup
      publishedQuery: $name
    ) {
      publishedQuery
      config {
        sql
      }
    }
  }
`);
/* c8 ignore end */

export type AllVizGroups = ApolloClient.QueryResult<
  MaybeMasked<AllVizGroupsQuery>
>;
export type VizGroupsByTenant = ApolloClient.QueryResult<
  MaybeMasked<VizGroupsByTenantQuery>
>;
export type CreateVizGroup = ApolloLink.Result<CreateVizGroupMutation>;
export type DeleteVizGroup = Awaited<ReturnType<typeof mutateDeleteVizGroup>>;
export type VizGroupDashboards = ApolloClient.QueryResult<
  MaybeMasked<VizGroupDashboardsQuery>
>;
export type VizGroupGroupPermissions = ApolloClient.QueryResult<
  MaybeMasked<VizGroupGroupPermissionsQuery>
>;

export const queryAllVizGroups: () => Promise<AllVizGroups> = async () =>
  query({
    query: ALL_VIZ_GROUPS,
  });

export const mutateCreateVizGroup: (
  name: string,
) => Promise<CreateVizGroup> = async (name) =>
  mutate({
    mutation: CREATE_VIZ_GROUP,
    variables: { tenant: await requireTenant(), name },
  });

export const mutateDeleteVizGroup = async (name: string) =>
  mutate({
    mutation: DELETE_VIZ_GROUP,
    variables: { tenant: await requireTenant(), name },
  });

export const queryVizGroupGroupPermissions: (
  tenant: string,
  vizGroup: string,
) => Promise<VizGroupGroupPermissions> = async (tenant, vizGroup) =>
  query({
    query: VIZ_GROUP_GROUP_PERMISSIONS,
    variables: { tenant, vizGroup },
  });

export type UserGroup = { name: string; tenant: string };

export type UserGroupPrincipal = { tenant: string; group: string };

export type UserGroupPermission = {
  name: string;
  groupPrincipals?: UserGroupPrincipal[] | null;
};

export type UserGroupPermissions = {
  admin: UserGroupPrincipal[];
  read: UserGroupPrincipal[];
};
export type UserGroupPermissionResult = Awaited<
  ReturnType<ReturnType<typeof addUserGroupPermission>>
>;

const removeUserGroup: (
  allExisting: UserGroupPermission[],
  userGroup: UserGroup,
) => UserGroupPermissions = (allExisting, userGroup) => {
  const existing = (perm: PermissionName) =>
    allExisting.find((p) => p.name === perm)?.groupPrincipals;
  const rm = (perm: PermissionName) =>
    reject(
      existing(perm),
      (p) => p.group === userGroup.name && p.tenant == userGroup.tenant,
    ).map((p) => ({ tenant: p.tenant, group: p.group }));

  return {
    read: rm('read'),
    admin: rm('admin'),
  };
};

const updateUserGroup: (
  permission: PermissionName,
) => (
  allExisting: UserGroupPermission[],
  userGroup: UserGroup,
) => UserGroupPermissions = (permission) => (allExisting, userGroup) => {
  const removed = removeUserGroup(allExisting, userGroup);
  removed[permission].push({ tenant: userGroup.tenant, group: userGroup.name });
  return removed;
};

const _updateUserGroupPermission =
  (
    action: (
      existing: UserGroupPermission[],
      userGroup: UserGroup,
    ) => UserGroupPermissions,
  ) =>
  async (tenant: string, vizGroup: string, userGroup: UserGroup) => {
    const existingResult = await query({
      query: VIZ_GROUP_GROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        vizGroup: vizGroup,
      },
    });

    const existing = existingResult.data?.vizGroup?.permissions ?? [];
    const updated = action(existing, userGroup);

    return await mutate({
      mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        vizGroup: vizGroup,
        readUserGroups: updated['read'],
        adminUserGroups: updated['admin'],
      },
    });
  };

export const addUserGroupPermission = (permission: PermissionName) =>
  _updateUserGroupPermission(updateUserGroup(permission));
export const updateUserGroupPermission = addUserGroupPermission;
export const deleteUserGroupPermission =
  _updateUserGroupPermission(removeUserGroup);

export type PublishedQueries = ApolloClient.QueryResult<
  MaybeMasked<PublishedQueriesQuery>
>;

export const queryPublishedQueries: (
  tenant: string,
  vizGroup: string,
) => Promise<PublishedQueries> = async (tenant, vizGroup) =>
  query({
    query: PUBLISHED_QUERIES,
    variables: { tenant, vizGroup },
  });

export type SinglePublishedQuery = ApolloClient.QueryResult<
  MaybeMasked<GetPublishedQueryQuery>
>;

export const querySinglePublishedQuery: (
  tenant: string,
  vizGroup: string,
  name: string,
) => Promise<SinglePublishedQuery> = (tenant, vizGroup, name) =>
  query({
    query: GET_PUBLISHED_QUERY,
    variables: {
      tenant,
      vizGroup,
      name,
    },
  });

export type DeletePublishedQuery = Awaited<
  ReturnType<typeof mutateDeletePublishedQuery>
>;

export const mutateDeletePublishedQuery = (
  tenant: string,
  vizGroup: string,
  name: string,
) =>
  mutate({
    mutation: DELETE_PUBLISHED_QUERY,
    variables: {
      tenant,
      vizGroup,
      name,
    },
  });

export type CreatePublishedQuery = Awaited<
  ReturnType<typeof mutateCreatePublishedQuery>
>;

export const mutateCreatePublishedQuery = (
  tenant: string,
  vizGroup: string,
  name: string,
  sql: string,
) =>
  mutate({
    mutation: CREATE_PUBLISHED_QUERY,
    variables: {
      tenant,
      vizGroup,
      name,
      sql,
    },
  });

export const internal = {
  ALL_VIZ_GROUPS,
  PUBLISHED_QUERIES,
  GET_PUBLISHED_QUERY,
  CREATE_VIZ_GROUP,
  DELETE_VIZ_GROUP,
  MUTATE_VIZ_GROUP_PERMISSIONS,
  VIZ_GROUP_GROUP_PERMISSIONS,
  DELETE_PUBLISHED_QUERY,
  CREATE_PUBLISHED_QUERY,
  removeUserGroup,
  updateUserGroup,
  _updateUserGroupPermission,
};
