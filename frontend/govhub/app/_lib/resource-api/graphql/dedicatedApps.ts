/* c8 ignore start */
import { graphql } from '@/app/__generated__';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import {
  AllDedicatedAppsQuery,
  GetDedicatedAppContainerInfosQuery,
} from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

const ALL_AND_INSTALLED_DEDICATEDAPPS = graphql(`
  query AllDedicatedApps($tenant: String!) {
    all: dedicatedAppsInfo {
      dedicatedApp
      info {
        categories
        description
        name
        pictureUri
        indexPath
      }
      requestCityToolLink(tenant: $tenant)
    }
    installed: tenant(tenant: $tenant) {
      tenant
      dedicatedApps {
        dedicatedApp
        url
      }
    }
  }
`);

const INSTALL_DEDICATEDAPP = graphql(`
  mutation InstallDedicatedApp($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      createDedicatedApp(dedicatedApp: $name) {
        dedicatedApp
        tenant
        url
      }
    }
  }
`);

const UNINSTALL_DEDICATEDAPP = graphql(`
  mutation UnInstallDedicatedApp($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      deleteDedicatedApp(dedicatedApp: $name)
    }
  }
`);

const GET_CONTAINER_INFOS = graphql(`
  query GetDedicatedAppContainerInfos(
    $tenant: String!
    $name: String!
    $lines: Int!
  ) {
    dedicatedApp(tenant: $tenant, dedicatedApp: $name) {
      dedicatedApp
      containerLogs(lines: $lines)
      containerStatus {
        ready
        running
        waitingMessage
        waitingReason
        waiting
        restartCount
      }
    }
  }
`);

export type AllAndInstalledDedicatedApps = ApolloClient.QueryResult<
  MaybeMasked<AllDedicatedAppsQuery>
>;

export const queryDedicatedApps: () => Promise<AllAndInstalledDedicatedApps> =
  async () => {
    const tenant = await requireTenant();
    return query({
      query: ALL_AND_INSTALLED_DEDICATEDAPPS,
      variables: { tenant },
    });
  };

export type GetDedicatedAppContainerInfos = ApolloClient.QueryResult<
  MaybeMasked<GetDedicatedAppContainerInfosQuery>
>;

export const queryContainerInfos = async (
  tenant: string,
  name: string,
  lines: number,
  fetchPolicy: ApolloClient.QueryOptions['fetchPolicy'] = 'network-only',
) =>
  query({
    query: GET_CONTAINER_INFOS,
    variables: { tenant, name, lines },
    fetchPolicy,
  });

export type InstallDedicatedApp = Awaited<
  ReturnType<typeof mutateInstallDedicatedApp>
>;

export const mutateInstallDedicatedApp = async (name: string) => {
  const tenant = await requireTenant();
  return mutate({
    mutation: INSTALL_DEDICATEDAPP,
    variables: {
      tenant,
      name,
    },
  });
};

export type UnInstallDedicatedApp = Awaited<
  ReturnType<typeof mutateUninstallDedicatedApp>
>;

export const mutateUninstallDedicatedApp = async (name: string) => {
  const tenant = await requireTenant();
  return mutate({
    mutation: UNINSTALL_DEDICATEDAPP,
    variables: {
      tenant,
      name,
    },
  });
};

export type DedicatedAppInstallation =
  | InstallDedicatedApp
  | UnInstallDedicatedApp;

export const internal = {
  ALL_AND_INSTALLED_DEDICATEDAPPS,
  INSTALL_DEDICATEDAPP,
  UNINSTALL_DEDICATEDAPP,
  GET_CONTAINER_INFOS,
};
