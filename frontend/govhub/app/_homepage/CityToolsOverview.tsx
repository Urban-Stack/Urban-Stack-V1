import { IcGrid, UdpInfoCard } from 'udp-ui/components';
import React from 'react';
import Link from 'next/link';
import { CityTool, getDisplayName, getHref } from '@/app/_lib/citytools';
import { unsafeGetDefined } from 'udp-ui/assertion';

interface CityToolsOverviewProps {
  staticAppBaseUrl: string;
  tenant: string;
  installedApps: CityTool[];
}

const CityToolsOverview = ({
  staticAppBaseUrl,
  tenant,
  installedApps,
}: CityToolsOverviewProps) => (
  <UdpInfoCard
    className='w-full'
    icon={IcGrid}
    title={`Installierte City Tools`}
    description={`Hier finden Sie eine Übersicht\nder installierten City Tools.`}
    items={installedApps.slice(0, 3).map((ct) => ({
      icon: IcGrid,
      text: getDisplayName(ct),
      href: unsafeGetDefined(getHref(staticAppBaseUrl, tenant)(ct)),
    }))}
    linkText='Installierte City Tools ansehen'
    linkHref={'/citytools?status=installed'}
    as={Link}
  />
);

export default CityToolsOverview;
