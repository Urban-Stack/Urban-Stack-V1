import { UdpEmbeddedDashboard } from 'udp-ui/components';
import { getPublicEnv } from '@/app/_lib/env';
import BackNavigation from '@/app/[tenant]/dashboards/[slug]/BackNavigation';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({
  pageName: ({ slug }) => `Dashboard ${slug}`,
});

const DashboardPage = async ({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) => {
  const supersetBaseUrl = getPublicEnv('SUPERSET_URI');
  const { slug, tenant } = await params;

  return (
    <main className='h-full flex flex-col gap-y-3'>
      <BackNavigation href={`/${tenant}/dashboards`} />
      <div className='h-full flex flex-col gap-y-4'>
        <UdpEmbeddedDashboard
          supersetBaseUrl={supersetBaseUrl}
          slug={slug}
          className='h-full'
        />
      </div>
    </main>
  );
};

export default DashboardPage;
