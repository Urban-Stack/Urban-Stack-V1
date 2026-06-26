import { CityTool, filterCityTools } from '@/app/_lib/citytools/internal';
import {
  queryGetPublicSharedApps,
  queryGetSharedAppsByTenant,
} from '@/app/_lib/resource-api/graphql/sharedApps';
import {
  toPublicSharedApps,
  toSharedApps,
} from '@/app/_lib/resource-api/sharedapps/internal';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { queryStaticApps } from '@/app/_lib/resource-api/graphql/staticapps';
import { isStaticApp, toStaticApps } from '@/app/_lib/resource-api/staticapps';
import { queryDedicatedApps } from '@/app/_lib/resource-api/graphql/dedicatedApps';
import {
  isDedicatedApp,
  toDedicatedApps,
} from '@/app/_lib/resource-api/dedicatedapps';
import { any } from 'udp-ui/fp';

export const fetchInstalledStaticAndDedicated: () => Promise<
  CityTool[]
> = async () => {
  const tenant = await requireTenant();
  const staticApps = await queryStaticApps().then(toStaticApps);
  const dedicatedApps = await queryDedicatedApps().then(
    toDedicatedApps(tenant),
  );

  return filterCityTools(staticApps, [], [], dedicatedApps, {
    installed: 'installed',
  }).filter(any(isStaticApp, isDedicatedApp));
};

export const fetchInstalled: (tenant: string) => Promise<CityTool[]> = async (
  tenant,
) => {
  const installedApps = await fetchInstalledStaticAndDedicated();
  const sharedApps =
    await queryGetSharedAppsByTenant(tenant).then(toSharedApps);
  const publicSharedApps = await queryGetPublicSharedApps()
    .then(toPublicSharedApps)
    .then((psas) =>
      psas.filter((psa) => !sharedApps.some((sa) => sa.name === psa.name)),
    );

  return [...installedApps, ...sharedApps, ...publicSharedApps];
};
