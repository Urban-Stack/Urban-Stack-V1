import {
  DashboardId,
  filterDashboards,
  mkDashboardHref,
  populateDashboards,
  sanitizeDashboards,
  slugDetails,
  toDateString,
  toUsername,
  unsafeSlugDetails,
} from '@/app/_lib/superset/util';
import {
  generateDashboardsMock,
  generateSanitizedDashboardsMock,
} from '@/app/_test/superset.util';
import {
  Dashboard,
  DashboardResponseRaw,
  FavoriteStatusType,
} from '@/app/_lib/superset/types';
import { range } from 'lodash';
import {
  internal,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';

const TEST_TENANT = 'test-tenant';
const TEST_VIZ_GROUP = 'test-viz-group';
const TEST_INDEX = 1;

describe('filterDashboards', () => {
  const dashboards = generateSanitizedDashboardsMock([
    {
      dashboard_title: 'First Dash',
      favorite: true,
      vizGroup: 'vg1',
      tenant: 't1',
      published: true,
    },
    {
      dashboard_title: 'Second Board',
      favorite: false,
      vizGroup: 'vg1',
      tenant: 't1',
      published: false,
    },
    {
      dashboard_title: 'Third Dash',
      favorite: true,
      vizGroup: 'vg2',
      tenant: 't1',
      published: true,
    },
    {
      dashboard_title: 'Unrelated Board',
      favorite: false,
      vizGroup: 'vg2',
      tenant: 't2',
      published: false,
    },
  ]);

  it('returns all dashboards if no filters applied', () => {
    expect(filterDashboards(dashboards, {})).toEqual(dashboards);
  });

  it('filters by search text only', () => {
    const result = filterDashboards(dashboards, { searchText: 'dash' });
    expect(result).toEqual([dashboards[0], dashboards[2]]);
  });

  it('returns empty array if no Dashboard matches the given search text', () => {
    const result = filterDashboards(dashboards, { searchText: 'hamster' });
    expect(result).toHaveLength(0);
  });

  test('does not include dashboards with missing title when searching by title', () => {
    const ds = [
      ...dashboards,
      { dashboard_title: undefined, favorite: true },
    ] as Dashboard[];
    const searchText = ' '; // non-empty search text

    const filteredDashboards = filterDashboards(ds, { searchText });

    expect(filteredDashboards).toEqual(dashboards);
  });

  it('filters by favorites only', () => {
    const result = filterDashboards(dashboards, { favorites: true });
    expect(result).toEqual([dashboards[0], dashboards[2]]);
  });

  it('filters by both search text and favorites', () => {
    const result = filterDashboards(dashboards, {
      searchText: 'dash',
      favorites: true,
    });
    expect(result).toEqual([dashboards[0], dashboards[2]]);
  });

  it('returns all dashboards if favorites=false', () => {
    const result = filterDashboards(dashboards, { favorites: false });
    expect(result).toEqual(dashboards);
  });

  it('ignores favorites filter when undefined', () => {
    const result = filterDashboards(dashboards, { favorites: undefined });
    expect(result).toEqual(dashboards);
  });

  it('filters by status "published"', () => {
    const ds = generateSanitizedDashboardsMock([
      { dashboard_title: 'Pub 1', published: true },
      { dashboard_title: 'Intern 1', published: false },
      { dashboard_title: 'Pub 2', published: true },
    ]);
    const result = filterDashboards(ds, { status: ['published'] });
    expect(result).toEqual([ds[0], ds[2]]);
  });

  it('filters by status "draft"', () => {
    const result = filterDashboards(dashboards, { status: ['intern'] });
    expect(result).toEqual([dashboards[1], dashboards[3]]);
  });

  it('returns all dashboards if status includes both intern and published', () => {
    const result = filterDashboards(dashboards, {
      status: ['intern', 'published'],
    });
    expect(result).toEqual(dashboards);
  });

  it('filters by matching vizGroup and tenant', () => {
    const vizGroups: VizGroup[] = [internal.mkVizGroup('vg1', 't1')];
    const result = filterDashboards(dashboards, { vizGroups });
    expect(result).toEqual([dashboards[0], dashboards[1]]);
  });

  it('combines vizGroup with favorites and searchText', () => {
    const vizGroups: VizGroup[] = [internal.mkVizGroup('vg1', 't1')];
    const result = filterDashboards(dashboards, {
      vizGroups,
      favorites: true,
      searchText: 'dash',
    });
    expect(result).toEqual([dashboards[0]]);
  });
});

describe('mkDashboardHref', () => {
  const slug = 'tenant_vizgroup_name';
  const dashboard: Dashboard = generateSanitizedDashboardsMock([{ slug }])[0];

  it('returns the correct href for the given dashboard', () => {
    const href = mkDashboardHref(dashboard);
    expect(href).toEqual(`/dashboards/${dashboard.slug}`);
  });

  it('returns the correct href for the given dashboard with edit mode', () => {
    const href = mkDashboardHref(dashboard, true);
    expect(href).toEqual(`/dashboards/${dashboard.slug}?edit=true`);
  });

  it('returns the correct href for the given dashboard slug', () => {
    const href = mkDashboardHref(slug);
    expect(href).toEqual(`/dashboards/${slug}`);
  });

  it('returns the correct href for the given dashboard slug with edit mode', () => {
    const href = mkDashboardHref(slug, true);
    expect(href).toEqual(`/dashboards/${slug}?edit=true`);
  });
});

describe('populateDashboards', () => {
  it('returns the internal representations of the given dashboards having the given favorite statuses', () => {
    const dashboards = generateSanitizedDashboardsMock();
    const favStatuses = dashboards.map(
      (dashboard) =>
        ({
          id: dashboard.id,
          value: Math.random() < 0.5,
        }) as FavoriteStatusType,
    );

    const populatedDashboards = populateDashboards(dashboards, favStatuses);

    expect(populatedDashboards[0].favorite).toBe(favStatuses[0].value);
    expect(populatedDashboards[1].favorite).toBe(favStatuses[1].value);
    expect(populatedDashboards[2].favorite).toBe(favStatuses[2].value);
  });

  it('returns empty array if empty array given', () => {
    const dashboards: Dashboard[] = [];

    const populatedDashboards = populateDashboards(dashboards);

    expect(populatedDashboards).toHaveLength(0);
  });

  it('disregards missing favorite statuses', () => {
    const dashboardIds = [0, 1, 2];
    const favStatusIds = [0, 2]; // missing favorite status for dashboard with ID 1
    const dashboards = generateSanitizedDashboardsMock(
      dashboardIds.map((index) => ({ id: index })),
    );
    const favStatuses = favStatusIds.map(
      (index) =>
        ({ id: index, value: Math.random() < 0.5 }) as FavoriteStatusType,
    );

    const populatedDashboards = populateDashboards(dashboards, favStatuses);

    expect(populatedDashboards).toHaveLength(dashboards.length);
    expect(populatedDashboards[0].favorite).toBe(favStatuses[0].value);
    expect(populatedDashboards[1].favorite).toBeUndefined();
    expect(populatedDashboards[2].favorite).toBe(favStatuses[1].value);
  });

  it('ignores favorite statuses of unknown dashboard IDs', () => {
    const dashboardIds = [0, 2];
    const favStatusIds = [0, 1, 2]; // includes favorite status for unknown dashboard ID 1
    const dashboards = generateSanitizedDashboardsMock(
      dashboardIds.map((index) => ({ id: index })),
    );
    const favStatuses = favStatusIds.map(
      (index) =>
        ({ id: index, value: Math.random() < 0.5 }) as FavoriteStatusType,
    );

    const populatedDashboards = populateDashboards(dashboards, favStatuses);

    expect(populatedDashboards).toHaveLength(dashboards.length);
    expect(populatedDashboards[0].favorite).toBe(favStatuses[0].value);
    expect(populatedDashboards[1].favorite).toBe(favStatuses[2].value);
  });

  it('replaces any favorite statuses of dashboards with undefined if no favorite statuses given', () => {
    const originalFavStatuses = [true, false, undefined];
    const dashboards = generateSanitizedDashboardsMock(
      originalFavStatuses.map((favStatus) => ({ favorite: favStatus })),
    );

    const populatedDashboards = populateDashboards(dashboards, undefined);

    dashboards.forEach((dashboard, index) => {
      expect(populatedDashboards[index]).toEqual({
        ...dashboard,
        favorite: undefined,
      });
    });
  });
});

describe('sanitizeDashboards', () => {
  it('returns the internal representations of the given dashboards', () => {
    const testSlug = `${TEST_TENANT}_${TEST_VIZ_GROUP}_dashboard-123`;
    const dashboards = generateDashboardsMock(
      range(0, 3).map((_) => ({ slug: testSlug })),
    );

    const sanitizedDashboards = sanitizeDashboards(dashboards);

    const originalDashboard = dashboards[TEST_INDEX];
    expect(sanitizedDashboards[TEST_INDEX]).toEqual({
      changed_on_utc: originalDashboard.changed_on_utc,
      created_by: originalDashboard.created_by,
      dashboard_title: originalDashboard.dashboard_title,
      favorite: undefined,
      id: originalDashboard.id,
      slug: originalDashboard.slug,
      tags: originalDashboard.tags,
      thumbnail_url: originalDashboard.thumbnail_url,
      vizGroup: TEST_VIZ_GROUP,
      tenant: TEST_TENANT,
      published: originalDashboard.published,
    });
  });

  it('returns empty array if empty array given', () => {
    const dashboards: DashboardResponseRaw[] = [];

    const sanitizedDashboards = sanitizeDashboards(dashboards);

    expect(sanitizedDashboards).toHaveLength(0);
  });

  it('returns the internal representations of the given dashboards reduced to the explicit tags', () => {
    // type 1 = explicit tags
    const explicitTag1 = { id: 1, name: 'Explicit Tag 1', type: 1 };
    const explicitTag2 = { id: 2, name: 'Explicit Tag 2', type: 1 };
    const implicitTag1 = { id: 3, name: 'Implicit Tag 1', type: 2 };
    const implicitTag2 = { id: 4, name: 'Implicit Tag 2', type: 3 };
    const implicitTag3 = { id: 5, name: 'Implicit Tag 3', type: 4 };
    const dashboards = generateDashboardsMock([
      { tags: [explicitTag1, explicitTag2] },
      { tags: [explicitTag1, implicitTag1, implicitTag3] },
      { tags: [implicitTag1, implicitTag2, implicitTag3] },
    ]);

    const internalDashboards = sanitizeDashboards(dashboards);

    expect(internalDashboards[0].tags).toEqual([explicitTag1, explicitTag2]);
    expect(internalDashboards[1].tags).toEqual([explicitTag1]);
    expect(internalDashboards[2].tags).toEqual([]);
  });

  it('disregards dashboard tags without a name', () => {
    const tagWithNameMissing = { id: 1, name: null, type: 1 };
    const tagWithEmptyName = { id: 2, name: '', type: 1 };
    const tagWithNonEmptyName = { id: 3, name: 'Test tag', type: 1 };
    const dashboards = generateDashboardsMock();
    dashboards[TEST_INDEX].tags = [
      tagWithNameMissing,
      tagWithEmptyName,
      tagWithNonEmptyName,
    ];

    const internalDashboards = sanitizeDashboards(dashboards);

    expect(internalDashboards[TEST_INDEX].tags).toEqual([tagWithNonEmptyName]);
  });
});

describe('toDateString', () => {
  test('returns correct string representation for given Date', () => {
    const date = new Date(2024, 7, 15);

    const dateString = toDateString(date);

    expect(dateString).toEqual('15. August 2024');
  });
});

describe('toUsername', () => {
  test('returns empty string if first and last name both are missing', () => {
    expect(toUsername(undefined, undefined)).toEqual('');
  });

  test('returns first name only if last name is missing', () => {
    expect(toUsername('Some', undefined)).toEqual('Some');
  });

  test('returns last name only if first name is missing', () => {
    expect(toUsername(undefined, 'User')).toEqual('User');
  });

  test('returns full name if first and last name both are given', () => {
    expect(toUsername('Some', 'User')).toEqual('Some User');
  });
});

describe('slugDetails', () => {
  it('returns DashboardId for a valid slug', () => {
    const expected: DashboardId = {
      tenant: 'tenant1',
      vizGroup: 'vizgroup1',
      name: 'dashboard1',
    };

    const result = slugDetails('tenant1_vizgroup1_dashboard1');

    expect(result).toEqual(expected);
  });

  it('supports dash', () => {
    const expected: DashboardId = {
      tenant: 'tenant-1',
      vizGroup: 'viz-group-1',
      name: 'dashboard-1',
    };

    const result = slugDetails('tenant-1_viz-group-1_dashboard-1');

    expect(result).toEqual(expected);
  });

  it.each([
    'short_slug', // not enough segments
    'tenant_group', // only 2 parts
    'tenant_group_', // ends with separator
    'tenant1__dashboard1', // empty middle segment
    'tenant1_group1_DASHBOARD', // uppercase
    'TENANT1_GROUP1_DASHBOARD1', // uppercase
    'tenant1-group1-dashboard1', // wrong separator
    'tenant!_group1_dash', // invalid character
    '___', // only underscores
    '', // empty string
  ])('returns undefined for invalid slug: "%s"', (slug) => {
    expect(slugDetails(slug)).toBeUndefined();
  });
});

describe('unsafeSlugDetails', () => {
  it('returns DashboardId for a valid slug', () => {
    const expected: DashboardId = {
      tenant: 'tenant1',
      vizGroup: 'vizgroup1',
      name: 'dashboard1',
    };

    const result = unsafeSlugDetails('tenant1_vizgroup1_dashboard1');

    expect(result).toEqual(expected);
  });

  it.each([
    'short_slug', // not enough segments
    'tenant_group', // only 2 parts
    'tenant_group_', // ends with separator
    'tenant1__dashboard1', // empty middle segment
    'tenant1_group1_DASHBOARD', // uppercase
    'TENANT1_GROUP1_DASHBOARD1', // uppercase
    'tenant1-group1-dashboard1', // wrong separator
    'tenant!_group1_dash', // invalid character
    '___', // only underscores
    '', // empty string
  ])('throws for invalid slug: "%s"', (slug) => {
    expect(() => unsafeSlugDetails(slug)).toThrow();
  });
});
