import { render, within } from '@testing-library/react';
import ProjectList from '@/app/settings/projects/ProjectList';
import { FuncMock } from '@/app/_test/utils';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ProjectsTestIds as TestIds } from '@/app/settings/projects/testIds';
import {
  AllProjects,
  fetchAllProjects,
} from '@/app/_lib/resource-api/graphql/project';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { useSearchParams } from 'next/navigation';

const fetchAllProjectsMock: FuncMock<typeof fetchAllProjects> =
  fetchAllProjects as unknown as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/project', () => ({
  fetchAllProjects: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const mockProjects = (hasProjects: boolean, error?: CombinedGraphQLErrors) => {
  fetchAllProjectsMock.mockResolvedValueOnce({
    data: {
      tenants: !hasProjects
        ? []
        : [
            {
              tenant: 'test-tenant-1',
              projects: [
                {
                  project: 'test-project-1',
                  tenant: 'test-tenant-1',
                  admin: true,
                },
                {
                  project: 'test-project-2',
                  tenant: 'test-tenant-1',
                  admin: true,
                },
              ],
            },
            {
              tenant: 'test-tenant-2',
              projects: [
                {
                  project: 'test-project-3',
                  tenant: 'test-tenant-2',
                  admin: true,
                },
              ],
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
    mockProjects(true);

    const { container } = render(
      await ProjectList({
        canCreateProject: true,
      }),
    );

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('projects overview contains as many list entries as projects retrieved', async () => {
    mockProjects(true);

    const component = render(
      await ProjectList({
        canCreateProject: true,
      }),
    );

    const table = component.getByTestId(TestIds.table);
    expect(table).toBeVisible();
    const tableRows = within(table).queryAllByTestId(TestIds.tableItem);
    expect(tableRows).toHaveLength(3);
    const fallback = component.queryByTestId(SettingsTestIds.fallback);
    expect(fallback).not.toBeInTheDocument();
  });

  it('shows "No projects" fallback if no projects retrieved', async () => {
    mockProjects(false);

    const component = render(
      await ProjectList({
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
    mockProjects(
      false,
      new CombinedGraphQLErrors({ errors: [{ message: '' }] }),
    );

    const component = render(
      await ProjectList({
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
