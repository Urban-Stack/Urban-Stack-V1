import {
  ContactHelpdeskIcon,
  CreateDashboardIcon,
  CreateForumSubmissionIcon,
  UdpTileButton,
  WriteMessageIcon,
} from 'udp-ui/components';
import { mkCommunityHref } from '@/app/_lib/discourse/util';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

type AppWelcomeButtonGroupProps = {
  username: string;
  className?: string;
};

const AppWelcomeButtonGroup = ({
  username,
  className,
}: AppWelcomeButtonGroupProps) => (
  <div
    className={twMerge(
      'flex flex-col justify-between gap-4 bg-gradient-to-b from-primary-400 to-primary-700 p-5 overflow-hidden rounded-2xl shadow-sm',
      className,
    )}
  >
    <div className='text-white flex flex-col gap-2'>
      <h1 className='text-2xl font-bold whitespace-pre-line'>
        Willkommen zurück, {username.replaceAll(' ', '\u00A0')}!
      </h1>
      <p className='text-md'>Was möchten Sie als Nächstes tun?</p>
    </div>

    <div className='flex flex-col md:flex-row h-full gap-4 justify-between'>
      {[
        {
          icon: CreateDashboardIcon,
          label: 'Dashboards anzeigen',
          href: '/dashboards',
        },
        {
          icon: WriteMessageIcon,
          label: 'Nachricht schreiben',
          href: mkCommunityHref('/chat/direct-messages', {
            basePage: '/chat',
          }),
        },
        {
          icon: CreateForumSubmissionIcon,
          label: 'Beitrag verfassen',
          href: mkCommunityHref('/new-topic?title='),
        },
        {
          icon: ContactHelpdeskIcon,
          label: 'Helpdesk kontaktieren',
          href: '/helpdesk',
        },
      ].map(({ icon, label, href }) => (
        <UdpTileButton
          className='flex-1 md:text-sm xl:text-base'
          icon={icon}
          label={label}
          href={href}
          key={label}
          as={Link}
        />
      ))}
    </div>
  </div>
);

export default AppWelcomeButtonGroup;
