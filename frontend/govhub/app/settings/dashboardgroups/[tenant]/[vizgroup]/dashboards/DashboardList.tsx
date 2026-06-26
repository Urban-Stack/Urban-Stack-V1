import { query } from '@/app/_lib/resource-api/client';
import { VIZ_GROUP_DASHBOARDS } from '@/app/_lib/resource-api/graphql/vizGroups';
import { toDashboards } from '@/app/_lib/resource-api/viz-groups/dashboards';
import DashboardTable from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardTable';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';

const DashboardList = async ({
  tenant,
  vizGroup,
}: {
  tenant: string;
  vizGroup: string;
}) => {
  const result = await query({
    query: VIZ_GROUP_DASHBOARDS,
    variables: { tenant, vizGroup },
  });
  const dashboards = toDashboards(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Dashboards konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => dashboards.length < 1,
      title: 'Noch keine Dashboards vorhanden',
      description:
        'Es befinden sich noch keine Dashboards in dieser Dashboardgruppe.',
    },
  ] as const;

  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <DashboardTable dashboards={dashboards} />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default DashboardList;
