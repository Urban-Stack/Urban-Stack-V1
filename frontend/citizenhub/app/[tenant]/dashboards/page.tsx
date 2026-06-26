import { getDashboards } from '@/app/_lib/superset';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import DashboardsContent from '@/app/[tenant]/dashboards/DashboardsContent';
import { SEARCH_PARAMS } from '@/app/[tenant]/dashboards/_internal/common';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({ pageName: 'Dashboards' });

const DashboardsPage = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const { tenant } = await params;
  const dashboards = await getDashboards(tenant);

  return (
    <div className='h-full flex flex-col gap-y-4'>
      <div className='flex flex-col gap-4 w-full'>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboards</h1>
        <AppSearchBar
          placeholder='Dashboards durchsuchen'
          paramKey={SEARCH_PARAMS.search}
        />
      </div>
      <DashboardsContent tenant={tenant} allDashboards={dashboards} />
    </div>
  );
};

export default DashboardsPage;
