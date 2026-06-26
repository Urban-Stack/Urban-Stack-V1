import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import UdpCityToolCard, {
  BadgeStateType,
  CreatorType,
  StateDataType,
  StateType,
} from './UdpCityToolCard';
import { UdpCityToolCardTestIds as TestIds } from './testIds';
import { createRender } from '@/lib/test-utils';
import { UdpButtonTestIds } from '@/lib/components';

const USER = userEvent.setup();

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
});

const TITLE = 'City Tool title';
const DESCRIPTION = 'City Tool description';
const CATEGORIES = ['cat1', 'cat2'];
const TEST_HREF = '/foobar';
const TEST_TARGET = 'test target';
const STATE_TYPE_TEXT = 'test state text';
const CONTACT_MAIL = 'contact@mail.xy';
const CONTACT_PREFIX = 'Ansprechpartner:';
const FALLBACK_IMAGE = 'https://example.com/fallback.jpg';

const renderComp = createRender(UdpCityToolCard, {
  title: TITLE,
  description: DESCRIPTION,
  categories: CATEGORIES,
  fallbackImage: FALLBACK_IMAGE,
});

describe('snapshots', () => {
  it('matches snapshot for minimal content', () => {
    const component = render(
      <UdpCityToolCard
        title={TITLE}
        description={DESCRIPTION}
        categories={CATEGORIES}
        fallbackImage={FALLBACK_IMAGE}
      />,
    );

    expect(component.container).toHaveTextContent(TITLE);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when linked', () => {
    const component = renderComp({ href: TEST_HREF });

    expect(component).toMatchSnapshot();
  });

  it.each(StateType)("matches snapshot for state '%s'", (stateType) => {
    const typeText = `${stateType} text`;

    const component = renderComp({
      state: {
        type: stateType,
        typeText: typeText,
      },
    });

    expect(component.getByText(typeText)).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const component = renderComp({
      state: {
        type: 'installable',
        typeText: 'Installieren',
      },
      isLoading: true,
    });

    expect(component.getByTestId(UdpButtonTestIds.spinner)).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for installation count given', () => {
    const component = renderComp({
      installation: {
        count: 123,
        countToText: (n) => `${n} Installationen`,
      },
    });

    expect(component.container).toHaveTextContent('123 Installationen');
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for contact given', () => {
    const component = renderComp({
      contact: {
        mail: CONTACT_MAIL,
        prefixText: CONTACT_PREFIX,
      },
    });

    expect(component.getByTestId(TestIds.contactBadge)).toBeInTheDocument();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when editable', () => {
    const badgeText = 'edit badge';

    const component = renderComp({
      editBadge: {
        action: () => {},
        tooltipText: badgeText,
      },
    });

    expect(component.getByText(badgeText)).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when removable', () => {
    const badgeText = 'remove badge';

    const component = renderComp({
      removeBadge: {
        action: () => {},
        tooltipText: badgeText,
      },
    });

    expect(component.getByText(badgeText)).toBeVisible();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with custom class', () => {
    const customClass = 'custom-test-class';

    const component = renderComp({ className: customClass });

    expect(component.getByTestId(TestIds.self)).toHaveClass(customClass);
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with pictureUri', () => {
    const component = renderComp({ pictureUri: 'https://example.com/img.jpg' });

    expect(component).toMatchSnapshot();
  });

  it('matches snapshot with fallbackImage', () => {
    const component = renderComp({ fallbackImage: FALLBACK_IMAGE });

    expect(component).toMatchSnapshot();
  });
});

describe('title link', () => {
  it('card title links to corresponding page', () => {
    renderComp({ href: TEST_HREF, target: TEST_TARGET });

    const linkElement = screen.getByTestId(TestIds.title);
    expect(linkElement).toHaveAttribute('href', TEST_HREF);
    expect(linkElement).toHaveAttribute('target', TEST_TARGET);
  });

  it('renders as custom link component', async () => {
    const customLinkId = 'test-custom-link-id';
    const CustomLink = vi.fn(() => <div data-testid={customLinkId}></div>);

    renderComp({ as: CustomLink, href: TEST_HREF, target: TEST_TARGET });
    await USER.click(screen.getByTestId(customLinkId));

    expect(CustomLink).toHaveBeenCalledWith(
      expect.objectContaining({ href: TEST_HREF, target: TEST_TARGET }),
      undefined,
    );
  });
});

describe('install button', () => {
  const INSTALL_STATE = {
    type: 'installable',
    typeText: 'Installieren',
    onClick: () => {},
  } as StateDataType;

  it('install button has given text', () => {
    renderComp({ state: { ...INSTALL_STATE, typeText: STATE_TYPE_TEXT } });

    const installButton = screen.getByTestId(TestIds.installButton);
    expect(installButton).toHaveTextContent(STATE_TYPE_TEXT);
  });

  it('click on install button invokes given callback function', async () => {
    const installMock = vi.fn();
    renderComp({ state: { ...INSTALL_STATE, onClick: installMock } });

    await USER.click(screen.getByTestId(TestIds.installButton));

    expect(installMock).toHaveBeenCalledOnce();
  });

  it.each(BadgeStateType)(
    'card does not contain install button if not installable (state = %s)',
    async (stateType) => {
      renderComp({
        state: {
          type: stateType,
          typeText: 'type text',
          onClick: () => {},
        },
      });

      const installButton = screen.queryByTestId(TestIds.installButton);
      expect(installButton).not.toBeInTheDocument();
    },
  );

  it('card does not contain install button if no state given', async () => {
    renderComp({ state: undefined });

    const installButton = screen.queryByTestId(TestIds.installButton);
    expect(installButton).not.toBeInTheDocument();
  });

  it('install button contains spinner when loading', () => {
    renderComp({ isLoading: true, state: INSTALL_STATE });

    const installButton = screen.getByTestId(TestIds.installButton);
    const spinner = within(installButton).getByTestId(UdpButtonTestIds.spinner);
    expect(spinner).toBeVisible();
  });

  it('install button does not contain spinner when not loading', () => {
    renderComp({
      isLoading: false,
      state: INSTALL_STATE,
    });

    const installButton = within(screen.getByTestId(TestIds.installButton));
    const spinner = installButton.queryByTestId(UdpButtonTestIds.spinner);
    expect(spinner).not.toBeInTheDocument();
  });
});

describe('state badge', () => {
  const STATE = {
    type: 'installed',
    typeText: 'Installiert',
    onClick: () => {},
  } as StateDataType;

  it('state badge has given text', () => {
    renderComp({ state: { ...STATE, typeText: STATE_TYPE_TEXT } });

    const stateBadge = screen.getByTestId(TestIds.stateBadge);
    expect(stateBadge).toHaveTextContent(STATE_TYPE_TEXT);
  });

  it('click on state badge invokes state action if given', async () => {
    const actionMock = vi.fn();
    renderComp({ state: { ...STATE, onClick: actionMock } });

    await USER.click(screen.getByTestId(TestIds.stateBadge));

    expect(actionMock).toHaveBeenCalledOnce();
  });

  it('renders state trigger through render-prop and preserves click', async () => {
    const onClick = vi.fn();
    const WRAP_ID = 'state-render-wrap';

    renderComp({
      state: {
        type: 'installed',
        typeText: STATE_TYPE_TEXT,
        onClick,
        render: (el) => <div data-testid={WRAP_ID}>{el}</div>,
      },
    });

    expect(screen.getByTestId(WRAP_ID)).toBeInTheDocument();

    await USER.click(screen.getByTestId(TestIds.stateBadge));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('contact badge', () => {
  it('shows contact badge with mailto link when contact is given', () => {
    renderComp({
      contact: { mail: CONTACT_MAIL, prefixText: CONTACT_PREFIX },
    });

    const badge = screen.getByTestId(TestIds.contactBadge);
    expect(badge).toBeInTheDocument();
    expect(badge.closest('a')).toHaveAttribute(
      'href',
      `mailto:${CONTACT_MAIL}`,
    );
  });

  it('does not show contact badge when contact is undefined', () => {
    renderComp({ contact: undefined });

    expect(screen.queryByTestId(TestIds.contactBadge)).not.toBeInTheDocument();
  });

  it('does not show contact badge when hideContactButton is true', () => {
    renderComp({
      contact: { mail: CONTACT_MAIL, prefixText: CONTACT_PREFIX },
      hideContactButton: true,
    });

    expect(screen.queryByTestId(TestIds.contactBadge)).not.toBeInTheDocument();
  });

  it('shows contact badge by default when hideContactButton is not set', () => {
    renderComp({
      contact: { mail: CONTACT_MAIL, prefixText: CONTACT_PREFIX },
    });

    expect(screen.getByTestId(TestIds.contactBadge)).toBeInTheDocument();
  });
});

describe('install count text', () => {
  it('displays install count text', () => {
    const component = renderComp({
      installation: { count: 1611, countToText: (n) => `${n} Installationen` },
    });

    expect(component.getByTestId(TestIds.installCount)).toHaveTextContent(
      '1611 Installationen',
    );
  });

  it('does not show installation count if undefined', () => {
    const component = renderComp({ installation: undefined });

    expect(
      component.queryByTestId(TestIds.installCount),
    ).not.toBeInTheDocument();
  });

  it('shows installation count alongside contact badge', () => {
    const component = renderComp({
      contact: { mail: CONTACT_MAIL, prefixText: CONTACT_PREFIX },
      installation: {
        count: 123,
        countToText: (num) => `${num} Installationen`,
      },
    });

    expect(component.getByTestId(TestIds.installCount)).toHaveTextContent(
      '123 Installationen',
    );
    expect(component.getByTestId(TestIds.contactBadge)).toBeInTheDocument();
  });
});

describe('edit badge', () => {
  it('editable if edit data is provided', async () => {
    const onEditMock = vi.fn();
    renderComp({ editBadge: { action: onEditMock } });

    const editBadge = screen.getByTestId(TestIds.editBadge);
    expect(editBadge).toBeEnabled();
    expect(onEditMock).not.toHaveBeenCalled();
    await USER.click(editBadge);
    expect(onEditMock).toHaveBeenCalledOnce();
  });

  it('renders as custom link component', async () => {
    const CustomLink = vi.fn((props) => <div {...props}></div>);

    renderComp({ editBadge: { as: CustomLink, href: TEST_HREF } });
    await USER.click(screen.getByTestId(TestIds.editBadge));

    expect(CustomLink).toHaveBeenCalledWith(
      expect.objectContaining({ href: TEST_HREF }),
      undefined,
    );
  });

  it('no edit badge if edit data missing', () => {
    renderComp({ editBadge: undefined });

    const editBadge = screen.queryByTestId(TestIds.editBadge);
    expect(editBadge).not.toBeInTheDocument();
  });
});

describe('remove badge', () => {
  it('removable if remove data is provided', async () => {
    const onRemoveMock = vi.fn();
    renderComp({ removeBadge: { action: onRemoveMock } });

    const removeBadge = screen.getByTestId(TestIds.removeBadge);
    expect(removeBadge).toBeEnabled();
    expect(onRemoveMock).not.toHaveBeenCalled();
    await USER.click(removeBadge);
    expect(onRemoveMock).toHaveBeenCalledOnce();
  });

  it('renders as custom link component', async () => {
    const CustomLink = vi.fn((props) => <div {...props}></div>);

    renderComp({ removeBadge: { as: CustomLink, href: TEST_HREF } });
    await USER.click(screen.getByTestId(TestIds.removeBadge));

    expect(CustomLink).toHaveBeenCalledWith(
      expect.objectContaining({ href: TEST_HREF }),
      undefined,
    );
  });

  it('no remove badge if remove data missing', () => {
    renderComp({ removeBadge: undefined });

    const removeBadge = screen.queryByTestId(TestIds.removeBadge);
    expect(removeBadge).not.toBeInTheDocument();
  });
});

describe('creator badge', () => {
  it.each<{
    creator: CreatorType;
    tooltip: string;
  }>([
    { creator: 'static-app', tooltip: 'Static App' },
    { creator: 'my-shared-app', tooltip: 'Created by my tenant' },
    {
      creator: 'public-shared-app',
      tooltip: 'Created by another tenant',
    },
  ])(
    'displays creator badge and tooltip for creator type $creator',
    async ({ creator, tooltip }) => {
      renderComp({ creator: creator, creatorTooltip: tooltip });

      const creatorBadge = screen.getByTestId(TestIds.creatorIcon);
      expect(creatorBadge).toBeVisible();

      await USER.hover(creatorBadge);
      const tooltipElement = await screen.findByRole('tooltip');

      expect(tooltipElement).toBeVisible();
      expect(tooltipElement).toHaveTextContent(tooltip);
    },
  );
});

describe('action slot', () => {
  const ACTION_SLOT_TEXT = 'action slot text';
  const testid = 'action-slot-test-id';

  it('renders action slot if given', () => {
    renderComp({
      actionSlot: <div data-testid={testid}>{ACTION_SLOT_TEXT}</div>,
    });

    const actionSlot = screen.getByTestId(testid);

    expect(actionSlot).toBeVisible();
    expect(actionSlot).toHaveTextContent(ACTION_SLOT_TEXT);
  });
});

describe('hide elements', () => {
  it('hides install button for installables', () => {
    renderComp({
      state: {
        type: 'installable',
        typeText: 'Installieren',
        onClick: () => {},
      },
      hideInstallButton: true,
    });

    const installButton = screen.queryByTestId(TestIds.installButton);
    expect(installButton).not.toBeInTheDocument();
  });

  it('hides delete button', () => {
    renderComp({
      removeBadge: {
        action: () => {},
        tooltipText: 'remove badge',
      },
      hideDeleteButton: true,
    });

    const removeBadge = screen.queryByTestId(TestIds.removeBadge);
    expect(removeBadge).not.toBeInTheDocument();
  });
});

describe('more details', () => {
  it('always shows more details button', () => {
    renderComp({});

    const moreDetailsButton = screen.queryByTestId(TestIds.moreDetailsButton);
    expect(moreDetailsButton).toBeVisible();
  });

  it('opens modal with more details', async () => {
    renderComp({
      pictureUri: 'https://abc.jpg',
    });

    expect(
      screen.queryByTestId(TestIds.moreDetailsContent),
    ).not.toBeInTheDocument();

    await USER.click(screen.getByTestId(TestIds.moreDetailsButton));

    const moreDetailModalContent = screen.getByTestId(
      TestIds.moreDetailsContent,
    );
    expect(moreDetailModalContent).toBeVisible();
    expect(moreDetailModalContent).toHaveTextContent(DESCRIPTION);
    expect(
      within(moreDetailModalContent).getByRole('img', {
        name: 'City Tool picture',
      }),
    ).toHaveAttribute('src', 'https://abc.jpg');
  });

  it('shows description in modal even without pictureUri', async () => {
    renderComp({});

    await USER.click(screen.getByTestId(TestIds.moreDetailsButton));

    const moreDetailModalContent = screen.getByTestId(
      TestIds.moreDetailsContent,
    );
    expect(moreDetailModalContent).toBeVisible();
    expect(moreDetailModalContent).toHaveTextContent(DESCRIPTION);
  });
});

describe('categories', () => {
  it('shows category badges if categories provided', () => {
    const categories = ['cat1', 'cat2', 'cat3'];
    renderComp({
      categories: categories,
    });

    const badgeGroup = screen.getByTestId(TestIds.categories);
    expect(badgeGroup).toBeVisible();

    for (const cat of categories) {
      expect(within(badgeGroup).getByText(cat)).toBeVisible();
    }
  });

  it('does not render categories container if no categories provided', () => {
    renderComp({
      categories: [],
    });

    const badgeGroup = screen.queryByTestId(TestIds.categories);
    expect(badgeGroup).not.toBeInTheDocument();
  });
});

describe('image', () => {
  it('shows pictureUri image when provided', () => {
    const { container } = renderComp({
      pictureUri: 'https://example.com/img.jpg',
    });

    const img = container.querySelector(
      'img[src="https://example.com/img.jpg"]',
    );
    expect(img).toBeInTheDocument();
  });

  it('shows fallback image with overlay when no pictureUri', () => {
    const { container } = renderComp({
      fallbackImage: FALLBACK_IMAGE,
    });

    const img = container.querySelector(`img[src="${FALLBACK_IMAGE}"]`);
    expect(img).toBeInTheDocument();
  });
});
