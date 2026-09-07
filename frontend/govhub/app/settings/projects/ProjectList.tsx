import React from 'react';
import { toProjects } from '../../_lib/resource-api/project';
import ProjectListTable from '@/app/settings/projects/_internal/ProjectListTable';
import { fetchAllProjects } from '@/app/_lib/resource-api/graphql/project';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';

interface ProjectListProps {
  canCreateProject: boolean;
}

const ProjectList = async ({ canCreateProject }: ProjectListProps) => {
  const result = await fetchAllProjects();
  const { projects, adminMap } = toProjects(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Projekte konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => projects.length < 1,
      title: 'Noch keine Projekte vorhanden',
      description: canCreateProject
        ? 'Sie können hier ein neues Projekt erstellen.'
        : 'Projekte, auf die Sie Zugriff haben, werden hier angezeigt.',
    },
  ];
  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <ProjectListTable projects={projects} adminMap={adminMap} />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default ProjectList;
