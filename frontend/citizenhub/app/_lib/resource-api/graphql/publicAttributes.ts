import { graphql } from '@/app/__generated__';
import { query } from '@/app/_lib/resource-api/client';
import { PublicAttributesQuery } from '@/app/__generated__/types';
import { ApolloClient, MaybeMasked } from '@apollo/client';

/* c8 ignore start */
const PUBLIC_ATTRIBUTES = graphql(`
  query PublicAttributes($tenant: String!) {
    publicAttributes(tenant: $tenant) {
      key
      value
    }
  }
`);
/* c8 ignore end */

export type QueriedPublicAttributes = ApolloClient.QueryResult<
  MaybeMasked<PublicAttributesQuery>
>;

export const queryPublicAttributes: (
  tenant: string,
) => Promise<QueriedPublicAttributes> = async (tenant: string) =>
  query({
    query: PUBLIC_ATTRIBUTES,
    variables: { tenant },
  });

export const internal = {
  PUBLIC_ATTRIBUTES,
};
