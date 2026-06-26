import 'server-only';

import { ApolloClient, OperationVariables } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { mkClient } from './internal';

export const query = async <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: ApolloClient.QueryOptions<TData, TVariables>,
  client?: ApolloClient,
): Promise<ApolloClient.QueryResult<TData>> => {
  try {
    const _client = client ?? mkClient();
    return await _client.query<TData, TVariables>(options);
    /* c8 ignore next 4 */
  } catch (e) {
    // Custom error handling could be added here
    throw e;
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
    const _client = client ?? mkClient();
    return await _client.mutate<TData, TVariables>({
      ...options,
      errorPolicy: options.errorPolicy ?? 'all',
    });
    /* c8 ignore next 4 */
  } catch (e) {
    if (CombinedGraphQLErrors.is(e))
      return {
        data: undefined,
        error: e,
      };
    throw e;
  }
};
