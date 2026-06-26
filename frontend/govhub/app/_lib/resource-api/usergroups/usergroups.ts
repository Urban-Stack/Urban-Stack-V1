import { Scope } from '@/app/_lib/resource-api/permission/scope';
import { AllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import { Permission } from '@/app/__generated__/types';

export type UserGroup = {
  readonly name: string;
  readonly tenant: string;
  readonly isMember: boolean;
  readonly keycloakGroupPath: string;
  readonly scopes?: {
    readonly granted?: Scope[];
    readonly all?: Scope[];
  };
  readonly isShared: boolean;
  readonly _tag: 'UserGroup';
};

export const toUserGroups: (result: AllUserGroups) => UserGroup[] = (result) =>
  result.data?.tenants?.flatMap((t) =>
    t.groups.map((g) =>
      unsafeMkUserGroup(
        g.group,
        t.tenant,
        g.isMember,
        g.keycloakGroupPath,
        g.permissions ?? [],
        {
          granted: g.scopes.granted,
        },
      ),
    ),
  ) ?? [];

const unsafeMkUserGroup: (
  name: string,
  tenant: string,
  isMember: boolean,
  keycloakGroupPath: string,
  permissions?: Permission[],
  scopes?: { granted?: string[]; all?: string[] },
) => UserGroup = (
  name,
  tenant,
  isMember,
  keycloakGroupPath,
  permissions,
  scopes,
) => ({
  name,
  tenant,
  isMember,
  keycloakGroupPath,
  scopes: scopes && {
    granted: scopes.granted?.map((s) => Scope.parse(s)) ?? [],
    all: scopes.all?.map((s) => Scope.parse(s)) ?? [],
  },
  isShared: permissions?.some((p) => p.name === 'shared') ?? false,
  _tag: 'UserGroup',
});
