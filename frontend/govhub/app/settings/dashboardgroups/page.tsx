import { mkMetadata } from '@/app/meta';
import VizGroupsList from '@/app/settings/dashboardgroups/VizGroupsList';
import CreateVizGroupButton from '@/app/settings/dashboardgroups/CreateVizGroupButton';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import {
  hasScopeForTenant,
  tenantPermissionMap,
  vizGroupPermissionMap,
} from '@/app/_lib/resource-api/permission/scope';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import React from 'react';
import { SEARCH_PARAMS } from '@/app/settings/dashboardgroups/common';

export const generateMetadata = mkMetadata({ pageName: 'Dashboardgruppen' });

const DashboardGroupsSettingsPage = async () => {
  const tenant = await requireTenant();
  const scopes = await GetAllTenantAndProjectScopes();
  const vizGroupScopeMap = vizGroupPermissionMap(scopes);
  const tenantScopes = tenantPermissionMap(scopes);
  const canCreateVizGroup = hasScopeForTenant(
    tenantScopes,
    'viz-group:admin',
    tenant,
  );

  return (
    <div className={'h-full flex flex-col'}>
      <div className='flex flex-wrap gap-4 mb-6'>
        <h2 className='grow-[999] self-end text-2xl font-bold text-gray-900'>
          Dashboardgruppen
        </h2>
        {canCreateVizGroup && <CreateVizGroupButton />}
      </div>
      <AppSearchBar
        placeholder='Dashboardgruppen durchsuchen'
        paramKey={SEARCH_PARAMS.search}
        className='mb-4'
      />
      <div className={'flex flex-col flex-grow justify-center'}>
        <VizGroupsList
          scopeMap={vizGroupScopeMap}
          canCreateVizGroup={canCreateVizGroup}
        />
      </div>
    </div>
  );
};
export default DashboardGroupsSettingsPage;
