'use client';

import { NoSearchResultIcon, UdpFallback, UdpIcon } from 'udp-ui/components';
import { useSearchParams } from 'next/navigation';
import { SEARCH_PARAMS } from '@/app/citytools/_internal/searchparams';
import { filterCityTools } from '@/app/_lib/citytools';
import { StaticApps } from '@/app/_lib/resource-api/staticapps';
import { head, isUndefined } from 'lodash';
import StaticAppCard from '@/app/citytools/_internal/staticapps/StaticAppCard';
import {
  PublicSharedApp,
  SharedApp,
} from '@/app/_lib/resource-api/sharedapps/internal';
import SharedAppCard from '@/app/citytools/_internal/sharedapps/SharedAppCard';
import { CityTool, cmpDisplayName } from '@/app/_lib/citytools/internal';
import PublicSharedAppCard from '@/app/citytools/_internal/sharedapps/PublicSharedAppCard';
import { CITYTOOL_CATEGORY_BY_LABEL } from '@/app/citytools/_internal/categories';
import { DedicatedApps } from '@/app/_lib/resource-api/dedicatedapps';
import DedicatedAppCard from '@/app/citytools/_internal/dedicatedapps/DedicatedAppCard';

interface CityToolCardsProps {
  isCitytoolAdmin: boolean;
  isSharedAppAdmin: boolean;
  isDedicatedAppAdmin: boolean;
  staticApps: StaticApps;
  staticAppBaseUrl: string;
  sharedApps: SharedApp[];
  tenant: string;
  publicSharedApps: PublicSharedApp[];
  dedicatedApps: DedicatedApps;
}

const ToolCards = ({
  isCitytoolAdmin,
  isSharedAppAdmin,
  isDedicatedAppAdmin,
  staticApps,
  staticAppBaseUrl,
  sharedApps,
  tenant,
  publicSharedApps,
  dedicatedApps,
}: CityToolCardsProps) => {
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? undefined;
  const status = searchParams.get(SEARCH_PARAMS.status)?.split(',');
  const categories = searchParams
    .get(SEARCH_PARAMS.categories)
    ?.split(',')
    .map((c) => CITYTOOL_CATEGORY_BY_LABEL[c]);
  const myCity = searchParams.get(SEARCH_PARAMS.myCity) === 'true';
  const installed = (() => {
    if (isUndefined(status) || status.length > 1) return 'all';
    else if (head(status) == 'installed') return 'installed';
    else return 'not-installed';
  })();
  const count =
    staticApps.all.size +
    sharedApps.length +
    publicSharedApps.length +
    dedicatedApps.all.size;
  const filtered = filterCityTools(
    staticApps,
    sharedApps,
    publicSharedApps,
    dedicatedApps,
    {
      searchText,
      installed,
      categories,
      myCity,
      tenant,
    },
  ).sort(cmpDisplayName);

  const Fallback = (() => {
    if (count === 0) return <NoCityToolsFallback />;
    else if (filtered.length === 0) return <NoSearchResultFallback />;
    else return undefined;
  })();

  return (
    <div className='flex flex-col flex-grow justify-center'>
      {Fallback ?? (
        <div className='size-full'>
          <div className='grid auto-rows-[auto] grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(450px,_1fr))] gap-4 whitespace-normal'>
            {filtered.map((ft) => (
              <ToolCard
                key={getKey(ft)}
                tenant={tenant}
                tool={ft}
                staticAppBaseUrl={staticAppBaseUrl}
                isCitytoolAdmin={isCitytoolAdmin}
                isSharedAppAdmin={isSharedAppAdmin}
                isDedicatedAppAdmin={isDedicatedAppAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCards;

export const CityToolCardsTestIds = {
  noCityTools: 'citytool-cards-no-citytools',
  noSearchResult: 'citytool-cards-no-search-result',
  overview: 'citytool-cards-overview',
};

const NoCityToolsFallback = () => (
  <UdpFallback
    data-testid={CityToolCardsTestIds.noCityTools}
    icon={NoSearchResultIcon as UdpIcon}
    title={'Noch keine City Tools vorhanden.'}
    description={'Sie können hier ein neues City Tool erstellen.'}
  />
);

const NoSearchResultFallback = () => (
  <UdpFallback
    data-testid={CityToolCardsTestIds.noSearchResult}
    icon={NoSearchResultIcon as UdpIcon}
    title={'Keine Suchergebnisse gefunden.'}
    description={
      'Versuchen Sie einen anderen Suchbegriff oder\nerstellen Sie ein neues City Tool.'
    }
  />
);

const ToolCard = ({
  tool,
  tenant,
  staticAppBaseUrl,
  isCitytoolAdmin,
  isSharedAppAdmin,
  isDedicatedAppAdmin,
}: {
  tool: CityTool;
  tenant: string;
  staticAppBaseUrl: string;
  isCitytoolAdmin?: boolean;
  isSharedAppAdmin?: boolean;
  isDedicatedAppAdmin?: boolean;
}) => {
  switch (tool._tag) {
    case 'StaticApp':
      return (
        <StaticAppCard
          staticAppBaseUrl={staticAppBaseUrl}
          staticApp={tool}
          tenant={tenant}
          isCitytoolAdmin={isCitytoolAdmin}
          hideInstallButton={!isCitytoolAdmin}
          hideDeleteButton={!isCitytoolAdmin}
          hideUploadButton={!isCitytoolAdmin}
        />
      );
    case 'SharedApp':
      return (
        <SharedAppCard
          tenant={tenant}
          sharedApp={tool}
          hideAdminElems={!isSharedAppAdmin}
        />
      );
    case 'PublicSharedApp':
      return (
        <PublicSharedAppCard currentTenant={tenant} publicSharedApp={tool} />
      );
    case 'DedicatedApp':
      return (
        <DedicatedAppCard
          dedicatedApp={tool}
          tenant={tenant}
          hideAdminElems={!isDedicatedAppAdmin}
        />
      );
  }
};

const getKey: (tool: CityTool) => string = (tool) => {
  switch (tool._tag) {
    case 'StaticApp':
    case 'SharedApp':
    case 'DedicatedApp':
      return `${tool.name}_${tool._tag}`;
    case 'PublicSharedApp':
      return `${tool.name}-${tool.tenant}_${tool._tag}`;
  }
};
