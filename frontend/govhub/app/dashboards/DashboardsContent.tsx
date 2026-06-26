'use client';

import { Dashboard } from '@/app/_lib/superset/types';
import {
  DEFAULT_VIEW,
  SEARCH_PARAMS,
  ViewType,
} from '@/app/dashboards/_internal/common';
import AppDashboardsOverview from '@/app/dashboards/_internal/AppDashboardsOverview';
import {
  NoDashboardsIcon,
  NoSearchResultIcon,
  UdpFallback,
  UdpIcon,
} from 'udp-ui/components';
import { useSearchParams } from 'next/navigation';
import { filterDashboards } from '@/app/_lib/superset/util';
import { paramToVizgroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { isDefined } from 'udp-ui/fp';

export const DashboardsContentTestIds = {
  noDashboards: 'dashboards-content-no-dashboards',
  noSearchResult: 'dashboards-content-no-search-result',
  overview: 'dashboards-content-overview',
};

type DashboardsContentProps = {
  supersetUri: string;
  dashboards: Dashboard[];
  onFavoriteChange: (dashboard: Dashboard) => void;
};

const DashboardsContent = ({
  supersetUri,
  dashboards: allDashboards,
  onFavoriteChange,
}: DashboardsContentProps) => {
  const searchParams = useSearchParams();

  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? undefined;
  const favorites = searchParams.get(SEARCH_PARAMS.favorites) == 'true';
  const status = searchParams.get(SEARCH_PARAMS.status)?.split(',');
  const vizGroups = searchParams
    .get(SEARCH_PARAMS.vizgroups)
    ?.split(',')
    .map(paramToVizgroup)
    .filter(isDefined);
  const dashboards = filterDashboards(allDashboards, {
    searchText,
    favorites,
    status,
    vizGroups,
  });

  const queryView: string =
    searchParams.get(SEARCH_PARAMS.view) ?? ViewType[DEFAULT_VIEW];
  const currentView = ViewType[queryView as keyof typeof ViewType];

  const Fallback = (() => {
    if (allDashboards.length === 0) return <NoDashboardsFallback />;
    else if (dashboards.length === 0) return <NoSearchResultFallback />;
    else return undefined;
  })();

  return (
    <div className={'flex flex-col flex-grow justify-center'}>
      {Fallback ?? (
        <div
          data-testid={DashboardsContentTestIds.overview}
          className={'size-full'}
        >
          <AppDashboardsOverview
            supersetUri={supersetUri}
            dashboards={dashboards}
            onFavoriteChange={onFavoriteChange}
            viewType={currentView}
          />
        </div>
      )}
    </div>
  );
};

const NoDashboardsFallback = () => (
  <UdpFallback
    data-testid={DashboardsContentTestIds.noDashboards}
    icon={NoDashboardsIcon}
    title={'Noch keine Dashboards vorhanden.'}
    description={'Sie können hier ein neues Dashboard erstellen.'}
  />
);

const NoSearchResultFallback = () => (
  <UdpFallback
    data-testid={DashboardsContentTestIds.noSearchResult}
    icon={NoSearchResultIcon as UdpIcon}
    title={'Keine Suchergebnisse gefunden.'}
    description={
      'Versuchen Sie einen anderen Suchbegriff oder\nerstellen Sie ein neues Dashboard.'
    }
  />
);

export default DashboardsContent;
