import AppSidebarToggle from '@/app/[tenant]/AppSidebarToggle';
import Link from 'next/link';
import { UdpAvatar, UdpButton } from 'udp-ui/components';
import {
  createTheme,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
} from 'flowbite-react';
import { logoutUrl } from '@/app/_lib/auth/authConfig';
import { getServerSession } from '@/app/_lib/auth';
import { Session } from 'next-auth';
import { getPublicEnv } from '@/app/_lib/env';
import { ProfileDropdownIds } from '@/app/[tenant]/testIds';

export const AppNavbarTestIds = {
  self: 'app-navbar',
  /* not unique, inherited from FlowBite */
  userMenuDropdown: 'flowbite-dropdown',
};

interface AppNavbarProps {
  tenant: string;
  logoPath?: string;
  fallbackTitle: string;
}

const AppNavbar = async ({
  tenant,
  logoPath,
  fallbackTitle,
}: AppNavbarProps) => {
  const session = await getServerSession();

  return (
    <nav
      className='fixed w-full top-0 bg-primary-700 h-16 z-50'
      data-testid={AppNavbarTestIds.self}
    >
      <div className='flex flex-wrap items-center justify-between h-full mx-auto p-3 text-white'>
        <div className='flex space-x-3'>
          <AppSidebarToggle />
          <Link
            href={`/${tenant}`}
            className='flex items-center space-x-3 rtl:space-x-reverse focus:ring-2 focus:outline-hidden rounded-lg focus:border-primary-200 focus:ring-3-primary-200 px-2'
          >
            {logoPath ? (
              <img src={logoPath} alt='Logo' title='Logo' className='h-8' />
            ) : (
              <span className='text-xl font-bold'>{fallbackTitle}</span>
            )}
          </Link>
        </div>
        {session ? (
          <ProfileDropdown user={session.user} />
        ) : (
          <UdpButton color='secondary' href='/api/auth/signin'>
            Anmelden/Registrieren
          </UdpButton>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;

const ProfileDropdown = ({ user }: { user: Session['user'] }) => {
  const keycloakRealmUrl = getPublicEnv('AUTH_KEYCLOAK_ISSUER');
  const customTheme = createTheme({
    dropdown: {
      inlineWrapper:
        'focus:ring-2 focus:outline-hidden focus:border-primary-200 focus:ring-primary-200 rounded-lg',
    },
  });

  return (
    <div className='flex'>
      <Dropdown
        arrowIcon={false}
        inline
        theme={customTheme.dropdown}
        label={<UdpAvatar alt='Benutzereinstellungen' />}
      >
        <DropdownHeader>
          {user.name && (
            <span
              data-testid={ProfileDropdownIds.username}
              className='block text-sm'
            >
              {user.name}
            </span>
          )}
          <span className='block truncate text-sm font-medium'>
            {user.email}
          </span>
        </DropdownHeader>
        <DropdownItem
          href={`${keycloakRealmUrl}/account`}
          as={Link}
          target={'_blank'}
        >
          Einstellungen
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem href={logoutUrl()} as={Link}>
          Abmelden
        </DropdownItem>
      </Dropdown>
    </div>
  );
};
