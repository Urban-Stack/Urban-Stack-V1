import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SHARED_CLASSES } from './util.ts';

interface UdpPostPreviewCardProps {
  date: Date;
  children: React.ReactNode;
  className?: string;
  href: string;
}

const UdpPostPreviewCard: React.FC<UdpPostPreviewCardProps> = ({
  date,
  children,
  className,
  href,
}) => (
  <a
    href={href}
    className='inline-block focus:outline-hidden focus:ring-2 focus:ring-primary-300 focus:rounded-2xl'
  >
    <div
      className={twMerge(
        SHARED_CLASSES,
        'hover:bg-primary-100 border-primary-200 hover:shadow-lg',
        className,
      )}
    >
      <span className='text-neutral-400 text-xs font-medium'>
        {fmtDate(date)}
      </span>
      <span className='line-clamp-1 sm:line-clamp-2'>{children}</span>
    </div>
  </a>
);

const fmtDate = (date: Date) =>
  `${date.getDate()}.
  ${date.toLocaleString('default', { month: '2-digit' })}.
  ${date.getFullYear()} - ${date.getHours()}:
  ${String(date.getMinutes()).padStart(2, '0')} Uhr`;

export default UdpPostPreviewCard;
