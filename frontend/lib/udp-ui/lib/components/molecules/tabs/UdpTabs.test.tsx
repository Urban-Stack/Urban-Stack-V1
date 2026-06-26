import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { within } from '@testing-library/react';
import { UdpTabs } from '@/lib/components';
import { TabsTestIds as TestIds } from '@/lib/components/molecules/tabs/testIds.ts';
import { Breakpoint, Viewport } from '@/lib/tailwind/classes';
import useViewport from '@/lib/hook/useViewport';
import userEvent from '@testing-library/user-event';
import {
  getViewportLargerThan,
  getViewportSmallerThan,
} from '@/lib/test-utils/viewport';
import { createRender } from '@/lib/test-utils';

const USER = userEvent.setup();

const TEST_TABS = {
  'Test Label 1': '/test/path/1',
  'Test Label 2': '/test/path/2',
  'Test Label 3': '/test/path/3',
} as Record<string, string>;
const TEST_INDEX = 1;
const TEST_LABELS = Object.keys(TEST_TABS);
const TEST_LABEL = TEST_LABELS[TEST_INDEX];
const TEST_LINKS = Object.values(TEST_TABS);
const TEST_BREAKPOINT = Breakpoint.md;

vi.mock('@/lib/hook/useViewport', () => ({
  default: vi.fn(),
}));
const useViewportMock = useViewport as Mock;

afterEach(() => {
  vi.restoreAllMocks();
});

const renderComp = createRender(UdpTabs, {
  tabsData: TEST_TABS,
  activeLabel: TEST_LABEL,
});

describe('snapshot', () => {
  it('matches snapshot for tab bar', () => {
    useViewportMock.mockReturnValue(getViewportLargerThan(TEST_BREAKPOINT));
    const component = renderComp({ breakpoint: TEST_BREAKPOINT });

    expect(component.getByTestId(TestIds.tabBar)).toBeInTheDocument();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot when dropdown closed', () => {
    useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
    const component = renderComp({ breakpoint: TEST_BREAKPOINT });

    expect(component.getByTestId(TestIds.dropdown)).toBeInTheDocument();
    expect(component.queryByRole('menu')).not.toBeInTheDocument();
    expect(component).toMatchSnapshot();
  });

  it('matches snapshot for dropdown popover', async () => {
    useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
    const component = renderComp({ breakpoint: TEST_BREAKPOINT });

    const triggerButton = component.getByRole('button');
    await USER.click(triggerButton);

    const popover = component.getByRole('menu');
    expect(within(popover).getByRole('list')).toMatchSnapshot();
  });
});

describe('properties', () => {
  describe('tabsData', () => {
    it('contains one tab for each given tab data entry', () => {
      useViewportMock.mockReturnValue(getViewportLargerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        breakpoint: TEST_BREAKPOINT,
      });

      const tabBar = component.getByTestId(TestIds.tabBar);
      const tabs = within(tabBar).getAllByRole('link');
      expect(tabs).toHaveLength(Object.entries(TEST_TABS).length);
      tabs.every((tab, idx) => {
        expect(tab).toHaveTextContent(TEST_LABELS[idx]);
        expect(tab).toHaveAttribute('href', TEST_LINKS[idx]);
      });
    });

    it('contains one dropdown item for each given tab data entry', async () => {
      useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        breakpoint: TEST_BREAKPOINT,
      });

      const triggerButton = component.getByRole('button');
      await USER.click(triggerButton);

      const dropdown = component.getByTestId(TestIds.dropdown);
      const items = within(dropdown).getAllByRole('link');
      expect(items).toHaveLength(Object.entries(TEST_TABS).length);
      items.every((item, idx) => {
        expect(item).toHaveTextContent(TEST_LABELS[idx]);
        expect(item).toHaveAttribute('href', TEST_LINKS[idx]);
      });
    });
  });

  describe('activeLabel', () => {
    const ACTIVE_COLOR = 'text-primary-700';

    const expectActiveByLabel = (links: HTMLElement[], activeLabel: string) => {
      links.forEach((link) =>
        link.textContent === activeLabel
          ? expect(link).toHaveClass(ACTIVE_COLOR)
          : expect(link).not.toHaveClass(ACTIVE_COLOR),
      );
    };

    it('tab of given label is active', () => {
      useViewportMock.mockReturnValue(getViewportLargerThan(TEST_BREAKPOINT));
      const component = renderComp({
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
      });

      const tabBar = component.getByTestId(TestIds.tabBar);
      const tabs = within(tabBar).getAllByRole('button');
      expectActiveByLabel(tabs, TEST_LABEL);
    });

    it('dropdown item of given label is active', async () => {
      useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
      const component = renderComp({
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
      });

      const triggerButton = component.getByRole('button');
      await USER.click(triggerButton);

      const dropdown = component.getByTestId(TestIds.dropdown);
      const items = within(dropdown).getAllByRole('link');
      expectActiveByLabel(items, TEST_LABEL);
    });
  });

  describe('as', () => {
    const CUSTOM_ROLE = 'custom-link';

    it('renders tabs as custom link component if "as" property is provided', () => {
      const Link = ({ ...props }) => <div {...props} role={CUSTOM_ROLE} />;
      useViewportMock.mockReturnValue(getViewportLargerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
        as: Link,
      });

      const tabBar = component.getByTestId(TestIds.tabBar);
      const tabs = within(tabBar).getAllByRole(CUSTOM_ROLE);
      expect(tabs).toHaveLength(Object.entries(TEST_TABS).length);
    });

    it('renders tabs as "a" link by default', () => {
      useViewportMock.mockReturnValue(getViewportLargerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
      });

      const tabBar = component.getByTestId(TestIds.tabBar);
      const tabs = tabBar.querySelectorAll('a');
      expect(tabs).toHaveLength(Object.entries(TEST_TABS).length);
    });

    it('renders dropdown items as custom link component if "as" property is provided', async () => {
      const Link = ({ ...props }) => <div {...props} role={CUSTOM_ROLE} />;
      useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
        as: Link,
      });

      const triggerButton = component.getByRole('button');
      await USER.click(triggerButton);

      const dropdown = component.getByTestId(TestIds.dropdown);
      const tabs = within(dropdown).getAllByRole(CUSTOM_ROLE);
      expect(tabs).toHaveLength(Object.entries(TEST_TABS).length);
    });

    it('renders tabs as "a" link by default', async () => {
      useViewportMock.mockReturnValue(getViewportSmallerThan(TEST_BREAKPOINT));
      const component = renderComp({
        tabsData: TEST_TABS,
        activeLabel: TEST_LABEL,
        breakpoint: TEST_BREAKPOINT,
      });

      const triggerButton = component.getByRole('button');
      await USER.click(triggerButton);

      const dropdown = component.getByTestId(TestIds.dropdown);
      const tabs = dropdown.querySelectorAll('a');
      expect(tabs).toHaveLength(Object.entries(TEST_TABS).length);
    });
  });

  describe('className', () => {
    it('passes custom class', () => {
      const customClass = 'test-class';

      const component = renderComp({ className: customClass });

      expect(component.getByRole('navigation')).toHaveClass(customClass);
    });
  });

  describe('breakpoint', () => {
    describe('renders dropdown for viewports smaller than given breakpoint', () => {
      const BREAKPOINT_LG = Breakpoint.lg;

      it.each([Viewport.base, Viewport.sm, Viewport.md])(
        "breakpoint = 'lg' and viewport = '%s'",
        (viewport) => {
          useViewportMock.mockReturnValue(viewport);

          const { queryByTestId } = renderComp({ breakpoint: BREAKPOINT_LG });

          expect(queryByTestId(TestIds.dropdown)).toBeInTheDocument();
          expect(queryByTestId(TestIds.tabBar)).not.toBeInTheDocument();
        },
      );
    });

    describe('renders tab bar for viewports larger than given breakpoint', () => {
      const BREAKPOINT_LG = Breakpoint.lg;

      it.each([Viewport.lg, Viewport.xl, Viewport['2xl']])(
        "breakpoint = 'lg' and viewport = '%s'",
        (viewport) => {
          useViewportMock.mockReturnValue(viewport);

          const { queryByTestId } = renderComp({ breakpoint: BREAKPOINT_LG });

          expect(queryByTestId(TestIds.tabBar)).toBeInTheDocument();
          expect(queryByTestId(TestIds.dropdown)).not.toBeInTheDocument();
        },
      );
    });
  });
});
