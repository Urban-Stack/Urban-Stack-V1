import React from 'react';
import { twMerge } from 'tailwind-merge';
import { UdpArticlePreviewCardTestIds } from '@/lib/components/molecules/post-preview/testIds';
import {
  IcArrowUpRightFromSquareSolid,
  ImageFallback,
  UdpButton,
} from '@/lib/components';

interface UdpArticlePreviewCardProps {
  imageSrc?: string;
  fallbackImage?: boolean;
  title: string;
  date: Date;
  children: React.ReactNode;
  className?: string;
  href: string;
}

const UdpArticlePreviewCard = ({
  imageSrc,
  fallbackImage,
  title,
  date,
  children,
  className,
  href,
}: UdpArticlePreviewCardProps) => (
  <div
    className={twMerge(
      'flex flex-col rounded-2xl shadow-sm bg-white',
      !imageSrc && !fallbackImage
        ? 'rounded-t-lg border-t-4 border-primary-700'
        : '',
      className,
    )}
    data-testid={UdpArticlePreviewCardTestIds.self}
  >
    {(imageSrc || fallbackImage) && (
      <div className='w-full aspect-[5/2] bg-primary-100 rounded-t-2xl overflow-hidden flex justify-center items-center'>
        {imageSrc && (
          <img
            src={imageSrc}
            alt='Titelbild des Artikels'
            className='w-full object-cover'
          />
        )}
        {!imageSrc && fallbackImage && (
          <div
            className='p-7'
            data-testid={UdpArticlePreviewCardTestIds.fallback}
          >
            <ImageFallback />
          </div>
        )}
      </div>
    )}
    <div className='p-5 flex flex-col justify-between flex-1'>
      <div className='text-md'>
        <div className='font-bold line-clamp-2'>{title}</div>
        <div className='line-clamp-4'>{children}</div>
      </div>
      <div
        className='flex flex-wrap pt-3 gap-2 justify-between items-end'
        dir='rtl'
      >
        <div className='grow-[999]' dir='ltr'>
          <div className='text-neutral-400 text-sm text-right font-medium whitespace-nowrap'>
            {date.toLocaleString('de', { dateStyle: 'long' })}
          </div>
        </div>
        <div className='grow' dir='ltr'>
          <UdpButton
            color='secondary'
            icon={IcArrowUpRightFromSquareSolid}
            href={href}
            target={'_blank'}
            className='justify-center'
          >
            Weiterlesen
          </UdpButton>
        </div>
      </div>
    </div>
  </div>
);

export default UdpArticlePreviewCard;
