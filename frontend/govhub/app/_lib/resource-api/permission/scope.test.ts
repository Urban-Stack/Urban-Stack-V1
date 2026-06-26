import { AllTenantAndProjectScopes, TenantScopes } from '../graphql/tenant';
import {
  canCreateProject,
  groupScopeSet,
  hasScopeForProject,
  hasScopeForTenant,
  hasScopeForVizGroup,
  isCityToolAdmin,
  isDedicatedAppAdmin,
  isGroupAdminInAnyTenant,
  isSharedAppAdmin,
  isTenantAdmin,
  projectPermissionMap,
  Scope,
  tenantPermissionMap,
  vizGroupPermissionMap,
} from './scope';
import { UserGroupScopes } from '@/app/_lib/resource-api/graphql/usergroups';

const input: AllTenantAndProjectScopes = {
  data: {
    tenants: [
      {
        tenant: 'test-tenant-1',
        scopes: {
          all: [],
          granted: [],
        },
        projects: [
          {
            project: 'test-project-1',
            scopes: {
              all: [],
              granted: ['project:admin', 'project:read'],
            },
          },
          {
            project: 'test-project-2',
            scopes: {
              all: [],
              granted: ['project:read'],
            },
          },
        ],
        groups: [],
        vizGroups: [
          {
            vizGroup: 'vizGroup-1',
            scopes: {
              all: [],
              granted: ['viz-group:admin', 'viz-group:read'],
            },
          },
          {
            vizGroup: 'vizGroup-2',
            scopes: {
              all: [],
              granted: ['viz-group:read'],
            },
          },
        ],
      },
      {
        tenant: 'test-tenant-2',
        scopes: {
          all: [],
          granted: ['tenant:admin'],
        },
        projects: [
          {
            project: 'test-project-3',
            scopes: {
              all: [],
              granted: ['project:admin', 'project:read'],
            },
          },
        ],
        groups: [
          {
            group: 'test-group-1',
            scopes: {
              all: [],
              granted: ['group:admin'],
            },
          },
        ],
        vizGroups: [
          {
            vizGroup: 'vizGroup-1',
            scopes: {
              all: [],
              granted: ['viz-group:read'],
            },
          },
          {
            vizGroup: 'vizGroup-3',
            scopes: {
              all: [],
              granted: ['viz-group:admin', 'viz-group:read'],
            },
          },
        ],
      },
    ],
  },
} as unknown as AllTenantAndProjectScopes;

describe('projectPermissionMap', () => {
  it('returns a map in the correct format', () => {
    const expectedResult: Map<string, Scope[]> = new Map([
      ['test-project-1', ['project:admin', 'project:read']],
      ['test-project-2', ['project:read']],
      ['test-project-3', ['project:admin', 'project:read']],
    ]);

    Object.keys(expectedResult).forEach((key) => {
      expect(projectPermissionMap(input).get(key)).toBe(
        expectedResult.get(key),
      );
    });
  });
});

describe('vizGroupPermissionMap', () => {
  it('returns a map in the correct format', () => {
    const expectedResult: Map<string, Map<string, Scope[]>> = new Map([
      [
        'test-tenant-1',
        new Map<string, Scope[]>([
          ['vizGroup-1', ['viz-group:admin', 'viz-group:read']],
          ['vizGroup-2', ['viz-group:read']],
        ]),
      ],
      [
        'test-tenant-2',
        new Map<string, Scope[]>([
          ['vizGroup-1', ['viz-group:read']],
          ['vizGroup-3', ['viz-group:admin', 'viz-group:read']],
        ]),
      ],
    ]);

    expect(vizGroupPermissionMap(input)).toEqual(expectedResult);
  });
});

describe('tenantPermissionMap', () => {
  it('returns a map in the correct format', () => {
    const expectedResult: Map<string, Scope[]> = new Map([
      ['test-tenant-1', []],
      ['test-tenant-2', ['tenant:admin']],
    ]);

    expect(tenantPermissionMap(input)).toEqual(expectedResult);
  });
});

describe('hasScopeForProject', () => {
  it('correctly returns whether or not a scope for a given project is set', () => {
    const scopeMap = projectPermissionMap(input);

    expect(
      hasScopeForProject(scopeMap, 'project:admin', 'test-project-1'),
    ).toBe(true);
    expect(
      hasScopeForProject(scopeMap, 'project:admin', 'test-project-2'),
    ).toBe(false);
    expect(
      hasScopeForProject(scopeMap, 'project:admin', 'test-project-3'),
    ).toBe(true);
  });
});

describe('hasScopeForVizGroup', () => {
  it('correctly returns whether or not a scope for a given vizGroup is set', () => {
    const scopeMap = vizGroupPermissionMap(input);

    expect(
      hasScopeForVizGroup(
        scopeMap,
        'viz-group:admin',
        'vizGroup-1',
        'test-tenant-1',
      ),
    ).toBe(true);
    expect(
      hasScopeForVizGroup(
        scopeMap,
        'viz-group:admin',
        'vizGroup-2',
        'test-tenant-1',
      ),
    ).toBe(false);

    expect(
      hasScopeForVizGroup(
        scopeMap,
        'viz-group:admin',
        'vizGroup-3',
        'test-tenant-2',
      ),
    ).toBe(true);
    expect(
      hasScopeForVizGroup(
        scopeMap,
        'viz-group:read',
        'vizGroup-1',
        'test-tenant-2',
      ),
    ).toBe(true);
    expect(
      hasScopeForVizGroup(
        scopeMap,
        'viz-group:admin',
        'vizGroup-1',
        'test-tenant-2',
      ),
    ).toBe(false);
  });

  it('returns empty map on empty input', () => {
    const scopeMap1 = vizGroupPermissionMap({} as AllTenantAndProjectScopes);
    const scopeMap2 = vizGroupPermissionMap({
      data: { tenants: [] as unknown },
    } as AllTenantAndProjectScopes);

    expect(scopeMap1.size).toBe(0);
    expect(scopeMap2.size).toBe(0);
  });
});

describe('hasScopeForTenant', () => {
  it('correctly returns whether or not a scope for a given tenant is set', () => {
    const scopeMap = tenantPermissionMap(input);

    expect(hasScopeForTenant(scopeMap, 'tenant:admin', 'test-tenant-1')).toBe(
      false,
    );
    expect(hasScopeForTenant(scopeMap, 'tenant:admin', 'test-tenant-2')).toBe(
      true,
    );
    expect(hasScopeForTenant(scopeMap, 'tenant:admin', 'test-tenant-3')).toBe(
      false,
    );
  });
});

describe('canCreateProject', () => {
  it('correctly returns whether the given scopes allow creating a project', () => {
    expect(canCreateProject(input)).toBe(true);
  });
});

describe('isGroupAdminInAnyTenant', () => {
  it('returns true when any group has the group admin scope', () => {
    expect(isGroupAdminInAnyTenant(input)).toBe(true);
  });

  it('returns false when querying for a group that doesnt exist', () => {
    expect(isGroupAdminInAnyTenant(input, 'hurz', 'test-tenant-1')).toBe(false);
  });

  it('returns false when querying for a tenant that doesnt exist', () => {
    expect(isGroupAdminInAnyTenant(input, 'test-group-1', 'hurz')).toBe(false);
  });

  it('returns true when querying for a specific existing group that has the group admin scope', () => {
    expect(
      isGroupAdminInAnyTenant(input, 'test-group-1', 'test-tenant-2'),
    ).toBe(true);
  });
});

describe('groupScopeSet', () => {
  it('returns empty set if group is undefined', () => {
    const scopesData = {
      data: {
        group: undefined,
      },
    } as UserGroupScopes;

    const scopeSet = groupScopeSet(scopesData);

    expect(scopeSet).toEqual(new Set());
  });

  it('returns empty set for granted scopes being empty', () => {
    const scopesData = {
      data: {
        group: {
          scopes: {
            all: ['tenant:admin', 'group:read', 'sensor-credential:view'],
            granted: [],
          },
        },
      },
    } as unknown as UserGroupScopes;

    const scopeSet = groupScopeSet(scopesData);

    expect(scopeSet).toEqual(new Set());
  });

  it('returns set of all granted scopes', () => {
    const scopesData = {
      data: {
        group: {
          scopes: {
            all: ['tenant:admin', 'group:read', 'sensor-credential:view'],
            granted: ['tenant:admin', 'tenant:admin', 'group:read'],
          },
        },
      },
    } as unknown as UserGroupScopes;

    const scopeSet = groupScopeSet(scopesData);

    expect(scopeSet).toEqual(new Set(['tenant:admin', 'group:read']));
  });
});

describe('isTenantAdmin', () => {
  it('returns true when admin scope is present for the given tenant', () => {
    expect(isTenantAdmin(input, 'test-tenant-2')).toBe(true);
  });

  it('returns false when admin scope is not present for the given tenant', () => {
    expect(isTenantAdmin(input, 'test-tenant-1')).toBe(false);
  });

  it('returns false when the given tenant does not exist', () => {
    expect(isTenantAdmin(input, 'test-tenant-9001')).toBe(false);
  });
});

const mkTenantScopes = (granted: Scope[] | null): TenantScopes =>
  ({
    data: granted
      ? {
          tenant: {
            scopes: {
              all: [],
              granted,
            },
          },
        }
      : { tenant: null },
  }) as TenantScopes;

describe('isCityToolAdmin', () => {
  it('returns true when tenant has citytool admin scope', () => {
    const result = mkTenantScopes(['citytool:admin']);
    expect(isCityToolAdmin(result)).toBe(true);
  });

  it('returns false when tenant is missing citytool admin scope', () => {
    const result = mkTenantScopes(['citytool:read']);
    expect(isCityToolAdmin(result)).toBe(false);
  });

  it('returns false when tenant scopes are unavailable', () => {
    const result = mkTenantScopes(null);
    expect(isCityToolAdmin(result)).toBe(false);
  });
});

describe('isSharedAppAdmin', () => {
  it('returns true when tenant has shared-app admin scope', () => {
    const result = mkTenantScopes(['shared-app:admin']);
    expect(isSharedAppAdmin(result)).toBe(true);
  });

  it('returns false when tenant is missing shared-app admin scope', () => {
    const result = mkTenantScopes(['shared-app:read']);
    expect(isSharedAppAdmin(result)).toBe(false);
  });

  it('returns false when tenant scopes are unavailable', () => {
    const result = mkTenantScopes(null);
    expect(isSharedAppAdmin(result)).toBe(false);
  });
});

describe('isDedicatedAppAdmin', () => {
  it('returns true when tenant has dedicated-app admin scope', () => {
    const result = mkTenantScopes(['dedicated-app:admin']);
    expect(isDedicatedAppAdmin(result)).toBe(true);
  });

  it('returns false when tenant is missing dedicated-app admin scope', () => {
    const result = mkTenantScopes(['dedicated-app:read']);
    expect(isDedicatedAppAdmin(result)).toBe(false);
  });

  it('returns false when tenant scopes are unavailable', () => {
    const result = mkTenantScopes(null);
    expect(isDedicatedAppAdmin(result)).toBe(false);
  });
});
