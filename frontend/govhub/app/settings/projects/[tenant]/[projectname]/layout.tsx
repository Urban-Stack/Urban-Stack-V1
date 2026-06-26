import { ReactNode } from 'react';
import ProjectTabs from '@/app/settings/projects/[tenant]/[projectname]/ProjectTabs';
import { capitalize } from 'udp-ui/string';
import Link from 'next/link';
import { IcAngleLeft } from 'udp-ui/components';
import {
  fetchTenantDisplayName,
  GetAllTenantAndProjectScopes,
} from '@/app/_lib/resource-api/graphql/tenant';
import {
  hasScopeForProject,
  projectPermissionMap,
} from '@/app/_lib/resource-api/permission/scope';
import { notFound } from 'next/navigation';

const ProjectLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string; projectname: string }>;
}) => {
  const projectname = (await params).projectname;
  const projectNameCapitalized = capitalize(projectname);
  const tenant = (await params).tenant;
  const tenantDisplay =
    (await fetchTenantDisplayName(tenant)) ?? capitalize(tenant);

  const scopes = await GetAllTenantAndProjectScopes();

  const isProjectAdmin = hasScopeForProject(
    projectPermissionMap(scopes),
    'project:admin',
    projectname,
  );

  if (!isProjectAdmin) {
    notFound();
  }

  return (
    <div className='h-full flex flex-col'>
      <Link
        href={'/settings/projects'}
        className='flex gap-2 items-center text-gray-600 hover:underline mb-4'
      >
        <IcAngleLeft className={'size-4'} />
        <span className={'text-sm'}>Zurück zur Übersicht</span>
      </Link>
      <h2 className='text-2xl mb-4'>
        <span className='font-bold'>{projectNameCapitalized}</span> -{' '}
        <span className='font-light'>{tenantDisplay}</span>
      </h2>
      <ProjectTabs />
      <div className='h-full py-7'>{children}</div>
    </div>
  );
};

export default ProjectLayout;
