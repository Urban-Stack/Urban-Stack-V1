import React from 'react';
import { render } from '@testing-library/react';
import DashboardsContainer from '@/app/dashboards/DashboardsContainer';
import { useSuperset } from '@/app/_lib/superset/superset';
import { sanitizeDashboards } from '@/app/_lib/superset/util';
import DashboardsContent from '@/app/dashboards/DashboardsContent';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import { DashboardResponseRaw } from '@/app/_lib/superset/types';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

jest.mock('@/app/_lib/superset/superset', () => ({
  useSuperset: jest.fn(),
}));

jest.mock('@/app/_component/searchbar/AppSearchBar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-dashboard-search-bar' />),
}));

jest.mock('@/app/dashboards/Filter', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-filter' />),
}));

jest.mock('@/app/dashboards/ViewSelector', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-view-selector' />),
}));

jest.mock('@/app/dashboards/DashboardsContent', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-dashboards-content' />),
}));

jest.mock('@/app/dashboards/_create/CreateDashboardButton', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-create-dashboard-button' />),
}));

const useSupersetMock = useSuperset as unknown as jest.Mock;
const getDashboards = jest.fn();
const useFavoriteStatuses = jest.fn();

const SUPERSET_URI = 'https://superset.example.com';
const TENANT = 'test-tenant';
const VIZ_GROUPS: VizGroup[] = [
  { name: 'group1', tenant: TENANT, _tag: 'VizGroup' },
];
const VIZ_GROUP_SCOPES_ADMIN: Map<string, Map<string, Scope[]>> = new Map([
  [TENANT, new Map<string, Scope[]>([['group1', ['viz-group:admin']]])],
]);

const VIZ_GROUP_SCOPES_READ: Map<string, Map<string, Scope[]>> = new Map([
  [
    TENANT,
    new Map<string, Scope[]>([
      ['group1', ['viz-group:read', 'dashboard:view']],
    ]),
  ],
]);

beforeAll(() => {
  useSupersetMock.mockReturnValue({
    getDashboards,
    useFavoriteStatuses,
  });
});

beforeEach(() => {
  getDashboards.mockReset();
  useFavoriteStatuses.mockReset();
  (DashboardsContent as jest.Mock).mockClear();
});

describe('DashboardsContainer', () => {
  it('matches snapshot', () => {
    getDashboards.mockReturnValue({
      dashboards: { result: [], count: 0, ids: [] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: { result: [] },
      setFavStatus: jest.fn(),
    });

    const { container } = render(
      <DashboardsContainer
        supersetUri={SUPERSET_URI}
        canCreateDashboard={true}
        vizGroups={VIZ_GROUPS}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  it('calls getDashboardsByTenant and sanitizes them in DashboardsContent', () => {
    const rawDashboards: DashboardResponseRaw[] = [
      {
        id: 1,
        slug: 'test-tenant_group1_dashboard1',
        dashboard_title: 'Dashboard 1',
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
        dashboard_title: 'Dashboard 2',
        thumbnail_url: '/thumb-2.png',
        changed_on_utc: new Date(),
        status: 'published',
        url: '/dashboard/2',
        tags: [{ id: 11, name: 'tag-b', type: 1 }],
        created_by: null,
        published: null,
      },
    ];
    getDashboards.mockReturnValue({
      dashboards: { result: rawDashboards, count: 2, ids: [1, 2] },
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

    render(
      <DashboardsContainer
        supersetUri={SUPERSET_URI}
        canCreateDashboard={false}
        vizGroups={VIZ_GROUPS}
        vizGroupScopeMap={VIZ_GROUP_SCOPES_READ}
      />,
    );

    expect(getDashboards).toHaveBeenCalledTimes(1);

    expect(useFavoriteStatuses).toHaveBeenCalledWith([1, 2]);

    const sanitized = sanitizeDashboards(rawDashboards);
    const dashboardsWithFavs = [
      { ...sanitized[0], favorite: true },
      { ...sanitized[1], favorite: false },
    ];

    expect(DashboardsContent).toHaveBeenCalledTimes(1);
    expect(DashboardsContent).toHaveBeenCalledWith(
      expect.objectContaining({
        supersetUri: SUPERSET_URI,
        dashboards: dashboardsWithFavs,
        onFavoriteChange: expect.any(Function),
      }),
      undefined,
    );
  });

  it('provides dashboards, which the user can view, to DashboardsContent', () => {
    const vizGroups: VizGroup[] = [
      { name: 'group1', tenant: 'test-tenant1', _tag: 'VizGroup' },
      { name: 'group2', tenant: 'test-tenant1', _tag: 'VizGroup' },
      { name: 'group3', tenant: 'test-tenant2', _tag: 'VizGroup' },
    ];
    const vizGroupScopeMap: Map<string, Map<string, Scope[]>> = new Map([
      [
        'test-tenant1',
        new Map<string, Scope[]>([
          [
            'group1',
            [
              'viz-group:admin',
              'dashboard:admin',
              'dashboard:view',
              'dashboard:read',
            ],
          ],
          ['group2', []],
        ]),
      ],
      [
        'test-tenant2',
        new Map<string, Scope[]>([
          ['group3', ['viz-group:read', 'dashboard:view']],
        ]),
      ],
    ]);
    const rawDashboards: DashboardResponseRaw[] = [
      {
        id: 1,
        slug: 'test-tenant1_group1_dashboard1',
        dashboard_title: 'Dashboard 1',
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
        slug: 'test-tenant1_group2_dashboard2',
        dashboard_title: 'Dashboard 2',
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
        slug: 'test-tenant2_group3_dashboard3',
        dashboard_title: 'Dashboard 3',
        thumbnail_url: '/thumb-3.png',
        changed_on_utc: new Date(),
        status: 'published',
        url: '/dashboard/3',
        tags: [{ id: 12, name: 'tag-c', type: 1 }],
        created_by: null,
        published: null,
      },
    ];
    getDashboards.mockReturnValue({
      dashboards: { result: rawDashboards, count: 3, ids: [1, 2, 3] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: {
        result: [
          { id: 1, value: true },
          { id: 2, value: false },
          { id: 3, value: false },
        ],
      },
      setFavStatus: jest.fn(),
    });

    render(
      <DashboardsContainer
        supersetUri={SUPERSET_URI}
        canCreateDashboard={false}
        vizGroups={vizGroups}
        vizGroupScopeMap={vizGroupScopeMap}
      />,
    );

    expect(getDashboards).toHaveBeenCalledTimes(1);

    expect(useFavoriteStatuses).toHaveBeenCalledWith([1, 3]);

    const sanitized = sanitizeDashboards(rawDashboards);
    const dashboardsWithFavs = [
      { ...sanitized[0], favorite: true },
      { ...sanitized[2], favorite: false },
    ];

    expect(DashboardsContent).toHaveBeenCalledTimes(1);
    expect(DashboardsContent).toHaveBeenCalledWith(
      expect.objectContaining({
        supersetUri: SUPERSET_URI,
        dashboards: dashboardsWithFavs,
        onFavoriteChange: expect.any(Function),
      }),
      undefined,
    );
  });

  describe('Create Dashboard button', () => {
    beforeEach(() => {
      getDashboards.mockReturnValue({
        dashboards: { result: [], count: 0, ids: [] },
        isLoading: false,
      });
      useFavoriteStatuses.mockReturnValue({
        favStatuses: { result: [] },
        setFavStatus: jest.fn(),
      });
    });

    it('hides create dashboard button if user is not tenant admin', () => {
      const { queryByTestId } = render(
        <DashboardsContainer
          supersetUri={SUPERSET_URI}
          canCreateDashboard={false}
        />,
      );
      expect(
        queryByTestId('mock-create-dashboard-button'),
      ).not.toBeInTheDocument();
    });

    it('hides create dashboard button if no vizgroups exist', () => {
      const { queryByTestId } = render(
        <DashboardsContainer
          supersetUri={SUPERSET_URI}
          canCreateDashboard={true}
          vizGroups={undefined}
        />,
      );
      expect(
        queryByTestId('mock-create-dashboard-button'),
      ).not.toBeInTheDocument();
    });

    it('hides create dashboard button if no viz group with admin scope exists', () => {
      const { queryByTestId } = render(
        <DashboardsContainer
          supersetUri={SUPERSET_URI}
          canCreateDashboard={true}
          vizGroups={VIZ_GROUPS}
          vizGroupScopeMap={VIZ_GROUP_SCOPES_READ}
        />,
      );
      expect(
        queryByTestId('mock-create-dashboard-button'),
      ).not.toBeInTheDocument();
    });

    it('renders create dashboard button if viz group with admin scope exists', () => {
      const { queryByTestId } = render(
        <DashboardsContainer
          supersetUri={SUPERSET_URI}
          canCreateDashboard={true}
          vizGroups={VIZ_GROUPS}
          vizGroupScopeMap={VIZ_GROUP_SCOPES_ADMIN}
        />,
      );
      expect(queryByTestId('mock-create-dashboard-button')).toBeInTheDocument();
    });
  });

  it('always renders the search bar and view selector', () => {
    getDashboards.mockReturnValue({
      dashboards: { result: [], count: 0, ids: [] },
      isLoading: false,
    });
    useFavoriteStatuses.mockReturnValue({
      favStatuses: { result: [] },
      setFavStatus: jest.fn(),
    });

    const { queryByTestId } = render(
      <DashboardsContainer
        supersetUri={SUPERSET_URI}
        canCreateDashboard={false}
      />,
    );

    expect(queryByTestId('mock-dashboard-search-bar')).toBeInTheDocument();
    expect(queryByTestId('mock-view-selector')).toBeInTheDocument();
  });

  it('provides an onFavoriteChange function that calls setFavStatus', () => {
    getDashboards.mockReturnValue({
      dashboards: {
        result: [
          {
            id: 99,
            slug: 'tenant_vizgroup_dashboard99',
            dashboard_title: 'Dashboard 99',
            thumbnail_url: '/thumb-99.png',
            changed_on_utc: new Date(),
            status: 'published',
            url: '/dashboard/99',
            tags: [],
            created_by: null,
            published: null,
          },
        ],
        count: 1,
        ids: [99],
      },
      isLoading: false,
    });

    const setFavStatusMock = jest.fn();
    useFavoriteStatuses.mockReturnValue({
      favStatuses: { result: [] }, // no favorites
      setFavStatus: setFavStatusMock,
    });

    render(
      <DashboardsContainer
        supersetUri={SUPERSET_URI}
        canCreateDashboard={false}
      />,
    );

    const { onFavoriteChange } = (DashboardsContent as jest.Mock).mock
      .calls[0][0];

    onFavoriteChange({ id: 99, favorite: false });

    expect(setFavStatusMock).toHaveBeenCalledWith(99, true);
  });
});
