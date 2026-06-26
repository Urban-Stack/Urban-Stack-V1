/* c8 ignore start */
//TODO: include in coverage

import { ReactNode } from 'react';
import { capitalize } from 'udp-ui/string';
import Link from 'next/link';
import { IcAngleLeft } from 'udp-ui/components';
import { fetchTenantDisplayName } from '@/app/_lib/resource-api/graphql/tenant';
import VizGroupTabs from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/VizGroupTabs';

const VizGroupLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string; vizgroup: string }>;
}) => {
  const vizGroup = (await params).vizgroup;
  const tenant = (await params).tenant;
  const tenantDisplay =
    (await fetchTenantDisplayName(tenant)) ?? capitalize(tenant);

  return (
    <div className='h-full flex flex-col'>
      <Link
        href={'/settings/dashboardgroups'}
        className='flex gap-2 items-center text-gray-600 hover:underline mb-4'
      >
        <IcAngleLeft className={'size-4'} />
        <span className={'text-sm'}>Zurück zur Übersicht</span>
      </Link>
      <h2 className='text-2xl mb-4'>
        <span className='font-bold'>{capitalize(vizGroup)}</span> -{' '}
        <span className='font-light'>{tenantDisplay}</span>
      </h2>
      <VizGroupTabs />
      <div className='h-full py-7'>{children}</div>
    </div>
  );
};

export default VizGroupLayout;
