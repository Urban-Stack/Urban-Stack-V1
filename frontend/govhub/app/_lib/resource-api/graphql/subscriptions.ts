import { graphql } from '@/app/__generated__';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import {
  AllSubscriptionsQuery,
  SingleSubscriptionQuery,
} from '@/app/__generated__/types';
import { SensorSubscriptionFormat } from '@/app/_lib/resource-api/project/subscriptions';
import { mutate, query } from '@/app/_lib/resource-api/client';

const ALL_SUBSCRIPTIONS = graphql(`
  query AllSubscriptions($tenant: String!, $project: String!) {
    project(tenant: $tenant, project: $project) {
      sensorSubscriptions {
        sensorSubscription
        config {
          uri
          format
          topic
          username
        }
        connection {
          error
          lastMessageTimestamp
          state
        }
      }
    }
  }
`);

const GET_SINGLE_SUBSCRIPTION = graphql(`
  query SingleSubscription(
    $tenant: String!
    $project: String!
    $name: String!
  ) {
    sensorSubscription(
      tenant: $tenant
      project: $project
      sensorSubscription: $name
    ) {
      config {
        uri
        format
        topic
        username
      }
    }
  }
`);

const CREATE_SUBSCRIPTION = graphql(`
  mutation CreateSubscription(
    $tenant: String!
    $project: String!
    $name: String!
    $config: SubscriptionConfigInput!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        createSensorSubscription(sensorSubscription: $name, config: $config) {
          sensorSubscription
          config {
            format
            topic
            uri
            username
          }
        }
      }
    }
  }
`);

const DELETE_SUBSCRIPTION = graphql(`
  mutation DeleteSubscription(
    $tenant: String!
    $project: String!
    $name: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        deleteSensorSubscription(sensorSubscription: $name)
      }
    }
  }
`);

const UPDATE_SUBSCRIPTION = graphql(`
  mutation UpdateSubscription(
    $tenant: String!
    $project: String!
    $oldName: String!
    $newName: String!
    $config: SubscriptionConfigInput!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        deleteSensorSubscription(sensorSubscription: $oldName)
        createSensorSubscription(
          sensorSubscription: $newName
          config: $config
        ) {
          sensorSubscription
          config {
            format
            topic
            uri
            username
          }
        }
      }
    }
  }
`);

export type AllSubscriptions = ApolloClient.QueryResult<
  MaybeMasked<AllSubscriptionsQuery>
>;

export const queryAllSubscriptions: (
  tenant: string,
  project: string,
) => Promise<AllSubscriptions> = async (tenant, project) =>
  query({
    query: ALL_SUBSCRIPTIONS,
    variables: {
      tenant,
      project,
    },
  });

export type SingleSubscription = ApolloClient.QueryResult<
  MaybeMasked<SingleSubscriptionQuery>
>;

export const querySingleSubscription: (
  tenant: string,
  project: string,
  name: string,
) => Promise<SingleSubscription> = async (tenant, project, name) =>
  query({
    query: GET_SINGLE_SUBSCRIPTION,
    variables: {
      tenant,
      project,
      name,
    },
  });

export type CreateSubscription = Awaited<
  ReturnType<typeof mutateCreateSubscription>
>;

export const mutateCreateSubscription = async (
  tenant: string,
  project: string,
  subscription: {
    name: string;
    uri: string;
    format: SensorSubscriptionFormat;
    topic: string;
    username: string;
    password: string;
  },
) => {
  const { name: _name, ...config } = subscription;
  return mutate({
    mutation: CREATE_SUBSCRIPTION,
    variables: {
      tenant,
      project,
      name: subscription.name,
      config,
    },
  });
};

export type DeleteSubscription = Awaited<
  ReturnType<typeof mutateDeleteSubscription>
>;

export const mutateDeleteSubscription = async (
  tenant: string,
  project: string,
  subscriptionName: string,
) =>
  mutate({
    mutation: DELETE_SUBSCRIPTION,
    variables: {
      tenant,
      project,
      name: subscriptionName,
    },
  });

export type UpdateSubscription = Awaited<
  ReturnType<typeof mutateUpdateSubscription>
>;

export const mutateUpdateSubscription = async (
  tenant: string,
  project: string,
  oldName: string,
  subscription: {
    name: string;
    uri: string;
    format: SensorSubscriptionFormat;
    topic: string;
    username: string;
    password: string;
  },
) => {
  const { name: _name, ...config } = subscription;
  return mutate({
    mutation: UPDATE_SUBSCRIPTION,
    variables: {
      tenant,
      project,
      oldName,
      newName: subscription.name,
      config,
    },
  });
};

export const internal = {
  ALL_SUBSCRIPTIONS,
  GET_SINGLE_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
};
