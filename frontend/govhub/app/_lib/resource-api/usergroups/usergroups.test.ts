import { AllUserGroups } from '@/app/_lib/resource-api/graphql/usergroups';
import {
  toUserGroups,
  UserGroup,
} from '@/app/_lib/resource-api/usergroups/usergroups';

describe('toUserGroups', () => {
  it.each([undefined, null, []])('handles edge case for %s', (tenants) => {
    const result = { data: { tenants } } as Partial<AllUserGroups>;

    const userGroups = toUserGroups(result as AllUserGroups);

    expect(userGroups).toEqual([]);
  });

  it('should return a UserGroup with granted and all scopes', () => {
    const result = {
      data: {
        tenants: [
          {
            tenant: 'tenant1',
            groups: [
              {
                group: 'group1',
                isMember: true,
                keycloakGroupPath: 'keycloakGroupPath1',
                scopes: { granted: ['group:admin', 'group:view'] },
              },
            ],
          },
        ],
      },
    } as Partial<AllUserGroups>;

    const expected: UserGroup = {
      name: 'group1',
      tenant: 'tenant1',
      isMember: true,
      keycloakGroupPath: 'keycloakGroupPath1',
      scopes: {
        granted: ['group:admin', 'group:view'],
        all: [],
      },
      isShared: false,
      _tag: 'UserGroup',
    };
    const userGroups = toUserGroups(result as AllUserGroups);

    expect(userGroups).toEqual([expected]);
  });

  it('should return a shared UserGroup', () => {
    const result = {
      data: {
        tenants: [
          {
            tenant: 'tenant1',
            groups: [
              {
                group: 'group1',
                isMember: false,
                keycloakGroupPath: 'keycloakGroupPath1',
                scopes: { granted: ['group:admin', 'group:view'] },
                permissions: [
                  {
                    name: 'shared',
                    scopes: ['group:view'],
                    allowAllAuthenticatedUsers: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    } as Partial<AllUserGroups>;

    const expected: UserGroup = {
      name: 'group1',
      tenant: 'tenant1',
      isMember: false,
      keycloakGroupPath: 'keycloakGroupPath1',
      scopes: {
        granted: ['group:admin', 'group:view'],
        all: [],
      },
      isShared: true,
      _tag: 'UserGroup',
    };
    const userGroups = toUserGroups(result as AllUserGroups);

    expect(userGroups).toEqual([expected]);
  });

  it('returns UserGroups of multiple tenants', () => {
    const result = {
      data: {
        tenants: [
          {
            tenant: 'tenant1',
            groups: [
              {
                group: 'group1',
                isMember: false,
                keycloakGroupPath: 'keycloakGroupPath1',
                scopes: { granted: ['group:admin', 'group:view'] },
              },
            ],
          },
          {
            tenant: 'tenant2',
            groups: [
              {
                group: 'group2',
                isMember: false,
                keycloakGroupPath: 'keycloakGroupPath2',
                scopes: { granted: ['group:admin', 'group:view'] },
              },
            ],
          },
        ],
      },
    } as Partial<AllUserGroups>;

    const expected1: UserGroup = {
      name: 'group1',
      tenant: 'tenant1',
      isMember: false,
      keycloakGroupPath: 'keycloakGroupPath1',
      scopes: {
        granted: ['group:admin', 'group:view'],
        all: [],
      },
      isShared: false,
      _tag: 'UserGroup',
    };
    const expected2: UserGroup = {
      name: 'group2',
      tenant: 'tenant2',
      isMember: false,
      keycloakGroupPath: 'keycloakGroupPath2',
      scopes: {
        granted: ['group:admin', 'group:view'],
        all: [],
      },
      isShared: false,
      _tag: 'UserGroup',
    };
    const userGroups = toUserGroups(result as AllUserGroups);

    expect(userGroups).toEqual([expected1, expected2]);
  });

  it('throws if granted scopes contain invalid strings', () => {
    const result = {
      data: {
        tenants: [
          {
            tenant: 'tenant1',
            groups: [
              {
                group: 'group1',
                keycloakGroupPath: 'keycloakGroupPath1',
                scopes: { granted: ['invalid'] },
              },
            ],
          },
        ],
      },
    } as Partial<AllUserGroups>;

    expect(() => toUserGroups(result as AllUserGroups)).toThrow();
  });
});
