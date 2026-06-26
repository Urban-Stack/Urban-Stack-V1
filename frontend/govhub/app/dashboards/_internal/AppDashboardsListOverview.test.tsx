import { render, within } from '@testing-library/react';
import AppDashboardsListOverview, {
  AppDashboardListOverviewTestIds as TestIds,
} from '@/app/dashboards/_internal/AppDashboardsListOverview';
import { generateSanitizedDashboardsMock } from '@/app/_test/superset.util';
import { Dashboard } from '@/app/_lib/superset/types';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

const TEST_SUPERSET_URI = 'https://superset.data-hub.local';
const TEST_INDEX = 1;

const pushMock = jest.fn();
const useRouterMock = useRouter as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeAll(() => {
  pushMock.mockReset();
  useRouterMock.mockReset().mockReturnValue({ push: pushMock });
});

const renderComponent = (
  dashboards: Dashboard[],
  onFavoriteChange: (dashboard: Dashboard) => void = () => {},
) =>
  render(
    <AppDashboardsListOverview
      supersetUri={TEST_SUPERSET_URI}
      dashboards={dashboards}
      onFavoriteChange={onFavoriteChange}
    />,
  );

describe('snapshot', () => {
  it('renders list overview as expected', async () => {
    const dashboards = generateSanitizedDashboardsMock();

    const { container } = renderComponent(dashboards);

    expect(container).toMatchSnapshot();
  });

  const favoriteTestCases = [
    { testCase: 'favored', favorite: true },
    { testCase: 'not favored', favorite: false },
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
});

describe('list overview', () => {
  it('list overview contains table with expected headers', () => {
    const dashboards: Dashboard[] = [];

    const component = renderComponent(dashboards);

    const list = component.queryByTestId(TestIds.self);
    expect(list).toHaveTextContent('Name');
    expect(list).toHaveTextContent('Zuletzt bearbeitet');
    expect(list).toHaveTextContent('Tags');
  });

  it('list overview contains table with as many rows as Dashboards given', async () => {
    const dashboards = generateSanitizedDashboardsMock();

    const component = renderComponent(dashboards);

    const rows = component.queryAllByTestId(TestIds.item);
    expect(rows).toHaveLength(dashboards.length);
  });

  it('name is fallback title for dashboard with property "dashboard_title" missing', () => {
    const dashboards = generateSanitizedDashboardsMock();
    dashboards[TEST_INDEX].dashboard_title = null;

    const component = renderComponent(dashboards);

    const nameCells = component.queryAllByTestId(TestIds.name);
    expect(nameCells[TEST_INDEX]).toHaveTextContent('Unbenanntes Dashboard');
  });
});

describe('link', () => {
  it('table row links to corresponding Dashboard', async () => {
    const dashboards = generateSanitizedDashboardsMock();
    const expectedHref = `/dashboards/${dashboards[TEST_INDEX].slug}`;

    const component = renderComponent(dashboards);
    const testRow = component.getAllByTestId(TestIds.item)[TEST_INDEX];

    const testLinkElement = within(testRow).getByRole('link');
    expect(testLinkElement).toBeInTheDocument();
    expect(testLinkElement).toHaveAttribute('href', expectedHref);
  });
});

describe('favorite status', () => {
  // assures that click events on the favorite button will not be propagated to the Dashboard row itself
  it("favorite button is not a subcomponent of the row's link element", () => {
    const dashboards = generateSanitizedDashboardsMock();

    const component = renderComponent(dashboards);
    const testRow = within(
      component.queryAllByTestId(TestIds.item)[TEST_INDEX],
    );

    const testFavButton = testRow.getByTestId(TestIds.favButton);
    const testLinkElement = testRow.getByRole('link');
    expect(testFavButton).toBeInTheDocument();
    expect(testLinkElement).not.toContainElement(testFavButton);
  });

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
      const testRow = component.getAllByTestId(TestIds.item)[TEST_INDEX];

      const testFavButton = within(testRow).getByTestId(TestIds.favButton);
      testFavButton.click();

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
    const rows = component.getAllByTestId(TestIds.item);

    expect(within(rows[0]).getByText('Veröffentlicht')).toBeVisible();
    expect(within(rows[1]).getByText('Intern')).toBeVisible();
    expect(
      within(rows[2]).queryByText('Veröffentlicht'),
    ).not.toBeInTheDocument();
    expect(within(rows[2]).queryByText('Intern')).not.toBeInTheDocument();
  });
});

describe('navigation', () => {
  it('pressing the enter key on a table row redirects to the corresponding dashboard page', async () => {
    const user = userEvent.setup();
    const dashboards = generateSanitizedDashboardsMock();
    const component = renderComponent(dashboards);

    const testDashboard = dashboards[TEST_INDEX];
    const testRow = component.queryAllByTestId(TestIds.item)[TEST_INDEX];
    await user.type(testRow, '{enter}');

    expect(pushMock).toHaveBeenCalledWith(`/dashboards/${testDashboard.slug}`);
  });
});
