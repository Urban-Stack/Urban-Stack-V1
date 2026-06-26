import React from 'react';
import { Dashboard } from '@/app/_lib/superset/types';
import AppDashboardsCardOverview from '@/app/dashboards/_internal/AppDashboardsCardOverview';
import AppDashboardsListOverview from '@/app/dashboards/_internal/AppDashboardsListOverview';
import { ViewType } from '@/app/dashboards/_internal/common';

export interface DashboardsComponent {
  supersetUri: string;
  dashboards: Dashboard[];
  onFavoriteChange: (dashboard: Dashboard) => void;
}

const viewTypeToComponentMap = new Map<ViewType, React.FC<DashboardsComponent>>(
  [
    [ViewType.list, AppDashboardsListOverview],
    [ViewType.card, AppDashboardsCardOverview],
  ],
);

/**
 * Overview of the available Superset Dashboards.
 * <p>
 * The representation depends on the given view type.
 *
 * @param supersetUri      Superset base URI
 * @param dashboards       list of the Dashboards to show
 * @param onFavoriteChange function to call when a favorite status changes
 * @param viewType         type of the view
 * @constructor
 */
const AppDashboardsOverview = ({
  supersetUri,
  dashboards,
  onFavoriteChange,
  viewType,
}: {
  supersetUri: string;
  dashboards: Dashboard[];
  onFavoriteChange: (dashboard: Dashboard) => void;
  viewType: ViewType;
}) => {
  const ContentComponent = viewTypeToComponentMap.get(viewType);

  return (
    ContentComponent && (
      <ContentComponent
        supersetUri={supersetUri}
        dashboards={dashboards}
        onFavoriteChange={onFavoriteChange}
      />
    )
  );
};

export default AppDashboardsOverview;
