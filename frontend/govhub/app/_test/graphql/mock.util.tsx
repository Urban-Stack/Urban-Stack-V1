import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  AllUserGroups,
  queryAllUserGroups,
} from '@/app/_lib/resource-api/graphql/usergroups';
import { FuncMock } from '@/app/_test/utils';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import {
  AllVizGroups,
  queryAllVizGroups,
} from '@/app/_lib/resource-api/graphql/vizGroups';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import {
  AllCredentials,
  queryAllCredentials,
} from '@/app/_lib/resource-api/graphql/credentials';

export const mkCombinedGraphQLError = (...messages: string[]) =>
  new CombinedGraphQLErrors({
    errors: messages.map((message) => ({ message })),
  });

/**
 * Returns a function for mocking the query for retrieving all sensor credentials.
 * <p>
 * The function to be returned takes the `credentials` as well as an optional `error`
 * for the response of the given `mock`.
 * <p>
 * Note: If `credentials` is `undefined`, the response data will be an empty object.
 *
 * @param mock mock for the query function the response of which is to be mocked
 * @return a function for mocking the query for retrieving all sensor credentials
 */
export const mockQueryAllCredentials =
  (mock: FuncMock<typeof queryAllCredentials>) =>
  (
    credentials: SensorCredential[] | undefined,
    error?: CombinedGraphQLErrors,
  ) => {
    mock.mockResolvedValueOnce({
      data: credentials
        ? {
            project: {
              sensorCredentials: credentials.map((c) => ({
                sensorCredential: c.name,
                username: c.username,
              })),
            },
          }
        : {},
      error,
    } as unknown as AllCredentials);
  };

/**
 * Returns a function for mocking the query for retrieving all user groups.
 * <p>
 * The function to be returned takes the `groups` as well as an optional `error`
 * for the response of the given `mock`.
 * <p>
 * Note: By using this function, the response data comprises only one tenant.
 * However, if `groups` is `undefined`, the response data will be an empty object.
 *
 * @param mock   mock for the query function the response of which is to be mocked
 * @param tenant name of the tenant to use for the mocked response
 * @return a function for mocking the query for retrieving all user groups
 */
export const mockQueryAllUserGroups =
  (mock: FuncMock<typeof queryAllUserGroups>, tenant: string) =>
  (groups: UserGroup[] | undefined, error?: CombinedGraphQLErrors) => {
    mock.mockResolvedValueOnce({
      data: groups
        ? {
            tenants: [
              {
                tenant: tenant,
                groups: groups.map((g) => ({
                  group: g.name,
                  keycloakGroupPath: g.keycloakGroupPath,
                  scopes: {
                    granted: g.scopes?.granted,
                  },
                })),
              },
            ],
          }
        : {},
      error: error,
    } as AllUserGroups);
  };

export const mockQueryAllVizGroups =
  (mock: FuncMock<typeof queryAllVizGroups>, tenant: string) =>
  (groups: VizGroup[] | undefined, error?: CombinedGraphQLErrors) => {
    mock.mockResolvedValueOnce({
      data: groups
        ? {
            tenants: [
              {
                tenant: tenant,
                vizGroups: groups.map((g) => ({
                  vizGroup: g.name,
                  tenant: g.tenant,
                })),
              },
            ],
          }
        : {},
      error: error,
    } as AllVizGroups);
  };
