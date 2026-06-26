import { mutate, query } from './client'; // Adjust path as necessary
import { mkClient } from './internal';
import { ApolloClient } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { redirect } from 'next/navigation';

const mkClientMock = mkClient as unknown as jest.Mock;
const redirectMock = redirect as unknown as jest.Mock;
const clientMock = {
  query: jest.fn(),
  mutate: jest.fn(),
};

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('./internal', () => ({
  mkClient: jest.fn(),
}));

beforeEach(() => {
  mkClientMock.mockReset();
  redirectMock.mockReset();
  clientMock.query.mockReset();
  clientMock.mutate.mockReset();
});

describe('query', () => {
  const QUERY = {
    query: 'FAKE_QUERY',
  } as const as unknown as ApolloClient.QueryOptions<{ foo: string }>;

  it('uses provided client and calls its query method', async () => {
    clientMock.query.mockResolvedValueOnce({
      data: { foo: 'bar' },
    } as ApolloClient.QueryResult);

    const result = await query(QUERY, clientMock as unknown as ApolloClient);

    expect(mkClientMock).not.toHaveBeenCalled();
    expect(clientMock.query).toHaveBeenCalledWith(QUERY);
    expect(result.data?.foo).toBe('bar');
  });

  it('creates new client if no client is provided', async () => {
    const newClient = {
      query: jest.fn().mockResolvedValue({ data: { foo: 'world' } }),
    };
    mkClientMock.mockResolvedValueOnce(newClient);

    const result = await query(QUERY);

    expect(mkClientMock).toHaveBeenCalled();
    expect(newClient.query).toHaveBeenCalledWith(QUERY);
    expect(result.data).toEqual({ foo: 'world' });
  });

  describe('error', () => {
    it('redirects on unauthorized error', async () => {
      const unauthorizedError = new CombinedGraphQLErrors({
        errors: [{ message: 'Session not active' }],
      });
      clientMock.query.mockRejectedValueOnce(unauthorizedError);

      await expect(
        query(QUERY, clientMock as unknown as ApolloClient),
      ).resolves.toBeUndefined();

      expect(redirectMock).toHaveBeenCalledWith('/api/auth/signin');
    });

    it('rethrows any other error', async () => {
      const otherError = new Error('Something else');
      clientMock.query.mockRejectedValueOnce(otherError);

      await expect(
        query(QUERY, clientMock as unknown as ApolloClient),
      ).rejects.toThrow('Something else');

      expect(redirectMock).not.toHaveBeenCalled();
    });
  });
});

describe('mutate', () => {
  const MUTATION = {
    mutation: 'FAKE_MUTATION',
  } as const as unknown as ApolloClient.MutateOptions<{ updated: boolean }>;

  it('uses the provided client and calls its mutate method', async () => {
    clientMock.mutate.mockResolvedValueOnce({ data: { updated: true } });

    const result = await mutate(
      MUTATION,
      clientMock as unknown as ApolloClient,
    );

    expect(mkClientMock).not.toHaveBeenCalled();
    expect(clientMock.mutate).toHaveBeenCalledWith({
      ...MUTATION,
      errorPolicy: 'all',
    });
    expect(result.data?.updated).toBe(true);
  });

  it('creates new client if no client is provided', async () => {
    const newClient = {
      mutate: jest.fn().mockResolvedValue({ data: { updated: true } }),
    };
    mkClientMock.mockResolvedValueOnce(newClient);

    const result = await mutate(MUTATION);

    expect(mkClientMock).toHaveBeenCalled();
    expect(newClient.mutate).toHaveBeenCalledWith({
      ...MUTATION,
      errorPolicy: 'all',
    });
    expect(result.data).toEqual({ updated: true });
  });

  it('preserves an explicit errorPolicy', async () => {
    clientMock.mutate.mockResolvedValueOnce({ data: { updated: true } });

    await mutate(
      {
        ...MUTATION,
        errorPolicy: 'ignore',
      },
      clientMock as unknown as ApolloClient,
    );

    expect(clientMock.mutate).toHaveBeenCalledWith({
      ...MUTATION,
      errorPolicy: 'ignore',
    });
  });

  describe('error', () => {
    it('redirects on unauthorized errors returned in the mutation result', async () => {
      clientMock.mutate.mockResolvedValueOnce({
        data: undefined,
        error: new CombinedGraphQLErrors({
          errors: [{ message: 'unauthorized' }],
        }),
      });

      await expect(
        mutate(MUTATION, clientMock as unknown as ApolloClient),
      ).resolves.toBeUndefined();

      expect(redirectMock).toHaveBeenCalledWith('/api/auth/signin');
    });

    it('redirects on unauthorized error', async () => {
      const unauthorizedError = new CombinedGraphQLErrors({
        errors: [{ message: 'unauthorized' }],
      });
      clientMock.mutate.mockRejectedValueOnce(unauthorizedError);

      await expect(
        mutate(MUTATION, clientMock as unknown as ApolloClient),
      ).resolves.toBeUndefined();

      expect(redirectMock).toHaveBeenCalledWith('/api/auth/signin');
    });

    it('normalizes non-unauthorized GraphQL errors into the mutation result', async () => {
      const graphqlError = new CombinedGraphQLErrors({
        errors: [{ message: 'validation failed' }],
      });
      clientMock.mutate.mockRejectedValueOnce(graphqlError);

      await expect(
        mutate(MUTATION, clientMock as unknown as ApolloClient),
      ).resolves.toEqual({
        data: undefined,
        error: graphqlError,
      });

      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('rethrows any other error', async () => {
      const otherError = new Error('Unexpected error');
      clientMock.mutate.mockRejectedValueOnce(otherError);

      await expect(
        mutate(MUTATION, clientMock as unknown as ApolloClient),
      ).rejects.toThrow('Unexpected error');

      expect(redirectMock).not.toHaveBeenCalled();
    });
  });
});
