import 'server-only';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { getPublicEnv } from '@/app/_lib/env';
import { auth } from '@/auth';
import { assertDefined } from 'udp-ui/assertion';

export const mkClient: () => Promise<ApolloClient> = async () => {
  const GRAPHQL_URI = getPublicEnv('GRAPHQL_URI');

  const session = await auth();
  const accessToken = session?.accessToken;
  assertDefined(accessToken);

  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: GRAPHQL_URI,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
    cache: new InMemoryCache(),
  });
};
