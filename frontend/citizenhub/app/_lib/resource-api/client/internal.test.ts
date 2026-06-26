import { getPublicEnv } from '@/app/_lib/env';
import { mkClient } from '@/app/_lib/resource-api/client/internal';
import { ApolloClient } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

const getPublicEnvMock = getPublicEnv as unknown as jest.Mock;
const httpLinkMock = HttpLink as unknown as jest.Mock;

jest.mock('@/app/_lib/env', () => ({
  getPublicEnv: jest.fn(),
}));
jest.mock('@apollo/client/link/http', () => ({
  HttpLink: jest.fn().mockImplementation(() => ({ mocked: 'http-link' })),
}));

beforeEach(() => {
  getPublicEnvMock.mockReturnValue('https://example.com/graphql');
  httpLinkMock.mockClear();
});

describe('mkClient', () => {
  it('creates valid Apollo client', async () => {
    const client = mkClient();
    expect(httpLinkMock).toHaveBeenCalledWith({
      uri: 'https://example.com/graphql',
    });
    expect(client).toBeInstanceOf(ApolloClient);
  });
});
