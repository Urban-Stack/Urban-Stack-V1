import Link from 'next/link';
import { IcAngleLeft } from 'udp-ui/components';
import { getPublicEnv } from '@/app/_lib/env';
import { mkMetadata } from '@/app/meta';
import AppDashboardContainer from '@/app/dashboards/[slug]/AppDashboardContainer';
import DeleteDashboardButton from '@/app/dashboards/[slug]/DeleteDashboardButton';
import { slugDetails } from '@/app/_lib/superset/util';
import { twMerge } from 'tailwind-merge';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import {
  hasScopeForVizGroup,
  vizGroupPermissionMap,
} from '@/app/_lib/resource-api/permission/scope';
import { notFound } from 'next/navigation';

export const generateMetadata = mkMetadata({
  pageName: ({ slug }) => `Dashboard ${slug}`,
});

/**
 * Page for showing a specific Superset Dashboard.
 *
 * @param params       route parameters for this page
 * @param searchParams search parameters for this page
 * @constructor
 */
const DashboardPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}) => {
  const slug = (await params).slug;
  const editMode = (await searchParams).edit === 'true';
  const dashboardId = slugDetails(slug);
  const scopes = await GetAllTenantAndProjectScopes();
  const scopeMap = vizGroupPermissionMap(scopes);

  const canSeeDashboard = hasScopeForVizGroup(
    scopeMap,
    'dashboard:view',
    dashboardId?.vizGroup ?? '',
    dashboardId?.tenant ?? '',
  );

  if (!canSeeDashboard) {
    notFound();
  }

  const canDeleteDashboard = hasScopeForVizGroup(
    scopeMap,
    'viz-group:admin',
    dashboardId?.vizGroup ?? '',
    dashboardId?.tenant ?? '',
  );

  return (
    <main className={'h-full flex flex-col gap-y-3'}>
      <div className={'flex justify-between'}>
        <BackNavigation />
        {canDeleteDashboard && dashboardId && (
          <DeleteDashboardButton dashboard={dashboardId} />
        )}
      </div>
      <AppDashboardContainer
        supersetBaseUrl={getPublicEnv('SUPERSET_URI')}
        slug={slug}
        editMode={editMode}
      />
    </main>
  );
};

export default DashboardPage;

const BackNavigation = () => (
  <Link
    href={'/dashboards'}
    className={twMerge(
      'flex gap-2 p-1 pl-0 items-center text-gray-600 hover:underline',
      'focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300',
    )}
  >
    <IcAngleLeft className={'size-4'} />
    <span className={'text-sm'}>Zurück zur Übersicht</span>
  </Link>
);
