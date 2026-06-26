'use client';

import SettingsSidebar from '@/app/settings/SettingsSidebar';
import { twMerge } from 'tailwind-merge';
import { UdpButton } from 'udp-ui/components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type SettingsLayoutClientProps = {
  keycloakBaseUrl: string;
  children?: React.ReactNode;
  lockUserManagement?: boolean;
  lockTenantSettings?: boolean;
};

const SettingsLayoutClient = ({
  keycloakBaseUrl,
  children,
  lockUserManagement = true,
  lockTenantSettings = true,
}: SettingsLayoutClientProps) => {
  const pathname = usePathname();
  return (
    <main className='flex h-full flex-col items-center'>
      <div className='flex w-full justify-between mb-4'>
        <h1 className='text-3xl font-bold text-gray-900'>Einstellungen</h1>
        <Link
          href='/settings'
          className={pathname === '/settings' ? 'hidden' : 'block lg:hidden'}
        >
          <UdpButton>Zurück</UdpButton>
        </Link>
      </div>
      <div className='size-full flex rounded-xl overflow-hidden bg-white'>
        <SettingsSidebar
          className={twMerge(
            pathname === '/settings' ? 'block' : 'hidden lg:block',
            'w-full lg:w-[312px] border-r border-gray-100',
          )}
          keycloakBaseUrl={keycloakBaseUrl}
          lockUserManagementLink={lockUserManagement}
          lockTenantSettings={lockTenantSettings}
        />
        <div
          className={twMerge(
            pathname === '/settings' ? 'hidden lg:block' : 'block',
            'flex-grow p-4 lg:p-10 truncate',
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default SettingsLayoutClient;
