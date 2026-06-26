import { ProjectGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
import { not } from 'udp-ui/fp';
import { VizGroupGroupPermissions } from '@/app/_lib/resource-api/graphql/vizGroups';
import { some } from 'lodash';
import { UserGroupPermissions } from '@/app/_lib/resource-api/graphql/usergroups';

export const PermissionName = ['admin', 'read'] as const;
export type PermissionName = (typeof PermissionName)[number];

export type SharedGroup = {
  readonly name: string;
  readonly tenant: string;
  readonly permissionName: PermissionName;
  readonly unknownPermissions: boolean;
  readonly _tag: 'SharedGroup';
};

type SharedUserGroupPermissions =
  | ProjectGroupPermissions
  | VizGroupGroupPermissions
  | UserGroupPermissions;

const permissionsFrom = (result: SharedUserGroupPermissions) =>
  (() => {
    if (!result.data) return undefined;
    if ('project' in result.data) return result.data.project?.permissions;
    if ('vizGroup' in result.data) return result.data.vizGroup?.permissions;
    if ('group' in result.data) return result.data.group?.permissions;
  })();

export const toSharedGroups: (
  result: SharedUserGroupPermissions,
) => SharedGroup[] = (result) =>
  (
    permissionsFrom(result)
      ?.filter(adminOrRead)
      .flatMap(
        (p) =>
          p.groupPrincipals?.map((gp) =>
            mkSharedGroup(
              gp.group,
              gp.tenant,
              p.name as SharedGroup['permissionName'],
            ),
          ) ?? [],
      ) ?? []
  ).map((sg) => ({ ...sg, unknownPermissions: existsInOtherPerm(sg, result) }));

export const hasUnknownPermissions = (result: SharedUserGroupPermissions) =>
  permissionsFrom(result)?.some(not(adminOrRead)) ?? false;

export const filterNotAlreadyShared = (
  adminGroups: { name: string; tenant: string }[],
  sharedGroups: SharedGroup[],
) => {
  const alreadyShared = (ag: (typeof adminGroups)[number]) =>
    some(sharedGroups, (g) => ag.name === g.name && ag.tenant === g.tenant);
  return adminGroups.filter(not(alreadyShared));
};

const adminOrRead = (permission: { name: string }) =>
  (PermissionName as readonly string[]).includes(permission.name);

const existsInOtherPerm = (
  sg: SharedGroup,
  result: SharedUserGroupPermissions,
) =>
  permissionsFrom(result)?.some(
    (p) =>
      p.name !== 'admin' &&
      p.name !== 'read' &&
      p.groupPrincipals?.some(
        (gp) => gp.group === sg.name && gp.tenant === sg.tenant,
      ),
  ) ?? false;

const mkSharedGroup: (
  name: string,
  tenant: string,
  permissionName: 'admin' | 'read',
  unknownPermissions?: boolean,
) => SharedGroup = (
  name,
  tenant,
  permissionName,
  unknownPermissions = false,
): SharedGroup => ({
  name,
  tenant,
  permissionName,
  unknownPermissions,
  _tag: 'SharedGroup',
});

export const internal = {
  mkSharedGroup,
};
