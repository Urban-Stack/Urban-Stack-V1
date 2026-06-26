import Link from 'next/link';
import { UdpArticlePreviewCard } from 'udp-ui/components';
import { RSSChannel } from 'udp-ui/fetching';

interface AppNewsArticlesProps {
  className?: string;
  tenantName?: string;
  newsRss?: RSSChannel;
}

const AppNewsArticles = ({
  className,
  tenantName,
  newsRss,
  ...restProps
}: AppNewsArticlesProps) => {
  const headline = `Neuigkeiten${tenantName ? ` aus ${tenantName}` : ''}`;

  const newsItems = newsRss ? newsRss.channel.item : [];
  const displayedNews = newsItems.slice(0, 3);
  const noImagesPresent = !displayedNews.some((item) => item.image);

  return (
    <div className={className} {...restProps}>
      <div className='flex flex-col lg:flex-row gap-2 items-center mb-3'>
        <h2 className='text-2xl font-bold grow truncate'>{headline}</h2>
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
      <div className='h-auto flex flex-col lg:flex-row items-stretch gap-4 whitespace-normal'>
        {displayedNews.map(({ title, description, image, pubDate, link }) => (
          <UdpArticlePreviewCard
            className={'w-full lg:max-w-[33%] shadow-lg'}
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
