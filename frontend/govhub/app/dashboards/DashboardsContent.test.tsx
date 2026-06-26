import React from 'react';
import { render } from '@testing-library/react';
import DashboardsContent, {
  DashboardsContentTestIds,
} from '@/app/dashboards/DashboardsContent';
import { useSearchParams } from 'next/navigation';
import { filterDashboards } from '@/app/_lib/superset/util';
import AppDashboardsOverview from '@/app/dashboards/_internal/AppDashboardsOverview';
import { Dashboard } from '@/app/_lib/superset/types';
import { DEFAULT_VIEW, ViewType } from '@/app/dashboards/_internal/common';
import { constant, identity } from 'lodash';
import { StatusOption } from '@/app/dashboards/Filter';
import {
  internal,
  VizGroup,
} from '@/app/_lib/resource-api/viz-groups/vizGroups';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));
jest.mock('@/app/_lib/superset/util', () => ({
  filterDashboards: jest.fn(),
}));
jest.mock('@/app/dashboards/_internal/AppDashboardsOverview', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='mock-overview' />),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;
const filterDashboardsMock = filterDashboards as jest.Mock;
const onFavoriteChangeMock = jest.fn();

describe('DashboardsContent', () => {
  const SUPERSET_URI = 'https://superset.example.com';
  const dashboards: Partial<Dashboard>[] = [
    {
      id: 1,
      slug: 'tenant_dash1',
      dashboard_title: 'Dashboard 1',
      thumbnail_url: '/thumb1.png',
      tags: [{ id: 1, name: 'tagA' }],
      published: true,
    },
    {
      id: 2,
      slug: 'tenant_dash2',
      dashboard_title: 'Some other board',
      thumbnail_url: '/thumb2.png',
      tags: [],
      published: false,
    },
  ];

  beforeEach(() => {
    useSearchParamsMock.mockReset();
    filterDashboardsMock.mockClear().mockImplementation(identity);
    useSearchParamsMock.mockReset().mockReturnValue(new URLSearchParams());
    (AppDashboardsOverview as jest.Mock).mockClear();
    onFavoriteChangeMock.mockReset();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <DashboardsContent
        supersetUri={SUPERSET_URI}
        dashboards={dashboards as Dashboard[]}
        onFavoriteChange={onFavoriteChangeMock}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders "No Dashboards" fallback when dashboards list is empty', () => {
    const { getByTestId, queryByTestId } = render(
      <DashboardsContent
        supersetUri={SUPERSET_URI}
        dashboards={[]}
        onFavoriteChange={onFavoriteChangeMock}
      />,
    );

    expect(getByTestId(DashboardsContentTestIds.noDashboards)).toBeVisible();
    expect(queryByTestId(DashboardsContentTestIds.overview)).toBeNull();
  });

  it('renders "No Search Result" fallback if dashboards exist but filter yields empty', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=xyz'));
    filterDashboardsMock.mockImplementation(constant([]));

    const { getByTestId, queryByTestId } = render(
      <DashboardsContent
        supersetUri={SUPERSET_URI}
        dashboards={dashboards as Dashboard[]}
        onFavoriteChange={onFavoriteChangeMock}
      />,
    );

    expect(getByTestId(DashboardsContentTestIds.noSearchResult)).toBeVisible();
    expect(queryByTestId(DashboardsContentTestIds.overview)).toBeNull();
  });

  it('renders the overview if some dashboards pass the filter', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?search=board'));
    filterDashboardsMock.mockReturnValueOnce([dashboards[1]]);

    const { getByTestId, queryByTestId } = render(
      <DashboardsContent
        supersetUri={SUPERSET_URI}
        dashboards={dashboards as Dashboard[]}
        onFavoriteChange={onFavoriteChangeMock}
      />,
    );

    expect(getByTestId(DashboardsContentTestIds.overview)).toBeVisible();
    expect(queryByTestId(DashboardsContentTestIds.noDashboards)).toBeNull();
    expect(queryByTestId(DashboardsContentTestIds.noSearchResult)).toBeNull();

    expect(AppDashboardsOverview).toHaveBeenCalledWith(
      expect.objectContaining({
        supersetUri: SUPERSET_URI,
        dashboards: [dashboards[1]],
        viewType: DEFAULT_VIEW,
        onFavoriteChange: onFavoriteChangeMock,
      }),
      undefined,
    );
  });

  it('respects "view" search param to pick the correct ViewType', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('?view=list'));

    const { getByTestId } = render(
      <DashboardsContent
        supersetUri={SUPERSET_URI}
        dashboards={dashboards as Dashboard[]}
        onFavoriteChange={onFavoriteChangeMock}
      />,
    );

    expect(getByTestId(DashboardsContentTestIds.overview)).toBeVisible();
    expect(AppDashboardsOverview).toHaveBeenCalledWith(
      expect.objectContaining({
        viewType: ViewType.list,
      }),
      undefined,
    );
  });

  describe('filter', () => {
    it.each<string>(['foo', 'bar'])(
      'calls filter function with correct search text',
      (searchText) => {
        useSearchParamsMock.mockReturnValue(
          new URLSearchParams(`?search=${searchText}`),
        );

        render(
          <DashboardsContent
            supersetUri={SUPERSET_URI}
            dashboards={dashboards as Dashboard[]}
            onFavoriteChange={onFavoriteChangeMock}
          />,
        );

        expect(filterDashboardsMock).toHaveBeenCalledWith(
          dashboards,
          expect.objectContaining({
            searchText,
          }),
        );
      },
    );

    it.each<boolean>([true, false])(
      'calls filter function with correct favorite status',
      (isFavorite) => {
        useSearchParamsMock.mockReturnValue(
          new URLSearchParams(`?favorites=${isFavorite}`),
        );

        render(
          <DashboardsContent
            supersetUri={SUPERSET_URI}
            dashboards={dashboards as Dashboard[]}
            onFavoriteChange={onFavoriteChangeMock}
          />,
        );

        expect(filterDashboardsMock).toHaveBeenCalledWith(
          dashboards,
          expect.objectContaining({
            favorites: isFavorite,
          }),
        );
      },
    );

    it.each<StatusOption>(['published', 'intern'])(
      'calls filter function with correct status',
      (status) => {
        useSearchParamsMock.mockReturnValue(
          new URLSearchParams(`?status=${status}`),
        );

        render(
          <DashboardsContent
            supersetUri={SUPERSET_URI}
            dashboards={dashboards as Dashboard[]}
            onFavoriteChange={onFavoriteChangeMock}
          />,
        );

        expect(filterDashboardsMock).toHaveBeenCalledWith(
          dashboards,
          expect.objectContaining({
            status: [status],
          }),
        );
      },
    );

    it.each<string[][]>([
      [['tenant1', 'sccon']],
      [
        ['tenant1', 'sccon'],
        ['tenant2', 'marketing'],
      ],
    ])('calls filter function with correct vizgroups', (...vizGroups) => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams(
          `?vizgroups=${vizGroups.map((p) => p.join('_')).join(',')}`,
        ),
      );
      const expected: VizGroup[] = vizGroups.map(([tenant, name]) =>
        internal.mkVizGroup(name, tenant),
      );

      render(
        <DashboardsContent
          supersetUri={SUPERSET_URI}
          dashboards={dashboards as Dashboard[]}
          onFavoriteChange={onFavoriteChangeMock}
        />,
      );

      expect(filterDashboardsMock).toHaveBeenCalledWith(
        dashboards,
        expect.objectContaining({
          vizGroups: expected,
        }),
      );
    });
  });
});
