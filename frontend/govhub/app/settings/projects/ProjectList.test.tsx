import { render, within } from '@testing-library/react';
import ProjectList from '@/app/settings/projects/ProjectList';
import { FuncMock } from '@/app/_test/utils';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ProjectsTestIds as TestIds } from '@/app/settings/projects/testIds';
import {
  AllProjects,
  fetchAllProjects,
} from '@/app/_lib/resource-api/graphql/project';
import { Project } from '../../_lib/resource-api/project';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import { useSearchParams } from 'next/navigation';

const fetchAllProjectsMock: FuncMock<typeof fetchAllProjects> =
  fetchAllProjects as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  fetchAllProjects: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const TEST_PROJECTS: Project[] = [
  { tenant: 'test-tenant-1', name: 'test-project-1', _tag: 'Project' },
  { tenant: 'test-tenant-1', name: 'test-project-2', _tag: 'Project' },
  { tenant: 'test-tenant-2', name: 'test-project-3', _tag: 'Project' },
];

const TEST_PROJECT_PERMISSIONS: Map<string, Scope[]> = new Map([
  ['test-project-1', ['project:admin']],
  ['test-project-2', ['project:admin']],
  ['test-project-3', ['project:admin']],
  ['test-project-4', ['project:read']],
]);

const mockProjects = (projects: Project[], error?: CombinedGraphQLErrors) => {
  fetchAllProjectsMock.mockResolvedValueOnce({
    data: {
      tenants: [
        {
          projects: projects.map((p) => ({
            tenant: p.tenant,
            project: p.name,
          })),
        },
      ],
    },
    error: error,
  } as AllProjects);
};
const useSearchParamsMock = useSearchParams as jest.Mock;

beforeEach(() => {
  useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    mockProjects(TEST_PROJECTS);

    const { container } = render(
      await ProjectList({
        projectPermissions: TEST_PROJECT_PERMISSIONS,
        canCreateProject: true,
      }),
    );

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('projects overview contains as many list entries as projects retrieved', async () => {
    mockProjects(TEST_PROJECTS);

    const component = render(
      await ProjectList({
        projectPermissions: TEST_PROJECT_PERMISSIONS,
        canCreateProject: true,
      }),
    );

    const table = component.getByTestId(TestIds.table);
    expect(table).toBeVisible();
    const tableRows = within(table).queryAllByTestId(TestIds.tableItem);
    expect(tableRows).toHaveLength(TEST_PROJECTS.length);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows "No projects" fallback if no projects retrieved', async () => {
    mockProjects([]);

    const component = render(
      await ProjectList({
        projectPermissions: TEST_PROJECT_PERMISSIONS,
        canCreateProject: true,
      }),
    );

    const table = component.queryByTestId(TestIds.table);
    expect(table).not.toBeInTheDocument();
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Noch keine Projekte vorhanden');
    expect(fallback).toHaveTextContent(
      'Sie können hier ein neues Projekt erstellen.',
    );
  });

  it('shows "Fetch error" fallback if error occurs when retrieving projects', async () => {
    mockProjects([], new CombinedGraphQLErrors({ errors: [{ message: '' }] }));

    const component = render(
      await ProjectList({
        projectPermissions: TEST_PROJECT_PERMISSIONS,
        canCreateProject: true,
      }),
    );

    const table = component.queryByTestId(TestIds.table);
    expect(table).not.toBeInTheDocument();
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).toBeVisible();
    expect(fallback).toHaveTextContent('Projekte konnten nicht geladen werden');
    expect(fallback).toHaveTextContent(
      'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    );
  });
});
