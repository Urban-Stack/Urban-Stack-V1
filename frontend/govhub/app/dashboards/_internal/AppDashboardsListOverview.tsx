import React from 'react';
import { Dashboard } from '@/app/_lib/superset/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { mkDashboardHref, toDateString } from '@/app/_lib/superset/util';
import { DashboardsComponent } from '@/app/dashboards/_internal/AppDashboardsOverview';
import Link from 'next/link';
import {
  IcStar,
  UdpBadgeGroup,
  UdpScrollWrapper,
  UdpToggleIconButton,
} from 'udp-ui/components';
import { useRouter } from 'next/navigation';

export const AppDashboardListOverviewTestIds = {
  self: 'dashboard-list-overview',
  item: 'dashboard-list-item',
  favButton: 'dashboard-list-favorite',
  name: 'dashboard-list-item-name',
};

/**
 * List overview for Superset Dashboards.
 *
 * @param dashboards       list of the Dashboards to show
 * @param onFavoriteChange callback function invoked on any change of a Dashboard's favorite status
 * @constructor
 */
const AppDashboardsListOverview = ({
  dashboards,
  onFavoriteChange,
}: DashboardsComponent) => (
  <UdpScrollWrapper>
    <Table
      hoverable
      className={'whitespace-nowrap bg-white'}
      data-testid={AppDashboardListOverviewTestIds.self}
    >
      <TableHead>
        <TableRow>
          <TableHeadCell className={'w-0 p-0 pr-1'}>
            <span className={'sr-only'}>Favorit</span>
          </TableHeadCell>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Zuletzt bearbeitet</TableHeadCell>
          <TableHeadCell>Gruppe</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Tags</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className={'divide-y text-gray-900'}>
        {dashboards.map((dashboard) => (
          <DashboardListItem
            key={dashboard.id}
            dashboard={dashboard}
            onFavoriteChange={() => onFavoriteChange(dashboard)}
          />
        ))}
      </TableBody>
    </Table>
  </UdpScrollWrapper>
);

export default AppDashboardsListOverview;

const DashboardListItem = ({
  dashboard,
  onFavoriteChange,
}: {
  dashboard: Dashboard;
  onFavoriteChange: () => void;
}) => {
  const router = useRouter();
  const { dashboard_title: title } = { ...dashboard };

  const navigateViaEnterTo = (e: React.KeyboardEvent, href: string) => {
    if (e.key === 'Enter') {
      router.push(href);
    }
  };
  const publicStatus: (
    published: Dashboard['published'],
  ) => string | undefined = () => {
    if (dashboard.published === null) return undefined;
    else if (dashboard.published) return 'Veröffentlicht';
    else return 'Intern';
  };

  return (
    <TableRow
      data-testid={AppDashboardListOverviewTestIds.item}
      tabIndex={0}
      onKeyDown={(e) => navigateViaEnterTo(e, mkDashboardHref(dashboard))}
      className='focus:outline-hidden focus:ring-2 focus:ring-primary-300'
    >
      <TableCell className={'p-0 justify-center'}>
        <UdpToggleIconButton
          outlineIcon={IcStar}
          active={dashboard.favorite}
          className={'w-6 px-0.5 pt-1 pb-1 ml-4 bg-transparent'}
          onChange={onFavoriteChange}
          data-testid={AppDashboardListOverviewTestIds.favButton}
        />
      </TableCell>
      <Link href={mkDashboardHref(dashboard)} className={'contents'}>
        <TableCell
          theme={{
            base: 'group-last/body:group-last/row:first:rounded-bl-none',
          }}
          className={title ? 'text-gray-900' : 'text-gray-500'}
          data-testid={AppDashboardListOverviewTestIds.name}
        >
          {title ?? 'Unbenanntes Dashboard'}
        </TableCell>
        <TableCell className={'text-gray-500'}>
          {toDateString(dashboard.changed_on_utc)}
        </TableCell>
        <TableCell>{dashboard.vizGroup}</TableCell>
        <TableCell>{publicStatus(dashboard.published)}</TableCell>
        <TableCell>
          <UdpBadgeGroup labels={dashboard.tags.map((tag) => tag.name)} />
        </TableCell>
      </Link>
    </TableRow>
  );
};
