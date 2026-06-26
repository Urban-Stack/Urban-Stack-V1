import { publicAttributes } from '@/app/_lib/resource-api/attributes/publicAttributes';
import {
  BundesministeriumSponsorLogo,
  IcChartPie,
  IcEnvelope,
  IcGrid,
  IcScaleBalanced,
  SmartCityDialogLogo,
  UdpInfoCard,
} from 'udp-ui/components';
import { queryPublicStaticApps } from '@/app/_lib/resource-api/graphql/staticApps';
import { toStaticApps } from '@/app/_lib/citytools';
import { getDashboards } from '@/app/_lib/superset';
import { getPublicEnv } from '@/app/_lib/env';
import { HomepageTestIds } from '@/app/[tenant]/testIds';
import { notFound } from 'next/navigation';
import AppNewsArticles from '@/app/[tenant]/AppNewsArticles';
import { fetchNewsRSS } from 'udp-ui/fetching';
import { twMerge } from 'tailwind-merge';
import { mkMetadata } from '@/app/meta';

export const generateMetadata = mkMetadata();

const HomePage = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const { tenant } = await params;
  const attributes = await publicAttributes(tenant);

  if (!attributes.legalNoticeUrl || !attributes.contactUrl) {
    notFound();
  }

  const cityToolsBaseUrl = getPublicEnv('CITYTOOLS_URI');
  const cityToolsResult = await queryPublicStaticApps(tenant);
  const cityTools = toStaticApps(cityToolsResult, tenant);

  const dashboards = await getDashboards(tenant);

  const newsRss = attributes['newsUrl']
    ? await fetchNewsRSS(attributes.newsUrl).catch(() => undefined)
    : undefined;

  const tenantName = attributes.tenantDisplayName ?? tenant.toUpperCase();

  return (
    <main
      className='flex flex-col min-h-vhp gap-6'
      data-testid={HomepageTestIds.self}
    >
      <div
        className='relative h-72 -mx-4 md:-mx-6 -mt-6 z-10'
        data-testid={HomepageTestIds.banner}
      >
        <img
          src={attributes.citizenHubImage}
          alt={`Mandantenbild ${tenantName ?? ''}`.trim()}
          className='absolute size-full object-cover'
        />
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-primary-500 opacity-70'></div>
          <div className='relative flex flex-col gap-4 -mt-4 h-full justify-center items-center text-center'>
            <h1 className='text-white font-extrabold text-3xl whitespace-pre-line'>
              Herzlich Willkommen!
            </h1>
            <p className='flex flex-col lg:flex-row text-white text-3xl whitespace-pre-line lg:whitespace-normal'>
              Im Urban Citizen Hub
              {tenantName && (
                <span className='block lg:whitespace-break-spaces'>
                  {' der Stadt ' + tenantName}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div
        className='flex flex-col lg:flex-row items-stretch gap-y-4 gap-x-6 -mt-16 justify-between'
        data-testid={HomepageTestIds.cards}
      >
        <UdpInfoCard
          className='z-20 w-full flex-1'
          icon={IcChartPie}
          title={
            tenantName ? `Dashboards\nder Stadt ${tenantName}` : 'Dashboards'
          }
          description={
            tenantName
              ? `Hier finden Sie Dashboards\nder Stadt ${tenantName}.`
              : ''
          }
          items={dashboards.slice(0, 3).map((db) => ({
            icon: IcChartPie,
            text: db.title ?? 'Unbenanntes Dashboard',
            href: `${tenant}/dashboards/${db.slug}`,
          }))}
          linkText='Alle Dashboards ansehen'
          linkHref={`${tenant}/dashboards`}
        />

        <UdpInfoCard
          className='z-20 w-full flex-1'
          icon={IcGrid}
          title={
            tenantName ? `City Tools\nder Stadt ${tenantName}` : 'City Tools'
          }
          description={
            tenantName
              ? `Hier finden Sie Apps und City Tools\nder Stadt ${tenantName}.`
              : ''
          }
          items={cityTools.slice(0, 3).map((ct) => ({
            icon: IcGrid,
            text: ct.displayName,
            href: `${cityToolsBaseUrl}/${ct.finalPath}`,
          }))}
          linkText='Alle City Tools ansehen'
          linkHref={`${tenant}/citytools`}
        />

        <UdpInfoCard
          className='z-20 w-full flex-1'
          icon={IcScaleBalanced}
          title={
            tenantName ? `Ihr Kontakt\nzur Stadt ${tenantName}` : 'Kontakt'
          }
          description={
            tenantName
              ? `Hier finden Sie Kontaktdaten\nder Stadt ${tenantName}.`
              : ''
          }
          items={[
            {
              icon: IcScaleBalanced,
              text: 'Impressum',
              href: attributes.legalNoticeUrl,
            },
            {
              icon: IcEnvelope,
              text: 'Kontaktformular',
              href: attributes.contactUrl,
            },
          ]}
        />
      </div>

      <div
        className={twMerge(
          'grid lg:grid-cols-[2fr_3fr] gap-x-6 gap-y-4',
          attributes.newsUrl ? 'lg:grid-cols-[3fr_2fr]' : '',
        )}
      >
        {attributes.newsUrl && (
          <AppNewsArticles
            newsRss={newsRss}
            tenantName={tenantName}
            data-testid={HomepageTestIds.news}
          />
        )}

        <div
          className='flex flex-row lg:mb-0 shrink-0 bg-white rounded-2xl shadow-lg justify-center items-center'
          data-testid={HomepageTestIds.sponsors}
        >
          <BundesministeriumSponsorLogo className='w-3/5' />
          <SmartCityDialogLogo className='w-2/5 pr-6' />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
