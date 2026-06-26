'use client';

import { UdpIcon } from '@/lib/components';
import { twMerge } from 'tailwind-merge';
import { UdpInfoCardTestIds } from '@/lib/components/molecules/info-card/testIds.ts';
import { ElementType } from 'react';

export type UdpInfoCardItem = {
  icon: UdpIcon;
  text: string;
  href: string;
};

export interface UdpInfoCardProps {
  icon: UdpIcon;
  title: string;
  description: string;
  items: UdpInfoCardItem[];
  linkText?: string;
  linkHref?: string;
  as?: ElementType;
  className?: string;
}

const UdpInfoCard = ({
  icon: Icon,
  title,
  description,
  items,
  linkText,
  linkHref,
  as: LinkComp = 'a',
  className,
}: UdpInfoCardProps) => {
  return (
    <div
      className={twMerge(
        'flex flex-col rounded-2xl shadow-lg bg-gray-50',
        className,
      )}
      data-testid={UdpInfoCardTestIds.self}
    >
      <div className='rounded-t-2xl flex flex-col p-6 gap-2 text-center items-center bg-white'>
        <div className='p-4 rounded-2xl bg-gradient-to-b from-primary-400 to-primary-700'>
          <Icon className='size-8 text-white' />
        </div>
        <div className='flex flex-col gap-4 items-center whitespace-pre-line'>
          <h2 className='font-bold text-xl'>{title}</h2>
          <p className='text-gray-800'>{description}</p>
        </div>
      </div>

      <div
        className='flex flex-col flex-1 py-6 px-3 pb-4 rounded-b-2xl bg-gray-50 min-h-60 justify-between'
        data-testid={UdpInfoCardTestIds.items}
      >
        <div className='flex flex-col gap-3 pb-4'>
          {items.map(({ icon: Icon, text, href }, index) => (
            <LinkComp
              key={index}
              className='flex flex-row items-center gap-3 pl-3 py-3 hover:bg-gray-100 rounded-xl
              focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300'
              href={href}
            >
              <Icon className='size-5 text-primary-700' />
              {text}
            </LinkComp>
          ))}
        </div>

        <LinkComp
          className='text-primary-700 min-h-6 p-1 hover:underline
          focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300'
          href={linkHref}
          data-testid={UdpInfoCardTestIds.link}
        >
          {linkText}
        </LinkComp>
      </div>
    </div>
  );
};

export default UdpInfoCard;
