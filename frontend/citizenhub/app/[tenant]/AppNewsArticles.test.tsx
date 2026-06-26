import { render } from '@testing-library/react';
import { UdpArticlePreviewCard } from 'udp-ui/components';
import { ParseResult } from 'udp-ui/fetching';
import AppNewsArticles from '@/app/[tenant]/AppNewsArticles';

jest.mock('udp-ui/components', () => ({
  UdpArticlePreviewCard: jest.fn(),
}));

const NEWS_RSS = {
  rss: {
    channel: {
      description: 'description',
      language: 'language',
      link: 'link',
      pubDate: 'Fri, 06 Jun 2025 15:45:19 +0200',
      title: 'title',
      item: [
        {
          title: 'title',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 06 Jun 2025 15:45:19 +0200',
        },
        {
          title: 'title',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 05 Jun 2025 15:45:19 +0200',
        },
        {
          title: 'title',
          description: 'description',
          link: 'link',
          guid: 'guid',
          pubDate: 'Fri, 04 Jun 2025 15:45:19 +0200',
        },
      ],
    },
  },
} as ParseResult;

describe('renders headline', () => {
  it('shows name of tenant if defined', () => {
    const component = render(
      AppNewsArticles({ newsRss: NEWS_RSS.rss, tenantName: 'Gütersloh' }),
    );

    expect(
      component.getByText('Neuigkeiten aus Gütersloh'),
    ).toBeInTheDocument();
  });

  it('shows only "Neuigkeiten"', () => {
    const component = render(AppNewsArticles({ newsRss: NEWS_RSS.rss }));

    expect(component.getByText('Neuigkeiten')).toBeInTheDocument();
  });
});

describe('renders news articles', () => {
  it('renders all news link when response has link', () => {
    const { container } = render(
      AppNewsArticles({ newsRss: NEWS_RSS.rss, tenantName: 'Tenant' }),
    );

    expect(container).toHaveTextContent('Alle anzeigen');
  });

  it('hides all news link when response is missing link', () => {
    const rss = NEWS_RSS.rss;
    rss.channel.link = '';

    const { container } = render(
      AppNewsArticles({ newsRss: NEWS_RSS.rss, tenantName: 'Tenant' }),
    );

    expect(container).not.toHaveTextContent('Alle anzeigen');
  });

  it('shows no articles without rss', () => {
    render(AppNewsArticles({ newsRss: undefined, tenantName: 'Tenant' }));

    expect(UdpArticlePreviewCard).not.toHaveBeenCalled();
  });

  it('shows articles', () => {
    render(AppNewsArticles({ newsRss: NEWS_RSS.rss, tenantName: 'Tenant' }));

    expect(UdpArticlePreviewCard).toHaveBeenCalledTimes(3);
    NEWS_RSS.rss.channel.item.forEach(
      ({ title, description, pubDate, link }) => {
        expect(UdpArticlePreviewCard).toHaveBeenCalledWith(
          {
            title: title,
            children: description,
            imageSrc: undefined,
            fallbackImage: false,
            date: new Date(Date.parse(pubDate)),
            href: link,
            className: 'w-full lg:max-w-[33%] shadow-lg',
          },
          undefined,
        );
      },
    );
  });

  it('shows articles with some images and some fallbacks', () => {
    const rss = NEWS_RSS.rss;
    rss.channel.item[0].image = 'https://www.domain.com/image.png';

    render(AppNewsArticles({ newsRss: rss, tenantName: 'Tenant' }));

    expect(UdpArticlePreviewCard).toHaveBeenCalledTimes(3);
    rss.channel.item.forEach(({ title, description, image, pubDate, link }) => {
      expect(UdpArticlePreviewCard).toHaveBeenCalledWith(
        {
          title: title,
          children: description,
          imageSrc: image ?? undefined,
          fallbackImage: !image,
          date: new Date(Date.parse(pubDate)),
          href: link,
          className: 'w-full lg:max-w-[33%] shadow-lg',
        },
        undefined,
      );
    });
  });
});
