import { render, within } from '@testing-library/react';
import AppDashboardsCardOverview from '@/app/dashboards/_internal/AppDashboardsCardOverview';
import {
  UdpDashboardCardTestIds as CardTestIds,
  UdpThumbnailTestIds,
} from 'udp-ui/components';
import {
  generateSanitizedDashboardsMock,
  mockGetThumbnailSrc,
} from '@/app/_test/superset.util';
import { Dashboard } from '@/app/_lib/superset/types';
import { useSuperset } from '@/app/_lib/superset/superset';

const TEST_SUPERSET_URI = 'https://superset.data-hub.local';
const TEST_INDEX = 1;
const TEST_TITLE = 'Test title';
const TEST_TAGS = ['Tag #1', 'Tag #2', 'Tag #3'];
const TEST_THUMBNAIL_BLOB_URL = `blob:${TEST_SUPERSET_URI}/test12345`;

const useSupersetMock = useSuperset as unknown as jest.Mock;
jest.mock('@/app/_lib/superset/superset', () => ({
  useSuperset: jest.fn(),
}));
beforeAll(() => {
  useSupersetMock.mockReturnValue({
    getThumbnailSrc: mockGetThumbnailSrc(TEST_THUMBNAIL_BLOB_URL),
  });
});

const renderComponent = (
  dashboards: Dashboard[],
  onFavoriteChange: (dashboard: Dashboard) => void = () => {},
) =>
  render(
    <AppDashboardsCardOverview
      supersetUri={TEST_SUPERSET_URI}
      dashboards={dashboards}
      onFavoriteChange={onFavoriteChange}
    />,
  );

describe('snapshot', () => {
  it('renders card overview as expected', async () => {
    const dashboards = generateSanitizedDashboardsMock();

    const { container } = renderComponent(dashboards);

    expect(container).toMatchSnapshot();
  });

  const noTitleTestCases = [
    {
      testCase: 'missing',
      dashboard_title: null,
    },
    {
      testCase: 'empty',
      dashboard_title: '',
    },
  ];
  it.each(noTitleTestCases)(
    'matches snapshot where the title of a dashboard is $testCase',
    ({ dashboard_title }) => {
      const dashboards = generateSanitizedDashboardsMock();
      dashboards[TEST_INDEX].dashboard_title = dashboard_title;

      const { container } = renderComponent(dashboards);

      expect(container).toMatchSnapshot();
    },
  );

  const favoriteTestCases = [
    {
      testCase: 'favored',
      favorite: true,
    },
    {
      testCase: 'not favored',
      favorite: false,
    },
  ];
  it.each(favoriteTestCases)(
    'matches snapshot where at least one Dashboard is $testCase',
    ({ favorite }) => {
      const dashboards = generateSanitizedDashboardsMock();
      dashboards[TEST_INDEX].favorite = favorite;

      const { container } = renderComponent(dashboards);

      expect(container).toMatchSnapshot();
    },
  );
});

describe('card overview', () => {
  it('card overview contains as many cards as Dashboards given', async () => {
    const dashboards = generateSanitizedDashboardsMock();

    const component = renderComponent(dashboards);

    expect(component.queryAllByTestId(CardTestIds.self)).toHaveLength(
      dashboards.length,
    );
  });
});

describe('cards', () => {
  it('cards contain the expected data', () => {
    const dashboards = generateSanitizedDashboardsMock();
    dashboards[TEST_INDEX] = {
      ...dashboards[TEST_INDEX],
      dashboard_title: TEST_TITLE,
      tags: TEST_TAGS.map((label, idx) => ({ id: idx, name: label })),
    };

    const component = renderComponent(dashboards);

    const testCard = within(
      component.getAllByTestId(CardTestIds.self)[TEST_INDEX],
    );
    expect(testCard.getByText(TEST_TITLE)).toBeVisible();
    TEST_TAGS.forEach((tag) => expect(testCard.getByText(tag)).toBeVisible());
  });
});

describe('link', () => {
  it('card links to corresponding page', () => {
    const dashboards = generateSanitizedDashboardsMock();
    const expectedHref = `/dashboards/${dashboards[TEST_INDEX].slug}`;

    const component = renderComponent(dashboards);
    const cards = component.getAllByTestId(CardTestIds.self);
    const testCard = cards[TEST_INDEX];

    const linkElement = within(testCard).getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', expectedHref);
  });
});

describe('favorite status', () => {
  const favoriteStatusTestCases = [
    { testCase: 'favored', favorite: true },
    { testCase: 'not favored', favorite: false },
  ];
  it.each(favoriteStatusTestCases)(
    'click on favorite button invokes "onFavoriteChange" callback function when Dashboard is $testCase',
    ({ favorite }) => {
      const onFavoriteChangeMock = jest.fn();
      const dashboards = generateSanitizedDashboardsMock();
      dashboards[TEST_INDEX].favorite = favorite;
      const component = renderComponent(dashboards, onFavoriteChangeMock);

      const testCard = component.getAllByTestId(CardTestIds.self)[TEST_INDEX];
      const testFavButton = within(testCard).getByTestId(CardTestIds.favButton);
      within(testFavButton).getByRole('checkbox').click();

      expect(onFavoriteChangeMock).toHaveBeenCalledWith(dashboards[TEST_INDEX]);
    },
  );
});

describe('published status', () => {
  it('shows the correct status', () => {
    const dashboards = generateSanitizedDashboardsMock();
    dashboards[0].published = true;
    dashboards[1].published = false;
    dashboards[2].published = null;

    const component = renderComponent(dashboards);
    const cards = component.getAllByTestId(CardTestIds.self);

    expect(within(cards[0]).getByText('Veröffentlicht')).toBeVisible();
    expect(within(cards[1]).getByText('Intern')).toBeVisible();
    expect(
      within(cards[2]).queryByText('Veröffentlicht'),
    ).not.toBeInTheDocument();
    expect(within(cards[2]).queryByText('Intern')).not.toBeInTheDocument();
  });
});

describe('thumbnails', () => {
  it('thumbnails are pulsing for those dashboards the thumbnails of which are loading', () => {
    const loadingThumbnail = '/api/v1/loading';
    const errorThumbnail = 'api/v1/error';
    const dashboards = generateSanitizedDashboardsMock([
      { thumbnail_url: loadingThumbnail },
      { thumbnail_url: '/api/v1/not/loading' },
      { thumbnail_url: errorThumbnail },
    ]);
    useSupersetMock.mockReturnValue({
      getThumbnailSrc: (thumbnailUrl: string) => {
        const isLoading = thumbnailUrl === loadingThumbnail;
        const isError = thumbnailUrl === errorThumbnail;
        return {
          src: isLoading || isError ? TEST_THUMBNAIL_BLOB_URL : undefined,
          isError,
          isLoading,
        };
      },
    });

    const component = renderComponent(dashboards);

    const thumbnails = component.getAllByTestId(UdpThumbnailTestIds.self);
    expect(thumbnails[0]).toHaveClass('animate-pulse');
    expect(thumbnails[1]).not.toHaveClass('animate-pulse');
    expect(thumbnails[2]).toHaveClass('animate-pulse');
  });
});
