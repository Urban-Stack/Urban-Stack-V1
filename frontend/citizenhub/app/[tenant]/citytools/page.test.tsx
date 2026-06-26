import React from 'react';
import { render } from '@testing-library/react';
import { queryPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { getPublicEnv } from '@/app/_lib/env';
import { UdpCityToolCard } from 'udp-ui/components';
import CityToolsPage from './page';
import { FuncMock } from '@/app/_test/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CitytoolCategory } from '@/app/__generated__/types';

jest.mock('@/app/_lib/resource-api/graphql/staticApps', () => ({
  queryPublicStaticApps: jest.fn(),
}));

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

jest.mock('udp-ui/components', () => ({
  ...jest.requireActual('udp-ui/components'),
  UdpCityToolCard: jest.fn(({ title }: { title: string }) => (
    <div>Title: {title}</div>
  )),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const useSearchParamsMock = useSearchParams as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const routerPushMock = jest.fn();

const queryPublicStaticAppsMock = queryPublicStaticApps as jest.Mock;
const getPublicEnvMock = getPublicEnv as FuncMock<typeof getPublicEnv>;

const TENANT = 'guetersloh';
const STATIC_APP_BASE_URL = 'https://citytools.example.com';
const STATIC_APPS = [
  {
    displayName: 'Tool 1',
    description: 'Description 1',
    categories: [],
    finalPath: 'tool-1',
  },
  {
    displayName: 'Tool 2',
    description: 'Description 2',
    categories: [CitytoolCategory.AppsTools],
    finalPath: 'tool-2',
  },
];

beforeEach(() => {
  queryPublicStaticAppsMock.mockResolvedValue({
    data: {
      publicCitytools: STATIC_APPS.map((ct) => ({
        ...ct,
        path: ct.finalPath,
      })),
    },
  });
  getPublicEnvMock.mockReturnValue(STATIC_APP_BASE_URL);
  (UdpCityToolCard as jest.Mock).mockClear();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
  useRouterMock.mockReturnValue({ push: routerPushMock });
  usePathnameMock.mockReturnValue('/');
});

it('matches snapshot', async () => {
  const { container } = render(
    await CityToolsPage({ params: Promise.resolve({ tenant: TENANT }) }),
  );
  expect(container).toMatchSnapshot();
});
