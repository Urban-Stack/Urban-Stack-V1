import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import HomePage from '@/app/[tenant]/page';
import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';
import { TEST_PUBLIC_ATTRIBUTES } from '@/app/_test/attributes';
import { FuncMock } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import { queryPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { Dashboard, getDashboards } from '@/app/_lib/superset';
import { HomepageTestIds } from '@/app/[tenant]/testIds';
import { fetchNewsRSS, ParseResult } from 'udp-ui/fetching';
import { UdpInfoCardTestIds } from 'udp-ui/components';
import { CitytoolCategory } from '@/app/__generated__/types';

const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));

const mockPublicAttributes = publicAttributes as jest.Mock;
jest.mock('@/app/_lib/resource-api/attributes/publicAttributes', () => ({
  publicAttributes: jest.fn(),
}));

const queryPublicStaticAppsMock = queryPublicStaticApps as jest.Mock;
jest.mock('@/app/_lib/resource-api/graphql/staticApps', () => ({
  queryPublicStaticApps: jest.fn(),
}));

const getDashboardsMock = getDashboards as unknown as FuncMock<
  typeof getDashboards
>;
jest.mock('@/app/_lib/superset', () => ({
  getDashboards: jest.fn(),
}));

const fetchNewsRSSMock = fetchNewsRSS as unknown as FuncMock<
  typeof fetchNewsRSS
>;
jest.mock('udp-ui/fetching', () => ({
  fetchNewsRSS: jest.fn(),
}));

const TENANT = {
  name: 'test-tenant',
  displayName: 'Test Tenant',
};
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

const NEWS_RSS = {
  rss: {
    channel: {
      description: 'description',
      language: 'language',
      link: 'link',
      pubDate: 'Fri, 06 Jun 2025 15:45:19 +0200',
      title: 'title',
      item: [
        {
          title: 'title1',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 06 Jun 2025 15:45:19 +0200',
        },
        {
          title: 'title2',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 05 Jun 2025 15:45:19 +0200',
        },
        {
          title: 'title3',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 04 Jun 2025 15:45:19 +0200',
        },
      ],
    },
  },
} as ParseResult;

beforeAll(() => {
  getPublicEnvMock.mockReturnValue('https://example.com/');
  mockPublicAttributes.mockReturnValue(TEST_PUBLIC_ATTRIBUTES);
  queryPublicStaticAppsMock.mockResolvedValue({
    data: {
      publicCitytools: STATIC_APPS.map((ct) => ({
        ...ct,
        path: ct.finalPath,
      })),
    },
  });
  getDashboardsMock.mockImplementation((_tenant) =>
    Promise.resolve(DASHBOARDS),
  );
});

beforeEach(() => {
  fetchNewsRSSMock.mockResolvedValueOnce(NEWS_RSS.rss);
});

describe('layout', () => {
  it('has banner with welcome message', async () => {
    const component = render(
      await HomePage({
        params: Promise.resolve({ tenant: TENANT.name }),
      }),
    );

    const banner = component.getByTestId(HomepageTestIds.banner);
    expect(banner).toHaveTextContent('Herzlich Willkommen!');
    expect(banner).toHaveTextContent(
      `Im Urban Citizen Hub der Stadt ${TENANT.displayName}`,
    );
  });

  it('has info cards', async () => {
    const component = render(
      await HomePage({
        params: Promise.resolve({ tenant: TENANT.name }),
      }),
    );

    const cards = component.getByTestId(HomepageTestIds.cards);
    expect(cards).toHaveTextContent('Alle Dashboards ansehen');
    expect(cards).toHaveTextContent('Alle City Tools ansehen');
    expect(cards).toHaveTextContent('Impressum');
    expect(cards).toHaveTextContent('Kontaktformular');
  });

  it('info cards display tenant name', async () => {
    const component = render(
      await HomePage({
        params: Promise.resolve({ tenant: TENANT.name }),
      }),
    );

    const cards = component.getAllByTestId(UdpInfoCardTestIds.self);
    for (const card of cards) {
      expect(card).toHaveTextContent(TENANT.displayName);
    }
  });

  it('has news section', async () => {
    const component = render(
      await HomePage({
        params: Promise.resolve({ tenant: TENANT.name }),
      }),
    );

    const news = component.getByTestId(HomepageTestIds.news);
    expect(news).toBeInTheDocument();
  });

  it('has sponsors displayed', async () => {
    const component = render(
      await HomePage({
        params: Promise.resolve({ tenant: TENANT.name }),
      }),
    );

    const sponsors = component.getByTestId(HomepageTestIds.sponsors);
    expect(sponsors).toBeInTheDocument();
  });
});
