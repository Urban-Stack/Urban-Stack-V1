import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { FuncMock } from '@/app/_test/utils';
import { UdpScrollWrapper, UdpTabs } from 'udp-ui/components';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';
import { SettingsTabsTestIds as TestIds } from '@/app/settings/_common/testIds';
import React from 'react';
import { Breakpoint } from 'udp-ui/tailwind';
import Link from 'next/link';

const TABS = {
  'Tab 1': '/example/test/1',
  'Tab 2': '/example/test/2',
  'Tab 3': '/example/test/3',
};
const TEST_INDEX = 1;
const ID_SCROLL_WRAPPER = 'test-id-scroll-wrapper';

jest.mock('udp-ui/components', () => ({
  UdpTabs: jest.fn(),
  UdpScrollWrapper: jest.fn(() => <div data-testid={ID_SCROLL_WRAPPER} />),
}));

const usePathnameMock: FuncMock<typeof usePathname> =
  usePathname as unknown as jest.Mock;
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('structure', () => {
  it('dropdown container comprises tabs component without scroll component', () => {
    usePathnameMock.mockReturnValue(Object.values(TABS)[TEST_INDEX]);

    const { getByTestId } = render(SettingsTabs({ tabsData: TABS }));

    const dropdownCtr = getByTestId(TestIds.dropdown);
    expect(dropdownCtr).toHaveClass('block md:hidden');
    expect(dropdownCtr).not.toContainElement(getByTestId(ID_SCROLL_WRAPPER));
  });

  it('tab bar container comprises tabs component surrounded with scroll component', () => {
    usePathnameMock.mockReturnValue(Object.values(TABS)[TEST_INDEX]);

    const { getByTestId } = render(SettingsTabs({ tabsData: TABS }));

    const tabBarCtr = getByTestId(TestIds.tabBar);
    expect(tabBarCtr).toHaveClass('hidden md:block');
    expect(tabBarCtr).toContainElement(getByTestId(ID_SCROLL_WRAPPER));
    expect(UdpScrollWrapper).toHaveBeenCalledWith(
      expect.objectContaining({
        gradClassName: 'from-primary-50 w-32',
        children: expect.objectContaining({
          props: {
            tabsData: TABS,
            activeLabel: Object.keys(TABS)[TEST_INDEX],
            as: Link,
            breakpoint: Breakpoint.md,
          },
        }),
      }),
      undefined,
    );
  });
});

describe('properties', () => {
  it('contains expected tabs with correct links', () => {
    usePathnameMock.mockReturnValue(Object.values(TABS)[TEST_INDEX]);

    render(SettingsTabs({ tabsData: TABS }));

    expect(UdpTabs).toHaveBeenCalledWith(
      expect.objectContaining({
        tabsData: TABS,
        activeLabel: Object.keys(TABS)[TEST_INDEX],
        breakpoint: Breakpoint.md,
      }),
      undefined,
    );
  });
});

describe('active tab', () => {
  it('activates tab for corresponding page', () => {
    usePathnameMock.mockReturnValue(Object.values(TABS)[TEST_INDEX]);

    render(SettingsTabs({ tabsData: TABS }));

    expect(UdpTabs).toHaveBeenCalledWith(
      expect.objectContaining({
        activeLabel: Object.keys(TABS)[TEST_INDEX],
      }),
      undefined,
    );
  });

  it('activates tab for corresponding sub page', () => {
    usePathnameMock.mockReturnValue(
      Object.values(TABS)[TEST_INDEX] + '/sub/page',
    );

    render(SettingsTabs({ tabsData: TABS }));

    expect(UdpTabs).toHaveBeenCalledWith(
      expect.objectContaining({
        activeLabel: Object.keys(TABS)[TEST_INDEX],
      }),
      undefined,
    );
  });
});
