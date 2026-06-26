import { filterDashboards } from '@/app/[tenant]/dashboards/_internal/util';
import { Dashboard } from '@/app/_lib/superset';

describe('filterDashboards', () => {
  const dashboards = [
    {
      title: 'First Dash',
      slug: 'first-dashboard',
    },
    {
      title: 'Second Board',
      slug: 'second-dashboard',
    },
    {
      title: 'Third Dash',
      slug: 'third-dashboard',
    },
    {
      title: 'Unrelated Board',
      slug: 'unrelated-board',
    },
  ] as Dashboard[];

  it('returns all dashboards if no filters applied', () => {
    expect(filterDashboards(dashboards, {})).toEqual(dashboards);
  });

  it('filters by search text', () => {
    const result = filterDashboards(dashboards, { searchText: 'dash' });
    expect(result).toEqual([dashboards[0], dashboards[2]]);
  });

  it('returns empty array if no Dashboard matches the given search text', () => {
    const result = filterDashboards(dashboards, { searchText: 'hamster' });
    expect(result).toHaveLength(0);
  });

  test('does not include dashboards with missing title when searching by title', () => {
    const ds = [...dashboards, { title: undefined }] as Dashboard[];
    const searchText = ' '; // non-empty search text

    const filteredDashboards = filterDashboards(ds, { searchText });

    expect(filteredDashboards).toEqual(dashboards);
  });
});
