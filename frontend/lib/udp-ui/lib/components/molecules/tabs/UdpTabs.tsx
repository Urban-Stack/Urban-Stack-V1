'use client';

import React, { ElementType } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  createTheme,
  Dropdown,
  DropdownItem,
  DropdownTheme,
  ListGroup,
  ListGroupItem,
  ListGroupTheme,
} from 'flowbite-react';
import { TabsTestIds } from '@/lib/components/molecules/tabs/testIds.ts';
import useViewport from '@/lib/hook/useViewport.ts';
import { Breakpoint, BreakpointObject } from '@/lib/tailwind/classes.ts';

const ACTIVE_LINE_CLASS = '!border-b-primary-700';
const DEFAULT_LINE_CLASS = 'border-b-primary-200';
const BORDER_CLASS = '!border-2 border-transparent';
const FOCUS_CLASS =
  'focus:outline-hidden focus:ring-0 focus:border-primary-300 focus:text-primary-300';
const TEXT_CLASS = 'text-base font-normal';
const ACTIVE_TEXT_CLASS = 'text-primary-700';
const DEFAULT_TEXT_CLASS = 'text-primary-200';
const TAB_CLASS =
  'h-full px-4 bg-transparent hover:bg-transparent !rounded-b-none !rounded-t-lg cursor-pointer';

const mkTheme = () =>
  createTheme({
    dropdown: {
      floating: {
        item: {
          base: twMerge(TEXT_CLASS, DEFAULT_TEXT_CLASS),
        },
        target: twMerge(
          TAB_CLASS,
          TEXT_CLASS,
          BORDER_CLASS,
          FOCUS_CLASS,
          'hover:bg-gray-100',
          ACTIVE_TEXT_CLASS,
          ACTIVE_LINE_CLASS,
        ),
      },
    } as DropdownTheme,
    listGroup: {
      root: {
        base: 'border-none rounded-none',
      },
      item: {
        base: twMerge(TEXT_CLASS, 'contents'),
        link: {
          base: twMerge(
            TAB_CLASS,
            BORDER_CLASS,
            FOCUS_CLASS,
            `hover:${ACTIVE_TEXT_CLASS}`,
          ),
          active: {
            off: DEFAULT_TEXT_CLASS,
            on: twMerge(
              ACTIVE_TEXT_CLASS,
              `focus:!${ACTIVE_TEXT_CLASS}`,
              ACTIVE_LINE_CLASS,
            ),
          },
        },
      },
    } as ListGroupTheme,
  });

type TabsData = Record<string, string>;
export type UdpTabBarProps<T extends TabsData = TabsData> = {
  tabsData: T;
  activeLabel: keyof T;
  as?: ElementType;
  className?: string;
};

/**
 * List of tab items.
 * <p>
 * Tabs are aligned horizontally (with a scrollbar if needed),
 * or by means of a dropdown for smaller screens (see `breakpoint`).
 *
 * @param tabsData    record of the labels and hrefs for the individual tabs
 * @param activeLabel label of the initially selected tab
 * @param as          type of the link elements (defaults to `a`)
 * @param className   class name for this tab component
 * @param breakpoint  breakpoint for the component representation (i.e. dropdown or list group)
 * @constructor
 */
const UdpTabs = <T extends TabsData>({
  tabsData,
  activeLabel,
  as = 'a',
  className,
  breakpoint = Breakpoint.sm,
}: UdpTabBarProps<T> & { breakpoint?: BreakpointObject }) => {
  const customTheme = mkTheme();
  return (
    <nav className={twMerge('relative flex h-10 min-w-max', className)}>
      <div
        className={twMerge(
          'absolute size-full',
          BORDER_CLASS,
          DEFAULT_LINE_CLASS,
        )}
      />
      <div className='relative h-full flex'>
        {useViewport() < breakpoint ? (
          <TabDropdown
            tabsData={tabsData}
            activeLabel={activeLabel}
            as={as}
            theme={customTheme.dropdown}
          />
        ) : (
          <TabBar
            tabsData={tabsData}
            activeLabel={activeLabel}
            as={as}
            theme={customTheme.listGroup}
          />
        )}
      </div>
    </nav>
  );
};

export default UdpTabs;

const TabDropdown = <T extends TabsData>({
  tabsData,
  activeLabel,
  as,
  theme,
}: UdpTabBarProps<T> & { theme: DropdownTheme }) => (
  <div data-testid={TabsTestIds.dropdown}>
    <Dropdown
      label={activeLabel as string}
      placement='bottom-start'
      className='max-w-96'
      theme={theme}
    >
      {Object.entries(tabsData).map(([label, href]) => (
        <DropdownItem
          href={href as string}
          as={as}
          className={label === activeLabel ? ACTIVE_TEXT_CLASS : ''}
          key={label}
        >
          {label}
        </DropdownItem>
      ))}
    </Dropdown>
  </div>
);

const TabBar = <T extends TabsData>({
  tabsData,
  activeLabel,
  as: LinkComp = 'a',
  theme,
}: UdpTabBarProps<T> & { theme: ListGroupTheme }) => (
  <div className='h-full truncate' data-testid={TabsTestIds.tabBar}>
    <ListGroup className='h-full flex bg-transparent' theme={theme.root}>
      {Object.entries(tabsData).map(([label, href]) => (
        <LinkComp href={href} key={label} tabIndex={-1}>
          <ListGroupItem active={label === activeLabel} theme={theme.item}>
            {label}
          </ListGroupItem>
        </LinkComp>
      ))}
    </ListGroup>
  </div>
);
