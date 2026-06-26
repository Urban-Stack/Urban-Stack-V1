import { auth } from '@/auth';
import { Session } from 'next-auth';
import { FuncMock, TEST_SESSION } from '@/app/_test/utils';
import { getPublicEnv } from '@/app/_lib/env';
import { mkClient } from '@/app/_lib/resource-api/client/internal';
import { ApolloClient } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

const authMock = auth as unknown as jest.Mock<Promise<Session | null>>;
const getPublicEnvMock: FuncMock<typeof getPublicEnv> =
  getPublicEnv as unknown as jest.Mock;
const httpLinkMock = HttpLink as unknown as jest.Mock;

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@apollo/client/link/http', () => ({
  HttpLink: jest.fn().mockImplementation(() => ({ mocked: 'http-link' })),
}));

beforeAll(() => {
  authMock.mockImplementation(() => Promise.resolve(TEST_SESSION));
});

beforeEach(() => {
  getPublicEnvMock.mockReturnValue('https://example.com/graphql');
  httpLinkMock.mockClear();
});

describe('mkClient', () => {
  it('does not throw for valid access token', async () => {
    await expect(mkClient()).resolves.not.toThrow();
  });

  it('creates valid Apollo client', async () => {
    const client = await mkClient();
    expect(httpLinkMock).toHaveBeenCalledWith({
      uri: 'https://example.com/graphql',
      headers: {
        Authorization: `Bearer ${TEST_SESSION.accessToken}`,
      },
    });
    expect(client).toBeInstanceOf(ApolloClient);
  });

  it('throws for invalid access token', async () => {
    authMock.mockImplementation(() =>
      Promise.resolve({
        ...TEST_SESSION,
        accessToken: undefined as unknown as string,
      }),
    );
    await expect(mkClient()).rejects.toThrow();
  });
});
