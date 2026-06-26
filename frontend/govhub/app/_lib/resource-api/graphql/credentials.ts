import { graphql } from '@/app/__generated__';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import { AllCredentialsQuery } from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';

export const ALL_CREDENTIALS = graphql(`
  query AllCredentials($tenant: String!, $project: String!) {
    project(tenant: $tenant, project: $project) {
      sensorCredentials {
        sensorCredential
        username
      }
    }
  }
`);
export const CREATE_SENSOR_CREDENTIAL = graphql(`
  mutation CreateCredential(
    $tenant: String!
    $project: String!
    $sensorCredential: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        createSensorCredential(sensorCredential: $sensorCredential) {
          username
          password
        }
      }
    }
  }
`);

export const ROTATE_SENSOR_CREDENTIAL = graphql(`
  mutation RotateCredential(
    $tenant: String!
    $project: String!
    $sensorCredential: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        rotateSensorCredential(sensorCredential: $sensorCredential) {
          username
          password
        }
      }
    }
  }
`);

export const DELETE_SENSOR_CREDENTIAL = graphql(`
  mutation DeleteSensorCredential(
    $tenant: String!
    $project: String!
    $sensorCredential: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        deleteSensorCredential(sensorCredential: $sensorCredential)
      }
    }
  }
`);

export type AllCredentials = ApolloClient.QueryResult<
  MaybeMasked<AllCredentialsQuery>
>;

export const queryAllCredentials: (
  tenant: string,
  project: string,
) => Promise<AllCredentials> = async (tenant, project) =>
  query({
    query: ALL_CREDENTIALS,
    variables: {
      tenant,
      project,
    },
  });

export type CreateCredential = Awaited<
  ReturnType<typeof mutateCreateSensorCredential>
>;

export const mutateCreateSensorCredential = async (
  tenant: string,
  project: string,
  name: string,
) =>
  mutate({
    mutation: CREATE_SENSOR_CREDENTIAL,
    variables: {
      tenant,
      project,
      sensorCredential: name,
    },
  });

export type RotateCredential = Awaited<
  ReturnType<typeof mutateRotateSensorCredential>
>;

export const mutateRotateSensorCredential = async (
  tenant: string,
  project: string,
  credentialName: string,
) =>
  mutate({
    mutation: ROTATE_SENSOR_CREDENTIAL,
    variables: {
      tenant,
      project,
      sensorCredential: credentialName,
    },
  });

export type DeleteCredential = Awaited<
  ReturnType<typeof mutateDeleteSensorCredential>
>;

export const mutateDeleteSensorCredential = async (
  tenant: string,
  project: string,
  credentialName: string,
) =>
  mutate({
    mutation: DELETE_SENSOR_CREDENTIAL,
    variables: {
      tenant,
      project,
      sensorCredential: credentialName,
    },
  });

export const internal = {
  ALL_CREDENTIALS,
  CREATE_SENSOR_CREDENTIAL,
  ROTATE_SENSOR_CREDENTIAL,
  DELETE_SENSOR_CREDENTIAL,
};
