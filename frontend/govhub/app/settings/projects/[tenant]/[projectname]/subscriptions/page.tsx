import { mkMetadata } from '@/app/meta';
import SubscriptionList from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/SubscriptionList';
import Link from 'next/link';
import { IcPlus, UdpButton } from 'udp-ui/components';
import { mkHref } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/util';

export const generateMetadata = mkMetadata({ pageName: 'Subscriptions' });

const SubscriptionPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const _params = await params;
  const tenant = _params.tenant;
  const project = _params.projectname;

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-6'>
        <UdpButton linkAs={Link} href={mkHref(tenant, project)} icon={IcPlus}>
          Neue Subscription
        </UdpButton>
      </div>
      <SubscriptionList tenant={tenant} project={project} />
    </div>
  );
};

export default SubscriptionPage;
