import {
  createTheme,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
} from 'flowbite-react';
import AppSidebarToggle from '@/app/AppSidebarToggle';
import Link from 'next/link';
import { logoutUrl } from '@/app/_lib/auth/authConfig';
import AppUserAvatar from '@/app/AppUserAvatar';
import { requireAuth } from '@/app/_lib/auth';
import { getPublicEnv } from '@/app/_lib/env';

export const AppNavbarTestIds = {
  self: 'app-navbar',
  /* not unique, inherited from FlowBite */
  userMenuDropdown: 'flowbite-dropdown',
};

interface AppNavbarProps {
  logoPath?: string;
  fallbackTitle: string;
}

const AppNavbar = async ({ logoPath, fallbackTitle }: AppNavbarProps) => {
  const { id, name, email } = (await requireAuth()).user;

  const discourseBaseUrl = getPublicEnv('DISCOURSE_URI');

  const customTheme = createTheme({
    dropdown: {
      inlineWrapper:
        'focus:ring-2 focus:outline-hidden focus:border-primary-200 focus:ring-primary-200 rounded-lg',
    },
  });

  return (
    <nav
      className='fixed w-full top-0 bg-primary-700 h-16 z-50'
      data-testid={AppNavbarTestIds.self}
    >
      <div className='flex flex-wrap items-center justify-between mx-auto p-3 md:pr-6 pr-4 text-white'>
        <div className='flex space-x-3'>
          <AppSidebarToggle />
          <Link
            href='/'
            className='flex items-center space-x-3 rtl:space-x-reverse focus:ring-2 focus:outline-hidden rounded-lg focus:border-primary-200 focus:ring-primary-200 px-2'
          >
            {logoPath ? (
              <img src={logoPath} alt='Logo' title='Logo' className='h-8' />
            ) : (
              <span className='text-xl font-bold'>{fallbackTitle}</span>
            )}
          </Link>
        </div>
        <div className='flex'>
          <Dropdown
            arrowIcon={false}
            inline
            theme={customTheme.dropdown}
            label={<AppUserAvatar discourseBaseUrl={discourseBaseUrl} />}
          >
            <DropdownHeader>
              <span className='block text-sm'>{name ?? id}</span>
              <span className='block truncate text-sm font-medium'>
                {email}
              </span>
            </DropdownHeader>
            <DropdownItem href='/settings/profile' as={Link}>
              Einstellungen
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href={logoutUrl()} as={Link}>
              Abmelden
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
