import { toPublishedQueries } from './publishedQueries';
import { internal } from './publishedQueries';
import { PublishedQuery } from './publishedQueries';
import { PublishedQueries } from '@/app/_lib/resource-api/graphql/vizGroups';
import { DeepPartial } from 'ts-essentials';

describe('toPublishedQueries', () => {
  it('should convert a GraphQL result to a PublishedQuery list', () => {
    const result = {
      data: {
        vizGroup: {
          publishedQueries: [
            {
              publishedQuery: 'query1',
              config: { sql: 'SELECT * FROM foo' },
            },
            {
              publishedQuery: 'query2',
              config: { sql: 'SELECT * FROM bar' },
            },
          ],
        },
      },
    } as DeepPartial<PublishedQueries>;

    const expected: PublishedQuery[] = [
      {
        name: 'query1',
        sql: 'SELECT * FROM foo',
        _tag: 'PublishedQuery',
      },
      {
        name: 'query2',
        sql: 'SELECT * FROM bar',
        _tag: 'PublishedQuery',
      },
    ];

    expect(toPublishedQueries(result as PublishedQueries)).toEqual(expected);
  });

  it('returns an empty array if no publishedQueries exist', () => {
    const result = {
      data: {
        vizGroup: {
          publishedQueries: [],
        },
      },
    } as unknown as PublishedQueries;

    expect(toPublishedQueries(result)).toEqual([]);
  });

  it('returns an empty array if vizGroup is missing', () => {
    const result = {
      data: {},
    } as unknown as PublishedQueries;

    expect(toPublishedQueries(result)).toEqual([]);
  });
});

describe('mkPublishedQuery', () => {
  it('should create a PublishedQuery object', () => {
    const expected: PublishedQuery = {
      name: 'query1',
      sql: 'SELECT * FROM foo',
      _tag: 'PublishedQuery',
    };

    const publishedQuery = internal.mkPublishedQuery(
      'query1',
      'SELECT * FROM foo',
    );

    expect(publishedQuery).toEqual(expected);
  });
});
