import { mkHref, mkResultHref } from './util';

describe('mkHref', () => {
  it('returns correct href with all arguments', () => {
    expect(mkHref('tenantA', 'groupB', 'queryC')).toBe(
      '/settings/dashboardgroups/tenantA/groupB/geojson/queryC',
    );
  });

  it('defaults query to "new" if not provided', () => {
    expect(mkHref('tenantX', 'groupY')).toBe(
      '/settings/dashboardgroups/tenantX/groupY/geojson/new',
    );
  });
});

describe('mkResultHref', () => {
  it('returns correct href', () => {
    expect(
      mkResultHref(
        'my-tenant',
        'my-group',
        'my-query',
        'https://api.data-hub.local',
      ),
    ).toBe(
      'https://api.data-hub.local/api/v2/query/my-tenant/my-group/my-query/geojson',
    );
  });
});
