import { PublishedQueries } from '@/app/_lib/resource-api/graphql/vizGroups';

export type PublishedQuery = {
  readonly name: string;
  readonly sql: string;
  readonly _tag: 'PublishedQuery';
};

export const toPublishedQueries: (
  result: PublishedQueries,
) => PublishedQuery[] = (result) =>
  result.data?.vizGroup?.publishedQueries.map((q) =>
    mkPublishedQuery(q.publishedQuery, q.config.sql),
  ) ?? [];

const mkPublishedQuery: (name: string, sql: string) => PublishedQuery = (
  name,
  sql,
) => ({
  name,
  sql,
  _tag: 'PublishedQuery',
});

export const internal = {
  mkPublishedQuery,
};
