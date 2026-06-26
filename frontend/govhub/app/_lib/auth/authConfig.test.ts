/**
 * @jest-environment node
 *
 * This fixes the following error:
 * Test suite failed to run
 * ReferenceError: TextEncoder is not defined
 *
 * See: https://jestjs.io/docs/configuration#testenvironment-string
 *
 */
import { FuncMock } from '@/app/_test/utils';
import { JWT } from 'next-auth/jwt';
import { Account, Session } from 'next-auth';
import { getPrivateEnv, getPublicEnv } from '@/app/_lib/env';
import { logMessage } from '@/app/_lib/client/fetcher';
import { generateMock } from '@anatine/zod-mock';
import {
  _internal,
  assembleToken,
  assertSession,
  refreshSession,
  TokenResponse,
} from '@/app/_lib/auth/authConfig';
import { clearEnvVars, setEnvVarsToAny } from 'udp-ui/test-utils';

const { enrichToken, fetchTokens, isValid, refreshTokens } = _internal;

const TOKEN: JWT = {
  userId: 'UUID',
  accessToken: 'NEW_ACCESS',
  idToken: 'NEW_ID_TOKEN',
  providerAccountId: 'NEW_ID',
  expiresAt: 456,
  refreshToken: 'NEW_REFRESH',
};

const ACCOUNT: Account = {
  access_token: 'ACCESS',
  id_token: 'ID_TOKEN',
  providerAccountId: 'ID',
  expires_at: 123,
  refresh_token: 'REFRESH',
  provider: 'keycloak',
  type: 'oidc',
};

const now = new Date('2024-09-25');

jest.useFakeTimers().setSystemTime(now);
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
  getPrivateEnv: jest.fn(),
}));
jest.mock('@/app/_lib/client/fetcher', () => ({
  ...jest.requireActual('@/app/_lib/client/fetcher'),
  logMessage: jest.fn(),
}));

const mockedFetch = jest.fn();
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
const getPrivateEnvMock: FuncMock<typeof getPrivateEnv> =
  getPrivateEnv as unknown as jest.Mock;
const mockLogMessage = logMessage as unknown as jest.Mock;

const ENV: Record<string, string> = {
  AUTH_KEYCLOAK_ISSUER: 'https://login.data-hub.local/realms/udh',
  AUTH_KEYCLOAK_ID: 'govHub',
  AUTH_KEYCLOAK_SECRET: 'super-secret',
} as const;

beforeAll(() => {
  global.fetch = mockedFetch;
  getPublicEnvMock.mockImplementation((name) => ENV[name]);
  getPrivateEnvMock.mockImplementation((name) => ENV[name]);
});

beforeEach(() => {
  mockedFetch.mockReset();
  mockLogMessage.mockReset();
});

describe('isValid', () => {
  const mkToken: (offsetSec?: number) => JWT = (offsetSec = 0) =>
    ({
      expiresAt: now.getTime() / 1000 + offsetSec,
    }) as Partial<JWT> as JWT;

  it('returns false if expiration date is equal to now plus 30 sec', () => {
    const token = mkToken(30);

    expect(isValid(token)).toBeFalsy();
  });

  it('returns false if expiration date is less than now plus 30 sec', () => {
    const token = mkToken(29);

    expect(isValid(token)).toBeFalsy();
  });

  it('returns true if expiration date is greater than now plus 30 seconds', () => {
    const token = mkToken(31);

    expect(isValid(token)).toBeTruthy();
  });
});

describe('fetchTokens', () => {
  const refreshToken = 'REFRESH';
  const responseToken = generateMock(TokenResponse);

  it('successfully fetches tokens', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseToken,
    });

    const token = await fetchTokens(refreshToken);

    expect(token).toEqual(responseToken);
    expect(mockedFetch).toHaveBeenCalledWith(
      `${ENV.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          client_id: ENV.AUTH_KEYCLOAK_ID,
          client_secret: ENV.AUTH_KEYCLOAK_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      },
    );
  });

  it('logs error if fetch fails', async () => {
    const error = new Error('Failed to fetch');
    mockedFetch.mockRejectedValueOnce(error);
    mockLogMessage.mockImplementation(() => (e: unknown) => {
      throw e;
    });

    await expect(() => fetchTokens(refreshToken)).rejects.toThrow(error);
    expect(mockLogMessage).toHaveBeenCalled();
  });
});

describe('refreshTokens', () => {
  const mkToken = {
    refreshToken: 'REFRESH',
  } as Partial<JWT> as JWT;

  it('throws if token has no refresh token', async () => {
    await expect(refreshTokens({} as JWT)).rejects.toThrow();
  });

  it('throws if fetchTokens fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    await expect(() => refreshTokens(mkToken)).rejects.toThrow();
  });

  it('refreshes tokens', async () => {
    const responseToken = generateMock(TokenResponse);
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseToken,
    });

    const token = await refreshTokens(mkToken);

    expect(token.accessToken).toBe(responseToken.access_token);
    expect(token.idToken).toBe(responseToken.id_token);
    expect(token.expiresAt).toBe(
      Math.floor(Date.now() / 1000 + responseToken.expires_in),
    );
    expect(token.refreshToken).toBe(responseToken.refresh_token);
  });
});

describe('enrichToken', () => {
  it.each([
    'access_token',
    'id_token',
    'providerAccountId',
    'expires_at',
    'refresh_token',
  ])('throws if account is missing %s property', (accountKey) => {
    const { [accountKey]: _, ...invalidAccount } = ACCOUNT;

    expect(() =>
      enrichToken(invalidAccount as unknown as Account, {} as JWT),
    ).toThrow();
  });

  it('enriches token', () => {
    const token = {
      access_token: 'NEW_ACCESS',
      id_token: 'NEW_ID_TOKEN',
      providerAccountId: 'NEW_ID',
      expires_at: 456,
      refresh_token: 'NEW_REFRESH',
    } as unknown as JWT;

    const newToken = enrichToken(ACCOUNT, token);

    expect(newToken.accessToken).toBe(ACCOUNT.access_token);
    expect(newToken.idToken).toBe(ACCOUNT.id_token);
    expect(newToken.userId).toBe(ACCOUNT.providerAccountId);
    expect(newToken.expiresAt).toBe(ACCOUNT.expires_at);
    expect(newToken.refreshToken).toBe(ACCOUNT.refresh_token);
  });
});

describe('assertSession', () => {
  const session: Session = {
    user: {
      id: 'ID',
      email: 'EMAIL',
    },
    accessToken: 'ACCESS',
    idToken: 'ID_TOKEN',
    refreshToken: 'REFRESH_TOKEN',
    expires: '',
  };

  it.each(['user', 'accessToken', 'idToken', 'expires'] as (keyof Session)[])(
    'throws if session is missing %s property',
    (sessionKey) => {
      const { [sessionKey]: _, ...invalidSession } = session;

      expect(() => assertSession(invalidSession as Session)).toThrow();
    },
  );

  it.each(['id', 'email'] as (keyof Session['user'])[])(
    'throws if session is missing user.%s property',
    (sessionKey) => {
      const { [sessionKey]: _, ...invalidUser } = session.user;
      const invalidSession = { ...session, user: invalidUser };

      expect(() => assertSession(invalidSession as Session)).toThrow();
    },
  );
});

describe('assembleToken', () => {
  it('calls enrichToken if Account is present', async () => {
    const newToken = await assembleToken(TOKEN, ACCOUNT);

    expect(newToken.accessToken).toBe(ACCOUNT.access_token);
    expect(newToken.idToken).toBe(ACCOUNT.id_token);
    expect(newToken.userId).toBe(ACCOUNT.providerAccountId);
    expect(newToken.expiresAt).toBe(ACCOUNT.expires_at);
    expect(newToken.refreshToken).toBe(ACCOUNT.refresh_token);
  });

  it('returns unchanged token if Account is not present and token is not expired', async () => {
    const existingToken = { ...TOKEN, expiresAt: now.getTime() / 1000 + 31 };

    const token = await assembleToken(existingToken, null);

    expect(token).toEqual(existingToken);
  });

  it('fetches new tokens if Account is not present and token is expired', async () => {
    const responseToken = generateMock(TokenResponse);
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseToken,
    });
    const existingToken = { ...TOKEN, expiresAt: now.getTime() / 1000 };

    const token = await assembleToken(existingToken, null);

    expect(token.accessToken).toBe(responseToken.access_token);
    expect(token.idToken).toBe(responseToken.id_token);
    expect(token.expiresAt).toBe(
      Math.floor(Date.now() / 1000 + responseToken.expires_in),
    );
    expect(token.refreshToken).toBe(responseToken.refresh_token);
  });
});

describe('logoutUrl', () => {
  beforeEach(() => {
    jest.resetModules();
    clearEnvVars();
  });

  it('throws if AUTH_KEYCLOAK_ISSUER env var not set', () => {
    setEnvVarsToAny(['AUTH_KEYCLOAK_ID', 'AUTH_URL']);
    expect(() => require('./authConfig').logoutUrl()).toThrow(
      'Missing environment variable: AUTH_KEYCLOAK_ISSUER',
    );
  });

  it('throws if AUTH_KEYCLOAK_ID env var not set', () => {
    setEnvVarsToAny(['AUTH_KEYCLOAK_ISSUER', 'AUTH_URL']);
    expect(() => require('./authConfig').logoutUrl()).toThrow(
      'Missing environment variable: AUTH_KEYCLOAK_ID',
    );
  });

  it('throws if AUTH_URL env var not set', () => {
    setEnvVarsToAny(['AUTH_KEYCLOAK_ISSUER', 'AUTH_KEYCLOAK_ID']);
    expect(() => require('./authConfig').logoutUrl()).toThrow(
      'Missing environment variable: AUTH_URL',
    );
  });
});

describe('refreshSession', () => {
  const session: Session = {
    user: { id: 'user-id', email: 'user@mail.tld' },
    accessToken: 'stale-access',
    idToken: 'stale-id',
    refreshToken: 'REFRESH',
    expires: '',
  };

  it('throws if session has no refreshToken', async () => {
    const { refreshToken: _, ...invalid } = session;

    await expect(refreshSession(invalid as Session)).rejects.toThrow();
  });

  it('propagates fetch error', async () => {
    const boom = new Error('fetch failed');
    mockedFetch.mockRejectedValueOnce(boom);

    await expect(refreshSession(session)).rejects.toThrow(boom);
  });

  it('updates session with tokens on success', async () => {
    const responseToken = generateMock(TokenResponse);
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseToken,
    });

    const updated = await refreshSession(session);

    expect(updated).toMatchObject({
      accessToken: responseToken.access_token,
      idToken: responseToken.id_token,
      refreshToken: responseToken.refresh_token,
    });
    expect(updated).toBe(updated); // same reference
  });
});
