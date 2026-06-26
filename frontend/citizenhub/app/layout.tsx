import { Poppins } from 'next/font/google';
import '@/app/globals.css';
import React, { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeConfig } from 'flowbite-react';

const poppinsFont = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='de' suppressHydrationWarning={false}>
    <body className={`${poppinsFont.className} h-screen bg-gray-100`}>
      <ThemeConfig dark={false} />
      {children}
      <ToastContainer className='mb-10' position='bottom-right' />
    </body>
  </html>
);

export default RootLayout;
