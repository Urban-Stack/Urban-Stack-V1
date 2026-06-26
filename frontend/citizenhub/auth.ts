/* c8 ignore start */
import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import {
  assembleToken,
  assertSession,
  refreshSession,
} from '@/app/_lib/auth/authConfig';
import { JWT } from 'next-auth/jwt';
import { asyncElse } from 'udp-ui/fp';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      authorization: {
        params: {
          scope: 'openid profile email',
          access_type: 'offline',
        },
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth }) => !!auth,
    jwt: async ({ token, account }) =>
      asyncElse({
        ...token,
        error: true,
      } as JWT)(() => assembleToken(token, account), isRedirectError),
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      if (session.user.name === session.user.email) {
        session.user.name = undefined;
      }

      assertSession(session);

      return session;
    },
  },
});

export const authWithRefresh = async () => {
  const session = await auth();
  return session ? refreshSession(session) : null;
};
/* c8 ignore end */
