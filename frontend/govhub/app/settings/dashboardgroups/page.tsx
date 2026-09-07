import { mkMetadata } from '@/app/meta';
import VizGroupsList from '@/app/settings/dashboardgroups/VizGroupsList';
import CreateVizGroupButton from '@/app/settings/dashboardgroups/CreateVizGroupButton';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import React from 'react';
import { SEARCH_PARAMS } from '@/app/settings/dashboardgroups/common';

export const generateMetadata = mkMetadata({ pageName: 'Dashboardgruppen' });

const DashboardGroupsSettingsPage = async () => {
  const tenant = await requireTenant();
  const canCreateVizGroup = await queryHasTenantScope(
    tenant,
    'viz-group:admin',
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
        <VizGroupsList canCreateVizGroup={canCreateVizGroup} />
      </div>
    </div>
  );
};
export default DashboardGroupsSettingsPage;
