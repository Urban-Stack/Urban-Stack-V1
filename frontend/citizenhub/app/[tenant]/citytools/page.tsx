import { queryPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { toStaticApps } from '@/app/_lib/citytools';
import { getPublicEnv } from '@/app/_lib/env';
import CityToolsContent from '@/app/[tenant]/citytools/CityToolsContent';
import { SEARCH_PARAMS } from '@/app/[tenant]/dashboards/_internal/common';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({ pageName: 'City Tools' });

const CityToolsPage = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const { tenant } = await params;
  const staticAppBaseUrl = getPublicEnv('CITYTOOLS_URI');
  const result = await queryPublicStaticApps(tenant);
  const staticApps = toStaticApps(result, tenant);

  return (
    <main className='h-full flex flex-col gap-y-4'>
      <div className='w-full'>
        <h1 className='text-3xl font-bold text-gray-900'>City Tools</h1>
      </div>
      <AppSearchBar
        placeholder='City Tools durchsuchen'
        paramKey={SEARCH_PARAMS.search}
      />
      <CityToolsContent
        staticAppBaseUrl={staticAppBaseUrl}
        staticApps={staticApps}
      />
    </main>
  );
};

export default CityToolsPage;
