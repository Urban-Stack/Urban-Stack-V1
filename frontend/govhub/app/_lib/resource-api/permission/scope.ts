import { z } from 'zod';
import { AllTenantAndProjectScopes, TenantScopes } from '../graphql/tenant';
import { UserGroupScopes } from '@/app/_lib/resource-api/graphql/usergroups';

export const Scope = z.enum([
  'citytool:admin',
  'citytool:read',
  'citytool:view',
  'dashboard:admin',
  'dashboard:read',
  'dashboard:view',
  'dataset:admin',
  'dataset:read',
  'dataset:refresh',
  'dataset:view',
  'dedicated-app:admin',
  'dedicated-app:read',
  'dedicated-app:view',
  'group:admin',
  'group:read',
  'group:view',
  'project:admin',
  'project:bucket-read',
  'project:bucket-write',
  'project:clickhouse-read',
  'project:read',
  'project:sensor-metadata-read',
  'project:sensor-metadata-write',
  'project:view',
  'published-query:admin',
  'published-query:read',
  'published-query:view',
  'sensor-credential:admin',
  'sensor-credential:read',
  'sensor-credential:rotate',
  'sensor-credential:view',
  'sensor-subscription:admin',
  'sensor-subscription:read',
  'sensor-subscription:view',
  'shared-app:admin',
  'shared-app:read',
  'shared-app:view',
  'tenant:admin',
  'tenant:ckan-admin',
  'tenant:ckan-editor',
  'tenant:ckan-member',
  'tenant:discourse-member',
  'tenant:discourse-moderator',
  'tenant:read',
  'tenant:view',
  'viz-group:admin',
  'viz-group:read',
  'viz-group:view',
] as const);
export type Scope = z.infer<typeof Scope>;

export const projectPermissionMap: (
  input: AllTenantAndProjectScopes,
) => Map<string, Scope[]> = (input: AllTenantAndProjectScopes) =>
  new Map(
    (input.data?.tenants.flatMap((tenant) => tenant.projects) ?? []).map(
      (project) => [
        project.project,
        project.scopes.granted as unknown as Scope[],
      ],
    ),
  );

export const vizGroupPermissionMap: (
  input: AllTenantAndProjectScopes,
) => Map<string, Map<string, Scope[]>> = (input) => {
  const byTenant = new Map<string, Map<string, Scope[]>>();

  (input.data?.tenants ?? []).forEach((tenant) => {
    const groups = new Map<string, Scope[]>();
    tenant.vizGroups.forEach((vg) => {
      groups.set(vg.vizGroup, vg.scopes.granted as Scope[]);
    });
    byTenant.set(tenant.tenant, groups);
  });

  return byTenant;
};

export const tenantPermissionMap: (
  input: AllTenantAndProjectScopes,
) => Map<string, Scope[]> = (input) =>
  new Map(
    (input.data?.tenants ?? []).map((tenant) => [
      tenant.tenant,
      tenant.scopes.granted as unknown as Scope[],
    ]),
  );

export const hasScopeForProject: (
  scopeMap: Map<string, Scope[]>,
  scope: Scope,
  project: string,
) => boolean = (scopeMap, scope, project) =>
  scopeMap.has(project) && (scopeMap.get(project)?.includes(scope) ?? false);

export const hasScopeForVizGroup: (
  scopeMap: Map<string, Map<string, Scope[]>>,
  scope: Scope,
  vizGroup: string,
  tenant: string,
) => boolean = (scopeMap, scope, vizGroup, tenant) =>
  scopeMap.get(tenant)?.get(vizGroup)?.includes(scope) ?? false;

export const hasScopeForTenant: (
  scopeMap: Map<string, Scope[]>,
  scope: Scope,
  tenant: string,
) => boolean = (scopeMap, scope, tenant) =>
  scopeMap.has(tenant) && (scopeMap.get(tenant)?.includes(scope) ?? false);

export const canCreateProject = (input: AllTenantAndProjectScopes) =>
  (input.data?.tenants ?? []).some((tenant) =>
    tenant.scopes.granted.includes('tenant:admin'),
  );

export const isGroupAdminInAnyTenant: (
  scopeQueryData: AllTenantAndProjectScopes,
  group?: string,
  tenant?: string,
) => boolean = (scopeQueryData, group, tenant) =>
  group && tenant
    ? (scopeQueryData.data?.tenants
        .find((tenantItem) => tenantItem.tenant === tenant)
        ?.groups.find((groupItem) => groupItem.group === group)
        ?.scopes.granted.includes('group:admin') ?? false)
    : (scopeQueryData.data?.tenants ?? []).some((tenantItem) =>
        tenantItem.groups.some((groupItem) =>
          groupItem.scopes.granted.includes('group:admin'),
        ),
      );

export const groupScopeSet: (scopes: UserGroupScopes) => Set<Scope> = (
  scopes,
) =>
  new Set<Scope>(
    (scopes.data?.group?.scopes.granted as unknown as Scope[] | undefined) ??
      [],
  );

export const isTenantAdmin: (
  input: AllTenantAndProjectScopes,
  tenant: string,
) => boolean = (input, tenant) =>
  input.data?.tenants.some(
    (tenantItem) =>
      tenantItem.tenant === tenant &&
      tenantItem.scopes.granted.includes('tenant:admin'),
  ) ?? false;

export const isCityToolAdmin: (result: TenantScopes) => boolean = (result) =>
  result.data?.tenant?.scopes.granted.includes('citytool:admin') ?? false;

export const isSharedAppAdmin: (result: TenantScopes) => boolean = (result) =>
  result.data?.tenant?.scopes.granted.includes('shared-app:admin') ?? false;

export const isDedicatedAppAdmin: (result: TenantScopes) => boolean = (
  result,
) =>
  result.data?.tenant?.scopes.granted.includes('dedicated-app:admin') ?? false;
