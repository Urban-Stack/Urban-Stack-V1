import 'server-only';

import { ApolloClient, OperationVariables } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { redirect } from 'next/navigation';
import { mkClient } from './internal';

export const query = async <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: ApolloClient.QueryOptions<TData, TVariables>,
  client?: ApolloClient,
): Promise<ApolloClient.QueryResult<TData>> => {
  try {
    const _client = client ?? (await mkClient());
    return await _client.query<TData, TVariables>(options);
  } catch (e) {
    if (isUnauthorized(e)) redirect('/api/auth/signin');
    else throw e;
  }
};

export const mutate = async <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: ApolloClient.MutateOptions<TData, TVariables>,
  client?: ApolloClient,
): Promise<ApolloClient.MutateResult<TData>> => {
  try {
    const _client = client ?? (await mkClient());
    const result = await _client.mutate<TData, TVariables>({
      ...options,
      errorPolicy: options.errorPolicy ?? 'all',
    });

    if (isUnauthorized(result.error)) return redirect('/api/auth/signin');
    return result;
  } catch (e) {
    if (isUnauthorized(e)) redirect('/api/auth/signin');
    else if (CombinedGraphQLErrors.is(e))
      return {
        data: undefined,
        error: e,
      };
    else throw e;
  }
};

const isUnauthorized = (e: unknown) =>
  CombinedGraphQLErrors.is(e) &&
  ['unauthorized', 'Session not active'].some((str) => e.message.includes(str));
