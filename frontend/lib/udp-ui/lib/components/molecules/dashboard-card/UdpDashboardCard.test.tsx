import { vi, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import UdpDashboardCard from './UdpDashboardCard';
import { DASHBOARD_THUMBNAIL_BAUMRADAR_SRC } from '@/lib/__test__/images.ts';
import { UdpDashboardCardTestIds as TestIds } from '@/lib/components/molecules/dashboard-card/testIds';

const TEST_HREF = '/dashboards/123';
const TEST_TITLE = 'Test Title';
const TEST_FALLBACK_TITLE = 'Test Fallback Title';

describe('snapshots', () => {
  it('matches snapshot', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with subtitle and info', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        subtitle='Subtitle'
        info='Additional Info'
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        isLoading={true}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with no thumbnail', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={undefined}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with fallback title', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={undefined}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with tags', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
        tags={['Tag #1', 'Tag #2', 'Tag #3']}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with additional classes', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
        className={'p-8'}
      />,
    );
    expect(component).toMatchSnapshot();
  });
});

describe('title', () => {
  it('shows title if title given', () => {
    const { container } = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );

    expect(container).toHaveTextContent(TEST_TITLE);
  });

  it('shows fallback title if no title given', () => {
    const { container } = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={undefined}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );

    expect(container).toHaveTextContent(TEST_FALLBACK_TITLE);
  });

  it('matches snapshot with status', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        subtitle='Subtitle'
        info='Additional Info'
        publicStatus={'published'}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with status and tooltips', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        subtitle='Subtitle'
        info='Additional Info'
        publicStatus={'published'}
        publicStatusTooltips={{
          published: 'Veröffentlicht',
          intern: 'Intern',
        }}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    expect(component).toMatchSnapshot();
  });
});

describe('link', () => {
  it('Dashboard card links to corresponding page', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );

    const linkElement = component.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', TEST_HREF);
  });

  it('renders as custom link component', () => {
    const CustomLink = vi.fn();

    render(
      <UdpDashboardCard
        href={TEST_HREF}
        as={CustomLink}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );

    expect(CustomLink).toHaveBeenCalledWith(
      expect.objectContaining({
        href: TEST_HREF,
        children: expect.anything(),
      }),
      undefined,
    );
  });
});

describe('favorite status', () => {
  // assures that click events on the favorite button will not be propagated to the Dashboard card itself
  it("favorite button is not a subcomponent of the card's link element", () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
      />,
    );
    const linkElement = component.getByRole('link');
    const favButton = component.getByTestId(TestIds.favButton);

    expect(favButton).toBeInTheDocument();
    expect(linkElement).not.toContainElement(favButton);
  });

  const favoriteStatusTestCases = [
    { testCase: 'favored', favorite: true },
    { testCase: 'not favored', favorite: false },
  ];
  it.each(favoriteStatusTestCases)(
    'click on favorite button invokes "onFavoriteChange" callback function when Dashboard is $testCase',
    ({ favorite }) => {
      const onFavoriteChangeMock = vi.fn();
      const component = render(
        <UdpDashboardCard
          href={TEST_HREF}
          src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
          title={TEST_TITLE}
          fallbackTitle={TEST_FALLBACK_TITLE}
          isFavorite={favorite}
          onFavoriteChange={onFavoriteChangeMock}
        />,
      );

      const favButton = component.getByTestId(TestIds.favButton);
      favButton.click();

      expect(onFavoriteChangeMock).toHaveBeenCalled();
    },
  );

  it('hides favorite button if specified via property', () => {
    const component = render(
      <UdpDashboardCard
        href={TEST_HREF}
        src={DASHBOARD_THUMBNAIL_BAUMRADAR_SRC}
        title={TEST_TITLE}
        fallbackTitle={TEST_FALLBACK_TITLE}
        hideFavorite
      />,
    );

    expect(component.queryByTestId(TestIds.favButton)).not.toBeInTheDocument();
  });
});
