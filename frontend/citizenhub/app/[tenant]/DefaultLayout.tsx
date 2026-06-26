/* c8 ignore start */
import React from 'react';
import AppSidebar from '@/app/[tenant]/AppSidebar';
import AppFooter from '@/app/[tenant]/AppFooter';
import 'react-toastify/dist/ReactToastify.css';
import AppNavbar from '@/app/[tenant]/AppNavbar';
import { UdpThemeApplier } from 'udp-ui/components';
import { themeOrDefault } from '@/app/_lib/resource-api/theme/theme';
import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';
import { getPublicEnv } from '@/app/_lib/env';
import { notFound } from 'next/navigation';
import { capitalize } from 'lodash';

interface AppDefaultLayoutProps {
  tenant: string;
  children: React.ReactNode;
}

const AppDefaultLayout = async ({
  tenant,
  children,
}: AppDefaultLayoutProps) => {
  const publicAttrs = await publicAttributes(tenant);
  const theme = await themeOrDefault(tenant);
  const ckanOrgUrl = getPublicEnv('CKAN_URI') + `/organization/${tenant}`;

  if (
    !publicAttrs.legalNoticeUrl ||
    !publicAttrs.privacyUrl ||
    !publicAttrs.contactUrl
  ) {
    notFound();
  }

  const fallbackTitle = publicAttrs.tenantDisplayName ?? capitalize(tenant);

  return (
    <>
      <UdpThemeApplier theme={theme} />
      <AppNavbar
        tenant={tenant}
        logoPath={publicAttrs.tenantLogo}
        fallbackTitle={fallbackTitle}
      />
      <div className='flex min-h-screen'>
        <AppSidebar tenant={tenant} ckanUrl={ckanOrgUrl} />
        <div className='w-full flex flex-col justify-between truncate'>
          <div className='mt-16 p-4 md:px-6 md:pt-6 pb-4 h-full'>
            {children}
          </div>
          <AppFooter
            legalNoticeUrl={publicAttrs.legalNoticeUrl}
            privacyUrl={publicAttrs.privacyUrl}
            contactUrl={publicAttrs.contactUrl}
          />
        </div>
      </div>
    </>
  );
};

export default AppDefaultLayout;
