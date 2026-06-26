import { IcAngleLeft } from 'udp-ui/components';
import Link from 'next/link';
import { capitalize } from 'udp-ui/string';
import { fetchTenantDisplayName } from '@/app/_lib/resource-api/graphql/tenant';
import { ReactNode } from 'react';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';
import { mkUserGroupHref } from '@/app/settings/usergroups/_internal/util';
import { queryUserGroupScopes } from '@/app/_lib/resource-api/graphql/usergroups';
import { groupScopeSet } from '@/app/_lib/resource-api/permission/scope';
import { notFound } from 'next/navigation';

const UserGroupLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string; groupname: string }>;
}) => {
  const { groupname, tenant } = await params;

  const scopes = await queryUserGroupScopes(tenant, groupname);
  if (scopes.error || !groupScopeSet(scopes).has('group:admin')) {
    return notFound();
  }

  const tenantDisplay =
    (await fetchTenantDisplayName(tenant)) ?? capitalize(tenant);

  const pathPrefix = mkUserGroupHref(tenant, groupname);
  const tabsData = {
    'Freigabe Benutzergruppen': `${pathPrefix}/shared-user-groups`,
    Teilen: `${pathPrefix}/public`,
    'Danger Zone': `${pathPrefix}/danger-zone`,
  };

  return (
    <div className='h-full flex flex-col'>
      <Link
        href={'/settings/usergroups'}
        className='flex gap-2 items-center text-gray-600 hover:underline mb-4'
      >
        <IcAngleLeft className='size-4' />
        <span className='text-sm'>Zurück zur Übersicht</span>
      </Link>
      <h2 className='text-2xl mb-4'>
        <span className='font-bold'>{capitalize(groupname)}</span> -{' '}
        <span className='font-light'>{tenantDisplay}</span>
      </h2>
      <SettingsTabs tabsData={tabsData} />
      <div className='h-full py-7'>{children}</div>
    </div>
  );
};

export default UserGroupLayout;
