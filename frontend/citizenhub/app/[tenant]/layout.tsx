import '@/app/globals.css';
import { ReactNode } from 'react';
import DefaultLayout from '@/app/[tenant]/DefaultLayout';

const TenantLayout = async ({
  params,
  children,
}: {
  params: Promise<{ tenant: string }>;
  children: ReactNode;
}) => {
  const { tenant } = await params;
  return <DefaultLayout tenant={tenant}>{children}</DefaultLayout>;
};

export default TenantLayout;
