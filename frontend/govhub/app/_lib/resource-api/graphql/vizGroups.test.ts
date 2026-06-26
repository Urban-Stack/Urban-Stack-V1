import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { FuncMock } from '@/app/_test/utils';
import {
  addUserGroupPermission,
  deleteUserGroupPermission,
  internal,
  mutateCreatePublishedQuery,
  mutateCreateVizGroup,
  mutateDeletePublishedQuery,
  mutateDeleteVizGroup,
  queryAllVizGroups,
  queryPublishedQueries,
  querySinglePublishedQuery,
  queryVizGroupGroupPermissions,
  updateUserGroupPermission,
  UserGroup,
  UserGroupPermission,
  UserGroupPermissions,
  UserGroupPrincipal,
} from '@/app/_lib/resource-api/graphql/vizGroups';

const {
  MUTATE_VIZ_GROUP_PERMISSIONS,
  VIZ_GROUP_GROUP_PERMISSIONS,
  removeUserGroup,
  updateUserGroup,
  _updateUserGroupPermission,
} = internal;

const mutateMock = mutate as jest.Mock;
const queryMock = query as jest.Mock;
const requireTenantMock = requireTenant as unknown as FuncMock<
  typeof requireTenant
>;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
}));

const TENANT = 'tenant1';
const VIZGROUP = 'vizGroup1';
const USER_GROUP: UserGroup = { tenant: TENANT, name: 'userGroup1' };
const TEST_PRINCIPAL: UserGroupPrincipal = {
  tenant: TENANT,
  group: 'userGroup2',
};
const ADMIN_PRINCIPAL: UserGroupPrincipal = {
  tenant: TENANT,
  group: 'admin-group',
};
const READ_PRINCIPAL: UserGroupPrincipal = {
  tenant: TENANT,
  group: 'read-group',
};

const adminPermission: (
  principals: UserGroupPrincipal[] | null,
) => UserGroupPermission = (principals: UserGroupPrincipal[] | null) => ({
  name: 'admin',
  groupPrincipals: principals,
});

const readPermission: (
  principals: UserGroupPrincipal[] | null,
) => UserGroupPermission = (principals) => ({
  name: 'read',
  groupPrincipals: principals,
});

const userGroup: (principal: UserGroupPrincipal) => UserGroup = (
  principal,
) => ({
  name: principal.group,
  tenant: principal.tenant,
});

beforeEach(() => {
  queryMock.mockReset();
  mutateMock.mockReset();
});

beforeAll(() => {
  requireTenantMock.mockResolvedValue(TENANT);
});

describe('mutateCreateVizGroup', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateCreateVizGroup(VIZGROUP);

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: internal.CREATE_VIZ_GROUP,
      variables: {
        name: VIZGROUP,
        tenant: TENANT,
      },
    });
  });
});

describe('mutateDeleteVizGroup', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateDeleteVizGroup(VIZGROUP);

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: internal.DELETE_VIZ_GROUP,
      variables: {
        name: VIZGROUP,
        tenant: TENANT,
      },
    });
  });
});

describe('queryVizGroupGroupPermissions', () => {
  it('should call the client with the correct query', async () => {
    await queryVizGroupGroupPermissions(TENANT, VIZGROUP);

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.VIZ_GROUP_GROUP_PERMISSIONS,
      variables: {
        vizGroup: VIZGROUP,
        tenant: TENANT,
      },
    });
  });
});

describe('queryAllVizGroups', () => {
  it('should call the client with the correct query', async () => {
    await queryAllVizGroups();

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.ALL_VIZ_GROUPS,
    });
  });
});

describe('queryPublishedQueries', () => {
  it('should call the client with the correct query', async () => {
    await queryPublishedQueries(TENANT, VIZGROUP);

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.PUBLISHED_QUERIES,
      variables: {
        vizGroup: VIZGROUP,
        tenant: TENANT,
      },
    });
  });
});

describe('querySinglePublishedQuery', () => {
  it('should call the client with the correct query', async () => {
    await querySinglePublishedQuery(TENANT, VIZGROUP, 'query1');

    expect(queryMock).toHaveBeenCalledWith({
      query: internal.GET_PUBLISHED_QUERY,
      variables: {
        vizGroup: VIZGROUP,
        tenant: TENANT,
        name: 'query1',
      },
    });
  });
});

describe('mutateDeletePublishedQuery', () => {
  it('should call the client with the correct mutation', async () => {
    const queryName = 'query1';
    await mutateDeletePublishedQuery(TENANT, VIZGROUP, queryName);

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: internal.DELETE_PUBLISHED_QUERY,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        name: queryName,
      },
    });
  });
});

describe('mutateCreatePublishedQuery', () => {
  it('should call the client with the correct mutation', async () => {
    const queryName = 'query1';
    const sql = 'SELECT * FROM table';
    await mutateCreatePublishedQuery(TENANT, VIZGROUP, queryName, sql);

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: internal.CREATE_PUBLISHED_QUERY,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        name: queryName,
        sql: sql,
      },
    });
  });
});

describe('removeUserGroup', () => {
  it('removes user group from all permissions in which it is present', () => {
    const existing = [
      adminPermission([TEST_PRINCIPAL]),
      readPermission([READ_PRINCIPAL, TEST_PRINCIPAL]),
    ];
    const group = userGroup(TEST_PRINCIPAL);

    const result = removeUserGroup(existing, group);

    expect(result).toEqual({
      admin: [],
      read: [READ_PRINCIPAL],
    });
  });

  it('does nothing if the user group does not exist in any permission', () => {
    const existing = [
      adminPermission([ADMIN_PRINCIPAL]),
      readPermission([READ_PRINCIPAL]),
    ];

    const result = removeUserGroup(existing, {
      tenant: TENANT,
      name: 'non-existent',
    });

    expect(result).toEqual({
      admin: [ADMIN_PRINCIPAL],
      read: [READ_PRINCIPAL],
    });
  });

  it('does nothing if no user groups exist', () => {
    const existing: UserGroupPermission[] = [];
    const group = userGroup(TEST_PRINCIPAL);

    const result = removeUserGroup(existing, group);

    expect(result).toEqual({
      admin: [],
      read: [],
    });
  });

  it('returns empty list for permission with group principals being null', () => {
    const existing = [adminPermission([ADMIN_PRINCIPAL]), readPermission(null)];
    const group = userGroup(ADMIN_PRINCIPAL);

    const result = removeUserGroup(existing, group);

    expect(result).toEqual({
      admin: [],
      read: [],
    });
  });
});

describe('updateUserGroup', () => {
  it('adds user group to read permission given no permissions exist', () => {
    const noExisting: UserGroupPermission[] = [];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('read')(noExisting, group);

    expect(result).toEqual({
      admin: [],
      read: [TEST_PRINCIPAL],
    });
  });

  it('adds user group to admin permission given no admin permissions exist', () => {
    const noExisting: UserGroupPermission[] = [];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('admin')(noExisting, group);

    expect(result).toEqual({
      admin: [TEST_PRINCIPAL],
      read: [],
    });
  });

  it('adds user group to existing read permissions', () => {
    const existing = [readPermission([READ_PRINCIPAL])];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('read')(existing, group);

    expect(result).toEqual({
      admin: [],
      read: [READ_PRINCIPAL, TEST_PRINCIPAL],
    });
  });

  it('adds user group to existing admin permissions', () => {
    const existing = [adminPermission([ADMIN_PRINCIPAL])];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('admin')(existing, group);

    expect(result).toEqual({
      admin: [ADMIN_PRINCIPAL, TEST_PRINCIPAL],
      read: [],
    });
  });

  it('does not duplicate a user group if it already exists in that permission', () => {
    const existing = [readPermission([READ_PRINCIPAL])];
    const group = userGroup(READ_PRINCIPAL);

    const result = updateUserGroup('read')(existing, group);

    expect(result).toEqual({
      admin: [],
      read: [READ_PRINCIPAL],
    });
  });

  it('changes permission assignment of given user group in accordance with given permission', () => {
    const existing = [
      adminPermission([ADMIN_PRINCIPAL, TEST_PRINCIPAL]),
      readPermission([READ_PRINCIPAL]),
    ];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('read')(existing, group);

    expect(result).toEqual({
      admin: [ADMIN_PRINCIPAL],
      read: [READ_PRINCIPAL, TEST_PRINCIPAL],
    });
  });

  it('returns empty list for permission with group principals being null', () => {
    const existing = [adminPermission(null)];
    const group = userGroup(TEST_PRINCIPAL);

    const result = updateUserGroup('admin')(existing, group);

    expect(result).toEqual({
      read: [],
      admin: [TEST_PRINCIPAL],
    });
  });
});

const mockExistingPermissions = (permissions: UserGroupPermission[]) => {
  queryMock.mockResolvedValue({
    data: {
      vizGroup: {
        permissions: permissions,
      },
    },
  });
};

describe('_updateUserGroupPermission', () => {
  const EXISTING_PERMISSIONS = [readPermission([TEST_PRINCIPAL])];
  const UPDATED_PERMISSIONS: UserGroupPermissions = {
    read: [READ_PRINCIPAL],
    admin: [ADMIN_PRINCIPAL],
  };

  const actionMock = jest.fn();
  beforeEach(() => {
    actionMock.mockReset();
  });

  it('should query existing permissions', async () => {
    mockExistingPermissions(EXISTING_PERMISSIONS);
    actionMock.mockReturnValue(UPDATED_PERMISSIONS);

    await _updateUserGroupPermission(actionMock)(TENANT, VIZGROUP, USER_GROUP);

    expect(queryMock).toHaveBeenCalledWith({
      query: VIZ_GROUP_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
      },
    });
  });

  it('should call the action with the correct parameters', async () => {
    mockExistingPermissions(EXISTING_PERMISSIONS);
    actionMock.mockReturnValue(UPDATED_PERMISSIONS);

    await _updateUserGroupPermission(actionMock)(TENANT, VIZGROUP, USER_GROUP);

    expect(actionMock).toHaveBeenCalledWith(EXISTING_PERMISSIONS, USER_GROUP);
  });

  it('should call the mutation with the correct groups', async () => {
    mockExistingPermissions(EXISTING_PERMISSIONS);
    actionMock.mockReturnValue(UPDATED_PERMISSIONS);

    await _updateUserGroupPermission(actionMock)(TENANT, VIZGROUP, USER_GROUP);

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        readUserGroups: UPDATED_PERMISSIONS.read,
        adminUserGroups: UPDATED_PERMISSIONS.admin,
      },
    });
  });
});

describe('addUserGroupPermission & updateUserGroupPermission', () => {
  it.each([addUserGroupPermission, updateUserGroupPermission])(
    '%p: performs expected call for adding a permission for the given user group',
    async (testFunc) => {
      mockExistingPermissions([readPermission([READ_PRINCIPAL])]);

      await testFunc('read')(TENANT, VIZGROUP, userGroup(TEST_PRINCIPAL));

      expect(mutateMock).toHaveBeenCalledWith({
        mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          vizGroup: VIZGROUP,
          readUserGroups: [READ_PRINCIPAL, TEST_PRINCIPAL],
          adminUserGroups: [],
        },
      });
    },
  );

  it.each([addUserGroupPermission, updateUserGroupPermission])(
    '%p: performs expected call for when the same user group already exists for the relevant permission',
    async (testFunc) => {
      mockExistingPermissions([adminPermission([TEST_PRINCIPAL])]);

      await testFunc('admin')(TENANT, VIZGROUP, userGroup(TEST_PRINCIPAL));

      expect(mutateMock).toHaveBeenCalledWith({
        mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          vizGroup: VIZGROUP,
          readUserGroups: [],
          adminUserGroups: [TEST_PRINCIPAL],
        },
      });
    },
  );

  it.each([addUserGroupPermission, updateUserGroupPermission])(
    '%p: performs expected call for changing permission of existing user group',
    async (testFunc) => {
      mockExistingPermissions([
        {
          name: 'admin',
          groupPrincipals: [TEST_PRINCIPAL],
        },
      ]);

      await testFunc('read')(TENANT, VIZGROUP, userGroup(TEST_PRINCIPAL));

      expect(mutateMock).toHaveBeenCalledWith({
        mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          vizGroup: VIZGROUP,
          readUserGroups: [TEST_PRINCIPAL],
          adminUserGroups: [],
        },
      });
    },
  );

  it.each([addUserGroupPermission, updateUserGroupPermission])(
    '%p: performs expected call for no permissions already exist',
    async (testFunc) => {
      mockExistingPermissions([]);

      await testFunc('admin')(TENANT, VIZGROUP, userGroup(TEST_PRINCIPAL));

      expect(mutateMock).toHaveBeenCalledWith({
        mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          vizGroup: VIZGROUP,
          readUserGroups: [],
          adminUserGroups: [TEST_PRINCIPAL],
        },
      });
    },
  );

  it.each([addUserGroupPermission, updateUserGroupPermission])(
    '%p: performs expected call for viz-group without permissions',
    async (testFunc) => {
      queryMock.mockResolvedValue({
        data: {
          vizGroup: {},
        },
      });

      await testFunc('read')(TENANT, VIZGROUP, userGroup(TEST_PRINCIPAL));

      expect(mutateMock).toHaveBeenCalledWith({
        mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
        variables: {
          tenant: TENANT,
          vizGroup: VIZGROUP,
          readUserGroups: [TEST_PRINCIPAL],
          adminUserGroups: [],
        },
      });
    },
  );
});

describe('deleteUserGroupPermission', () => {
  it('performs expected call for removing the permissions that correspond to the given user group', async () => {
    mockExistingPermissions([
      adminPermission([TEST_PRINCIPAL]),
      readPermission([READ_PRINCIPAL, TEST_PRINCIPAL]),
    ]);

    await deleteUserGroupPermission(
      TENANT,
      VIZGROUP,
      userGroup(TEST_PRINCIPAL),
    );

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        readUserGroups: [READ_PRINCIPAL],
        adminUserGroups: [],
      },
    });
  });

  it('performs expected call for viz-group without permissions', async () => {
    queryMock.mockResolvedValue({
      data: {
        vizGroup: {},
      },
    });

    await deleteUserGroupPermission(
      TENANT,
      VIZGROUP,
      userGroup(TEST_PRINCIPAL),
    );

    expect(mutateMock).toHaveBeenCalledWith({
      mutation: MUTATE_VIZ_GROUP_PERMISSIONS,
      variables: {
        tenant: TENANT,
        vizGroup: VIZGROUP,
        readUserGroups: [],
        adminUserGroups: [],
      },
    });
  });
});
