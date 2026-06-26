import Link from 'next/link';
import { UdpArticlePreviewCard } from 'udp-ui/components';
import { requireTenantMeta } from '@/app/_lib/resource-api/legacy';
import { fetchNewsRSS } from 'udp-ui/fetching';

interface AppNewsArticlesProps {
  className?: string;
  newsUrl: string;
}

const AppNewsArticles = async ({
  className,
  newsUrl,
}: AppNewsArticlesProps) => {
  const tenantMeta = await requireTenantMeta();
  const headline = `Neuigkeiten${tenantMeta['tenant-name'] ? ` aus ${tenantMeta['tenant-name']}` : ''}`;

  const newsRss = await fetchNewsRSS(newsUrl).catch(() => undefined);
  const newsItems = newsRss ? newsRss.channel.item : [];
  const displayedNews = newsItems.slice(0, 3);
  const noImagesPresent = !displayedNews.some((item) => item.image);

  return (
    <div className={className}>
      <div className='flex flex-row gap-2 items-center mb-3'>
        <h2 className='text-2xl font-bold flex-grow truncate'>{headline}</h2>
        {newsRss && newsRss.channel.link && (
          <Link
            href={newsRss.channel.link}
            target='_blank'
            className='p-1 text-gray-500 hover:underline
            focus:rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-300'
          >
            Alle anzeigen
          </Link>
        )}
      </div>
      <div className='h-auto flex flex-col md:flex-row items-stretch gap-4 whitespace-normal'>
        {displayedNews.map(({ title, description, image, pubDate, link }) => (
          <UdpArticlePreviewCard
            className={'w-full md:max-w-[33%]'}
            title={title}
            imageSrc={noImagesPresent ? undefined : (image ?? undefined)}
            fallbackImage={noImagesPresent ? false : !image}
            date={new Date(Date.parse(pubDate))}
            href={link}
            key={title}
          >
            {description}
          </UdpArticlePreviewCard>
        ))}
      </div>
    </div>
  );
};

export default AppNewsArticles;
