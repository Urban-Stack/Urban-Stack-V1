import { NoSearchResultIcon, UdpFallback, UdpIcon } from 'udp-ui/components';
import { toProjects } from '@/app/_lib/resource-api/project';
import { fetchAllProjects } from '@/app/_lib/resource-api/graphql/project';
import { SEARCH_PARAMS } from '@/app/filemanager/_internal/common';
import BucketSelector from './_internal/BucketSelector';
import BucketContent from '@/app/filemanager/_internal/BucketContent';
import { GetAllTenantAndProjectScopes } from '../_lib/resource-api/graphql/tenant';
import {
  isTenantAdmin,
  projectPermissionMap,
} from '../_lib/resource-api/permission/scope';
import { requireTenant } from '../_lib/resource-api/legacy';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata({ pageName: 'Datei-Manager' });

const FileManagerPage = async ({
  searchParams,
}: {
  searchParams: Promise<Partial<typeof SEARCH_PARAMS>>;
}) => {
  const projects = toProjects(await fetchAllProjects());
  const bucket = (await searchParams).bucket;
  const scopes = await GetAllTenantAndProjectScopes();
  const tenant = await requireTenant();
  const projectPermissions = projectPermissionMap(scopes);
  const canCreateProject = isTenantAdmin(scopes, tenant);

  return (
    <main className='flex h-full flex-col items-center'>
      <div className='flex w-full justify-between mb-4'>
        <h1 className='text-3xl font-bold text-gray-900'>Datei-Manager</h1>
      </div>
      <div className='size-full flex flex-col gap-5 rounded-xl overflow-hidden bg-white p-6'>
        {projects.length > 0 ? (
          <>
            <BucketSelector projects={projects} />
            {bucket && (
              <BucketContent
                bucket={bucket}
                projectPermissions={projectPermissions}
              />
            )}
          </>
        ) : (
          <FallbackNoProjects canCreateProject={canCreateProject} />
        )}
      </div>
    </main>
  );
};

const FallbackNoProjects = ({
  canCreateProject,
}: {
  canCreateProject: boolean;
}) => (
  <div className='flex size-full items-center justify-center'>
    <UdpFallback
      icon={NoSearchResultIcon as UdpIcon}
      title='Noch keine Projekte vorhanden.'
      description={
        canCreateProject
          ? 'Sie müssen zuerst ein Projekt erstellen, um Dateien hochladen zu können.'
          : 'Wenn Sie Zugriff auf ein Projekt erhalten, können Sie hier Dateien hochladen.'
      }
      className='max-w-[30rem]'
    />
  </div>
);

export default FileManagerPage;
