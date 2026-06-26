import React from 'react';
import { render } from '@testing-library/react';
import { Dashboard, getDashboards } from '@/app/_lib/superset';
import { FuncMock } from '@/app/_test/utils';
import { UdpDashboardCard } from 'udp-ui/components';
import DashboardsPage from './page';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

jest.mock('@/app/_lib/superset', () => ({
  getDashboards: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpDashboardCard: jest.fn(() => <div>Mocked Dashboard Card</div>),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;
const replaceMock = jest.fn();

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

  useRouterMock.mockReturnValue({ replace: replaceMock });
  usePathnameMock.mockReturnValue('/dashboards');
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

describe('DashboardsPage', () => {
  it('matches snapshot', async () => {
    const { container } = render(
      await DashboardsPage({ params: Promise.resolve({ tenant: TENANT }) }),
    );
    expect(container).toMatchSnapshot();
  });
});
