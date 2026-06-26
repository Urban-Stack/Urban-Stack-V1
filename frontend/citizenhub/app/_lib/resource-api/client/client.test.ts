import { mutate, query } from './client'; // Adjust path as necessary
import { mkClient } from './internal';
import { ApolloClient } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

const mkClientMock = mkClient as unknown as jest.Mock;
const clientMock = {
  query: jest.fn(),
  mutate: jest.fn(),
};

jest.mock('./internal', () => ({
  mkClient: jest.fn(),
}));

beforeEach(() => {
  mkClientMock.mockReset();
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
    mkClientMock.mockReturnValue(newClient);

    const result = await query(QUERY);

    expect(mkClientMock).toHaveBeenCalled();
    expect(newClient.query).toHaveBeenCalledWith(QUERY);
    expect(result.data).toEqual({ foo: 'world' });
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
    mkClientMock.mockReturnValue(newClient);

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

  it('normalizes rejected GraphQL errors into the mutation result', async () => {
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
  });

  it('rethrows non-GraphQL errors', async () => {
    clientMock.mutate.mockRejectedValueOnce(new Error('Unexpected error'));

    await expect(
      mutate(MUTATION, clientMock as unknown as ApolloClient),
    ).rejects.toThrow('Unexpected error');
  });
});
