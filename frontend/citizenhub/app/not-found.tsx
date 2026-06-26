import { ErrorCyclopses, UdpThemeApplier } from 'udp-ui/components';
import React from 'react';
import { DEFAULT_THEME } from 'udp-ui/theme';

const NotFoundPage = () => (
  <main className='h-full'>
    <UdpThemeApplier theme={DEFAULT_THEME} />
    <div className='flex flex-col gap-14 items-center justify-center h-full p-10'>
      <div className='fixed w-full top-0 bg-primary-700 h-16' />
      <ErrorCyclopses />
      <div className='flex flex-col gap-3 text-center'>
        <h1 className='font-bold text-primary-900 text-9xl'>404</h1>
        <h2 className='font-semibold text-2xl'>Seite nicht gefunden</h2>
        <p className='text-gray-400 text-wrap'>
          Die gesuchte Seite konnte nicht gefunden werden.
        </p>
      </div>
    </div>
  </main>
);

export default NotFoundPage;
