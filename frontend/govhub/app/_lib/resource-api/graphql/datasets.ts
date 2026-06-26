import { graphql } from '@/app/__generated__';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import { AllDatasetsQuery, ClickHouseFormat } from '@/app/__generated__/types';
import { DatasetFormat } from '@/app/_lib/resource-api/project/dataset';

const ALL_DATASETS = graphql(`
  query AllDatasets($tenant: String!, $project: String!) {
    project(tenant: $tenant, project: $project) {
      datasets {
        dataset
        config {
          path
          format
        }
      }
    }
  }
`);

const CREATE_DATASET = graphql(`
  mutation CreateDataset(
    $tenant: String!
    $project: String!
    $name: String!
    $format: ClickHouseFormat!
    $path: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        createDataset(
          dataset: $name
          config: { format: $format, path: $path }
        ) {
          dataset
          config {
            path
            format
          }
        }
      }
    }
  }
`);

const DELETE_DATASET = graphql(`
  mutation DeleteDataset(
    $tenant: String!
    $project: String!
    $dataset: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        deleteDataset(dataset: $dataset)
      }
    }
  }
`);

const REFRESH_DATASET = graphql(`
  mutation RefreshDataset(
    $tenant: String!
    $project: String!
    $dataset: String!
  ) {
    tenant(tenant: $tenant) {
      project(project: $project) {
        refreshDataset(dataset: $dataset) {
          dataset
          config {
            format
            path
          }
        }
      }
    }
  }
`);

export type AllDatasets = ApolloClient.QueryResult<
  MaybeMasked<AllDatasetsQuery>
>;

export const queryAllDatasets = async (
  tenant: string,
  project: string,
): Promise<AllDatasets> =>
  query({
    query: ALL_DATASETS,
    variables: { tenant, project },
  });

const formatMap: Readonly<Record<DatasetFormat, ClickHouseFormat>> = {
  csv: ClickHouseFormat.Csv,
  json: ClickHouseFormat.Json,
  'json-compact': ClickHouseFormat.JsonCompact,
};

export type CreateDataset = Awaited<ReturnType<typeof mutateCreateDataset>>;

export const mutateCreateDataset = async (
  tenant: string,
  project: string,
  name: string,
  path: string,
  format: DatasetFormat,
) =>
  mutate({
    mutation: CREATE_DATASET,
    variables: {
      tenant,
      project,
      name,
      format: formatMap[format],
      path,
    },
  });

export type DeleteDataset = Awaited<ReturnType<typeof mutateDeleteDataset>>;

export const mutateDeleteDataset = async (
  tenant: string,
  project: string,
  dataset: string,
) =>
  mutate({
    mutation: DELETE_DATASET,
    variables: { tenant, project, dataset },
  });

export type RefreshDataset = Awaited<ReturnType<typeof mutateRefreshDataset>>;

export const mutateRefreshDataset = async (
  tenant: string,
  project: string,
  dataset: string,
) =>
  mutate({
    mutation: REFRESH_DATASET,
    variables: { tenant, project, dataset },
  });

export const internal = {
  ALL_DATASETS,
  CREATE_DATASET,
  DELETE_DATASET,
  REFRESH_DATASET,
};
