import { mutate, query } from '@/app/_lib/resource-api/client';
import { FuncMock } from '@/app/_test/utils';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import {
  addGroupPermission,
  addVizGroupPermission,
  deleteGroupPermission,
  deleteVizGroupPermission,
  fetchAllProjects,
  internal,
  mutateCreateProject,
  mutateDeleteProject,
  queryProjectGroupPermissions,
  updateGroupPermission,
  updateVizGroupPermission,
} from '@/app/_lib/resource-api/graphql/project';

const {
  ALL_PROJECTS,
  DELETE_PROJECT,
  CREATE_PROJECT,
  PROJECT_GROUP_PERMISSIONS,
  MUTATE_PROJECT_PERMISSIONS,
  MUTATE_PROJECT_VIZ_PERMISSIONS,
  updateGroup,
  removeGroup,
  _updateGroupPermission,
} = internal;

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));
jest.mock('@/app/_lib/resource-api/legacy', () => ({
  requireTenant: jest.fn(),
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

beforeAll(() => {
  requireTenantMock.mockResolvedValue('tenant1');
});

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

describe('fetchAllProjects', () => {
  it('should call the client with the correct query', async () => {
    await fetchAllProjects();

    expect(mockQuery).toHaveBeenCalledWith({
      query: ALL_PROJECTS,
    });
  });
});

describe('mutateCreateProject', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateCreateProject('name');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: CREATE_PROJECT,
      variables: {
        project: 'name',
        tenant: 'tenant1',
      },
    });
  });
});

describe('mutateDeleteProject', () => {
  it('should call the client with the correct mutation', async () => {
    await mutateDeleteProject('tenant1', 'name');

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: DELETE_PROJECT,
      variables: {
        project: 'name',
        tenant: 'tenant1',
      },
    });
  });
});

describe('queryProjectGroupPermissions', () => {
  it('should call the client with the correct query', async () => {
    await queryProjectGroupPermissions('tenant1', 'project1');

    expect(mockQuery).toHaveBeenCalledWith({
      query: PROJECT_GROUP_PERMISSIONS,
      variables: {
        project: 'project1',
        tenant: 'tenant1',
      },
    });
  });
});

describe('_updateGroupPermission', () => {
  const updated = {
    read: [{ tenant: 'tenant1', group: 'read-group' }],
    admin: [{ tenant: 'tenant1', group: 'admin-group' }],
  };
  const actionMock = jest.fn();

  beforeEach(() => {
    actionMock.mockReset().mockReturnValue(updated);
    mockQuery.mockResolvedValue({
      data: {
        project: {
          permissions: [
            {
              name: 'read',
              groupPrincipals: [
                {
                  tenant: 'tenant1',
                  group: 'existing-group',
                },
              ],
            },
          ],
        },
      },
    });
  });

  it('should query existing permissions', async () => {
    await _updateGroupPermission(actionMock)('tenant1', 'project1', {
      tenant: 'tenant1',
      name: 'group1',
    });

    expect(mockQuery).toHaveBeenCalledWith({
      query: PROJECT_GROUP_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'project1',
      },
    });
  });

  it('should call the action with the correct parameters', async () => {
    await _updateGroupPermission(actionMock)('tenant1', 'project1', {
      tenant: 'tenant1',
      name: 'grp',
    });

    expect(actionMock).toHaveBeenCalledWith(
      [
        {
          name: 'read',
          groupPrincipals: [{ tenant: 'tenant1', group: 'existing-group' }],
        },
      ],
      { tenant: 'tenant1', name: 'grp' },
    );
  });

  it('should call the mutation with the correct groups', async () => {
    await _updateGroupPermission(actionMock)('tenant1', 'project1', {
      tenant: 'tenant1',
      name: 'grp',
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_PROJECT_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'project1',
        readGroups: updated.read,
        adminGroups: updated.admin,
      },
    });
  });
});

describe('updateGroup', () => {
  it('should add group to read permission when no existing permissions exist', () => {
    const group = { name: 'read-group', tenant: 'tenant1' };
    const result = updateGroup('read')([], group);

    expect(result).toEqual({
      read: [{ tenant: 'tenant1', group: 'read-group' }],
      admin: [],
    });
  });

  it('should add group to admin permission when no existing permissions exist', () => {
    const group = { name: 'admin-group', tenant: 'tenant1' };
    const result = updateGroup('admin')([], group);

    expect(result).toEqual({
      read: [],
      admin: [{ tenant: 'tenant1', group: 'admin-group' }],
    });
  });

  it('should add group to admin permissions without removing existing admin groups', () => {
    const existing = [
      {
        name: 'admin',
        groupPrincipals: [{ tenant: 'tenant1', group: 'admin-group' }],
      },
    ];
    const group = { name: 'new-admin', tenant: 'tenant1' };
    const result = updateGroup('admin')(existing, group);

    expect(result).toEqual({
      read: [],
      admin: [
        { tenant: 'tenant1', group: 'admin-group' },
        { tenant: 'tenant1', group: 'new-admin' },
      ],
    });
  });

  it('should not duplicate a group if it already exists in that permission', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: [{ tenant: 'tenant1', group: 'existing-read-group' }],
      },
    ];
    const group = { name: 'existing-read-group', tenant: 'tenant1' };
    const result = updateGroup('read')(existing, group);

    expect(result).toEqual({
      read: [{ tenant: 'tenant1', group: 'existing-read-group' }],
      admin: [],
    });
  });

  it('should remove group from admin permission and add it to read', () => {
    const existing = [
      {
        name: 'admin',
        groupPrincipals: [
          { tenant: 'tenant1', group: 'my-group' },
          { tenant: 'tenant1', group: 'some-other-group' },
        ],
      },
      {
        name: 'read',
        groupPrincipals: [{ tenant: 'tenant1', group: 'read-group' }],
      },
    ];
    const group = { name: 'my-group', tenant: 'tenant1' };

    const result = updateGroup('read')(existing, group);

    expect(result).toEqual({
      read: [
        { tenant: 'tenant1', group: 'read-group' },
        { tenant: 'tenant1', group: 'my-group' },
      ],
      admin: [{ tenant: 'tenant1', group: 'some-other-group' }],
    });
  });

  it('should handle null groupPrincipals gracefully', () => {
    const existing = [
      {
        name: 'admin',
        groupPrincipals: null,
      },
    ];
    const group = { name: 'admin-group', tenant: 'tenant1' };
    const result = updateGroup('admin')(existing, group);

    expect(result).toEqual({
      read: [],
      admin: [{ tenant: 'tenant1', group: 'admin-group' }],
    });
  });
});

describe('removeGroup', () => {
  it('should remove group from both read and admin permission', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: [
          { tenant: 'tenant1', group: 'read-group' },
          { tenant: 'tenant1', group: 'remove-me' },
        ],
      },
      {
        name: 'admin',
        groupPrincipals: [{ tenant: 'tenant1', group: 'remove-me' }],
      },
    ];

    const result = removeGroup(existing, {
      tenant: 'tenant1',
      name: 'remove-me',
    });

    expect(result).toEqual({
      read: [{ tenant: 'tenant1', group: 'read-group' }],
      admin: [],
    });
  });

  it('should do nothing if the group does not exist in any permission', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: [{ tenant: 'tenant1', group: 'read-group' }],
      },
    ];

    const result = removeGroup(existing, {
      tenant: 'tenant1',
      name: 'non-existent',
    });

    expect(result).toEqual({
      read: [{ tenant: 'tenant1', group: 'read-group' }],
      admin: [],
    });
  });

  it('should handle null groupPrincipals gracefully', () => {
    const existing = [
      {
        name: 'read',
        groupPrincipals: null,
      },
      {
        name: 'admin',
        groupPrincipals: [{ tenant: 'tenant1', group: 'some-admin' }],
      },
    ];

    const result = removeGroup(existing, {
      tenant: 'tenant1',
      name: 'some-admin',
    });

    expect(result).toEqual({
      read: [],
      admin: [],
    });
  });
});

describe('addGroupPermission & updateGroupPermission', () => {
  it.each([addGroupPermission, updateGroupPermission])(
    '%p: should call client with the correct mutation for adding a permission',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            permissions: [
              {
                name: 'read',
                groupPrincipals: [
                  {
                    tenant: 'tenant1',
                    group: 'existing-group',
                  },
                ],
              },
            ],
          },
        },
      });

      await f('read')('tenant1', 'project1', {
        name: 'new-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project1',
          readGroups: [
            { tenant: 'tenant1', group: 'existing-group' },
            { tenant: 'tenant1', group: 'new-group' },
          ],
          adminGroups: [],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: should do nothing if the exact group & permission already exists',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            permissions: [
              {
                name: 'admin',
                groupPrincipals: [
                  {
                    tenant: 'tenant1',
                    group: 'existing-group',
                  },
                ],
              },
            ],
          },
        },
      });

      await f('admin')('tenant1', 'project3', {
        name: 'existing-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project3',
          readGroups: [],
          adminGroups: [{ tenant: 'tenant1', group: 'existing-group' }],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: should handle cases where permission of existing group is changed',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            permissions: [
              {
                name: 'admin',
                groupPrincipals: [
                  {
                    tenant: 'tenant1',
                    group: 'existing-group',
                  },
                ],
              },
            ],
          },
        },
      });

      await f('read')('tenant1', 'project3', {
        name: 'existing-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project3',
          readGroups: [{ tenant: 'tenant1', group: 'existing-group' }],
          adminGroups: [],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: should handle cases where no existing permissions are found',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            permissions: [],
          },
        },
      });

      await f('admin')('tenant1', 'project2', {
        name: 'admin-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project2',
          readGroups: [],
          adminGroups: [{ tenant: 'tenant1', group: 'admin-group' }],
        },
      });
    },
  );

  it.each([addGroupPermission, updateGroupPermission])(
    '%p: should handle a project without permissions',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {},
        },
      });

      await f('read')('tenant1', 'project4', {
        name: 'new-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project4',
          readGroups: [{ tenant: 'tenant1', group: 'new-group' }],
          adminGroups: [],
        },
      });
    },
  );
});

describe('deleteGroupPermission', () => {
  it('should remove the group from permissions and call the correct mutation', async () => {
    mockQuery.mockResolvedValue({
      data: {
        project: {
          permissions: [
            {
              name: 'read',
              groupPrincipals: [
                { tenant: 'tenant1', group: 'del-group' },
                { tenant: 'tenant1', group: 'keep-group' },
              ],
            },
            {
              name: 'admin',
              groupPrincipals: [{ tenant: 'tenant1', group: 'del-group' }],
            },
          ],
        },
      },
    });

    await deleteGroupPermission('tenant1', 'proj5', {
      name: 'del-group',
      tenant: 'tenant1',
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_PROJECT_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'proj5',
        readGroups: [{ tenant: 'tenant1', group: 'keep-group' }],
        adminGroups: [],
      },
    });
  });

  it('should handle a project without permissions', async () => {
    mockQuery.mockResolvedValue({
      data: {
        project: {},
      },
    });

    await deleteGroupPermission('tenant1', 'proj6', {
      name: 'non-existent',
      tenant: 'tenant1',
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_PROJECT_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'proj6',
        readGroups: [],
        adminGroups: [],
      },
    });
  });
});

describe('addVizGroupPermission & updateVizGroupPermission', () => {
  it.each([addVizGroupPermission, updateVizGroupPermission])(
    '%p: should call client with the correct mutation for adding a visualization permission',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            vizPermissions: [
              {
                name: 'viz-group-read',
                groupPrincipals: [
                  {
                    tenant: 'tenant1',
                    group: 'existing-viz-group',
                  },
                ],
              },
            ],
          },
        },
      });

      await f('viz-group-read')('tenant1', 'project1', {
        name: 'new-viz-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_VIZ_PERMISSIONS,
        variables: {
          project: 'project1',
          tenant: 'tenant1',
          readGroups: [{ tenant: 'tenant1', vizGroup: 'new-viz-group' }],
        },
      });
    },
  );

  it.each([addVizGroupPermission, updateVizGroupPermission])(
    '%p: should handle cases where no existing visualization permissions are found',
    async (f) => {
      mockQuery.mockResolvedValue({
        data: {
          project: {
            vizPermissions: [],
          },
        },
      });

      await f('viz-group-read')('tenant1', 'project2', {
        name: 'edit-viz-group',
        tenant: 'tenant1',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        mutation: MUTATE_PROJECT_VIZ_PERMISSIONS,
        variables: {
          tenant: 'tenant1',
          project: 'project2',
          readGroups: [{ tenant: 'tenant1', vizGroup: 'edit-viz-group' }],
        },
      });
    },
  );
});

describe('deleteVizGroupPermission', () => {
  it('should remove the visualization group from permissions and call the correct mutation', async () => {
    mockQuery.mockResolvedValue({
      data: {
        project: {
          vizPermissions: [
            {
              name: 'view',
              groupPrincipals: [
                { tenant: 'tenant1', vizGroup: 'del-viz-group' },
                { tenant: 'tenant1', vizGroup: 'keep-viz-group' },
              ],
            },
            {
              name: 'edit',
              groupPrincipals: [
                { tenant: 'tenant1', vizGroup: 'del-viz-group' },
              ],
            },
          ],
        },
      },
    });

    await deleteVizGroupPermission('tenant1', 'proj5', {
      name: 'del-viz-group',
      tenant: 'tenant1',
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_PROJECT_VIZ_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'proj5',
        readGroups: [],
      },
    });
  });

  it('should handle a project without visualization permissions', async () => {
    mockQuery.mockResolvedValue({
      data: {
        project: {},
      },
    });

    await deleteVizGroupPermission('tenant1', 'proj6', {
      name: 'non-existent',
      tenant: 'tenant1',
    });

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MUTATE_PROJECT_VIZ_PERMISSIONS,
      variables: {
        tenant: 'tenant1',
        project: 'proj6',
        readGroups: [],
      },
    });
  });
});
