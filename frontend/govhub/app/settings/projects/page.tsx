import { mkMetadata } from '@/app/meta';
import ProjectList from '@/app/settings/projects/ProjectList';
import React from 'react';
import CreateProjectButton from '@/app/settings/projects/_create/CreateProjectButton';
import AppSearchBar from '@/app/_component/searchbar/AppSearchBar';
import { SEARCH_PARAMS } from '@/app/settings/projects/common';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';

export const generateMetadata = mkMetadata({
  pageName: 'Projekte',
});

const ProjectSettingsPage = async () => {
  const tenant = await requireTenant();
  const showProjectCreateButton = await queryHasTenantScope(
    tenant,
    'project:admin',
  );

  return (
    <div className='h-full flex flex-col'>
      <div className='flex flex-wrap gap-4 mb-6'>
        <h2 className='grow-[999] self-end text-2xl font-bold text-gray-900'>
          Projekte
        </h2>
        {showProjectCreateButton && (
          <div className='grow'>
            <CreateProjectButton />
          </div>
        )}
      </div>
      <AppSearchBar
        placeholder='Projekte durchsuchen'
        paramKey={SEARCH_PARAMS.search}
        className='mb-4'
      />
      <div className='flex flex-col flex-grow justify-center'>
        <ProjectList canCreateProject={showProjectCreateButton} />
      </div>
    </div>
  );
};
export default ProjectSettingsPage;
