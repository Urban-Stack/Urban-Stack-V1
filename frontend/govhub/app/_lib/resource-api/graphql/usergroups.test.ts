import { FuncMock } from '@/app/_test/utils';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import {
  addGroupPermission,
  deleteGroupPermission,
  disableUserGroupShared,
  enableUserGroupShared,
  Group,
  internal,
  mutateCreateUserGroup,
  mutateDeleteUserGroup,
  Permission,
  Principal,
  queryAllUserGroups,
  queryUserGroupPermissions,
  queryUserGroupScopes,
  updateGroupPermission,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';

const {
  ALL_USER_GROUPS,
  USER_GROUP_PERMISSIONS,
  USER_GROUP_SCOPES,
  CREATE_USER_GROUP,
  DELETE_USER_GROUP,
  ENABLE_USER_GROUP_SHARED,
  DISABLE_USER_GROUP_SHARED,
  MUTATE_USER_GROUP_PERMISSIONS,
  updateGroup,
  removeGroup,
  _updateGroupPermission,
} = internal;

jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

const TENANT = 'test-tenant';
const GROUP_NAME = 'test-group';
const GROUP: Group = { tenant: 'group-tenant', name: 'group-name' };
const PRINCIPAL: Principal = {
  tenant: 'principal-tenant',
  group: 'principal-group',
};

const toGroup: (principal: Principal) => Group = (principal) => ({
  tenant: principal.tenant,
  name: principal.group,
});

const toPrincipal: (group: Group) => Principal = (group) => ({
  tenant: group.tenant,
  group: group.name,
});

describe('queryAllUserGroups', () => {
  it('should call the client with the correct query', async () => {
    await queryAllUserGroups();

    expect(mockQuery).toHaveBeenCalledWith({
      query: ALL_USER_GROUPS,
    });
  });
});

describe('queryUserGroupPermissions', () => {
  it('should call the client with the correct query', async () => {
    requireTenantMock.mockResolvedValue(TENANT);

    await queryUserGroupPermissions(TENANT, GROUP_NAME);

    expect(mockQuery).toHaveBeenCalledWith({
      query: USER_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('queryUserGroupScopes', () => {
  it('should call the client with the correct query', async () => {
    requireTenantMock.mockResolvedValue(TENANT);

    await queryUserGroupScopes(TENANT, GROUP_NAME);

    expect(mockQuery).toHaveBeenCalledWith({
      query: USER_GROUP_SCOPES,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('mutateCreateUserGroup', () => {
  it('should call the client with the correct mutation', async () => {
    requireTenantMock.mockResolvedValue(TENANT);

    await mutateCreateUserGroup(GROUP_NAME);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: CREATE_USER_GROUP,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('mutateDeleteUserGroup', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateDeleteUserGroup({
      tenant: TENANT,
      name: GROUP_NAME,
    } as unknown as UserGroup);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: DELETE_USER_GROUP,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('enableUserGroupShared', () => {
  it('should call the client with the correct mutation', async () => {
    const group: UserGroup = {
      name: GROUP_NAME,
      tenant: TENANT,
      isMember: false,
      keycloakGroupPath: 'test/keycloak/group/path/1',
      scopes: {},
      isShared: false,
      _tag: 'UserGroup',
    };

    await enableUserGroupShared(group);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: ENABLE_USER_GROUP_SHARED,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('disableUserGroupShared', () => {
  it('should call the client with the correct mutation', async () => {
    const group: UserGroup = {
      name: GROUP_NAME,
      tenant: TENANT,
      isMember: false,
      keycloakGroupPath: 'test/keycloak/group/path/1',
      scopes: {},
      isShared: false,
      _tag: 'UserGroup',
    };

    await disableUserGroupShared(group);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: DISABLE_USER_GROUP_SHARED,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });
});

describe('_updateGroupPermission', () => {
  const PERMISSION = { name: 'read', groupPrincipals: [PRINCIPAL] };
  const updated = {
    read: [{ tenant: TENANT, group: 'read-group' }],
    admin: [{ tenant: TENANT, group: 'admin-group' }],
  };
  const actionMock = jest.fn();

  beforeEach(() => {
    actionMock.mockReset().mockReturnValue(updated);
    mockQuery.mockResolvedValue({ data: {} });
  });

  it('queries existing permissions', async () => {
    await _updateGroupPermission(actionMock)(TENANT, GROUP_NAME, GROUP);

    expect(mockQuery).toHaveBeenCalledWith({
      query: USER_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
      },
    });
  });

  it('calls given action with correct parameters', async () => {
    mockQuery.mockResolvedValue({
      data: { group: { permissions: [PERMISSION] } },
    });

    await _updateGroupPermission(actionMock)(TENANT, GROUP_NAME, GROUP);

    expect(actionMock).toHaveBeenCalledWith([PERMISSION], GROUP);
  });

  it('calls mutation with correct groups', async () => {
    await _updateGroupPermission(actionMock)(TENANT, GROUP_NAME, GROUP);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_USER_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
        readGroups: updated.read,
        adminGroups: updated.admin,
      },
    });
  });
});

describe('updateGroup', () => {
  it('adds group to read permission when no existing permissions exist', () => {
    const existing: Permission[] = [];

    const result = updateGroup('read')(existing, GROUP);

    expect(result).toEqual({
      read: [toPrincipal(GROUP)],
      admin: [],
    });
  });

  it('adds group to admin permission when no existing permissions exist', () => {
    const existing: Permission[] = [];

    const result = updateGroup('admin')(existing, GROUP);

    expect(result).toEqual({
      read: [],
      admin: [toPrincipal(GROUP)],
    });
  });

  it('adds group to admin permissions without removing existing admin groups', () => {
    const existing = [{ name: 'admin', groupPrincipals: [PRINCIPAL] }];

    const result = updateGroup('admin')(existing, GROUP);

    expect(result).toEqual({
      read: [],
      admin: [PRINCIPAL, toPrincipal(GROUP)],
    });
  });

  it('does not duplicate group if it already exists in that permission', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: [PRINCIPAL],
      },
    ];

    const result = updateGroup('read')(existing, toGroup(PRINCIPAL));

    expect(result).toEqual({
      read: [PRINCIPAL],
      admin: [],
    });
  });

  it('removes group from admin permission and adds it to read', () => {
    const readPrincipal = { tenant: 'tenant1', group: 'read-group' };
    const adminPrincipal = { tenant: 'tenant2', group: 'admin-group' };
    const existing = [
      {
        name: 'admin',
        groupPrincipals: [PRINCIPAL, adminPrincipal],
      },
      {
        name: 'read',
        groupPrincipals: [readPrincipal],
      },
    ];

    const result = updateGroup('read')(existing, toGroup(PRINCIPAL));

    expect(result).toEqual({
      read: [readPrincipal, PRINCIPAL],
      admin: [adminPrincipal],
    });
  });

  it('handles null principals gracefully', () => {
    const existing = [
      {
        name: 'admin',
        groupPrincipals: null,
      },
    ];

    const result = updateGroup('admin')(existing, GROUP);

    expect(result).toEqual({
      read: [],
      admin: [toPrincipal(GROUP)],
    });
  });
});

describe('removeGroup', () => {
  it('removes group from both read and admin permission', () => {
    const readPrincipal = { tenant: 'tenant1', group: 'read-group' };
    const principalToRemove = { tenant: 'tenant2', group: 'remove-me' };
    const existing = [
      {
        name: 'read',
        groupPrincipals: [readPrincipal, principalToRemove],
      },
      {
        name: 'admin',
        groupPrincipals: [principalToRemove],
      },
    ];

    const result = removeGroup(existing, {
      tenant: principalToRemove.tenant,
      name: principalToRemove.group,
    });

    expect(result.read).not.toContainEqual(principalToRemove);
    expect(result.admin).not.toContainEqual(principalToRemove);
    expect(result).toEqual({
      read: [readPrincipal],
      admin: [],
    });
  });

  it('does nothing if group does not exist in any permission', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: [PRINCIPAL],
      },
    ];

    const nonExistingGroup = { tenant: 'tenant1', name: 'non-existent' };
    const result = removeGroup(existing, nonExistingGroup);

    expect(result).toEqual({
      read: [PRINCIPAL],
      admin: [],
    });
  });

  it('handles null principals gracefully', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: null,
      },
      {
        name: 'admin',
        groupPrincipals: [PRINCIPAL],
      },
    ];

    const result = removeGroup(existing, toGroup(PRINCIPAL));

    expect(result).toEqual({
      read: [],
      admin: [],
    });
  });
});

describe('addGroupPermission & updateGroupPermission', () => {
  it.each([addGroupPermission, updateGroupPermission])(
    '%p: calls client with correct mutation for adding permission',
    async (f) => {
      const permission = 'read';
      mockQuery.mockResolvedValue({
        data: {
          group: {
            permissions: [
              {
                name: permission,
                groupPrincipals: [PRINCIPAL],
              },
            ],
          },
        },
      });

      await f(permission)(TENANT, GROUP_NAME, GROUP);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_USER_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          group: GROUP_NAME,
          readGroups: [PRINCIPAL, toPrincipal(GROUP)],
          adminGroups: [],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: does nothing if exact group and permission already exists',
    async (f) => {
      const permission = 'admin';
      mockQuery.mockResolvedValue({
        data: {
          group: {
            permissions: [
              {
                name: permission,
                groupPrincipals: [PRINCIPAL],
              },
            ],
          },
        },
      });

      await f(permission)(TENANT, GROUP_NAME, toGroup(PRINCIPAL));

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_USER_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          group: GROUP_NAME,
          readGroups: [],
          adminGroups: [PRINCIPAL],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: handles cases where permission of existing group is changed',
    async (f) => {
      const oldPermission = 'admin';
      const newPermission = 'read';
      mockQuery.mockResolvedValue({
        data: {
          group: {
            permissions: [
              {
                name: oldPermission,
                groupPrincipals: [PRINCIPAL],
              },
            ],
          },
        },
      });

      await f(newPermission)(TENANT, GROUP_NAME, toGroup(PRINCIPAL));

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_USER_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          group: GROUP_NAME,
          readGroups: [PRINCIPAL],
          adminGroups: [],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: handles cases where no existing permissions are found',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          group: {
            permissions: [],
          },
        },
      });

      await f('admin')(TENANT, GROUP_NAME, GROUP);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_USER_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          group: GROUP_NAME,
          readGroups: [],
          adminGroups: [toPrincipal(GROUP)],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: handles group without permissions',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          group: {},
        },
      });

      await f('read')(TENANT, GROUP_NAME, GROUP);

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_USER_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          group: GROUP_NAME,
          readGroups: [toPrincipal(GROUP)],
          adminGroups: [],
        },
      });
    },
  );
});

describe('deleteGroupPermission', () => {
  it('removes group from permissions and calls correct mutation', async () => {
    const principalToRemove = { tenant: 'tenant1', group: 'del-group' };
    mockQuery.mockResolvedValue({
      data: {
        group: {
          permissions: [
            {
              name: 'read',
              groupPrincipals: [principalToRemove, PRINCIPAL],
            },
            {
              name: 'admin',
              groupPrincipals: [principalToRemove],
            },
          ],
        },
      },
    });

    await deleteGroupPermission(TENANT, GROUP_NAME, toGroup(principalToRemove));

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_USER_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
        readGroups: [PRINCIPAL],
        adminGroups: [],
      },
    });
  });

  it('handles group without permissions', async () => {
    mockQuery.mockResolvedValue({
      data: {
        group: {},
      },
    });

    await deleteGroupPermission(TENANT, GROUP_NAME, GROUP);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_USER_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        group: GROUP_NAME,
        readGroups: [],
        adminGroups: [],
      },
    });
  });
});
