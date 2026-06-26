import { Poppins } from 'next/font/google';
import '@/app/globals.css';
import { ReactNode } from 'react';
import AppDefaultLayout from '@/app/AppDefaultLayout';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata();

const poppinsFont = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang='de' suppressHydrationWarning={false}>
    <body className={`${poppinsFont.className} h-screen bg-gray-100`}>
      <AppDefaultLayout>{children}</AppDefaultLayout>
    </body>
  </html>
);

export default RootLayout;
