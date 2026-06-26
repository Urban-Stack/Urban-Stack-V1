import { mkMetadata } from '@/app/meta';
import React from 'react';
import Link from 'next/link';
import { IcArrowUpRightFromSquare } from 'udp-ui/components';
import { getPublicEnv } from '@/app/_lib/env';

export const generateMetadata = mkMetadata({ pageName: 'Profileinstellungen' });

const ProfileSettingsPage = () => {
  const discourseBaseUrl = getPublicEnv('DISCOURSE_URI');
  const keycloakBaseUrl = getPublicEnv('KEYCLOAK_URI');
  return (
    <div className='h-full flex flex-col gap-8'>
      <h2 className='text-2xl font-bold text-gray-900'>Profileinstellungen</h2>
      <div className='flex flex-col gap-4'>
        <LinkCard
          heading='Kontoeinstellungen'
          description='Hier können Sie Änderungen an Ihrem Konto vornehmen.'
          href={`${keycloakBaseUrl}/realms/udh/account`}
        />
        <LinkCard
          heading='Profilbild'
          description='Hier können Sie Ihr Profilbild ändern.'
          href={`${discourseBaseUrl}/my/preferences/account`}
        />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

type LinkCardProps = {
  href: string;
  heading: string;
  description: string;
};

const LinkCard = ({ href, heading, description }: LinkCardProps) => (
  <Link
    href={href}
    target='_blank'
    className='xl:w-5/6 flex flex-col gap-3 p-5 border-l-8 rounded-2xl shadow-sm hover:shadow-lg hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-primary-300'
  >
    <div className='flex gap-2 text-gray-900'>
      <h3 className='leading-none text-xl font-bold'>{heading}</h3>
      <IcArrowUpRightFromSquare className='size-5 self-center' />
    </div>
    <p className='leading-none text-gray-300 whitespace-pre-line'>
      {description}
    </p>
  </Link>
);
