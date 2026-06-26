/* c8 ignore start */
import React from 'react';
import AppSidebar from '@/app/AppSidebar';
import AppNavbar from '@/app/AppNavbar';
import AppFooter from '@/app/AppFooter';
import AppDiscourseLogin from '@/app/AppDiscourseLogin';
import { UdpThemeApplier } from 'udp-ui/components';
import AppSupersetLogin from '@/app/AppSupersetLogin';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/app/_lib/auth';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { themeOrDefault } from '@/app/_lib/theme';
import { getPublicEnv } from '@/app/_lib/env';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { ThemeConfig, ThemeProvider } from 'flowbite-react';
import { queryTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { capitalize } from 'lodash';
import { flowbiteTheme } from 'udp-ui/theme';
import { fetchInstalled } from '@/app/_lib/citytools/server';
import { toCitytoolLink } from '@/app/_lib/citytools';

interface AppDefaultLayoutProps {
  children: React.ReactNode;
}

const AppDefaultLayout = async ({ children }: AppDefaultLayoutProps) => {
  const session = await requireAuth();
  if (session?.error) {
    redirect('/api/auth/signin');
  }

  const theme = await themeOrDefault();
  const tenant = await requireTenant();
  const ckanOrgUrl =
    getPublicEnv('CKAN_URI') + '/user/sso?state=organization.read:' + tenant;
  const citizenhubUrl = getPublicEnv('CITIZENHUB_URI') + '/' + tenant;

  const { data: tenantSettings, error } = await queryTenantSettings(tenant);

  const tenantName = !error
    ? (tenantSettings?.tenant?.tenantDisplayName ?? capitalize(tenant))
    : capitalize(tenant);
  const logoPath = !error
    ? (tenantSettings?.tenant?.tenantLogoUrl ?? undefined)
    : undefined;

  const citytoolLinks = (await fetchInstalled(tenant)).map(
    toCitytoolLink(getPublicEnv('CITYTOOLS_URI')),
  );

  return (
    <ThemeProvider theme={flowbiteTheme}>
      <ThemeConfig dark={false} />
      <UdpThemeApplier theme={theme} />
      <AppDiscourseLogin discourseBaseUrl={getPublicEnv('DISCOURSE_URI')} />
      <AppSupersetLogin supersetBaseUrl={getPublicEnv('SUPERSET_URI')} />
      <AppNavbar logoPath={logoPath} fallbackTitle={tenantName} />
      <ToastContainer className='mb-10' position='bottom-right' />
      <div className='flex min-h-screen'>
        <AppSidebar
          discourseBaseUrl={getPublicEnv('DISCOURSE_URI')}
          jupyterhubUrl={getPublicEnv('JUPYTERHUB_URI')}
          citizenhubUrl={citizenhubUrl}
          ckanUrl={ckanOrgUrl}
          docsUrl={getPublicEnv('DOCS_URI')}
          citytools={citytoolLinks}
        />
        <div className='w-full flex flex-col justify-between truncate'>
          <div className='mt-16 p-4 md:px-6 md:pt-6 pb-4 h-full'>
            {children}
          </div>
          <AppFooter />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AppDefaultLayout;
