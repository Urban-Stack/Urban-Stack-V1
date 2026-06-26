import { render } from '@testing-library/react';
import DashboardOverview from '@/app/_homepage/DashboardOverview';
import { useSuperset } from '@/app/_lib/superset/superset';
import React from 'react';
import { DashboardResponseRaw } from '@/app/_lib/superset/types';

const useSupersetMock = useSuperset as unknown as jest.Mock;
const getDashboards = jest.fn();
const useFavoriteStatuses = jest.fn();

jest.mock('@/app/_lib/superset/superset', () => ({
  useSuperset: jest.fn(),
}));

beforeAll(() => {
  useSupersetMock.mockReturnValue({
    getDashboards,
    useFavoriteStatuses,
  });
});

beforeEach(() => {
  getDashboards.mockReset();
  useFavoriteStatuses.mockReset();
});

const DASHBOARDS = [
  {
    id: 1,
    slug: 'test-tenant_group1_dashboard1',
    dashboard_title: 'Sales',
    thumbnail_url: '/thumb-1.png',
    changed_on_utc: new Date(),
    status: 'published',
    url: '/dashboard/1',
    tags: [{ id: 10, name: 'tag-a', type: 1 }],
    created_by: null,
    published: null,
  },
  {
    id: 2,
    slug: 'test-tenant_group1_dashboard2',
    dashboard_title: 'Marketing',
    thumbnail_url: '/thumb-2.png',
    changed_on_utc: new Date(),
    status: 'published',
    url: '/dashboard/2',
    tags: [{ id: 11, name: 'tag-b', type: 1 }],
    created_by: null,
    published: null,
  },
  {
    id: 3,
    slug: 'test-tenant_group1_dashboard3',
    dashboard_title: 'Development',
    thumbnail_url: '/thumb-3.png',
    changed_on_utc: new Date(),
    status: 'published',
    url: '/dashboard/3',
    tags: [{ id: 12, name: 'tag-c', type: 1 }],
    created_by: null,
    published: null,
  },
  {
    id: 4,
    slug: 'test-tenant_group1_dashboard4',
    dashboard_title: 'Grinding',
    thumbnail_url: '/thumb-4.png',
    changed_on_utc: new Date(),
    status: 'published',
    url: '/dashboard/4',
    tags: [{ id: 13, name: 'tag-d', type: 1 }],
    created_by: null,
    published: null,
  },
];

describe('DashboardOverview', () => {
  it('renders without dashboards', () => {
    getDashboards.mockReturnValue({
      dashboards: { result: [], count: 0, ids: [] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: { result: [] },
      setFavStatus: jest.fn(),
    });

    const { container } = render(<DashboardOverview supersetUri='uri' />);

    expect(container).toBeVisible();
  });

  it('renders only favorite dashboards', () => {
    const dashboards: DashboardResponseRaw[] = [DASHBOARDS[0], DASHBOARDS[1]];
    getDashboards.mockReturnValue({
      dashboards: { result: dashboards, count: 2, ids: [1, 2] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: {
        result: [
          { id: 1, value: true },
          { id: 2, value: false },
        ],
      },
      setFavStatus: jest.fn(),
    });

    const container = render(<DashboardOverview supersetUri='uri' />);

    expect(container.queryByText('Sales')).toBeInTheDocument();
    expect(container.queryByText('Marketing')).not.toBeInTheDocument();
  });

  it('limits card max 3 dashboards', () => {
    getDashboards.mockReturnValue({
      dashboards: { result: DASHBOARDS, count: 2, ids: [1, 2] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: {
        result: [
          { id: 1, value: true },
          { id: 2, value: true },
          { id: 3, value: true },
          { id: 4, value: true },
        ],
      },
      setFavStatus: jest.fn(),
    });

    const container = render(<DashboardOverview supersetUri='uri' />);

    expect(container.queryByText('Sales')).toBeInTheDocument();
    expect(container.queryByText('Marketing')).toBeInTheDocument();
    expect(container.queryByText('Development')).toBeInTheDocument();
    expect(container.queryByText('Grinding')).not.toBeInTheDocument();
  });
});
