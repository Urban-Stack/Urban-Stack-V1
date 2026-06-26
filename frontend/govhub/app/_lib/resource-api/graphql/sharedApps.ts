import { graphql } from '@/app/__generated__';
import {
  CitytoolCategory,
  GetContainerInfosQuery,
  GetSharedAppQuery,
  GetSharedAppsQuery,
  PublicSharedAppsQuery,
} from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import { DeepPartial } from 'ts-essentials';

/* c8 ignore start */
const GET_SHARED_APP = graphql(`
  query GetSharedApp($tenant: String!, $name: String!) {
    sharedApp(tenant: $tenant, sharedApp: $name) {
      sharedApp
      url
      config {
        displayName
        adminContact
        description
        pictureUri
        categories
        imageDigest
        imageRegistry
        imageRepository
        registryUsername
      }
    }
  }
`);

const GET_SHARED_APPS_BY_TENANT = graphql(`
  query GetSharedApps($tenant: String!) {
    tenant(tenant: $tenant) {
      sharedApps {
        sharedApp
        config {
          displayName
          description
          pictureUri
          categories
          adminContact
        }
        containerStatus {
          ready
          running
          waiting
        }
        url
      }
    }
  }
`);

const GET_PUBLIC_SHARED_APPS = graphql(`
  query PublicSharedApps {
    publicSharedApps {
      sharedApp
      displayName
      description
      pictureUri
      categories
      tenant
      tenantDisplayName
      adminContact
      url
    }
  }
`);

const GET_CONTAINER_INFOS = graphql(`
  query GetContainerInfos($tenant: String!, $name: String!, $lines: Int!) {
    sharedApp(tenant: $tenant, sharedApp: $name) {
      sharedApp
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

const CREATE_SHARED_APP = graphql(`
  mutation CreateSharedApp(
    $tenant: String!
    $name: String!
    $config: SharedAppConfigInput!
  ) {
    tenant(tenant: $tenant) {
      createSharedApp(sharedApp: $name, config: $config) {
        sharedApp
        config {
          displayName
          adminContact
          pictureUri
          categories
          description
          imageDigest
          imageRegistry
          imageRepository
          registryUsername
        }
      }
    }
  }
`);

const UPDATE_SHARED_APP = graphql(`
  mutation EditSharedApp(
    $tenant: String!
    $name: String!
    $config: UpdateSharedAppConfigInput!
  ) {
    tenant(tenant: $tenant) {
      sharedApp(sharedApp: $name) {
        update(config: $config) {
          sharedApp
          config {
            displayName
            adminContact
            pictureUri
            categories
            description
            imageDigest
            imageRegistry
            imageRepository
            registryUsername
          }
        }
      }
    }
  }
`);

const DELETE_SHARED_APP = graphql(`
  mutation DeleteSharedApp($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      deleteSharedApp(sharedApp: $name)
    }
  }
`);
/* c8 ignore end */

export type GetSharedApp = ApolloClient.QueryResult<
  MaybeMasked<GetSharedAppQuery>
>;

export const queryGetSharedApp = async (tenant: string, name: string) =>
  query({
    query: GET_SHARED_APP,
    variables: { tenant, name },
  });

export type GetSharedApps = ApolloClient.QueryResult<
  MaybeMasked<GetSharedAppsQuery>
>;

export const queryGetSharedAppsByTenant = async (tenant: string) =>
  query({
    query: GET_SHARED_APPS_BY_TENANT,
    variables: { tenant },
  });

export type GetPublicSharedApps = ApolloClient.QueryResult<
  MaybeMasked<PublicSharedAppsQuery>
>;

export const queryGetPublicSharedApps = async () =>
  query({ query: GET_PUBLIC_SHARED_APPS });

export type GetSharedAppContainerInfos = ApolloClient.QueryResult<
  MaybeMasked<GetContainerInfosQuery>
>;

export const queryGetContainerInfos = async (
  tenant: string,
  name: string,
  lines: number,
) =>
  query({
    query: GET_CONTAINER_INFOS,
    variables: { tenant, name, lines },
  });

export type SharedAppConfig = {
  readonly displayName: string;
  readonly description: string;
  readonly adminContact: string;
  readonly pictureUri?: string;
  readonly categories: CitytoolCategory[];
  readonly image: {
    readonly digest: string;
    readonly repository: string;
    readonly registry: string;
    readonly username?: string;
    readonly password?: string;
  };
};

export type CreateSharedApp = Awaited<ReturnType<typeof mutateCreateSharedApp>>;

export const mutateCreateSharedApp = async (
  tenant: string,
  name: string,
  config: SharedAppConfig,
) =>
  mutate({
    mutation: CREATE_SHARED_APP,
    variables: {
      tenant,
      name,
      config: {
        displayName: config.displayName,
        description: config.description,
        adminContact: config.adminContact,
        pictureUri: config.pictureUri,
        categories: config.categories,
        imageDigest: config.image.digest,
        imageRepository: config.image.repository,
        imageRegistry: config.image.registry,
        registryUsername: config.image.username,
        registryPassword: config.image.password,
      },
    },
  });

export type UpdateSharedApp = Awaited<ReturnType<typeof mutateUpdateSharedApp>>;

export const mutateUpdateSharedApp = async (
  tenant: string,
  name: string,
  config: Omit<DeepPartial<SharedAppConfig>, 'categories'> & {
    categories?: CitytoolCategory[];
  },
) =>
  mutate({
    mutation: UPDATE_SHARED_APP,
    variables: {
      tenant,
      name,
      config: {
        displayName: config.displayName,
        description: config.description,
        adminContact: config.adminContact,
        pictureUri: config.pictureUri,
        categories: config.categories,
        imageDigest: config.image?.digest,
        imageRepository: config.image?.repository,
        imageRegistry: config.image?.registry,
        registryUsername: config.image?.username,
        registryPassword: config.image?.password,
      },
    },
  });

export type DeleteSharedApp = Awaited<ReturnType<typeof mutateDeleteSharedApp>>;

export const mutateDeleteSharedApp = async (tenant: string, name: string) =>
  mutate({
    mutation: DELETE_SHARED_APP,
    variables: { tenant, name },
  });

export const internal = {
  GET_SHARED_APP,
  GET_SHARED_APPS_BY_TENANT,
  GET_PUBLIC_SHARED_APPS,
  GET_CONTAINER_INFOS,
  CREATE_SHARED_APP,
  UPDATE_SHARED_APP,
  DELETE_SHARED_APP,
};
