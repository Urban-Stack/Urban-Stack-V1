import { StaticApp } from '@/app/_lib/citytools/internal';
import { filterStaticApps } from '@/app/[tenant]/citytools/_internal/util';

describe('filterStaticApps', () => {
  const staticApps: StaticApp[] = [
    {
      displayName: 'Tool A',
      description: 'First',
      categories: [],
      finalPath: 'Path A',
      _tag: 'StaticApp',
    },
    {
      displayName: 'Tool B',
      description: 'Second',
      categories: [],
      finalPath: 'Path B',
      _tag: 'StaticApp',
    },
    {
      displayName: 'Spell C',
      description: 'Third',
      categories: [],
      finalPath: 'Path C',
      _tag: 'StaticApp',
    },
  ];

  it('returns all tools if no filters applied', () => {
    expect(filterStaticApps(staticApps, {})).toEqual(staticApps);
  });

  it('filters by search text matching display name', () => {
    const result = filterStaticApps(staticApps, { searchText: 'tool' });
    expect(result).toEqual([staticApps[0], staticApps[1]]);
  });

  it('filters by search text matching description', () => {
    const result = filterStaticApps(staticApps, { searchText: 'first' });
    expect(result).toEqual([staticApps[0]]);
  });

  it('returns empty array if no match', () => {
    const result = filterStaticApps(staticApps, { searchText: 'no-results' });
    expect(result).toEqual([]);
  });

  it('is case-insensitive', () => {
    const result = filterStaticApps(staticApps, { searchText: 'TOOL A' });
    expect(result).toEqual([staticApps[0]]);
  });
});
