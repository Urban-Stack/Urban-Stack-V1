/* c8 ignore start */

import { auth } from '@/auth';
import { assertDefined } from 'udp-ui/assertion';
import {
  BundesministeriumSponsorLogo,
  SmartCityDialogLogo,
} from 'udp-ui/components';
import AppNewsArticles from '@/app/_homepage/AppNewsArticles';
import TenantImage from '@/app/_homepage/AppTenantImage';
import AppWelcomeButtonGroup from '@/app/_homepage/AppWelcomeButtonGroup';
import AppCommunityPostGroup from '@/app/_homepage/AppCommunityPostGroup';
import { getPublicEnv } from '@/app/_lib/env';
import DashboardOverview from '@/app/_homepage/DashboardOverview';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import CityToolsOverview from '@/app/_homepage/CityToolsOverview';
import { queryTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { mkMetadata } from '@/app/meta';
import { fetchInstalledStaticAndDedicated } from '@/app/_lib/citytools/server';

export const generateMetadata = mkMetadata();

const HomePage = async () => {
  const session = await auth();
  const username = session?.user.name;
  assertDefined(
    username,
    'User of Session data is not defined but is required.',
  );

  const tenant = await requireTenant();
  const tenantSettings = await queryTenantSettings(tenant);
  const newsUrl = tenantSettings.data?.tenant?.newsUrl;

  return (
    <main className='flex flex-col xl:flex-row min-h-vhp pb-2 gap-x-6'>
      {/*Left column*/}
      <div className='flex flex-col flex-grow gap-6'>
        <div className='flex flex-row gap-6'>
          <AppWelcomeButtonGroup
            username={username}
            className='min-h-64 w-full'
          />
          <TenantImage className='hidden lg:flex xl:hidden w-1/3' />
        </div>

        <div className='flex flex-col lg:flex-row items-stretch gap-y-4 gap-x-6 justify-between'>
          <DashboardOverview supersetUri={getPublicEnv('SUPERSET_URI')} />
          <CityToolsOverview
            staticAppBaseUrl={getPublicEnv('CITYTOOLS_URI')}
            tenant={tenant}
            installedApps={await fetchInstalledStaticAndDedicated()}
          />
        </div>

        {newsUrl && <AppNewsArticles newsUrl={newsUrl} />}
      </div>

      {/*Right column*/}
      <div className='flex flex-col shrink-0 xl:w-1/3 gap-6 mt-6 xl:mt-0'>
        <TenantImage className='hidden xl:flex' />
        <AppCommunityPostGroup
          discourseBaseUrl={getPublicEnv('DISCOURSE_URI')}
        />
        <div className='flex flex-row shrink-0 min-h-64 bg-white rounded-2xl shadow-sm justify-center'>
          <BundesministeriumSponsorLogo className='xl:h-full w-3/5' />
          <SmartCityDialogLogo className='xl:h-full my-auto w-2/5 pr-6' />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
