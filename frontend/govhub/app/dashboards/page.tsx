import DashboardsContainer from '@/app/dashboards/DashboardsContainer';
import { getPublicEnv } from '@/app/_lib/env';
import { mkMetadata } from '@/app/meta';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { fromAllVizGroups } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { query } from '@/app/_lib/resource-api/client';
import { ALL_VIZ_GROUPS } from '@/app/_lib/resource-api/graphql/vizGroups';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';

export const generateMetadata = mkMetadata({ pageName: 'Dashboards' });

const DashboardsPage = async () => {
  const tenant = await requireTenant();
  const canCreateDashboard = await queryHasTenantScope(
    tenant,
    'viz-group:admin',
  );

  const { vizGroups, adminMap, dashboardViewMap } = await query({
    query: ALL_VIZ_GROUPS,
  }).then(fromAllVizGroups);

  return (
    <DashboardsContainer
      supersetUri={getPublicEnv('SUPERSET_URI')}
      canCreateDashboard={canCreateDashboard}
      vizGroups={vizGroups}
      adminMap={adminMap}
      dashboardViewMap={dashboardViewMap}
    />
  );
};

export default DashboardsPage;
