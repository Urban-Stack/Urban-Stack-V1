import { VizGroupDashboards } from '@/app/_lib/resource-api/graphql/vizGroups';

export type Dashboard = {
  readonly name: string;
  readonly slug: string;
  readonly vizGroup: string;
  readonly tenant: string;
  readonly _tag: 'Dashboard';
};

export const toDashboards: (result: VizGroupDashboards) => Dashboard[] = (
  result,
) => {
  const tenant = result.data?.vizGroup?.tenant;
  const vizGroup = result.data?.vizGroup?.vizGroup;
  return !!tenant && !!vizGroup
    ? (result.data?.vizGroup?.dashboards.map((d) =>
        mkDashboard(d.dashboard, d.slug, vizGroup, tenant),
      ) ?? [])
    : [];
};

const mkDashboard: (
  name: string,
  slug: string,
  vizGroup: string,
  tenant: string,
) => Dashboard = (name, slug, vizGroup, tenant) => ({
  name,
  slug,
  vizGroup,
  tenant,
  _tag: 'Dashboard',
});

export const internal = {
  mkDashboard,
};
