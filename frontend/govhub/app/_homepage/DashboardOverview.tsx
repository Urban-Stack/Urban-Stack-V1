'use client';

import { IcChartPie, IcStar, UdpInfoCard } from 'udp-ui/components';
import { useSuperset } from '@/app/_lib/superset/superset';
import {
  populateDashboards,
  sanitizeDashboards,
} from '@/app/_lib/superset/util';
import React from 'react';
import Link from 'next/link';

interface DashboardOverviewProps {
  supersetUri: string;
}

const DashboardOverview = ({ supersetUri }: DashboardOverviewProps) => {
  const { getDashboards, useFavoriteStatuses } = useSuperset(supersetUri);

  const { dashboards: dashboardsResp } = getDashboards();
  const sanitized = dashboardsResp?.result
    ? sanitizeDashboards(dashboardsResp.result)
    : [];

  const { favStatuses } = useFavoriteStatuses(sanitized.map((d) => d.id));
  const dashboards = populateDashboards(sanitized, favStatuses?.result);

  return (
    <UdpInfoCard
      className='w-full'
      icon={IcChartPie}
      title={`Favorisierte Dashboards`}
      description={`Hier finden Sie eine Übersicht\nIhrer favorisierten Dashboards.`}
      items={dashboards
        .filter((d) => d.favorite)
        .slice(0, 3)
        .map((db) => ({
          icon: (props: React.SVGProps<SVGSVGElement>) => (
            <IcStar {...props} className='fill-primary-700 size-5 mb-1' />
          ),
          text: db.dashboard_title ?? 'Unbenanntes Dashboard',
          href: `/dashboards/${db.slug}`,
        }))}
      linkText='Favorisierte Dashboards ansehen'
      linkHref={'/dashboards?favorites=true'}
      as={Link}
    />
  );
};

export default DashboardOverview;
