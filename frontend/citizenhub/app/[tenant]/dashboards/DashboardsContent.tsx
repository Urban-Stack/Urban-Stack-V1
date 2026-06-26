'use client';

import {
  NoSearchResultIcon,
  UdpDashboardCard,
  UdpFallback,
  UdpIcon,
} from 'udp-ui/components';
import Link from 'next/link';
import { DashboardCardsTestIds } from '@/app/[tenant]/dashboards/testids';
import { useSearchParams } from 'next/navigation';
import { Dashboard } from '@/app/_lib/superset';
import { twMerge } from 'tailwind-merge';
import { SEARCH_PARAMS } from '@/app/[tenant]/dashboards/_internal/common';
import { filterDashboards } from '@/app/[tenant]/dashboards/_internal/util';

const DashboardsContent = ({
  tenant,
  allDashboards,
}: {
  tenant: string;
  allDashboards: Dashboard[];
}) => {
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? undefined;

  const dashboards = filterDashboards(allDashboards, {
    searchText,
  });

  const Fallback =
    dashboards.length === 0 ? <NoDashboardsFallback /> : undefined;

  return (
    <div
      className={twMerge('flex flex-col grow', Fallback && 'justify-center')}
    >
      {Fallback ?? (
        <div
          data-testid={DashboardCardsTestIds.results}
          className='grid auto-rows-[auto] grid-cols-[repeat(auto-fill,_minmax(288px,_1fr))] gap-4'
        >
          {dashboards.map((d) => (
            <UdpDashboardCard
              key={d.id}
              as={Link}
              src={d.thumbnailUrl}
              href={`/${tenant}/dashboards/${d.slug}`}
              title={d.title}
              fallbackTitle={'Unbenanntes Dashboard'}
              tags={d.tags.map((tag) => tag.name)}
              hideFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardsContent;

const NoDashboardsFallback = () => (
  <UdpFallback
    data-testid={DashboardCardsTestIds.noDashboards}
    icon={NoSearchResultIcon as UdpIcon}
    title={'Noch keine Dashboards veröffentlicht.'}
    description={'Schau in Kürze wieder vorbei. Wir arbeiten daran!'}
  />
);
