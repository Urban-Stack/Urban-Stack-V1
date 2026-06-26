import DashboardsContainer from '@/app/dashboards/DashboardsContainer';
import { getPublicEnv } from '@/app/_lib/env';
import { mkMetadata } from '@/app/meta';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { fromAllVizGroups } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { query } from '@/app/_lib/resource-api/client';
import { ALL_VIZ_GROUPS } from '@/app/_lib/resource-api/graphql/vizGroups';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import {
  hasScopeForTenant,
  tenantPermissionMap,
  vizGroupPermissionMap,
} from '@/app/_lib/resource-api/permission/scope';

export const generateMetadata = mkMetadata({ pageName: 'Dashboards' });

const DashboardsPage = async () => {
  const tenant = await requireTenant();
  const scopes = await GetAllTenantAndProjectScopes();
  const vizGroupScopeMap = vizGroupPermissionMap(scopes);
  const tenantScopeMap = tenantPermissionMap(scopes);
  const canCreateDashboard = hasScopeForTenant(
    tenantScopeMap,
    'viz-group:admin',
    tenant,
  );

  const vizGroups = await query({
    query: ALL_VIZ_GROUPS,
  }).then(fromAllVizGroups);

  return (
    <DashboardsContainer
      supersetUri={getPublicEnv('SUPERSET_URI')}
      canCreateDashboard={canCreateDashboard}
      vizGroups={vizGroups}
      vizGroupScopeMap={vizGroupScopeMap}
    />
  );
};

export default DashboardsPage;
