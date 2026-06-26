import { mkMetadata } from '@/app/meta';
import DashboardList from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/dashboards/DashboardList';

export const generateMetadata = mkMetadata({ pageName: 'Dashboards' });

const DashboardPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; vizgroup: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const vizGroup = _params.vizgroup;

  return (
    <div className='h-full flex flex-col'>
      <DashboardList tenant={tenant} vizGroup={vizGroup} />
    </div>
  );
};

export default DashboardPage;
