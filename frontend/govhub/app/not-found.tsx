import { ErrorCyclopses, UdpThemeApplier } from 'udp-ui/components';
import React from 'react';
import { themeOrDefault } from '@/app/_lib/theme';

const NotFoundPage = async () => {
  const theme = await themeOrDefault();

  return (
    <main className='h-full'>
      <UdpThemeApplier theme={theme} />
      <div className='flex flex-col gap-14 items-center justify-center h-full p-10'>
        <div className='fixed w-full top-0 bg-primary-700 h-16' />
        <ErrorCyclopses />
        <div className='flex flex-col gap-3 text-center'>
          <p className='font-bold text-primary-700 text-9xl'>404</p>
          <h1 className='font-semibold text-2xl'>Seite nicht gefunden</h1>
          <p className='text-gray-400 text-wrap'>
            Die gesuchte Seite konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
