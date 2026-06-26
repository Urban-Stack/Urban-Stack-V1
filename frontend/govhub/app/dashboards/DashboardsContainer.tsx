'use client';

import React from 'react';
import { useSuperset } from '@/app/_lib/superset/superset';
import {
  filterDashboards,
  populateDashboards,
  sanitizeDashboards,
} from '@/app/_lib/superset/util';
import CreateDashboardButton from '@/app/dashboards/_create/CreateDashboardButton';
import {
  filterVizGroupsByScope,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';
import DashboardsContent from '@/app/dashboards/DashboardsContent';
import ViewSelector from '@/app/dashboards/ViewSelector';
import { Dashboard } from '@/app/_lib/superset/types';
import Filter from '@/app/dashboards/Filter';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import { SEARCH_PARAMS } from '@/app/dashboards/_internal/common';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

interface AppDashboardsContainerProps {
  supersetUri: string;
  canCreateDashboard: boolean;
  vizGroups?: VizGroup[];
  vizGroupScopeMap?: Map<string, Map<string, Scope[]>>;
}

/**
 * Container for showing the available Superset dashboards.
 * <p>
 * This container comprises
 * <ul>
 *  <li>a search bar
 *  <li>a selector for the view layout
 *  <li>the container for the available dashboards, or a fallback component if there are no dashboards to show
 * </ul>
 *
 * @param supersetUri        Superset base URI
 * @param canCreateDashboard `true` if the user has dashboard creation permissions for the current tenant - `false` otherwise
 * @param vizGroups          available viz groups for viewing or creating dashboards
 * @param vizGroupScopeMap   available scopes per viz group
 * @constructor
 */
const DashboardsContainer = ({
  supersetUri,
  canCreateDashboard,
  vizGroups,
  vizGroupScopeMap,
}: AppDashboardsContainerProps) => {
  const { getDashboards, useFavoriteStatuses } = useSuperset(supersetUri);

  const { dashboards: dashboardsResp } = getDashboards();
  const sanitized = dashboardsResp?.result
    ? sanitizeDashboards(dashboardsResp.result)
    : [];

  const vizGroupsWithViewScope = filterVizGroupsByScope(
    vizGroups,
    vizGroupScopeMap,
    'dashboard:view',
  );

  const visibleDashboards = filterDashboards(sanitized, {
    vizGroups: vizGroupsWithViewScope,
  });

  const { favStatuses, setFavStatus } = useFavoriteStatuses(
    visibleDashboards.map((d) => d.id),
  );
  const dashboards = populateDashboards(visibleDashboards, favStatuses?.result);

  const onFavoriteChange = (d: Dashboard) => {
    void setFavStatus(d.id, !d.favorite);
  };

  const vizGroupsWithAdminScope = filterVizGroupsByScope(
    vizGroups,
    vizGroupScopeMap,
    'viz-group:admin',
  );

  return (
    <div className={'h-full flex flex-col gap-y-4'}>
      <div className={'flex flex-wrap gap-4'}>
        <h1 className={'grow-[999] self-end text-3xl font-bold text-gray-900'}>
          Dashboards
        </h1>
        {canCreateDashboard && vizGroupsWithAdminScope.length > 0 && (
          <div className='grow'>
            <CreateDashboardButton
              vizGroups={vizGroupsWithAdminScope}
              className='w-full'
            />
          </div>
        )}
      </div>
      <AppSearchBar
        placeholder='Dashboards durchsuchen'
        paramKey={SEARCH_PARAMS.search}
      />
      <div className='flex flex-row flex-wrap justify-between items-start sm:items-center gap-4'>
        <Filter vizGroups={vizGroups} className='flex-shrink' />
        <ViewSelector className='grow-0 shrink-0 self-end sm:self-auto sm:ml-0 ml-auto' />
      </div>
      <DashboardsContent
        supersetUri={supersetUri}
        dashboards={dashboards}
        onFavoriteChange={onFavoriteChange}
      />
    </div>
  );
};

export default DashboardsContainer;
