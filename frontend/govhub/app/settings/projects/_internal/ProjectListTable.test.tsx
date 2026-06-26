import { render } from '@testing-library/react';
import ProjectListTable from '@/app/settings/projects/_internal/ProjectListTable';
import { redirect, useSearchParams } from 'next/navigation';
import { ProjectsTestIds } from '@/app/settings/projects/testIds';
import { Project } from '../../../_lib/resource-api/project';
import { Scope } from '@/app/_lib/resource-api/permission/scope';
import userEvent from '@testing-library/user-event';
import React from 'react';

const redirectMock = redirect as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;

const TEST_INDEX = 1;
const UNCLICKABLE_TEST_INDEX = 3;
const TEST_PROJECTS: Project[] = [
  { tenant: 'test-tenant-1', name: 'test-project-1', _tag: 'Project' },
  { tenant: 'test-tenant-1', name: 'test-project-2', _tag: 'Project' },
  { tenant: 'test-tenant-2', name: 'test-project-3', _tag: 'Project' },
  { tenant: 'test-tenant-2', name: 'test-project-4', _tag: 'Project' },
];
const TEST_PROJECT_PERMISSIONS: Map<string, Scope[]> = new Map([
  ['test-project-1', ['project:admin']],
  ['test-project-2', ['project:admin']],
  ['test-project-3', ['project:admin']],
  ['test-project-4', ['project:read']],
]);

beforeEach(() => {
  useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
});

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    const { container } = render(
      <ProjectListTable
        projects={TEST_PROJECTS}
        projectPermissions={TEST_PROJECT_PERMISSIONS}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});

describe('content', () => {
  it('project list table contains as many entries as projects given', async () => {
    const component = render(<ProjectListTable projects={TEST_PROJECTS} />);

    const items = component.queryAllByTestId(ProjectsTestIds.tableItem);
    expect(items).toHaveLength(TEST_PROJECTS.length);
  });
});

describe('redirect', () => {
  it('click on project entry redirects to corresponding subpage', async () => {
    const component = render(
      <ProjectListTable
        projects={TEST_PROJECTS}
        projectPermissions={TEST_PROJECT_PERMISSIONS}
      />,
    );
    const rows = component.queryAllByTestId(ProjectsTestIds.tableItem);
    const testRow = rows[TEST_INDEX];
    const testProject = TEST_PROJECTS[TEST_INDEX];

    await userEvent.click(testRow);

    expect(redirectMock).toHaveBeenCalledWith(
      `/settings/projects/${testProject.tenant}/${testProject.name}`,
    );

    const unclickableTestRow = rows[UNCLICKABLE_TEST_INDEX];
    const unclickableTestProject = TEST_PROJECTS[UNCLICKABLE_TEST_INDEX];

    await userEvent.click(unclickableTestRow);

    expect(redirectMock).not.toHaveBeenCalledWith(
      `/settings/projects/${unclickableTestProject.tenant}/${unclickableTestProject.name}`,
    );
  });

  it('pressing enter on project entry redirects to corresponding subpage', async () => {
    const component = render(
      <ProjectListTable
        projects={TEST_PROJECTS}
        projectPermissions={TEST_PROJECT_PERMISSIONS}
      />,
    );
    const rows = component.queryAllByTestId(ProjectsTestIds.tableItem);
    const testRow = rows[TEST_INDEX];
    const testProject = TEST_PROJECTS[TEST_INDEX];

    testRow.focus();
    await userEvent.keyboard('{Enter}');

    expect(redirectMock).toHaveBeenCalledWith(
      `/settings/projects/${testProject.tenant}/${testProject.name}`,
    );

    const unclickableTestRow = rows[UNCLICKABLE_TEST_INDEX];
    const unclickableTestProject = TEST_PROJECTS[UNCLICKABLE_TEST_INDEX];

    await userEvent.click(unclickableTestRow);

    expect(redirectMock).not.toHaveBeenCalledWith(
      `/settings/projects/${unclickableTestProject.tenant}/${unclickableTestProject.name}`,
    );
  });
});

describe('project search', () => {
  it('Filters projects by names matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('?search=project-3'),
    );
    const component = render(<ProjectListTable projects={TEST_PROJECTS} />);

    const items = component.queryAllByTestId(ProjectsTestIds.tableItem);
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('test-project-3');
  });

  it('Filters projects by tenant matching the search parameter', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams('?search=tenant-1'),
    );
    const component = render(<ProjectListTable projects={TEST_PROJECTS} />);

    const items = component.queryAllByTestId(ProjectsTestIds.tableItem);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('test-tenant-1');
    expect(items[1]).toHaveTextContent('test-tenant-1');
  });

  it('Lists no project when none match the search parameter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=xyz'));
    const component = render(<ProjectListTable projects={TEST_PROJECTS} />);

    const items = component.queryAllByTestId(ProjectsTestIds.tableItem);
    expect(items).toHaveLength(0);
  });
});
