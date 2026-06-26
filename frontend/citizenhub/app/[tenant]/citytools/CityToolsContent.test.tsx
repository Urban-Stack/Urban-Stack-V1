import React from 'react';
import { render } from '@testing-library/react';
import { getPublicEnv } from '@/app/_lib/env';
import { UdpCityToolCard } from 'udp-ui/components';
import { FuncMock } from '@/app/_test/utils';
import { CityToolCardsTestIds } from '@/app/[tenant]/citytools/testids';
import { useSearchParams } from 'next/navigation';
import CityToolsContent from '@/app/[tenant]/citytools/CityToolsContent';
import { StaticApp } from '@/app/_lib/citytools/internal';
import { CitytoolCategory } from '@/app/__generated__/types';

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
}));

const useSearchParamsMock = useSearchParams as jest.Mock;

const getPublicEnvMock = getPublicEnv as FuncMock<typeof getPublicEnv>;

const TENANT = 'guetersloh';
const STATIC_APP_BASE_URL = 'https://citytools.example.com';
const BASE_URL_WITH_TENANT = `${STATIC_APP_BASE_URL}/${TENANT}`;
const STATIC_APPS: StaticApp[] = [
  {
    displayName: 'Tool 1',
    description: 'Description 1',
    pictureUri: 'https://pictures/image.png',
    categories: [],
    finalPath: 'tool-1',
    _tag: 'StaticApp',
  },
  {
    displayName: 'Tool 2',
    description: 'Description 2',
    categories: [CitytoolCategory.Office],
    finalPath: 'tool-2',
    _tag: 'StaticApp',
  },
];

beforeEach(() => {
  getPublicEnvMock.mockReturnValue(STATIC_APP_BASE_URL);
  (UdpCityToolCard as jest.Mock).mockClear();
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

it('matches snapshot', () => {
  const { container } = render(
    CityToolsContent({
      staticAppBaseUrl: BASE_URL_WITH_TENANT,
      staticApps: STATIC_APPS,
    }),
  );
  expect(container).toMatchSnapshot();
});

it('renders city tool cards with correct props', () => {
  render(
    CityToolsContent({
      staticAppBaseUrl: BASE_URL_WITH_TENANT,
      staticApps: STATIC_APPS,
    }),
  );

  expect(UdpCityToolCard).toHaveBeenCalledTimes(STATIC_APPS.length);
  expect(UdpCityToolCard).toHaveBeenCalledWith(
    expect.objectContaining({
      title: STATIC_APPS[0].displayName,
      description: STATIC_APPS[0].description,
      pictureUri: STATIC_APPS[0].pictureUri,
      categories: [],
      href: `${STATIC_APP_BASE_URL}/${TENANT}/${STATIC_APPS[0].finalPath}`,
      target: '_blank',
    }),
    undefined,
  );
  expect(UdpCityToolCard).toHaveBeenCalledWith(
    expect.objectContaining({
      title: STATIC_APPS[1].displayName,
      description: STATIC_APPS[1].description,
      pictureUri: undefined,
      categories: ['Office'],
      href: `${STATIC_APP_BASE_URL}/${TENANT}/${STATIC_APPS[1].finalPath}`,
      target: '_blank',
    }),
    undefined,
  );
});

describe('Fallback', () => {
  it('renders no-CityTools fallback if there are no static apps', () => {
    const component = render(
      CityToolsContent({
        staticAppBaseUrl: BASE_URL_WITH_TENANT,
        staticApps: [],
      }),
    );

    expect(
      component.getByTestId(CityToolCardsTestIds.noCityTools),
    ).toBeInTheDocument();
  });

  it('renders citytool cards if there are static apps', () => {
    const component = render(
      CityToolsContent({
        staticAppBaseUrl: BASE_URL_WITH_TENANT,
        staticApps: STATIC_APPS,
      }),
    );

    expect(
      component.getByTestId(CityToolCardsTestIds.results),
    ).toBeInTheDocument();
  });
});
