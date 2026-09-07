import { groupScopeSet } from './scope';
import { UserGroupScopes } from '@/app/_lib/resource-api/graphql/usergroups';

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
