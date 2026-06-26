import {
  filterNotAlreadyShared,
  hasUnknownPermissions,
  internal,
  SharedGroup,
  toSharedGroups,
} from '@/app/_lib/resource-api/util/shared-groups';
import { ProjectGroupPermissions } from '@/app/_lib/resource-api/graphql/project';
import { VizGroupGroupPermissions } from '@/app/_lib/resource-api/graphql/vizGroups';

const projectGroupPermissions = (permissions: unknown) =>
  ({
    data: { project: { permissions: permissions } },
  }) as ProjectGroupPermissions;

const vizGroupGroupPermissions = (permissions: unknown) =>
  ({
    data: { vizGroup: { permissions: permissions } },
  }) as VizGroupGroupPermissions;

describe('toSharedGroups', () => {
  describe.each([projectGroupPermissions, vizGroupGroupPermissions])(
    `%p`,
    (mkResult) => {
      it.each([
        ['undefined', undefined, []],
        ['empty permission list', [], []],
        ['empty principal list', [{ name: 'admin', groupPrincipals: [] }], []],
        [
          'single permission and with single principal',
          [
            {
              name: 'admin',
              groupPrincipals: [{ group: 'name', tenant: 'tenant' }],
            },
          ],
          [
            {
              name: 'name',
              tenant: 'tenant',
              permissionName: 'admin',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
          ],
        ],
        [
          'single permission and with multiple principals',
          [
            {
              name: 'read',
              groupPrincipals: [
                { group: 'name1', tenant: 'tenant' },
                { group: 'name2', tenant: 'tenant' },
              ],
            },
          ],
          [
            {
              name: 'name1',
              tenant: 'tenant',
              permissionName: 'read',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
            {
              name: 'name2',
              tenant: 'tenant',
              permissionName: 'read',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
          ],
        ],
        [
          'multiple permissions and with multiple principals',
          [
            {
              name: 'admin',
              groupPrincipals: [
                { group: 'name1', tenant: 'tenant1' },
                { group: 'name2', tenant: 'tenant2' },
              ],
            },
            {
              name: 'read',
              groupPrincipals: [
                { group: 'name3', tenant: 'tenant1' },
                { group: 'name4', tenant: 'tenant2' },
              ],
            },
          ],
          [
            {
              name: 'name1',
              tenant: 'tenant1',
              permissionName: 'admin',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
            {
              name: 'name2',
              tenant: 'tenant2',
              permissionName: 'admin',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
            {
              name: 'name3',
              tenant: 'tenant1',
              permissionName: 'read',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
            {
              name: 'name4',
              tenant: 'tenant2',
              permissionName: 'read',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
          ],
        ],
      ])('should handle %s', (_, permissions, expected) => {
        const sharedGroups = toSharedGroups(mkResult(permissions));

        expect(sharedGroups).toEqual(expected);
      });

      it.each([
        [
          'only unknown',
          [
            {
              name: 'unknown1',
              groupPrincipals: [{ group: 'name', tenant: 'tenant' }],
            },
            {
              name: 'unknown2',
              groupPrincipals: [{ group: 'name', tenant: 'tenant' }],
            },
          ],
          [],
        ],
        [
          'admin and unknown',
          [
            {
              name: 'admin',
              groupPrincipals: [{ group: 'name', tenant: 'tenant' }],
            },
            {
              name: 'unknown',
              groupPrincipals: [{ group: 'name', tenant: 'tenant' }],
            },
          ],
          [
            {
              name: 'name',
              tenant: 'tenant',
              permissionName: 'admin',
              unknownPermissions: true,
              _tag: 'SharedGroup',
            },
          ],
        ],
        [
          'admin, read and unknown',
          [
            {
              name: 'admin',
              groupPrincipals: [{ group: 'name1', tenant: 'tenant' }],
            },
            {
              name: 'read',
              groupPrincipals: [{ group: 'name2', tenant: 'tenant' }],
            },
            {
              name: 'unknown',
              groupPrincipals: [{ group: 'name1', tenant: 'tenant' }],
            },
          ],
          [
            {
              name: 'name1',
              tenant: 'tenant',
              permissionName: 'admin',
              unknownPermissions: true,
              _tag: 'SharedGroup',
            },
            {
              name: 'name2',
              tenant: 'tenant',
              permissionName: 'read',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
          ],
        ],
        [
          'with same name in different tenants',
          [
            {
              name: 'admin',
              groupPrincipals: [{ group: 'name1', tenant: 'tenant1' }],
            },
            {
              name: 'unknown',
              groupPrincipals: [{ group: 'name1', tenant: 'tenant2' }],
            },
          ],
          [
            {
              name: 'name1',
              tenant: 'tenant1',
              permissionName: 'admin',
              unknownPermissions: false,
              _tag: 'SharedGroup',
            },
          ],
        ],
      ])('should handle permissions & %s', (_, permissions, expected) => {
        const sharedGroups = toSharedGroups(mkResult(permissions));

        expect(sharedGroups).toEqual(expected);
      });
    },
  );
});

describe('hasUnknownPermissions', () => {
  describe.each([projectGroupPermissions, vizGroupGroupPermissions])(
    `%p`,
    (mkResult) => {
      it(`should return false when there are no permissions`, () => {
        const permissions: unknown[] = [];

        const hasUnknown = hasUnknownPermissions(mkResult(permissions));

        expect(hasUnknown).toBe(false);
      });

      it('should return false when there are only admin and read permissions', () => {
        const permissions = [
          { name: 'admin', groupPrincipals: [], scopes: [] },
          { name: 'read', groupPrincipals: [], scopes: [] },
        ];

        const hasUnknown = hasUnknownPermissions(mkResult(permissions));

        expect(hasUnknown).toBe(false);
      });

      it('should return true when there are unknown permissions', () => {
        const permissions = [
          { name: 'admin', groupPrincipals: [], scopes: [] },
          { name: 'unknown', groupPrincipals: [], scopes: [] },
        ];

        const hasUnknown = hasUnknownPermissions(mkResult(permissions));

        expect(hasUnknown).toBe(true);
      });
    },
  );
});

describe('filterAlreadyShared', () => {
  it('returns an empty array if adminGroups is empty', () => {
    const result = filterNotAlreadyShared([], []);
    expect(result).toEqual([]);
  });

  it('returns the same array if sharedGroups is empty', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ];

    const result = filterNotAlreadyShared(adminGroups, []);

    expect(result).toEqual(adminGroups);
    expect(result).not.toBe(adminGroups);
  });

  it('filters out matching groups when both arrays have matching name & tenant', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
      { name: 'Admin3', tenant: 'TenantC' },
    ];
    const sharedGroups = [
      { name: 'Admin2', tenant: 'TenantB' },
    ] as SharedGroup[];

    const result = filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(result).toEqual([
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin3', tenant: 'TenantC' },
    ]);
  });

  it('keeps admin groups that do not exactly match sharedGroups', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin1', tenant: 'TenantB' },
      { name: 'Admin2', tenant: 'TenantA' },
    ];
    const sharedGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
    ] as SharedGroup[];

    const result = filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(result).toEqual([
      { name: 'Admin1', tenant: 'TenantB' },
      { name: 'Admin2', tenant: 'TenantA' },
    ]);
  });

  it('removes all admin groups if all match sharedGroups', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ];
    const sharedGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ] as SharedGroup[];

    const result = filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(result).toEqual([]);
  });

  it('handles duplicate admin groups correctly', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ];
    const sharedGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
    ] as SharedGroup[];

    const result = filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(result).toEqual([{ name: 'Admin2', tenant: 'TenantB' }]);
  });

  it('handles cases where sharedGroups has duplicates', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ];
    const sharedGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin1', tenant: 'TenantA' },
    ] as SharedGroup[];

    const result = filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(result).toEqual([{ name: 'Admin2', tenant: 'TenantB' }]);
  });

  it('does not mutate the original adminGroups array', () => {
    const adminGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
      { name: 'Admin2', tenant: 'TenantB' },
    ];
    const adminGroupsCopy = [...adminGroups];
    const sharedGroups = [
      { name: 'Admin1', tenant: 'TenantA' },
    ] as SharedGroup[];

    filterNotAlreadyShared(adminGroups, sharedGroups);

    expect(adminGroups).toEqual(adminGroupsCopy);
  });
});

describe('mkSharedGroups', () => {
  it('should return a SharedGroup object', () => {
    const sharedGroup = internal.mkSharedGroup('name', 'tenant', 'admin');

    expect(sharedGroup).toEqual({
      name: 'name',
      tenant: 'tenant',
      permissionName: 'admin',
      unknownPermissions: false,
      _tag: 'SharedGroup',
    });
  });

  it('should return a SharedGroup object with unknownPermissions', () => {
    const sharedGroup = internal.mkSharedGroup('name', 'tenant', 'admin', true);

    expect(sharedGroup).toEqual({
      name: 'name',
      tenant: 'tenant',
      permissionName: 'admin',
      unknownPermissions: true,
      _tag: 'SharedGroup',
    });
  });
});
