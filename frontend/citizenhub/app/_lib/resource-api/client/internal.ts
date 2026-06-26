import 'server-only';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { getPublicEnv } from '@/app/_lib/env';

export const mkClient: () => ApolloClient = () => {
  const GRAPHQL_URI = getPublicEnv('GRAPHQL_URI');

  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: GRAPHQL_URI,
    }),
    cache: new InMemoryCache(),
  });
};
