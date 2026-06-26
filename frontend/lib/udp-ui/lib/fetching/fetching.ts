import { XMLParser } from 'fast-xml-parser';

export type RSSItem = {
  title: string;
  description: string;
  image: string;
  link: string;
  guid: string;
  pubDate: string;
};

export type RSSChannel = {
  channel: {
    description: string;
    item: RSSItem[];
    language: string;
    link: string;
    pubDate: string;
    title: string;
  };
};

export type ParseResult = {
  rss: RSSChannel;
};

export const fetchNewsRSS = async (rssUrl: string) => {
  const res = await fetch(rssUrl);
  const text = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name, jpath) => name === 'item' && jpath === 'rss.channel.item',
  });
  const parsed = parser.parse(text) as ParseResult;

  return parsed.rss;
};
