'use client';

import { twMerge } from 'tailwind-merge';
import { CityToolCardsTestIds } from '@/app/[tenant]/citytools/testids';
import {
  NoSearchResultIcon,
  UdpCityToolCard,
  UdpFallback,
  UdpIcon,
} from 'udp-ui/components';
import { StaticApp } from '@/app/_lib/citytools/internal';
import { useSearchParams } from 'next/navigation';
import { SEARCH_PARAMS } from '@/app/[tenant]/dashboards/_internal/common';
import { filterStaticApps } from '@/app/[tenant]/citytools/_internal/util';
import { CITYTOOL_CATEGORY_LABELS } from '@/app/[tenant]/citytools/_internal/categories';

const FALLBACK_IMG = '/gt/stockgt.jpg';

const CityToolsContent = ({
  staticAppBaseUrl,
  staticApps,
}: {
  staticAppBaseUrl: string;
  staticApps: StaticApp[];
}) => {
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? undefined;

  const filteredStaticApps = filterStaticApps(staticApps, { searchText });

  const Fallback =
    filteredStaticApps.length === 0 ? <NoCityToolsFallback /> : undefined;

  return (
    <div
      className={twMerge('flex flex-col grow', Fallback && 'justify-center')}
    >
      {Fallback ?? (
        <div
          data-testid={CityToolCardsTestIds.results}
          className='grid auto-rows-[auto] grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(450px,_1fr))] gap-4'
        >
          {filteredStaticApps.map((ct, i) => (
            <StaticAppCard
              key={`${i}__${ct.displayName}`}
              staticApp={ct}
              staticAppBaseUrl={staticAppBaseUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CityToolsContent;

const NoCityToolsFallback = () => (
  <UdpFallback
    data-testid={CityToolCardsTestIds.noCityTools}
    icon={NoSearchResultIcon as UdpIcon}
    title={'Noch keine City Tools veröffentlicht.'}
    description={'Schau in Kürze wieder vorbei. Wir arbeiten daran!'}
  />
);

const StaticAppCard = ({
  staticApp,
  staticAppBaseUrl,
}: {
  staticApp: StaticApp;
  staticAppBaseUrl: string;
}) => {
  const categoryLabels = staticApp.categories.map(
    (c) => CITYTOOL_CATEGORY_LABELS[c],
  );
  return (
    <UdpCityToolCard
      key={staticApp.finalPath}
      title={staticApp.displayName}
      description={staticApp.description}
      categories={categoryLabels}
      pictureUri={staticApp.pictureUri}
      fallbackImage={FALLBACK_IMG}
      href={`${staticAppBaseUrl}/${staticApp.finalPath}`}
      target='_blank'
    />
  );
};
