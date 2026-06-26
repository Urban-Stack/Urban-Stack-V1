export type Resource = TenantResource | VizGroupResource | DashboardResource;

type TenantResource = {
  readonly _tag: 'tenant';
  readonly name: string;
};

type VizGroupResource = {
  readonly _tag: 'viz-group';
  readonly tenant: string;
  readonly name: string;
};

type DashboardResource = {
  readonly _tag: 'dashboard';
  readonly tenant: string;
  readonly vizGroup: string;
  readonly name: string;
};

export const mkTenantResource: (name: string) => TenantResource = (name) => ({
  _tag: 'tenant',
  name,
});

export const mkVizGroupResource: (
  tenant: string,
  name: string,
) => VizGroupResource = (tenant, name) => ({
  _tag: 'viz-group',
  tenant,
  name,
});

export const mkDashboardResource: (
  tenant: string,
  vizGroup: string,
  name: string,
) => DashboardResource = (tenant, vizGroup, name) => ({
  _tag: 'dashboard',
  tenant,
  vizGroup,
  name,
});
