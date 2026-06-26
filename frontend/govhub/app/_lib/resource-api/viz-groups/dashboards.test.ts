import { VizGroupDashboards } from '@/app/_lib/resource-api/graphql/vizGroups';
import { DeepPartial } from 'ts-essentials';
import {
  Dashboard,
  internal,
  toDashboards,
} from '@/app/_lib/resource-api/viz-groups/dashboards';

describe('toDashboards', () => {
  it('should convert a GraphQL result to a Dashboard list', () => {
    const result = {
      data: {
        vizGroup: {
          tenant: 'tenant1',
          vizGroup: 'vizgroup1',
          dashboards: [
            { dashboard: 'dashboard1', slug: 'dashboard1_tenant1' },
            { dashboard: 'dashboard2', slug: 'dashboard2_tenant1' },
            { dashboard: 'dashboard3', slug: 'dashboard3_tenant1' },
          ],
        },
      },
    } as DeepPartial<VizGroupDashboards> as VizGroupDashboards;

    const expected: Dashboard[] = [
      {
        name: 'dashboard1',
        slug: 'dashboard1_tenant1',
        vizGroup: 'vizgroup1',
        tenant: 'tenant1',
        _tag: 'Dashboard',
      },
      {
        name: 'dashboard2',
        slug: 'dashboard2_tenant1',
        vizGroup: 'vizgroup1',
        tenant: 'tenant1',
        _tag: 'Dashboard',
      },
      {
        name: 'dashboard3',
        slug: 'dashboard3_tenant1',
        vizGroup: 'vizgroup1',
        tenant: 'tenant1',
        _tag: 'Dashboard',
      },
    ];

    const vizGroups = toDashboards(result);

    expect(vizGroups).toEqual(expected);
  });

  it('returns an empty array if no dashboards exist', () => {
    const result = {
      data: {
        vizGroup: { tenant: 'tenant1', vizGroup: 'vizgroup1', dashboards: [] },
      },
    } as DeepPartial<VizGroupDashboards> as VizGroupDashboards;

    expect(toDashboards(result)).toEqual([]);
  });

  it('returns an empty array if tenant name not available', () => {
    const result = {
      data: {
        vizGroup: {
          vizGroup: 'vizgroup1',
          dashboards: [
            { dashboard: 'dashboard1', slug: 'dashboard1_tenant1' },
            { dashboard: 'dashboard2', slug: 'dashboard2_tenant1' },
            { dashboard: 'dashboard3', slug: 'dashboard3_tenant1' },
          ],
        },
      },
    } as DeepPartial<VizGroupDashboards> as VizGroupDashboards;

    expect(toDashboards(result)).toEqual([]);
  });

  it('returns an empty array if vizGroup name not available', () => {
    const result = {
      data: {
        vizGroup: {
          tenant: 'tenant1',
          dashboards: [
            { dashboard: 'dashboard1', slug: 'dashboard1_tenant1' },
            { dashboard: 'dashboard2', slug: 'dashboard2_tenant1' },
            { dashboard: 'dashboard3', slug: 'dashboard3_tenant1' },
          ],
        },
      },
    } as DeepPartial<VizGroupDashboards> as VizGroupDashboards;

    expect(toDashboards(result)).toEqual([]);
  });
});

describe('mkDashboard', () => {
  it('should create a Dashboard object', () => {
    const expected: Dashboard = {
      name: 'dashboard1',
      slug: 'dashboard1_tenant1',
      vizGroup: 'vizgroup1',
      tenant: 'tenant1',
      _tag: 'Dashboard',
    };

    const dashboard = internal.mkDashboard(
      'dashboard1',
      'dashboard1_tenant1',
      'vizgroup1',
      'tenant1',
    );

    expect(dashboard).toEqual(expected);
  });
});
