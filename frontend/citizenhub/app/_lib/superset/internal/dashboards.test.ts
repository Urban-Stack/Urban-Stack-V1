import {
  DashboardRaw,
  fetchDashboards,
} from '@/app/_lib/superset/internal/client';
import { FuncMock } from '@/app/_test/utils';
import {
  getDashboards,
  internal,
} from '@/app/_lib/superset/internal/dashboards';
import { getPublicEnv } from '@/app/_lib/env';

const SUPERSET_URI = 'https://superset.example.com';

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('@/app/_lib/superset/internal/client', () => ({
  fetchDashboards: jest.fn(),
}));

const fetchDashboardsMock = fetchDashboards as FuncMock<typeof fetchDashboards>;
const getPublicEnvMock = getPublicEnv as FuncMock<typeof getPublicEnv>;

const DASHBOARDS_RAW: DashboardRaw[] = [
  {
    id: 1,
    slug: 'tenant1_group1_dashboard1',
    dashboard_title: 'Dashboard 1',
    thumbnail_url: '/thumbnail1.png',
    changed_on_utc: new Date('2024-01-01T00:00:00Z'),
    status: 'published',
    url: '/dashboard/1',
    tags: [{ id: 10, name: 'tag-a', type: 1 }],
  },
  {
    id: 2,
    slug: 'tenant1_group1_dashboard2',
    dashboard_title: undefined,
    thumbnail_url: '/thumbnail2.png',
    changed_on_utc: new Date('2024-01-01T00:00:00Z'),
    status: 'draft',
    url: '/dashboard/2',
    tags: [{ id: 11, name: 'tag-b', type: 1 }],
  },
  {
    id: 3,
    slug: 'tenant1_group1_dashboard3',
    dashboard_title: 'Dashboard 3',
    thumbnail_url: '/thumbnail3.png',
    changed_on_utc: new Date('2024-01-01T00:00:00Z'),
    status: 'draft',
    url: '/dashboard/3',
    tags: [{ id: 12, name: 'tag-c', type: 2 }],
  },
  {
    id: 4,
    slug: 'tenant1_group1_dashboard4',
    dashboard_title: 'Dashboard 4',
    thumbnail_url: '/thumbnail4.png',
    changed_on_utc: new Date('2024-01-01T00:00:00Z'),
    status: 'draft',
    url: '/dashboard/4',
    tags: [{ id: 12, name: '', type: 1 }],
  },
];

beforeAll(() => {
  getPublicEnvMock.mockReturnValue(SUPERSET_URI);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sanitizeDashboard', () => {
  it('sanitizes a DashboardRaw into Dashboard', () => {
    const raw = DASHBOARDS_RAW[0];

    const result = internal.sanitizeDashboard(SUPERSET_URI)(raw);

    expect(result).toEqual({
      id: 1,
      slug: 'tenant1_group1_dashboard1',
      title: 'Dashboard 1',
      thumbnailUrl: SUPERSET_URI + '/thumbnail1.png',
      tags: [{ id: 10, name: 'tag-a' }],
    });
  });

  it('handles undefined thumbnail url', () => {
    const raw = {
      ...DASHBOARDS_RAW[0],
      thumbnail_url: undefined,
    };

    const result = internal.sanitizeDashboard(SUPERSET_URI)(raw);

    expect(result).toEqual({
      id: 1,
      slug: 'tenant1_group1_dashboard1',
      title: 'Dashboard 1',
      thumbnailUrl: undefined,
      tags: [{ id: 10, name: 'tag-a' }],
    });
  });

  it('ignores tag if type is not 1', () => {
    const result = internal.sanitizeDashboard(SUPERSET_URI)(DASHBOARDS_RAW[2]);

    expect(result).toEqual({
      id: 3,
      slug: 'tenant1_group1_dashboard3',
      title: 'Dashboard 3',
      thumbnailUrl: SUPERSET_URI + '/thumbnail3.png',
      tags: [],
    });
  });

  it('ignores tag if name is empty', () => {
    const result = internal.sanitizeDashboard(SUPERSET_URI)(DASHBOARDS_RAW[3]);

    expect(result).toEqual({
      id: 4,
      slug: 'tenant1_group1_dashboard4',
      title: 'Dashboard 4',
      thumbnailUrl: SUPERSET_URI + '/thumbnail4.png',
      tags: [],
    });
  });
});

describe('getDashboards', () => {
  beforeEach(() => {
    fetchDashboardsMock.mockReset();
  });

  it('fetches and sanitizes dashboards for a tenant', async () => {
    fetchDashboardsMock.mockResolvedValueOnce(DASHBOARDS_RAW);

    const dashboards = await getDashboards('tenant1');

    expect(fetchDashboardsMock).toHaveBeenCalledWith('tenant1');
    expect(dashboards).toEqual([
      {
        id: 1,
        slug: 'tenant1_group1_dashboard1',
        title: 'Dashboard 1',
        thumbnailUrl: SUPERSET_URI + '/thumbnail1.png',
        tags: [{ id: 10, name: 'tag-a' }],
      },
      {
        id: 2,
        slug: 'tenant1_group1_dashboard2',
        title: undefined,
        thumbnailUrl: SUPERSET_URI + '/thumbnail2.png',
        tags: [{ id: 11, name: 'tag-b' }],
      },
      {
        id: 3,
        slug: 'tenant1_group1_dashboard3',
        title: 'Dashboard 3',
        thumbnailUrl: SUPERSET_URI + '/thumbnail3.png',
        tags: [],
      },
      {
        id: 4,
        slug: 'tenant1_group1_dashboard4',
        title: 'Dashboard 4',
        thumbnailUrl: SUPERSET_URI + '/thumbnail4.png',
        tags: [],
      },
    ]);
  });
});
