import { ApolloClient, MaybeMasked } from '@apollo/client';
import {
  AllProjectsQuery,
  GetGroupsPermissionsQuery,
  GetVizGroupsPermissionsQuery,
} from '@/app/__generated__/types';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { graphql } from '@/app/__generated__';
import { reject } from 'lodash';
import { PermissionName } from '@/app/_lib/resource-api/util/shared-groups';
import { mutate, query } from '@/app/_lib/resource-api/client';

export type AllProjects = ApolloClient.QueryResult<
  MaybeMasked<AllProjectsQuery>
>;

const ALL_PROJECTS = graphql(`
  query AllProjects {
    tenants {
      projects {
        tenant
        project
      }
    }
  }
`);

const PROJECT_GROUP_PERMISSIONS = graphql(`
  query GetGroupsPermissions($tenant: String!, $project: String!) {
    project(tenant: $tenant, project: $project) {
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

const PROJECT_VIZGROUP_PERMISSIONS = graphql(`
  query GetVizGroupsPermissions($tenant: String!, $project: String!) {
    project(tenant: $tenant, project: $project) {
      permissions {
        name
        vizGroupPrincipals {
          tenant
          vizGroup
        }
        scopes
      }
    }
  }
`);

const CREATE_PROJECT = graphql(`
  mutation CreateProject($tenant: String!, $project: String!) {
    tenant(tenant: $tenant) {
      createProject(project: $project) {
        project
        tenant
      }
    }
  }
`);

const DELETE_PROJECT = graphql(`
  mutation DeleteProject($tenant: String!, $project: String!) {
    tenant(tenant: $tenant) {
      deleteProject(project: $project)
    }
  }
`);

const MUTATE_PROJECT_PERMISSIONS = graphql(`
  mutation ProjectPermission(
    $tenant: String!
    $project: String!
    $readGroups: [GroupInput!]!
    $adminGroups: [GroupInput!]!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        read: createPermission(
          permission: {
            name: "read"
            scopes: ["project:read"]
            groupPrincipals: $readGroups
          }
        )
        admin: createPermission(
          permission: {
            name: "admin"
            scopes: ["project:admin"]
            groupPrincipals: $adminGroups
          }
        )
      }
    }
  }
`);

export const MUTATE_PROJECT_VIZ_PERMISSIONS = graphql(`
  mutation ProjectVizPermission(
    $tenant: String!
    $project: String!
    $readGroups: [VizGroupInput!]!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        vizGroupRead: createPermission(
          permission: {
            name: "viz-group-read"
            scopes: ["project:read"]
            vizGroupPrincipals: $readGroups
          }
        )
      }
    }
  }
`);

export const fetchAllProjects: () => Promise<AllProjects> = async () =>
  query({ query: ALL_PROJECTS });

export type CreateProject = Awaited<ReturnType<typeof mutateCreateProject>>;

export type DeleteProject = Awaited<ReturnType<typeof mutateDeleteProject>>;

export const mutateCreateProject = async (name: string) =>
  mutate({
    mutation: CREATE_PROJECT,
    variables: {
      tenant: await requireTenant(),
      project: name,
    },
  });

export const mutateDeleteProject = async (tenant: string, project: string) =>
  mutate({
    mutation: DELETE_PROJECT,
    variables: {
      tenant,
      project,
    },
  });

export type ProjectGroupPermissions = ApolloClient.QueryResult<
  MaybeMasked<GetGroupsPermissionsQuery>
>;

export type ProjectVizGroupPermissions = ApolloClient.QueryResult<
  MaybeMasked<GetVizGroupsPermissionsQuery>
>;

export const queryProjectGroupPermissions: (
  tenant: string,
  project: string,
) => Promise<ProjectGroupPermissions> = async (tenant, project) =>
  query({
    query: PROJECT_GROUP_PERMISSIONS,
    variables: {
      tenant,
      project,
    },
  });

export const queryProjectVizGroupPermissions: (
  tenant: string,
  project: string,
) => Promise<ProjectVizGroupPermissions> = async (tenant, project) =>
  query({
    query: PROJECT_VIZGROUP_PERMISSIONS,
    variables: {
      tenant,
      project,
    },
  });

export type GroupPermission = Awaited<
  ReturnType<ReturnType<typeof addGroupPermission>>
>;

export type GroupVizPermission = Awaited<
  ReturnType<ReturnType<typeof addVizGroupPermission>>
>;

type Permission = {
  name: string;
  groupPrincipals?: { tenant: string; group: string }[] | null;
};

type VizGroupPermission = {
  name: string;
  vizGroupPrincipals?: { tenant: string; vizGroup: string }[] | null;
};

type GroupPermissions = {
  admin: { tenant: string; group: string }[];
  read: { tenant: string; group: string }[];
};

type VizGroupPermissions = {
  'viz-group-read': { tenant: string; vizGroup: string }[];
};

const updateGroup: (permission: PermissionName) => (
  allExisting: Permission[],
  group: {
    name: string;
    tenant: string;
  },
) => GroupPermissions = (permission) => (allExisting, group) => {
  const removed = removeGroup(allExisting, group);
  removed[permission].push({ tenant: group.tenant, group: group.name });
  return removed;
};

const updateVizGroup: (permission: 'viz-group-read') => (
  allExisting: VizGroupPermission[],
  vizGroup: {
    name: string;
    tenant: string;
  },
) => VizGroupPermissions = (permission) => (allExisting, vizGroup) => {
  const removed = removeVizGroup(allExisting, vizGroup);
  removed[permission].push({
    tenant: vizGroup.tenant,
    vizGroup: vizGroup.name,
  });
  return removed;
};

const removeGroup: (
  allExisting: Permission[],
  group: {
    name: string;
    tenant: string;
  },
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

const removeVizGroup: (
  allExisting: VizGroupPermission[],
  vizGroup: {
    name: string;
    tenant: string;
  },
) => VizGroupPermissions = (allExisting, vizGroup) => {
  const existing = (perm: 'viz-group-read') =>
    allExisting.find((p) => p.name === perm)?.vizGroupPrincipals;
  const rm = (perm: 'viz-group-read') =>
    reject(
      existing(perm),
      (p) => p.vizGroup === vizGroup.name && p.tenant == vizGroup.tenant,
    ).map((p) => ({ tenant: p.tenant, vizGroup: p.vizGroup }));

  return {
    'viz-group-read': rm('viz-group-read'),
  };
};

const _updateGroupPermission =
  (
    action: (
      existing: Permission[],
      group: { name: string; tenant: string },
    ) => GroupPermissions,
  ) =>
  async (
    tenant: string,
    project: string,
    group: { name: string; tenant: string },
  ) => {
    const existingResult = await query({
      query: PROJECT_GROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        project: project,
      },
    });

    const existing = existingResult.data?.project?.permissions ?? [];
    const updated = action(existing, group);

    return await mutate({
      mutation: MUTATE_PROJECT_PERMISSIONS,
      variables: {
        tenant: tenant,
        project: project,
        readGroups: updated['read'],
        adminGroups: updated['admin'],
      },
    });
  };

const _updateVizGroupPermission =
  (
    action: (
      existing: Permission[],
      group: { name: string; tenant: string },
    ) => VizGroupPermissions,
  ) =>
  async (
    tenant: string,
    project: string,
    group: { name: string; tenant: string },
  ) => {
    const existingResult = await query({
      query: PROJECT_VIZGROUP_PERMISSIONS,
      variables: {
        tenant: tenant,
        project: project,
      },
    });

    const existing = existingResult.data?.project?.permissions ?? [];
    const updated = action(existing, group);

    return await mutate({
      mutation: MUTATE_PROJECT_VIZ_PERMISSIONS,
      variables: {
        tenant: tenant,
        project: project,
        readGroups: updated['viz-group-read'],
      },
    });
  };

export const addGroupPermission = (permission: PermissionName) =>
  _updateGroupPermission(updateGroup(permission));
export const addVizGroupPermission = (permission: 'viz-group-read') =>
  _updateVizGroupPermission(updateVizGroup(permission));
export const updateGroupPermission = addGroupPermission;
export const updateVizGroupPermission = addVizGroupPermission;
export const deleteGroupPermission = _updateGroupPermission(removeGroup);
export const deleteVizGroupPermission =
  _updateVizGroupPermission(removeVizGroup);

export const internal = {
  ALL_PROJECTS,
  CREATE_PROJECT,
  DELETE_PROJECT,
  PROJECT_GROUP_PERMISSIONS,
  MUTATE_PROJECT_PERMISSIONS,
  MUTATE_PROJECT_VIZ_PERMISSIONS,
  updateGroup,
  removeGroup,
  _updateGroupPermission,
};
