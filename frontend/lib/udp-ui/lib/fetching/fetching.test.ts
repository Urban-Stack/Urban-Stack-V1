import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { fetchNewsRSS } from '@/lib/fetching/fetching.ts';

const fetchMock = vi.fn();

const VALID_RSS =
  '<rss version="2.0">\n' +
  '<channel>\n' +
  '<title>Aktuelle Meldungen als RSS</title>\n' +
  '<link>https://www.guetersloh.de</link>\n' +
  '<description>Aktuelle Meldungen als RSS Feed</description>\n' +
  '<language>de-de</language>\n' +
  '<pubDate>Tue, 10 Jun 2025 15:23:59 +0200</pubDate>\n' +
  '<item>\n' +
  '<title>361.600 Kilometer: Gütersloh stellt neuen Rekord beim Stadtradeln auf</title>\n' +
  '<description>\n' +
  '<![CDATA[ Teilnehmende durften sich auch in diesem Jahr über verloste Sachpreise und Gutscheine freuen. ]]>\n' +
  '</description>\n' +
  '<link>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</link>\n' +
  '<guid>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</guid>\n' +
  '<pubDate>Fri, 06 Jun 2025 15:45:19 +0200</pubDate>\n' +
  '</item>\n' +
  '<item>\n' +
  '<title>361.600 Kilometer: Gütersloh stellt neuen Rekord beim Stadtradeln auf</title>\n' +
  '<description>\n' +
  '<![CDATA[ Teilnehmende durften sich auch in diesem Jahr über verloste Sachpreise und Gutscheine freuen. ]]>\n' +
  '</description>\n' +
  '<link>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</link>\n' +
  '<guid>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</guid>\n' +
  '<pubDate>Fri, 06 Jun 2025 15:45:19 +0200</pubDate>\n' +
  '</item>' +
  '<item>\n' +
  '<title>Vielfalt des Ehrenamts in Gütersloh entdecken</title>\n' +
  '<description>\n' +
  '<![CDATA[ Pop-Up-Store &quot;aufZeit&quot; wird offene Anlaufstelle vom 10. bis 14. Juni. ]]>\n' +
  '</description>\n' +
  '<link>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/auf-zeit-ehrenamt.php</link>\n' +
  '<guid>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/auf-zeit-ehrenamt.php</guid>\n' +
  '<pubDate>Fri, 06 Jun 2025 12:13:33 +0200</pubDate>\n' +
  '</item>\n' +
  '</channel>\n' +
  '</rss>';

const SHORT_VALID_RSS =
  '<rss version="2.0">\n' +
  '<channel>\n' +
  '<title>Aktuelle Meldungen als RSS</title>\n' +
  '<link>https://www.guetersloh.de</link>\n' +
  '<description>Aktuelle Meldungen als RSS Feed</description>\n' +
  '<language>de-de</language>\n' +
  '<pubDate>Tue, 10 Jun 2025 15:23:59 +0200</pubDate>\n' +
  '<item>\n' +
  '<title>361.600 Kilometer: Gütersloh stellt neuen Rekord beim Stadtradeln auf</title>\n' +
  '<description>\n' +
  '<![CDATA[ Teilnehmende durften sich auch in diesem Jahr über verloste Sachpreise und Gutscheine freuen. ]]>\n' +
  '</description>\n' +
  '<image>https://www.domain.com/preview.png</image>\n' +
  '<link>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</link>\n' +
  '<guid>https://www.guetersloh.de/de/rathaus/presseportal/news/meldungen/stadtradeln-neuer-rekord.php</guid>\n' +
  '<pubDate>Fri, 06 Jun 2025 15:45:19 +0200</pubDate>\n' +
  '</item>\n' +
  '</channel>\n' +
  '</rss>';

beforeAll(() => {
  global.fetch = fetchMock;
});

beforeEach(() => {
  fetchMock.mockReset();
});

describe('fetchNewsRSS', () => {
  it('should return data for valid feed', async () => {
    fetchMock.mockResolvedValueOnce({
      text: () => Promise.resolve(VALID_RSS),
    } as Response);

    const newsRss = await fetchNewsRSS('rss.feed.cns');

    expect(newsRss.channel.title).toEqual('Aktuelle Meldungen als RSS');
    expect(newsRss.channel.link).toEqual('https://www.guetersloh.de');
    expect(newsRss.channel.description).toEqual(
      'Aktuelle Meldungen als RSS Feed',
    );
    expect(newsRss.channel.item).toHaveLength(3);
  });

  it('should return item array for valid feed with one article', async () => {
    fetchMock.mockResolvedValueOnce({
      text: () => Promise.resolve(SHORT_VALID_RSS),
    } as Response);

    const newsRss = await fetchNewsRSS('rss.feed.cns');

    expect(newsRss.channel.item).toBeInstanceOf(Array);
    expect(newsRss.channel.item).toHaveLength(1);
  });

  it('should parse item image', async () => {
    fetchMock.mockResolvedValueOnce({
      text: () => Promise.resolve(SHORT_VALID_RSS),
    } as Response);

    const newsRss = await fetchNewsRSS('rss.feed.cns');

    const item = newsRss.channel.item[0];
    expect(item.image).toEqual('https://www.domain.com/preview.png');
  });

  it('should return undefined for non-RSS feed URL', async () => {
    fetchMock.mockResolvedValueOnce({
      text: () =>
        Promise.resolve(
          "<!doctype html><html lang='en'>Some website's content</html>",
        ),
    } as Response);

    const newsRss = await fetchNewsRSS('not.a.feed');

    expect(newsRss).toBeUndefined();
  });

  it('should return undefined for unavailable feed', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 503,
      statusText: 'Service Unavailable',
      text: () =>
        Promise.resolve(
          "<!doctype html><html lang='en'>Service Unavailable</html>",
        ),
    } as Response);

    const newsRss = await fetchNewsRSS('rss.feed.cns');

    expect(newsRss).toBeUndefined();
  });
});
