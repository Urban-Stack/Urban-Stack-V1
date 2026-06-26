'use client';

import React from 'react';
import SettingsTable from '@/app/settings/_common/SettingsTable';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';
import { redirect, useSearchParams } from 'next/navigation';
import { ProjectsTestIds } from '@/app/settings/projects/testIds';
import { mkProjectHref, Project } from '@/app/_lib/resource-api/project';
import {
  hasScopeForProject,
  type Scope,
} from '@/app/_lib/resource-api/permission/scope';
import { twMerge } from 'tailwind-merge';
import { UdpBadge } from 'udp-ui/components';
import { SEARCH_PARAMS } from '@/app/settings/projects/common';

interface ProjectListTableProps {
  projects: Project[];
  projectPermissions?: Map<string, Scope[]>;
}

const filterProjects = (projects: Project[], searchTextRaw: string) => {
  const searchText = searchTextRaw.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchText) ||
      project.tenant.toLowerCase().includes(searchText),
  );
};

const ProjectListTable: React.FC<ProjectListTableProps> = ({
  projects,
  projectPermissions = new Map<string, Scope[]>(),
}) => {
  const isProjectAdmin = (projectName: string) =>
    hasScopeForProject(projectPermissions, 'project:admin', projectName);
  const searchParams = useSearchParams();
  const searchText = searchParams.get(SEARCH_PARAMS.search) ?? '';
  const filteredProjects = filterProjects(projects, searchText);

  return (
    <SettingsTable data-testid={ProjectsTestIds.table}>
      <TableHead>
        <TableRow>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Mandant</TableHeadCell>
          <TableHeadCell>Berechtigung</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className={'divide-y text-gray-900'}>
        {filteredProjects.map((project) => (
          <ProjectListItem
            key={`${project.tenant}_${project.name}`}
            project={project}
            disabled={!isProjectAdmin(project.name)}
            isProjectAdmin={isProjectAdmin(project.name)}
          />
        ))}
      </TableBody>
    </SettingsTable>
  );
};

interface ProjectListItemProps {
  project: Project;
  disabled: boolean;
  isProjectAdmin: boolean;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  isProjectAdmin = false,
  disabled = false,
}) => {
  const redirectOnEnter = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      redirect(mkProjectHref(project.tenant, project.name));
    }
  };

  return (
    <TableRow
      data-testid={ProjectsTestIds.tableItem}
      className={twMerge(
        disabled ? 'cursor-auto' : 'cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary-300',
      )}
      tabIndex={disabled ? -1 : 0}
      onClick={
        disabled
          ? undefined
          : () => redirect(mkProjectHref(project.tenant, project.name))
      }
      onKeyDown={redirectOnEnter}
    >
      <TableCell>{project.name}</TableCell>
      <TableCell>{project.tenant}</TableCell>
      <TableCell>
        <UdpBadge className='w-fit'>
          {isProjectAdmin ? 'Mitarbeiter' : 'Betrachter'}
        </UdpBadge>
      </TableCell>
    </TableRow>
  );
};

export default ProjectListTable;
