import { mkMetadata } from '@/app/meta';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import { queryPublishedQueries } from '@/app/_lib/resource-api/graphql/vizGroups';
import { toPublishedQueries } from '@/app/_lib/resource-api/viz-groups/publishedQueries';
import { IcPlus, UdpButton } from 'udp-ui/components';
import QueryTable from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/QueryTable';
import Link from 'next/link';
import { mkHref } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/geojson/_internal/util';
import { getPublicEnv } from '@/app/_lib/env';

export const generateMetadata = mkMetadata({
  pageName: 'GeoJSON',
});

const GeoJsonPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; vizgroup: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const vizGroup = _params.vizgroup;

  const queryResult = await queryPublishedQueries(tenant, vizGroup);
  const queries = toPublishedQueries(queryResult);

  const pubqueryUri = getPublicEnv('PUBQUERY_URI');

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!queryResult.error,
      title: 'Erstellte Queries konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => queries.length < 1,
      title: 'Noch keine erstellten Queries vorhanden',
      description: 'Sie können auf dieser Seite neue Queries erstellen.',
    },
  ];

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <UdpButton icon={IcPlus} linkAs={Link} href={mkHref(tenant, vizGroup)}>
          Neue Query erstellen
        </UdpButton>
      </div>
      <div className={'flex flex-col flex-grow justify-center'}>
        <SettingsFallbackWrapper fallbacks={fallbacks}>
          <div className='size-full'>
            <QueryTable
              tenant={tenant}
              vizGroup={vizGroup}
              queries={queries}
              pubqueryUri={pubqueryUri}
            />
          </div>
        </SettingsFallbackWrapper>
      </div>
    </div>
  );
};

export default GeoJsonPage;
