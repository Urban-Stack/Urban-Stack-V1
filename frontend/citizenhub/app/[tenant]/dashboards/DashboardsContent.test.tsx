import React from 'react';
import { render } from '@testing-library/react';
import { Dashboard, getDashboards } from '@/app/_lib/superset';
import { FuncMock } from '@/app/_test/utils';
import { UdpDashboardCard } from 'udp-ui/components';
import { DashboardCardsTestIds } from '@/app/[tenant]/dashboards/testids';
import DashboardsContent from '@/app/[tenant]/dashboards/DashboardsContent';
import { useSearchParams } from 'next/navigation';

jest.mock('@/app/_lib/superset', () => ({
  getDashboards: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpDashboardCard: jest.fn(() => <div>Mocked Dashboard Card</div>),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;

const getDashboardsMock = getDashboards as unknown as FuncMock<
  typeof getDashboards
>;

const TENANT = 'guetersloh';
const DASHBOARDS: Dashboard[] = [
  {
    id: 1,
    slug: 'slug-1',
    title: 'Dashboard 1',
    thumbnailUrl: '/thumb1.png',
    tags: [
      { id: 1, name: 'Tag A' },
      { id: 2, name: 'Tag B' },
    ],
  },
  {
    id: 2,
    slug: 'slug-2',
    title: undefined,
    thumbnailUrl: '/thumb2.png',
    tags: [],
  },
];

beforeEach(() => {
  getDashboardsMock.mockImplementation((tenant) =>
    tenant === TENANT ? Promise.resolve(DASHBOARDS) : Promise.reject(),
  );
  (UdpDashboardCard as jest.Mock).mockClear();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

describe('DashboardsPage', () => {
  it('renders dashboard cards with correct props', () => {
    render(DashboardsContent({ tenant: TENANT, allDashboards: DASHBOARDS }));

    expect(UdpDashboardCard).toHaveBeenCalledTimes(DASHBOARDS.length);
    expect(UdpDashboardCard).toHaveBeenCalledWith(
      expect.objectContaining({
        href: `/${TENANT}/dashboards/${DASHBOARDS[0].slug}`,
        title: 'Dashboard 1',
        src: DASHBOARDS[0].thumbnailUrl,
        fallbackTitle: 'Unbenanntes Dashboard',
        tags: ['Tag A', 'Tag B'],
        hideFavorite: true,
      }),
      undefined,
    );
    expect(UdpDashboardCard).toHaveBeenCalledWith(
      expect.objectContaining({
        href: `/${TENANT}/dashboards/${DASHBOARDS[1].slug}`,
        title: undefined,
        src: DASHBOARDS[1].thumbnailUrl,
        fallbackTitle: 'Unbenanntes Dashboard',
        tags: [],
        hideFavorite: true,
      }),
      undefined,
    );
  });

  it('matches snapshot', () => {
    const { container } = render(
      DashboardsContent({ tenant: TENANT, allDashboards: DASHBOARDS }),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('Fallback', () => {
  it('renders no-Dashboards fallback if there are no dashboards', () => {
    getDashboardsMock.mockResolvedValue([]);

    const component = render(
      DashboardsContent({ tenant: TENANT, allDashboards: [] }),
    );

    expect(
      component.getByTestId(DashboardCardsTestIds.noDashboards),
    ).toBeInTheDocument();
  });

  it('renders dashboard cards if there are dashboards ', () => {
    const component = render(
      DashboardsContent({ tenant: TENANT, allDashboards: DASHBOARDS }),
    );

    expect(
      component.getByTestId(DashboardCardsTestIds.results),
    ).toBeInTheDocument();
  });
});
