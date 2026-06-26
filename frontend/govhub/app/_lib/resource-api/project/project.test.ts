import {
  mkProjectHref,
  toProjects,
} from '@/app/_lib/resource-api/project/index';
import { AllProjects } from '@/app/_lib/resource-api/graphql/project';

describe('mkProjectHref', () => {
  const TEST_PROJECT_NAME = 'test-project';
  const TEST_TENANT_NAME = 'test-tenant';

  it('returns the correct href for the given tenant and project name', () => {
    const href = mkProjectHref(TEST_TENANT_NAME, TEST_PROJECT_NAME);

    expect(href).toEqual(
      `/settings/projects/${TEST_TENANT_NAME}/${TEST_PROJECT_NAME}`,
    );
  });
});

describe('toProject', () => {
  it('should convert a graphql result to a project list', () => {
    const result = {
      data: {
        tenants: [
          {
            projects: [],
          },
          {
            projects: [
              { tenant: 't1', project: 'p1' },
              { tenant: 't1', project: 'p2' },
              { tenant: 't1', project: 'p3' },
            ],
          },
          {
            projects: [
              { tenant: 't2', project: 'p4' },
              { tenant: 't2', project: 'p5' },
            ],
          },
        ],
      },
    } as AllProjects;

    const expected = [
      { name: 'p1', tenant: 't1', _tag: 'Project' },
      { name: 'p2', tenant: 't1', _tag: 'Project' },
      { name: 'p3', tenant: 't1', _tag: 'Project' },
      { name: 'p4', tenant: 't2', _tag: 'Project' },
      { name: 'p5', tenant: 't2', _tag: 'Project' },
    ];

    const projects = toProjects(result);

    expect(projects).toEqual(expected);
  });
});
