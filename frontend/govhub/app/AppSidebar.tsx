'use client';

import { useEffect } from 'react';
import {
  createTheme,
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItemProps,
  SidebarItems,
  SidebarTheme,
} from 'flowbite-react';
import {
  IcBrain,
  IcChartPie,
  IcChat,
  IcCog,
  IcFile,
  IcFolderArrow,
  IcGlobe,
  IcGrid,
  IcHome,
  IcInfoCircle,
  IcLaptopCode,
  IcUserHeadset,
  IcUsersGroup,
  type UdpIcon,
} from 'udp-ui/components';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useSidebarStore } from '@/app/_store/sidebarStore';
import { useWindowSize } from 'udp-ui/hook';
import { useNotificationCount } from '@/app/_lib/discourse/iframe-communication/useNotificationCount';
import { usePathname } from 'next/navigation';
import { mkCommunityHref } from '@/app/_lib/discourse/util';
import { useIframeReset } from '@/app/_lib/client/iframeResetStorage';
import { DeepPartial } from 'ts-essentials';
import { CitytoolLink } from '@/app/_lib/citytools/internal';

interface AppSidebarProps {
  discourseBaseUrl: string;
  jupyterhubUrl: string;
  citizenhubUrl: string;
  ckanUrl: string;
  docsUrl: string;
  citytools: CitytoolLink[];
}

type CollapseBehavior = 'collapse' | 'hide';

export const AppSidebarTestIds = {
  self: 'app-sidebar',
  mainNav: 'app-sidebar_main',
};

export const PATHS = {
  homepage: '/',
  dashboards: '/dashboards',
  community: '/community',
  chat: '/chat',
  citytools: '/citytools',
  filemanager: '/filemanager',
  aidemo: '/aidemo',
  helpdesk: '/helpdesk',
  settings: '/settings/profile',
};

const AppSidebar = ({
  discourseBaseUrl,
  jupyterhubUrl,
  citizenhubUrl,
  ckanUrl,
  docsUrl,
  citytools,
}: AppSidebarProps) => {
  const { isOpen, init: initSidebar, toggle } = useSidebarStore();
  const { width: windowWidth } = useWindowSize();
  const notificationCount = useNotificationCount(discourseBaseUrl);
  const { notificationUnread, chatUnread } = notificationCount || {};
  const pathname = usePathname();

  const resetIframe = useIframeReset((s) => s.nextToken);

  const InjectClasses: (
    mkClasses: () => string | undefined,
  ) => (icon: UdpIcon) => UdpIcon = (mkClasses) => (Icon) => {
    const injected: UdpIcon = ({ className, ...props }) => (
      <Icon {...props} className={twMerge(className, mkClasses())} />
    );
    injected.displayName = Icon.displayName;
    return injected;
  };

  const highlightOn = (bool: boolean, href: string) =>
    InjectClasses(() =>
      twMerge(
        activeIconClass(isActive(href)),
        bool ? 'text-danger-600' : undefined,
      ),
    );

  useEffect(() => {
    initSidebar();
  }, [initSidebar]);

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

  const focusStyles =
    'focus:outline-hidden focus:ring-2 focus:ring-primary-300 hover:bg-primary-100 active:bg-primary-100';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const activeIconClass = (isActive: boolean) =>
    isActive ? 'text-primary-700' : 'text-primary-400';

  const highlightItemIfOnPath = (path: string) =>
    twMerge(
      focusStyles,
      isActive(path) && 'bg-primary-100 text-primary-700 font-bold',
    );

  const targetBlank = {
    target: '_blank',
  } as SidebarItemProps;

  const CityToolsItem = () =>
    isOpen && citytools.length > 0 ? (
      <SidebarCollapse
        icon={() => (
          <IcGrid className={activeIconClass(isActive(PATHS.citytools))} />
        )}
        label='City Tools'
      >
        <SidebarItem as={Link} href={PATHS.citytools} className='font-semibold'>
          Übersicht
        </SidebarItem>
        {citytools.map((ct) => (
          <SidebarItem
            key={`${ct.displayName}-${ct.href}`}
            as={Link}
            href={ct.href}
            className='[&>span]:truncate'
            {...targetBlank}
          >
            {ct.displayName}
          </SidebarItem>
        ))}
      </SidebarCollapse>
    ) : (
      <SidebarItem
        href={PATHS.citytools}
        icon={() => (
          <IcGrid className={activeIconClass(isActive(PATHS.citytools))} />
        )}
        as={Link}
        className={highlightItemIfOnPath(PATHS.citytools)}
      >
        City Tools
      </SidebarItem>
    );

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
              href={PATHS.homepage}
              icon={() => (
                <IcHome className={activeIconClass(isActive(PATHS.homepage))} />
              )}
              as={Link}
              className={twMerge(highlightItemIfOnPath(PATHS.homepage))}
            >
              Startseite
            </SidebarItem>
            <SidebarItem
              href={PATHS.dashboards}
              icon={() => (
                <IcChartPie
                  className={activeIconClass(isActive(PATHS.dashboards))}
                />
              )}
              as={Link}
              className={highlightItemIfOnPath(PATHS.dashboards)}
            >
              Dashboards
            </SidebarItem>
            <SidebarItem
              href={PATHS.community}
              icon={highlightOn(
                !isOpen && !!notificationUnread,
                PATHS.community,
              )(IcGlobe)}
              as={Link}
              onClick={() => resetIframe('DISCOURSE')}
              label={notificationUnread}
              className={twMerge(
                notificationUnread && 'font-bold',
                highlightItemIfOnPath(PATHS.community),
              )}
            >
              Community
            </SidebarItem>
            <SidebarItem
              href={mkCommunityHref('/chat/direct-messages', {
                basePage: PATHS.chat,
              })}
              icon={highlightOn(!isOpen && !!chatUnread, PATHS.chat)(IcChat)}
              as={Link}
              onClick={() => resetIframe('DISCOURSE')}
              label={chatUnread}
              className={twMerge(
                chatUnread && 'font-bold',
                highlightItemIfOnPath(PATHS.chat),
              )}
            >
              Chat
            </SidebarItem>
            <CityToolsItem />
            <SidebarItem
              href={PATHS.filemanager}
              icon={() => (
                <IcFile
                  className={activeIconClass(isActive(PATHS.filemanager))}
                />
              )}
              as={Link}
              className={highlightItemIfOnPath(PATHS.filemanager)}
            >
              Datei-Manager
            </SidebarItem>
            <SidebarItem
              href={jupyterhubUrl}
              icon={() => (
                <IcLaptopCode
                  className={activeIconClass(isActive(jupyterhubUrl))}
                />
              )}
              as={Link}
              className={focusStyles}
              {...targetBlank}
            >
              JupyterHub
            </SidebarItem>
            <SidebarItem
              href={ckanUrl}
              icon={() => <IcFolderArrow className={activeIconClass(false)} />}
              as={Link}
              className={focusStyles}
              {...targetBlank}
            >
              CKAN
            </SidebarItem>
            <SidebarItem
              href={PATHS.aidemo}
              icon={() => (
                <IcBrain className={activeIconClass(isActive(PATHS.aidemo))} />
              )}
              as={Link}
              className={highlightItemIfOnPath(PATHS.aidemo)}
            >
              AI Demo
            </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
            <SidebarItem
              href={citizenhubUrl}
              icon={() => <IcUsersGroup className={activeIconClass(false)} />}
              as={Link}
              className={focusStyles}
              {...targetBlank}
            >
              CitizenHub
            </SidebarItem>
            <SidebarItem
              href={PATHS.helpdesk}
              icon={() => (
                <IcUserHeadset
                  className={activeIconClass(isActive(PATHS.helpdesk))}
                />
              )}
              as={Link}
              className={highlightItemIfOnPath(PATHS.helpdesk)}
            >
              Helpdesk
            </SidebarItem>
            <SidebarItem
              href={docsUrl}
              icon={() => <IcInfoCircle className={activeIconClass(false)} />}
              as={Link}
              className={focusStyles}
              {...targetBlank}
            >
              Dokumentation
            </SidebarItem>
            <SidebarItem
              href={PATHS.settings}
              icon={() => (
                <IcCog className={activeIconClass(isActive(PATHS.settings))} />
              )}
              as={Link}
              className={highlightItemIfOnPath(PATHS.settings)}
            >
              Einstellungen
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
