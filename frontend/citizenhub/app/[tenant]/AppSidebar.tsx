'use client';

import React, { useEffect } from 'react';
import {
  createTheme,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItemProps,
  SidebarItems,
  SidebarTheme,
} from 'flowbite-react';
import { IcChartPie, IcFolderArrow, IcGrid, IcHome } from 'udp-ui/components';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useSidebarStore } from '@/app/_store/sidebarStore';
import { usePathname } from 'next/navigation';
import { useWindowSize } from 'udp-ui/hook';
import { DeepPartial } from 'ts-essentials';

type CollapseBehavior = 'collapse' | 'hide';

interface AppSidebarProps {
  tenant: string;
  ckanUrl: string;
}

export const AppSidebarTestIds = {
  self: 'app-sidebar',
  mainNav: 'app-sidebar_main',
};

export const sidebarPaths = (tenant: string, ckanUrl: string) => ({
  homepage: `/${tenant}`,
  dashboards: `/${tenant}/dashboards`,
  citytools: `/${tenant}/citytools`,
  ckan: ckanUrl,
});

const AppSidebar = ({ tenant, ckanUrl }: AppSidebarProps) => {
  const { isOpen, init: initSidebar, toggle } = useSidebarStore();
  const { width: windowWidth } = useWindowSize();
  const pathname = usePathname();

  useEffect(initSidebar, [initSidebar]);

  const collapseBehavior: CollapseBehavior =
    windowWidth < 768 ? 'hide' : 'collapse';

  const showBackDrop: boolean = isOpen && collapseBehavior === 'hide';

  const theme = createTheme<DeepPartial<SidebarTheme>>({
    root: {
      inner:
        'h-full overflow-y-auto overflow-x-hidden px-3 py-4 bg-white rounded-none',
    },
    item: {
      label: 'rounded-full !bg-danger-600 text-white',
    },
  });

  const paths = sidebarPaths(tenant, ckanUrl);

  const isActive = (href: string) =>
    href === `/${tenant}`
      ? pathname === `/${tenant}`
      : pathname.startsWith(href);

  const activeIconClass = (isActive: boolean) =>
    isActive ? 'text-primary-700' : 'text-primary-400';

  const highlightItemIfOnPath = (path: string) =>
    twMerge(
      isActive(path) && 'bg-primary-100 text-primary-700 font-bold',
      'focus:outline-hidden focus:ring-2 focus:ring-primary-300 hover:bg-primary-100 active:bg-primary-100',
    );

  const targetBlank = {
    target: '_blank',
  } as SidebarItemProps;

  return (
    <>
      <Sidebar
        className={twMerge(
          isOpen && 'min-w-64',
          'fixed md:sticky top-0 left-0 z-40 pt-16 h-screen',
        )}
        aria-label='Sidebar'
        as={'aside'}
        collapsed={!isOpen}
        collapseBehavior={collapseBehavior}
        theme={theme}
        data-testid={AppSidebarTestIds.self}
      >
        <SidebarItems className='h-full flex flex-col justify-between '>
          <SidebarItemGroup data-testid={AppSidebarTestIds.mainNav}>
            <SidebarItem
              href={paths.homepage}
              icon={() => (
                <IcHome className={activeIconClass(isActive(paths.homepage))} />
              )}
              as={Link}
              className={twMerge(highlightItemIfOnPath(paths.homepage))}
            >
              Startseite
            </SidebarItem>
            <SidebarItem
              href={paths.dashboards}
              icon={() => (
                <IcChartPie
                  className={activeIconClass(isActive(paths.dashboards))}
                />
              )}
              as={Link}
              className={highlightItemIfOnPath(paths.dashboards)}
            >
              Dashboards
            </SidebarItem>
            <SidebarItem
              href={paths.citytools}
              icon={() => (
                <IcGrid
                  className={activeIconClass(isActive(paths.citytools))}
                />
              )}
              as={Link}
              className={highlightItemIfOnPath(paths.citytools)}
            >
              City Tools
            </SidebarItem>
            <SidebarItem
              href={paths.ckan}
              icon={() => <IcFolderArrow className={activeIconClass(false)} />}
              as={Link}
              {...targetBlank}
            >
              CKAN
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
      {showBackDrop && (
        <div
          id='drawer-backdrop'
          className='bg-gray-900/50 fixed inset-0 z-30'
          onClick={toggle}
        />
      )}
    </>
  );
};

export default AppSidebar;
