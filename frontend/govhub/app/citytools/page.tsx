import { mkMetadata } from '@/app/meta';
import { queryStaticApps } from '@/app/_lib/resource-api/graphql/staticapps';
import { toStaticApps } from '@/app/_lib/resource-api/staticapps';
import { getPublicEnv } from '@/app/_lib/env';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import { SEARCH_PARAMS } from '@/app/citytools/_internal/searchparams';
import Filter from '@/app/citytools/_internal/Filter';
import ToolCards from '@/app/citytools/_internal/ToolCards';
import Link from 'next/link';
import { IcPlus, UdpButton } from 'udp-ui/components';
import { mkHref } from '@/app/citytools/shared-app/util';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import {
  queryGetPublicSharedApps,
  queryGetSharedAppsByTenant,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import {
  toPublicSharedApps,
  toSharedApps,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { queryTenantScopes } from '@/app/_lib/resource-api/graphql/tenant';
import {
  isCityToolAdmin,
  isDedicatedAppAdmin,
  isSharedAppAdmin,
} from '@/app/_lib/resource-api/permission/scope';
import { queryDedicatedApps } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import { toDedicatedApps } from '@/app/_lib/resource-api/dedicatedapps';

export const generateMetadata = mkMetadata({ pageName: 'City Tools' });

const CityToolsPage = async () => {
  const tenant = await requireTenant();
  const staticAppsUrl = getPublicEnv('CITYTOOLS_URI');

  const staticApps = await queryStaticApps().then(toStaticApps);
  const sharedApps =
    await queryGetSharedAppsByTenant(tenant).then(toSharedApps);
  const publicSharedApps =
    await queryGetPublicSharedApps().then(toPublicSharedApps);
  const dedicatedApps = await queryDedicatedApps().then(
    toDedicatedApps(tenant),
  );

  const scopes = await queryTenantScopes(tenant);
  const isSAAdmin = isSharedAppAdmin(scopes);
  const isCTAdmin = isCityToolAdmin(scopes);
  const isDAAdmin = isDedicatedAppAdmin(scopes);

  return (
    <div className='flex flex-col gap-y-4'>
      <AppSearchBar
        placeholder='City Tools durchsuchen'
        paramKey={SEARCH_PARAMS.search}
      />
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
        <Filter isSAAdmin={isSAAdmin} className='shrink' />
        {isSAAdmin && (
          <UdpButton linkAs={Link} href={mkHref(tenant)} icon={IcPlus}>
            Neues City Tool erstellen
          </UdpButton>
        )}
      </div>
      <ToolCards
        tenant={tenant}
        isCitytoolAdmin={isCTAdmin}
        isSharedAppAdmin={isSAAdmin}
        isDedicatedAppAdmin={isDAAdmin}
        staticAppBaseUrl={staticAppsUrl}
        staticApps={staticApps}
        sharedApps={sharedApps}
        publicSharedApps={publicSharedApps}
        dedicatedApps={dedicatedApps}
      />
    </div>
  );
};

export default CityToolsPage;
