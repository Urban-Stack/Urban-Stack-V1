import { Scope } from '@/app/_lib/resource-api/permission/scope';

export type Principal = TenantPrincipal | GroupPrincipal;

type TenantPrincipal = {
  readonly tenant: string;
  readonly _tag: 'tenant';
};

type GroupPrincipal = {
  readonly tenant: string;
  readonly group: string;
  readonly _tag: 'group';
};

export const mkTenantPrincipal: (tenant: string) => TenantPrincipal = (
  tenant,
): TenantPrincipal => ({
  tenant,
  _tag: 'tenant',
});

export const mkGroupPrincipal: (
  tenant: string,
  group: string,
) => GroupPrincipal = (tenant, group): GroupPrincipal => ({
  tenant,
  group,
  _tag: 'group',
});

export type Permission = {
  readonly name: string;
  readonly scopes: Scope[];
  readonly principals: Principal[];
  readonly _tag: 'permission';
};

export const mkPermission: (
  name: string,
  scopes: Scope[],
  principals: Principal[],
) => Permission = (name, scopes, principals) => ({
  name,
  scopes,
  principals,
  _tag: 'permission',
});
