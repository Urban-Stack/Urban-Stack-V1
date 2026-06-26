import { getPublicEnv } from '@/app/_lib/env';
import { z } from 'zod';
import { DashboardRaw, fetchDashboards } from './client';

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
const getPublicEnvMock = getPublicEnv as jest.Mock;
const fetchMock = jest.fn();

const TENANT = 'tenant1';
const SUPERSET_URI = 'https://superset.example.com';
const DASHBOARD_FIXTURE: DashboardRaw[] = [
  {
    changed_on_utc: new Date('2024-01-01T00:00:00Z'),
    dashboard_title: 'Dashboard A',
    id: 1,
    slug: 'tenant1_groupA_dashA',
    status: 'published',
    tags: [{ id: 1, name: 'tag-a', type: 1 }],
    thumbnail_url: '/thumb/a.png',
    url: '/dashboard/a',
  },
  {
    changed_on_utc: new Date('2024-01-02T00:00:00Z'),
    dashboard_title: 'Dashboard B',
    id: 2,
    slug: 'tenant1_groupB_dashB',
    status: 'published',
    tags: [{ id: 2, name: 'tag-b', type: 1 }],
    thumbnail_url: '/thumb/b.png',
    url: '/dashboard/b',
  },
];

beforeAll(() => {
  global.fetch = fetchMock;
  getPublicEnvMock.mockReturnValue(SUPERSET_URI);
});

beforeEach(() => {
  fetchMock.mockReset();
});

describe('fetchDashboards', () => {
  it('fetches dashboards and parses response correctly', async () => {
    const query = {
      filters: [{ col: 'slug', opr: 'sw', value: `${TENANT}_` }],
      page_size: -1,
    };
    const expectedUrl = `${SUPERSET_URI}/api/v1/dashboard/?q=${encodeURIComponent(
      JSON.stringify(query),
    )}`;

    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          count: 2,
          ids: [1, 2],
          result: DASHBOARD_FIXTURE.map((d) => ({
            ...d,
            changed_on_utc: d.changed_on_utc.toISOString(),
          })),
        }),
    } as Response);

    const dashboards = await fetchDashboards(TENANT);

    expect(getPublicEnvMock).toHaveBeenCalledWith('SUPERSET_URI');
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl);
    expect(dashboards).toEqual(DASHBOARD_FIXTURE);
  });

  it('throws if response is malformed', async () => {
    global.fetch = fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ invalid: 'data' }),
    } as Response);

    await expect(fetchDashboards(TENANT)).rejects.toThrow(z.ZodError);
  });
});
