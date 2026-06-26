import {
  AllVizGroups,
  VizGroupsByTenant,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { ProjectVizGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
import { some } from 'lodash';
import { not } from 'udp-ui/fp';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

export type VizGroup = {
  readonly name: string;
  readonly tenant: string;
  readonly _tag: 'VizGroup';
};

export const mkVizGroupHref: (tenant: string, vizGroup: string) => string = (
  tenant,
  vizGroup,
) => `/settings/dashboardgroups/${tenant}/${vizGroup}`;

export const fromAllVizGroups: (result: AllVizGroups) => VizGroup[] = (
  result,
) =>
  (result.data?.tenants ?? [])
    .flatMap((t) => t.vizGroups)
    .map((v) => mkVizGroup(v.vizGroup, v.tenant));

export const fromVizGroupsByTenant: (
  result: VizGroupsByTenant,
) => VizGroup[] | undefined = (result) =>
  result.data?.tenant?.vizGroups.map((v) => mkVizGroup(v.vizGroup, v.tenant));

const mkVizGroup = (name: string, tenant: string): VizGroup => ({
  name,
  tenant,
  _tag: 'VizGroup',
});

export const filterVizGroupsByScope: (
  vizGroups: VizGroup[] | undefined,
  vizGroupsScopeMap: Map<string, Map<string, Scope[]>> | undefined,
  scope: Scope,
) => VizGroup[] = (
  vizGroups: VizGroup[] | undefined,
  vizGroupsScopeMap: Map<string, Map<string, Scope[]>> | undefined,
  scope: Scope,
) =>
  vizGroups?.filter((vizGroup) =>
    vizGroupsScopeMap
      ?.get(vizGroup.tenant)
      ?.get(vizGroup.name)
      ?.includes(scope),
  ) ?? [];

const vizGroupRead = (permission: { name: string }) =>
  permission.name === 'viz-group-read';

export const toSharedVizGroups: (
  result: ProjectVizGroupPermissions,
) => VizGroup[] = (result) =>
  (
    result.data?.project?.permissions
      ?.filter(vizGroupRead)
      .flatMap(
        (p) =>
          p.vizGroupPrincipals?.map((vgp) =>
            mkVizGroup(vgp.vizGroup, vgp.tenant),
          ) ?? [],
      ) ?? []
  ).map((svg) => ({ ...svg }));

export const filterNotAlreadyShared: (
  vizGroups: VizGroup[],
  sharedGroups: VizGroup[],
) => VizGroup[] = (vizGroups: VizGroup[], sharedGroups: VizGroup[]) => {
  const alreadyShared = (ag: (typeof vizGroups)[number]) =>
    some(sharedGroups, (g) => ag.name === g.name && ag.tenant === g.tenant);
  return vizGroups.filter(not(alreadyShared));
};

/** @param param Searchparameter in the format `tenant_vizgroup` */
export const paramToVizgroup: (param: string) => VizGroup | undefined = (
  param,
) => {
  const split = param.split('_');
  const [tenant, name] = split;
  if (split.length != 2 || !tenant || !name) return undefined;
  return mkVizGroup(name, tenant);
};

export const internal = {
  mkVizGroup,
};
