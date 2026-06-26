import { Dashboard } from '@/app/_lib/superset/types';
import { DashboardsComponent } from '@/app/dashboards/_internal/AppDashboardsOverview';
import {
  UdpDashboardCard,
  type DashboardPublicStatus,
} from 'udp-ui/components';
import { useSuperset } from '@/app/_lib/superset/superset';
import { mkDashboardHref, toDateString } from '@/app/_lib/superset/util';
import Link from 'next/link';

export const AppDashboardCardOverviewTestIds = {
  self: 'dashboard-card-overview',
};

/**
 * Card overview for Superset Dashboards.
 *
 * @param supersetUri      Superset base URI
 * @param dashboards       list of the Dashboards to show
 * @param onFavoriteChange callback function invoked on any change of a Dashboard's favorite status
 * @constructor
 */
const AppDashboardsCardOverview = ({
  supersetUri,
  dashboards,
  onFavoriteChange,
}: DashboardsComponent) => {
  const dynamicLayoutClassName = `grid auto-rows-[auto] grid-cols-[repeat(auto-fill,_minmax(288px,_1fr))] gap-4`;
  return (
    <div
      className={dynamicLayoutClassName}
      data-testid={AppDashboardCardOverviewTestIds.self}
    >
      {dashboards.map((dashboard) => (
        <InternalDashboardCard
          key={dashboard.id}
          supersetUri={supersetUri}
          dashboard={dashboard}
          onFavoriteChange={() => onFavoriteChange(dashboard)}
        />
      ))}
    </div>
  );
};

export default AppDashboardsCardOverview;

const statusTooltips: Readonly<Record<DashboardPublicStatus, string>> = {
  published: 'Veröffentlicht',
  intern: 'Intern',
};

const InternalDashboardCard = ({
  supersetUri,
  dashboard,
  onFavoriteChange,
}: {
  supersetUri: string;
  dashboard: Dashboard;
  onFavoriteChange: () => void;
}) => {
  const { getThumbnailSrc } = useSuperset(supersetUri);
  const { src, isError, isLoading } = getThumbnailSrc(dashboard.thumbnail_url);

  const publicStatus: DashboardPublicStatus | undefined = (() => {
    if (dashboard.published === null) return undefined;
    else if (dashboard.published) return 'published';
    else return 'intern';
  })();

  return (
    <UdpDashboardCard
      as={Link}
      href={mkDashboardHref(dashboard)}
      src={src}
      isLoading={isLoading || isError}
      title={dashboard.dashboard_title ?? undefined}
      subtitle={`${dashboard.vizGroup} (${dashboard.tenant})`}
      info={`Zuletzt bearbeitet: ${toDateString(dashboard.changed_on_utc)}`}
      fallbackTitle={'Unbenanntes Dashboard'}
      tags={dashboard.tags.map((tag) => tag.name)}
      isFavorite={dashboard.favorite}
      publicStatus={publicStatus}
      publicStatusTooltips={statusTooltips}
      onFavoriteChange={onFavoriteChange}
    />
  );
};
