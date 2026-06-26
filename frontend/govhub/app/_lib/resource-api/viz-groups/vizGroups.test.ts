import {
  mkVizGroupHref,
  fromAllVizGroups,
  fromVizGroupsByTenant,
  VizGroup,
  toSharedVizGroups,
  filterNotAlreadyShared,
  paramToVizgroup,
  internal,
  filterVizGroupsByScope,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';
import {
  AllVizGroups,
  VizGroupsByTenant,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { ProjectVizGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

const PROJECT_PERMISSIONS = {
  data: {
    project: {
      permissions: [
        {
          name: 'viz-group-read',
          vizGroupPrincipals: [
            { vizGroup: 'group1', tenant: 'tenant1' },
            { vizGroup: 'group2', tenant: 'tenant1' },
          ],
        },
        { name: 'someOtherPermission', vizGroupPrincipals: [] },
      ],
    },
  },
} as ProjectVizGroupPermissions;

const NO_PROJECT_PERMISSIONS = {
  data: {
    project: {
      permissions: [{}],
    },
  },
} as ProjectVizGroupPermissions;

describe('mkVizGroupHref', () => {
  const VIZ_GROUP_NAME = 'vizgroup1';
  const TENANT_NAME = 'tenant1';

  it('returns the correct href for the given tenant and viz group', () => {
    const href = mkVizGroupHref(TENANT_NAME, VIZ_GROUP_NAME);

    expect(href).toEqual(
      `/settings/dashboardgroups/${TENANT_NAME}/${VIZ_GROUP_NAME}`,
    );
  });
});

describe('fromAllVizGroups', () => {
  it('should convert a GraphQL result to a VizGroup list', () => {
    const result = {
      data: {
        tenants: [
          {
            vizGroups: [
              { tenant: 'tenant1', vizGroup: 'vizGroup1' },
              { tenant: 'tenant1', vizGroup: 'vizGroup2' },
            ],
          },
          { vizGroups: [] },
          { vizGroups: [{ tenant: 'tenant2', vizGroup: 'vizGroup3' }] },
        ],
      },
    } as unknown as AllVizGroups;

    const expected: VizGroup[] = [
      { name: 'vizGroup1', tenant: 'tenant1', _tag: 'VizGroup' },
      { name: 'vizGroup2', tenant: 'tenant1', _tag: 'VizGroup' },
      { name: 'vizGroup3', tenant: 'tenant2', _tag: 'VizGroup' },
    ];

    const vizGroups = fromAllVizGroups(result);

    expect(vizGroups).toEqual(expected);
  });

  it('returns an empty array if no tenants exist', () => {
    const result = { data: { tenants: [] } } as unknown as AllVizGroups;

    expect(fromAllVizGroups(result)).toEqual([]);
  });
});

describe('fromVizGroupsByTenant', () => {
  it('should convert GraphQL result to VizGroup list', () => {
    const result = {
      data: {
        tenant: {
          vizGroups: [
            { tenant: 'tenant1', vizGroup: 'vizGroupA' },
            { tenant: 'tenant1', vizGroup: 'vizGroupB' },
          ],
        },
      },
    } as unknown as VizGroupsByTenant;

    const expected: VizGroup[] = [
      { name: 'vizGroupA', tenant: 'tenant1', _tag: 'VizGroup' },
      { name: 'vizGroupB', tenant: 'tenant1', _tag: 'VizGroup' },
    ];

    const vizGroups = fromVizGroupsByTenant(result);

    expect(vizGroups).toEqual(expected);
  });

  it('returns undefined if tenant is undefined', () => {
    const result = {
      data: { tenant: undefined },
    } as unknown as VizGroupsByTenant;

    const vizGroups = fromVizGroupsByTenant(result);

    expect(vizGroups).toBeUndefined();
  });

  it('returns an empty array if tenant has no vizGroups', () => {
    const result = {
      data: {
        tenant: {
          vizGroups: [],
        },
      },
    } as unknown as VizGroupsByTenant;

    const vizGroups = fromVizGroupsByTenant(result);

    expect(vizGroups).toEqual([]);
  });
});

describe('toSharedVizGroups', () => {
  it('should extract shared VizGroups from project permissions', () => {
    const result = toSharedVizGroups(PROJECT_PERMISSIONS);
    expect(result).toEqual([
      { name: 'group1', tenant: 'tenant1', _tag: 'VizGroup' },
      { name: 'group2', tenant: 'tenant1', _tag: 'VizGroup' },
    ]);
  });

  it('should return an empty array if there are no shared VizGroups', () => {
    const result = toSharedVizGroups(NO_PROJECT_PERMISSIONS);
    expect(result).toEqual([]);
  });
});

describe('filterNotAlreadyShared', () => {
  const vizGroups: VizGroup[] = [
    { name: 'group1', tenant: 'tenant1', _tag: 'VizGroup' },
    { name: 'group2', tenant: 'tenant1', _tag: 'VizGroup' },
    { name: 'group3', tenant: 'tenant2', _tag: 'VizGroup' },
  ];

  it('should filter out VizGroups that are already shared', () => {
    const sharedGroups: VizGroup[] = [
      { name: 'group1', tenant: 'tenant1', _tag: 'VizGroup' },
    ];
    const result = filterNotAlreadyShared(vizGroups, sharedGroups);
    expect(result).toEqual([
      { name: 'group2', tenant: 'tenant1', _tag: 'VizGroup' },
      { name: 'group3', tenant: 'tenant2', _tag: 'VizGroup' },
    ]);
  });

  it('should return all VizGroups if none are shared', () => {
    const result = filterNotAlreadyShared(vizGroups, []);
    expect(result).toEqual(vizGroups);
  });

  it('should return an empty array if all VizGroups are shared', () => {
    const result = filterNotAlreadyShared(vizGroups, vizGroups);
    expect(result).toEqual([]);
  });
});

describe('paramToVizgroup', () => {
  it('parses a valid tenant_vizgroup string', () => {
    expect(paramToVizgroup('tenant1_vizgroup1')).toEqual(
      internal.mkVizGroup('vizgroup1', 'tenant1'),
    );
  });

  it.each([
    '',
    'tenantonly',
    '_vizgrouponly',
    'tenant_vizgroup_extra',
    'tenant_',
    '_vizgroup',
    '_',
  ])('returns undefined for invalid param "%s"', (param) => {
    expect(paramToVizgroup(param)).toBeUndefined();
  });
});

describe('filterVizGroupsByScope', () => {
  const vizGroups: VizGroup[] = [
    {
      name: 'vizGroup1',
      tenant: 'tenant1',
      _tag: 'VizGroup',
    },
    {
      name: 'vizGroup2',
      tenant: 'tenant1',
      _tag: 'VizGroup',
    },
    {
      name: 'vizGroup3',
      tenant: 'tenant2',
      _tag: 'VizGroup',
    },
    {
      name: 'vizGroup4',
      tenant: 'tenant2',
      _tag: 'VizGroup',
    },
  ];
  const vizGroupScopes: Map<string, Map<string, Scope[]>> = new Map([
    [
      'tenant1',
      new Map<string, Scope[]>([
        ['vizGroup1', ['viz-group:view']],
        ['vizGroup2', ['viz-group:view', 'viz-group:read']],
      ]),
    ],
    [
      'tenant2',
      new Map<string, Scope[]>([
        ['vizGroup3', ['viz-group:read', 'viz-group:admin']],
        ['vizGroup4', ['viz-group:admin']],
      ]),
    ],
  ]);
  const expectedAdminVizGroups = vizGroups.slice(2);

  it('returns vizGroup list with the specified scope', () => {
    const filteredAdminVizGroups = filterVizGroupsByScope(
      vizGroups,
      vizGroupScopes,
      'viz-group:admin',
    );
    expect(filteredAdminVizGroups).toStrictEqual(expectedAdminVizGroups);
  });

  it('returns empty array when scope does not match any vizGroups scopes', () => {
    const filteredAdminVizGroups = filterVizGroupsByScope(
      vizGroups,
      vizGroupScopes,
      'tenant:view',
    );
    expect(filteredAdminVizGroups).toHaveLength(0);
  });

  it('returns empty array when vizGroup is undefined', () => {
    const filteredAdminVizGroups = filterVizGroupsByScope(
      undefined,
      vizGroupScopes,
      'viz-group:admin',
    );
    expect(filteredAdminVizGroups).toHaveLength(0);
  });

  it('returns empty array when vizGroupScopes is undefined', () => {
    const filteredAdminVizGroups = filterVizGroupsByScope(
      vizGroups,
      undefined,
      'viz-group:admin',
    );
    expect(filteredAdminVizGroups).toHaveLength(0);
  });
});
