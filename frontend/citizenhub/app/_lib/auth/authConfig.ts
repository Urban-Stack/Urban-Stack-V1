import 'server-only';
import { assertDefined } from 'udp-ui/assertion';
import { unstable_noStore as noStore } from 'next/cache';
import { JWT } from 'next-auth/jwt';
import { Account, Session } from 'next-auth';
import { z } from 'zod';
import { getPrivateEnv, getPublicEnv } from '@/app/_lib/env';
import { fetcher, logMessage } from '@/app/_lib/client/fetcher';
import { logoutUrl as _logoutUrl } from '@/app/_lib/auth/_internal';

const AUTH_KEYCLOAK_ISSUER = process.env.AUTH_KEYCLOAK_ISSUER;
const AUTH_KEYCLOAK_ID = process.env.AUTH_KEYCLOAK_ID;
const AUTH_URL = process.env.AUTH_URL;

const REDIRECT_URL = `${AUTH_URL}/api/auth/signout`;

export const logoutUrl = () => {
  noStore();
  assertDefined(
    AUTH_KEYCLOAK_ISSUER,
    'Missing environment variable: AUTH_KEYCLOAK_ISSUER',
  );
  assertDefined(
    AUTH_KEYCLOAK_ID,
    'Missing environment variable: AUTH_KEYCLOAK_ID',
  );
  assertDefined(AUTH_URL, 'Missing environment variable: AUTH_URL');

  return _logoutUrl(AUTH_KEYCLOAK_ISSUER, AUTH_KEYCLOAK_ID, REDIRECT_URL);
};

export const assembleToken: (
  token: JWT,
  account: Account | null | undefined,
) => Promise<JWT> = async (token, account) => {
  if (account) return enrichToken(account, token);
  else if (isValid(token)) return token;
  else return await refreshTokens(token);
};

export const refreshSession: (session: Session) => Promise<Session> = async (
  session,
) => {
  assertDefined(session.refreshToken);
  const newTokens = await fetchTokens(session.refreshToken);

  session.accessToken = newTokens.access_token;
  session.idToken = newTokens.id_token;
  session.refreshToken = newTokens.refresh_token;

  return session;
};

export const assertSession: (session: Session) => void = (session) => {
  assertDefined(
    session.user,
    'User of Session data is not defined but is required.',
  );
  assertDefined(session.user.id, 'ID of User is not defined but is required.');
  assertDefined(
    session.user.email,
    'Email of User is not defined but is required.',
  );
  assertDefined(
    session.accessToken,
    'User access token is not defined but is required.',
  );
  assertDefined(
    session.idToken,
    'User Id token is not defined but is required.',
  );
  assertDefined(
    session.expires,
    'Expiration time of Session is not defined but is required.',
  );
};

const EXPIRY_OFFSET_MS = 30000;

const isValid: (token: JWT) => boolean = (token) =>
  Date.now() + EXPIRY_OFFSET_MS < token.expiresAt * 1000;

export const TokenResponse = z.object({
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

type TokenResponse = z.infer<typeof TokenResponse>;

const fetchTokens: (refreshToken: string) => Promise<TokenResponse> = (
  refreshToken,
) =>
  fetcher(TokenResponse)(
    `${getPublicEnv('AUTH_KEYCLOAK_ISSUER')}/protocol/openid-connect/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        client_id: getPublicEnv('AUTH_KEYCLOAK_ID'),
        client_secret: getPrivateEnv('AUTH_KEYCLOAK_SECRET'),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    },
  ).catch(logMessage('Error refreshing access_token'));

const refreshTokens = async (token: JWT) => {
  if (!token.refreshToken) throw new TypeError('Missing refreshToken');

  const newTokens = await fetchTokens(token.refreshToken);

  token.accessToken = newTokens.access_token;
  token.idToken = newTokens.id_token;
  token.expiresAt = Math.floor(Date.now() / 1000 + newTokens.expires_in);
  token.refreshToken = newTokens.refresh_token;

  return token;
};

const enrichToken: (account: Account, token: JWT) => JWT = (account, token) => {
  assertDefined(account.access_token, 'Access token is not defined');
  assertDefined(account.id_token, 'ID token is not defined');
  assertDefined(
    account.providerAccountId,
    'Provider account ID is not defined',
  );
  assertDefined(account.expires_at, 'Expiration time is not defined');
  assertDefined(account.refresh_token, 'Refresh token is not defined');
  return {
    ...token,
    accessToken: account.access_token,
    idToken: account.id_token,
    userId: account.providerAccountId,
    expiresAt: account.expires_at,
    refreshToken: account.refresh_token,
  };
};

// eslint-disable @typescript-eslint/no-unused-vars
const debug = {
  expiresInSeconds: (expiresAt: number): number =>
    Math.floor((expiresAt * 1000 - Date.now()) / 1000),
  /* Inspect Id or Access Token */
  parseToken: (token: string): unknown =>
    JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()),
};

export const _internal = {
  enrichToken,
  fetchTokens,
  refreshTokens,
  isValid,
};
