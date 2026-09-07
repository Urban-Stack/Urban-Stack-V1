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
            tenant: 't0',
            projects: [],
          },
          {
            tenant: 't1',
            projects: [
              { tenant: 't1', project: 'p1', admin: true },
              { tenant: 't1', project: 'p2', admin: false },
              { tenant: 't1', project: 'p3', admin: false },
            ],
          },
          {
            tenant: 't2',
            projects: [
              { tenant: 't2', project: 'p4', admin: false },
              { tenant: 't2', project: 'p5', admin: true },
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

    const expectedAdminMap = new Map([
      ['t0', new Map()],
      [
        't1',
        new Map([
          ['p1', true],
          ['p2', false],
          ['p3', false],
        ]),
      ],
      [
        't2',
        new Map([
          ['p4', false],
          ['p5', true],
        ]),
      ],
    ]);

    const { projects, adminMap } = toProjects(result);

    expect(projects).toEqual(expected);
    expect(adminMap).toEqual(expectedAdminMap);
  });
});
