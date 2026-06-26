import { graphql } from '@/app/__generated__';
import { query } from '@/app/_lib/resource-api/client';
import { PublicCityToolsQuery } from '@/app/__generated__/types';
import { ApolloClient, MaybeMasked } from '@apollo/client';

/* c8 ignore start */
const PUBLIC_STATIC_APPS = graphql(`
  query PublicCityTools($tenant: String!) {
    publicCitytools(tenant: $tenant) {
      displayName
      description
      categories
      pictureUri
      path
      indexPath
    }
  }
`);
/* c8 ignore end */

export type QueriedPublicStaticApps = ApolloClient.QueryResult<
  MaybeMasked<PublicCityToolsQuery>
>;

export const queryPublicStaticApps = async (tenant: string) =>
  query({
    query: PUBLIC_STATIC_APPS,
    variables: { tenant },
  });

export const internal = {
  PUBLIC_STATIC_APPS,
};
