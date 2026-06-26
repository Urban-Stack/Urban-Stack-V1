'use client';

import { twMerge } from 'tailwind-merge';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { IcArrowUpRightFromSquare } from 'udp-ui/components';
import {
  createTheme,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItemProps,
  SidebarItems,
} from 'flowbite-react';

export const PATHS = {
  profile: '/settings/profile',
  tenant: '/settings/tenants',
  projects: '/settings/projects',
  dashboardgroups: '/settings/dashboardgroups',
  usergroups: '/settings/usergroups',
};

const SettingsSidebarTestIds = {
  self: 'settings-sidebar',
};

export type SettingsSidebarProps = {
  keycloakBaseUrl: string;
  className?: string;
  lockUserManagementLink?: boolean;
  lockTenantSettings?: boolean;
};

type SettingsSidebarListItem = {
  title: string;
  href: string;
  external?: boolean;
  disabled?: boolean;
};

const SettingsSidebar = ({
  keycloakBaseUrl,
  className,
  lockUserManagementLink = true,
  lockTenantSettings = true,
}: SettingsSidebarProps) => {
  const customTheme = createTheme({
    sidebar: {
      root: {
        inner: 'bg-white',
      },
      item: {
        content: {
          base: 'px-0 flex flex-grow justify-center md:justify-start truncate',
        },
      },
    },
  });

  const sidebarItems: SettingsSidebarListItem[] = [
    {
      title: 'Profileinstellungen',
      href: PATHS.profile,
    },
    {
      title: 'Mandanteneinstellungen',
      href: PATHS.tenant,
      disabled: lockTenantSettings,
    },
    {
      title: 'Projekte',
      href: PATHS.projects,
    },
    {
      title: 'Dashboardgruppen',
      href: PATHS.dashboardgroups,
    },
    {
      title: 'Benutzergruppen',
      href: PATHS.usergroups,
    },
    {
      title: 'Benutzerverwaltung',
      href: keycloakBaseUrl + '/admin/udh/console/#/udh/users/add-user',
      external: true,
      disabled: lockUserManagementLink,
    },
  ] as const;

  return (
    <Sidebar
      className={twMerge(className)}
      theme={customTheme.sidebar}
      aria-label='Settings sidebar'
      data-testid={SettingsSidebarTestIds.self}
    >
      <SidebarItems>
        <SidebarItemGroup>
          {sidebarItems.map((item) => (
            <SettingsSidebarItem
              href={item.disabled ? '' : item.href}
              external={item.external}
              key={item.title}
              disabled={item.disabled ?? false}
            >
              {item.title}
            </SettingsSidebarItem>
          ))}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};

export default SettingsSidebar;

const DEFAULT_STYLE = `px-5 py-3 hover:bg-primary-100 active:bg-primary-100'
   focus:outline-hidden focus:ring-2 focus:ring-primary-300`;
const HIGHLIGHT_STYLE = 'bg-primary-100 text-primary-700 font-bold';
const DISABLED_STYLE =
  'px-5 py-3 cursor-not-allowed hover:bg-transparent text-gray-500';

const SettingsSidebarItem = ({
  href,
  external = false,
  children,
  disabled = false,
}: {
  href: string | undefined;
  external?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const pathname = usePathname();
  const highlightedIfCurrent = (href?: string) =>
    href && pathname.startsWith(href) && HIGHLIGHT_STYLE;

  const targetBlank = {
    target: external ? '_blank' : undefined,
  } as SidebarItemProps;

  return (
    <SidebarItem
      href={href ?? undefined}
      as={disabled ? 'p' : Link}
      className={twMerge(
        disabled ? DISABLED_STYLE : DEFAULT_STYLE,
        highlightedIfCurrent(!external ? href : undefined),
      )}
      {...targetBlank}
      aria-disabled={disabled}
    >
      <div className={'flex gap-2 truncate'}>
        <span className={'truncate'}>{children}</span>
        {external && (
          <IcArrowUpRightFromSquare className={'size-5 self-center shrink-0'} />
        )}
      </div>
    </SidebarItem>
  );
};
