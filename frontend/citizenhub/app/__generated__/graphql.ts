/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A JSON scalar */
  JSON: { input: any; output: any };
};

export type Attribute = {
  __typename?: 'Attribute';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type AttributePatchInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Citytool = HasAttributes & {
  __typename?: 'Citytool';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  citytool: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  info: CitytoolMeta;
  installs: CitytoolInstalls;
  name?: Maybe<Scalars['String']['output']>;
  path: Scalars['String']['output'];
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
  stars?: Maybe<Scalars['Int']['output']>;
  tenant: Scalars['String']['output'];
};

export type CitytoolAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type CitytoolHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export enum CitytoolCategory {
  /** Apps & Tools */
  AppsTools = 'APPS_TOOLS',
  /** Bürgerservices */
  CitizenServices = 'CITIZEN_SERVICES',
  /** Datenanalyse */
  DataAnalytics = 'DATA_ANALYTICS',
  /** Geoinformation */
  GeoInformation = 'GEO_INFORMATION',
  /** Intelligente Automation */
  IntelligentAutomation = 'INTELLIGENT_AUTOMATION',
  /** Office */
  Office = 'OFFICE',
  /** Fachverfahren */
  SpecializedApplication = 'SPECIALIZED_APPLICATION',
}

export type CitytoolInformation = {
  __typename?: 'CitytoolInformation';
  citytool: Scalars['String']['output'];
  info: CitytoolMeta;
  installs: CitytoolInstalls;
  requestCityToolLink: Scalars['String']['output'];
};

export type CitytoolInformationRequestCityToolLinkArgs = {
  tenant: Scalars['String']['input'];
};

export type CitytoolInstalls = {
  __typename?: 'CitytoolInstalls';
  averageStars?: Maybe<Scalars['Float']['output']>;
  count: Scalars['Int']['output'];
};

export type CitytoolMeta = {
  __typename?: 'CitytoolMeta';
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['output'];
  indexPath?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pictureUri?: Maybe<Scalars['String']['output']>;
  showInCitizenhub: Scalars['Boolean']['output'];
  showInGovhub: Scalars['Boolean']['output'];
};

export type CitytoolMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'CitytoolMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    citytool: Scalars['String']['output'];
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    info: CitytoolMeta;
    installs: CitytoolInstalls;
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    path: Scalars['String']['output'];
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    stars?: Maybe<Scalars['Int']['output']>;
    tenant: Scalars['String']['output'];
    updatePath: Scalars['String']['output'];
    updateStars?: Maybe<Scalars['Int']['output']>;
  };

export type CitytoolMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type CitytoolMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type CitytoolMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type CitytoolMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type CitytoolMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type CitytoolMutationUpdatePathArgs = {
  path: Scalars['String']['input'];
};

export type CitytoolMutationUpdateStarsArgs = {
  stars?: InputMaybe<Scalars['Int']['input']>;
};

export enum ClickHouseFormat {
  Csv = 'CSV',
  Json = 'JSON',
  JsonCompact = 'JSONCompact',
}

export type CommonMutation = {
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  createPermission: Scalars['String']['output'];
  deletePermission: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  patchAttributes: Array<Attribute>;
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
};

export type CommonMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type CommonMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type CommonMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type CommonMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type CommonMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type ContainerStatus = {
  __typename?: 'ContainerStatus';
  ready: Scalars['Boolean']['output'];
  restartCount?: Maybe<Scalars['Int']['output']>;
  running: Scalars['Boolean']['output'];
  waiting: Scalars['Boolean']['output'];
  waitingMessage?: Maybe<Scalars['String']['output']>;
  waitingReason?: Maybe<Scalars['String']['output']>;
};

export type Dashboard = HasAttributes & {
  __typename?: 'Dashboard';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  dashboard: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
  slug: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
  vizGroup: Scalars['String']['output'];
};

export type DashboardAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DashboardHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DashboardMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'DashboardMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    createPermission: Scalars['String']['output'];
    dashboard: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    slug: Scalars['String']['output'];
    tenant: Scalars['String']['output'];
    vizGroup: Scalars['String']['output'];
  };

export type DashboardMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DashboardMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type DashboardMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type DashboardMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DashboardMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type Dataset = HasAttributes & {
  __typename?: 'Dataset';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  config: DatasetConfig;
  dataset: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  project: Scalars['String']['output'];
  scopes: Scopes;
  tenant: Scalars['String']['output'];
};

export type DatasetAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DatasetHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DatasetConfig = {
  __typename?: 'DatasetConfig';
  format: ClickHouseFormat;
  path: Scalars['String']['output'];
};

export type DatasetConfigInput = {
  format: ClickHouseFormat;
  path: Scalars['String']['input'];
};

export type DatasetMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'DatasetMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    config: DatasetConfig;
    createPermission: Scalars['String']['output'];
    dataset: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    project: Scalars['String']['output'];
    scopes: Scopes;
    tenant: Scalars['String']['output'];
  };

export type DatasetMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DatasetMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type DatasetMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type DatasetMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DatasetMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type DedicatedApp = HasAttributes & {
  __typename?: 'DedicatedApp';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  containerLogs?: Maybe<Scalars['String']['output']>;
  containerStatus?: Maybe<ContainerStatus>;
  dedicatedApp: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  info: DedicatedAppMeta;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
  tenant: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type DedicatedAppAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DedicatedAppContainerLogsArgs = {
  lines: Scalars['Int']['input'];
};

export type DedicatedAppHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DedicatedAppInformation = {
  __typename?: 'DedicatedAppInformation';
  dedicatedApp: Scalars['String']['output'];
  info: DedicatedAppMeta;
  requestCityToolLink: Scalars['String']['output'];
};

export type DedicatedAppInformationRequestCityToolLinkArgs = {
  tenant: Scalars['String']['input'];
};

export type DedicatedAppMeta = {
  __typename?: 'DedicatedAppMeta';
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['output'];
  indexPath?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pictureUri?: Maybe<Scalars['String']['output']>;
};

export type DedicatedAppMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'DedicatedAppMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    containerLogs?: Maybe<Scalars['String']['output']>;
    containerStatus?: Maybe<ContainerStatus>;
    createPermission: Scalars['String']['output'];
    dedicatedApp: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    info: DedicatedAppMeta;
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    tenant: Scalars['String']['output'];
    url: Scalars['String']['output'];
  };

export type DedicatedAppMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type DedicatedAppMutationContainerLogsArgs = {
  lines: Scalars['Int']['input'];
};

export type DedicatedAppMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type DedicatedAppMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type DedicatedAppMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type DedicatedAppMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type Group = HasAttributes &
  KeycloakGroup & {
    __typename?: 'Group';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    group: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    isMember: Scalars['Boolean']['output'];
    keycloakGroupPath: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    tenant: Scalars['String']['output'];
  };

export type GroupAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type GroupHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type GroupInput = {
  group: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type GroupMutation = CommonMutation &
  HasAttributes &
  KeycloakGroup & {
    __typename?: 'GroupMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    group: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    isMember: Scalars['Boolean']['output'];
    keycloakGroupPath: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    tenant: Scalars['String']['output'];
  };

export type GroupMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type GroupMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type GroupMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type GroupMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type GroupMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type HasAttributes = {
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
};

export type HasAttributesAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type HasAttributesHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type KeycloakGroup = {
  keycloakGroupPath: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createTenant: TenantMutation;
  createUser: User;
  deleteTenant: Scalars['String']['output'];
  helpdesk: Scalars['Boolean']['output'];
  rotatePersonalCredential: PersonalCredential;
  tenant: TenantMutation;
};

export type MutationCreateTenantArgs = {
  tenant: Scalars['String']['input'];
};

export type MutationCreateUserArgs = {
  user: UserCreateInput;
};

export type MutationDeleteTenantArgs = {
  tenant: Scalars['String']['input'];
};

export type MutationHelpdeskArgs = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type MutationTenantArgs = {
  tenant: Scalars['String']['input'];
};

export type Permission = {
  __typename?: 'Permission';
  allowAllAuthenticatedUsers?: Maybe<Scalars['Boolean']['output']>;
  groupPrincipals?: Maybe<Array<Group>>;
  name: Scalars['String']['output'];
  projectPrincipals?: Maybe<Array<Project>>;
  scopes: Array<Scalars['String']['output']>;
  tenantPrincipals?: Maybe<Array<Tenant>>;
  userPrincipals?: Maybe<Array<User>>;
  vizGroupPrincipals?: Maybe<Array<VizGroup>>;
};

export type PermissionInput = {
  allowAllAuthenticatedUsers?: InputMaybe<Scalars['Boolean']['input']>;
  groupPrincipals?: InputMaybe<Array<GroupInput>>;
  name: Scalars['String']['input'];
  projectPrincipals?: InputMaybe<Array<ProjectInput>>;
  scopes: Array<Scalars['String']['input']>;
  tenantPrincipals?: InputMaybe<Array<TenantInput>>;
  userPrincipals?: InputMaybe<Array<UserInput>>;
  vizGroupPrincipals?: InputMaybe<Array<VizGroupInput>>;
};

export type PersonalCredential = {
  __typename?: 'PersonalCredential';
  password: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type Project = HasAttributes & {
  __typename?: 'Project';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  datasets: Array<Dataset>;
  flatName: Scalars['String']['output'];
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  project: Scalars['String']['output'];
  scopes: Scopes;
  sensorCredentials: Array<SensorCredential>;
  sensorSubscriptions: Array<SensorSubscription>;
  tenant: Scalars['String']['output'];
};

export type ProjectAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type ProjectHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type ProjectInput = {
  project: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type ProjectMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'ProjectMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    createDataset: DatasetMutation;
    createPermission: Scalars['String']['output'];
    createSensorCredential: SensorCredentialResult;
    createSensorSubscription: SensorSubscriptionMutation;
    dataset: DatasetMutation;
    datasets: Array<Dataset>;
    deleteDataset: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    deleteSensorCredential: Scalars['String']['output'];
    deleteSensorSubscription: Scalars['String']['output'];
    flatName: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    project: Scalars['String']['output'];
    refreshDataset: DatasetMutation;
    rotateSensorCredential: SensorCredentialResult;
    scopes: Scopes;
    sensorCredential: SensorCredentialMutation;
    sensorCredentials: Array<SensorCredential>;
    sensorSubscription: SensorSubscriptionMutation;
    sensorSubscriptions: Array<SensorSubscription>;
    tenant: Scalars['String']['output'];
  };

export type ProjectMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type ProjectMutationCreateDatasetArgs = {
  config: DatasetConfigInput;
  dataset: Scalars['String']['input'];
};

export type ProjectMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type ProjectMutationCreateSensorCredentialArgs = {
  sensorCredential: Scalars['String']['input'];
};

export type ProjectMutationCreateSensorSubscriptionArgs = {
  config: SubscriptionConfigInput;
  sensorSubscription: Scalars['String']['input'];
};

export type ProjectMutationDatasetArgs = {
  dataset: Scalars['String']['input'];
};

export type ProjectMutationDeleteDatasetArgs = {
  dataset: Scalars['String']['input'];
};

export type ProjectMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type ProjectMutationDeleteSensorCredentialArgs = {
  sensorCredential: Scalars['String']['input'];
};

export type ProjectMutationDeleteSensorSubscriptionArgs = {
  sensorSubscription: Scalars['String']['input'];
};

export type ProjectMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type ProjectMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type ProjectMutationRefreshDatasetArgs = {
  dataset: Scalars['String']['input'];
};

export type ProjectMutationRotateSensorCredentialArgs = {
  sensorCredential: Scalars['String']['input'];
};

export type ProjectMutationSensorCredentialArgs = {
  sensorCredential: Scalars['String']['input'];
};

export type ProjectMutationSensorSubscriptionArgs = {
  sensorSubscription: Scalars['String']['input'];
};

export type PublicCitytool = {
  __typename?: 'PublicCitytool';
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  indexPath?: Maybe<Scalars['String']['output']>;
  path: Scalars['String']['output'];
  pictureUri?: Maybe<Scalars['String']['output']>;
};

export type PublicSharedApp = {
  __typename?: 'PublicSharedApp';
  adminContact: Scalars['String']['output'];
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  pictureUri?: Maybe<Scalars['String']['output']>;
  sharedApp: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
  tenantDisplayName?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type PublishedQuery = HasAttributes & {
  __typename?: 'PublishedQuery';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  config: PublishedQueryConfig;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  publishedQuery: Scalars['String']['output'];
  scopes: Scopes;
  tenant: Scalars['String']['output'];
  vizGroup: Scalars['String']['output'];
};

export type PublishedQueryAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type PublishedQueryHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type PublishedQueryConfig = {
  __typename?: 'PublishedQueryConfig';
  sql: Scalars['String']['output'];
};

export type PublishedQueryMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'PublishedQueryMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    config: PublishedQueryConfig;
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    publishedQuery: Scalars['String']['output'];
    scopes: Scopes;
    tenant: Scalars['String']['output'];
    vizGroup: Scalars['String']['output'];
  };

export type PublishedQueryMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type PublishedQueryMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type PublishedQueryMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type PublishedQueryMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type PublishedQueryMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type Query = {
  __typename?: 'Query';
  citytool?: Maybe<Citytool>;
  citytoolInfo?: Maybe<CitytoolInformation>;
  citytoolsInfo: Array<CitytoolInformation>;
  clickhouseQuery?: Maybe<Scalars['JSON']['output']>;
  dashboard?: Maybe<Dashboard>;
  dataset?: Maybe<Dataset>;
  dedicatedApp?: Maybe<DedicatedApp>;
  dedicatedAppInfo?: Maybe<DedicatedAppInformation>;
  dedicatedAppsInfo: Array<DedicatedAppInformation>;
  group?: Maybe<Group>;
  keycloakGroupMemberships: Array<KeycloakGroup>;
  personalCredential: PersonalCredential;
  project?: Maybe<Project>;
  publicAttributes: Array<Attribute>;
  publicCitytools: Array<PublicCitytool>;
  publicSharedApps: Array<PublicSharedApp>;
  publishedQuery?: Maybe<PublishedQuery>;
  sensorCredential?: Maybe<SensorCredential>;
  sensorSubscription?: Maybe<SensorSubscription>;
  sharedApp?: Maybe<SharedApp>;
  tenant?: Maybe<Tenant>;
  tenants: Array<Tenant>;
  vizGroup?: Maybe<VizGroup>;
};

export type QueryCitytoolArgs = {
  citytool: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryCitytoolInfoArgs = {
  citytool: Scalars['String']['input'];
};

export type QueryClickhouseQueryArgs = {
  project?: InputMaybe<ProjectInput>;
  query: Scalars['String']['input'];
};

export type QueryDashboardArgs = {
  dashboard: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
};

export type QueryDatasetArgs = {
  dataset: Scalars['String']['input'];
  project: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryDedicatedAppArgs = {
  dedicatedApp: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryDedicatedAppInfoArgs = {
  dedicatedApp: Scalars['String']['input'];
};

export type QueryGroupArgs = {
  group: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryProjectArgs = {
  project: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryPublicAttributesArgs = {
  tenant: Scalars['String']['input'];
};

export type QueryPublicCitytoolsArgs = {
  tenant: Scalars['String']['input'];
};

export type QueryPublishedQueryArgs = {
  publishedQuery: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
};

export type QuerySensorCredentialArgs = {
  project: Scalars['String']['input'];
  sensorCredential: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QuerySensorSubscriptionArgs = {
  project: Scalars['String']['input'];
  sensorSubscription: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QuerySharedAppArgs = {
  sharedApp: Scalars['String']['input'];
  tenant: Scalars['String']['input'];
};

export type QueryTenantArgs = {
  tenant: Scalars['String']['input'];
};

export type QueryVizGroupArgs = {
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
};

export type QueryConfigInput = {
  sql: Scalars['String']['input'];
};

export type ReadonlySharedAppConfig = {
  __typename?: 'ReadonlySharedAppConfig';
  adminContact: Scalars['String']['output'];
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  hasPassword: Scalars['Boolean']['output'];
  imageDigest: Scalars['String']['output'];
  imageRegistry: Scalars['String']['output'];
  imageRepository: Scalars['String']['output'];
  pictureUri?: Maybe<Scalars['String']['output']>;
  registryUsername?: Maybe<Scalars['String']['output']>;
};

export type Scopes = {
  __typename?: 'Scopes';
  all: Array<Scalars['String']['output']>;
  granted: Array<Scalars['String']['output']>;
};

export type SensorCredential = HasAttributes & {
  __typename?: 'SensorCredential';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  project: Scalars['String']['output'];
  scopes: Scopes;
  sensorCredential: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type SensorCredentialAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SensorCredentialHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SensorCredentialMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'SensorCredentialMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    project: Scalars['String']['output'];
    scopes: Scopes;
    sensorCredential: Scalars['String']['output'];
    tenant: Scalars['String']['output'];
    username: Scalars['String']['output'];
  };

export type SensorCredentialMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SensorCredentialMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type SensorCredentialMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type SensorCredentialMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SensorCredentialMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type SensorCredentialResult = {
  __typename?: 'SensorCredentialResult';
  password: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type SensorSubscription = HasAttributes & {
  __typename?: 'SensorSubscription';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  config: SensorSubscriptionConfig;
  connection: SensorSubscriptionConnection;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  project: Scalars['String']['output'];
  scopes: Scopes;
  sensorSubscription: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
};

export type SensorSubscriptionAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SensorSubscriptionHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SensorSubscriptionConfig = {
  __typename?: 'SensorSubscriptionConfig';
  format: Scalars['String']['output'];
  topic: Scalars['String']['output'];
  uri: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type SensorSubscriptionConnection = {
  __typename?: 'SensorSubscriptionConnection';
  error?: Maybe<Scalars['String']['output']>;
  lastMessageTimestamp?: Maybe<Scalars['String']['output']>;
  state: SubscriptionState;
};

export type SensorSubscriptionMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'SensorSubscriptionMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    config: SensorSubscriptionConfig;
    connection: SensorSubscriptionConnection;
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    project: Scalars['String']['output'];
    scopes: Scopes;
    sensorSubscription: Scalars['String']['output'];
    tenant: Scalars['String']['output'];
  };

export type SensorSubscriptionMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SensorSubscriptionMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type SensorSubscriptionMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type SensorSubscriptionMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SensorSubscriptionMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type SharedApp = HasAttributes & {
  __typename?: 'SharedApp';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  config: ReadonlySharedAppConfig;
  containerLogs?: Maybe<Scalars['String']['output']>;
  containerStatus?: Maybe<ContainerStatus>;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  scopes: Scopes;
  sharedApp: Scalars['String']['output'];
  tenant: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SharedAppAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SharedAppContainerLogsArgs = {
  lines: Scalars['Int']['input'];
};

export type SharedAppHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SharedAppConfigInput = {
  adminContact: Scalars['String']['input'];
  categories: Array<CitytoolCategory>;
  description: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  imageDigest: Scalars['String']['input'];
  imageRegistry: Scalars['String']['input'];
  imageRepository: Scalars['String']['input'];
  pictureUri?: InputMaybe<Scalars['String']['input']>;
  registryPassword?: InputMaybe<Scalars['String']['input']>;
  registryUsername?: InputMaybe<Scalars['String']['input']>;
};

export type SharedAppMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'SharedAppMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    config: ReadonlySharedAppConfig;
    containerLogs?: Maybe<Scalars['String']['output']>;
    containerStatus?: Maybe<ContainerStatus>;
    createPermission: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    scopes: Scopes;
    sharedApp: Scalars['String']['output'];
    tenant: Scalars['String']['output'];
    update: SharedAppMutation;
    url: Scalars['String']['output'];
  };

export type SharedAppMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type SharedAppMutationContainerLogsArgs = {
  lines: Scalars['Int']['input'];
};

export type SharedAppMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type SharedAppMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type SharedAppMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type SharedAppMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type SharedAppMutationUpdateArgs = {
  config: UpdateSharedAppConfigInput;
};

export type SubscriptionConfigInput = {
  format: Scalars['String']['input'];
  password: Scalars['String']['input'];
  topic: Scalars['String']['input'];
  uri: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export enum SubscriptionState {
  Connected = 'CONNECTED',
  Connecting = 'CONNECTING',
  Error = 'ERROR',
}

export type Tenant = HasAttributes &
  KeycloakGroup & {
    __typename?: 'Tenant';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    citytools: Array<Citytool>;
    dedicatedApps: Array<DedicatedApp>;
    groups: Array<Group>;
    hasScopes: Scalars['Boolean']['output'];
    keycloakGroupPath: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
    permissions?: Maybe<Array<Permission>>;
    projects: Array<Project>;
    requestCityToolLink: Scalars['String']['output'];
    scopes: Scopes;
    sharedApps: Array<SharedApp>;
    tenant: Scalars['String']['output'];
    vizGroups: Array<VizGroup>;
  };

export type TenantAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type TenantHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type TenantRequestCityToolLinkArgs = {
  citytool: Scalars['String']['input'];
};

export type TenantInput = {
  tenant: Scalars['String']['input'];
};

export type TenantMutation = CommonMutation &
  HasAttributes &
  KeycloakGroup & {
    __typename?: 'TenantMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    citytool: CitytoolMutation;
    citytools: Array<Citytool>;
    createCitytool: CitytoolMutation;
    createDedicatedApp: DedicatedAppMutation;
    createGroup: GroupMutation;
    createPermission: Scalars['String']['output'];
    createProject: ProjectMutation;
    createSharedApp: SharedAppMutation;
    createVizGroup: VizGroupMutation;
    dedicatedApp: DedicatedAppMutation;
    dedicatedApps: Array<DedicatedApp>;
    deleteCitytool: Scalars['String']['output'];
    deleteDedicatedApp: Scalars['String']['output'];
    deleteGroup: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    deleteProject: Scalars['String']['output'];
    deleteSharedApp: Scalars['String']['output'];
    deleteVizGroup: Scalars['String']['output'];
    group: GroupMutation;
    groups: Array<Group>;
    hasScopes: Scalars['Boolean']['output'];
    keycloakGroupPath: Scalars['String']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    project: ProjectMutation;
    projects: Array<Project>;
    requestCityToolLink: Scalars['String']['output'];
    scopes: Scopes;
    sharedApp: SharedAppMutation;
    sharedApps: Array<SharedApp>;
    tenant: Scalars['String']['output'];
    vizGroup: VizGroupMutation;
    vizGroups: Array<VizGroup>;
  };

export type TenantMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type TenantMutationCitytoolArgs = {
  citytool: Scalars['String']['input'];
};

export type TenantMutationCreateCitytoolArgs = {
  citytool: Scalars['String']['input'];
  path: Scalars['String']['input'];
};

export type TenantMutationCreateDedicatedAppArgs = {
  dedicatedApp: Scalars['String']['input'];
};

export type TenantMutationCreateGroupArgs = {
  group: Scalars['String']['input'];
};

export type TenantMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type TenantMutationCreateProjectArgs = {
  project: Scalars['String']['input'];
};

export type TenantMutationCreateSharedAppArgs = {
  config: SharedAppConfigInput;
  sharedApp: Scalars['String']['input'];
};

export type TenantMutationCreateVizGroupArgs = {
  vizGroup: Scalars['String']['input'];
};

export type TenantMutationDedicatedAppArgs = {
  dedicatedApp: Scalars['String']['input'];
};

export type TenantMutationDeleteCitytoolArgs = {
  citytool: Scalars['String']['input'];
};

export type TenantMutationDeleteDedicatedAppArgs = {
  dedicatedApp: Scalars['String']['input'];
};

export type TenantMutationDeleteGroupArgs = {
  group: Scalars['String']['input'];
};

export type TenantMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type TenantMutationDeleteProjectArgs = {
  project: Scalars['String']['input'];
};

export type TenantMutationDeleteSharedAppArgs = {
  sharedApp: Scalars['String']['input'];
};

export type TenantMutationDeleteVizGroupArgs = {
  vizGroup: Scalars['String']['input'];
};

export type TenantMutationGroupArgs = {
  group: Scalars['String']['input'];
};

export type TenantMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type TenantMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type TenantMutationProjectArgs = {
  project: Scalars['String']['input'];
};

export type TenantMutationRequestCityToolLinkArgs = {
  citytool: Scalars['String']['input'];
};

export type TenantMutationSharedAppArgs = {
  sharedApp: Scalars['String']['input'];
};

export type TenantMutationVizGroupArgs = {
  vizGroup: Scalars['String']['input'];
};

export type UpdateSharedAppConfigInput = {
  adminContact?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<CitytoolCategory>>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  imageDigest?: InputMaybe<Scalars['String']['input']>;
  imageRegistry?: InputMaybe<Scalars['String']['input']>;
  imageRepository?: InputMaybe<Scalars['String']['input']>;
  pictureUri?: InputMaybe<Scalars['String']['input']>;
  registryPassword?: InputMaybe<Scalars['String']['input']>;
  registryUsername?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  userId: Scalars['String']['output'];
};

export type UserCreateInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  groups: Array<GroupInput>;
  lastName: Scalars['String']['input'];
  tenants: Array<TenantInput>;
};

export type UserInput = {
  userId: Scalars['String']['input'];
};

export type VizGroup = HasAttributes & {
  __typename?: 'VizGroup';
  attribute?: Maybe<Scalars['String']['output']>;
  attributes: Array<Attribute>;
  dashboards: Array<Dashboard>;
  hasScopes: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permission>>;
  publishedQueries: Array<PublishedQuery>;
  scopes: Scopes;
  tenant: Scalars['String']['output'];
  vizGroup: Scalars['String']['output'];
};

export type VizGroupAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type VizGroupHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type VizGroupInput = {
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
};

export type VizGroupMutation = CommonMutation &
  HasAttributes & {
    __typename?: 'VizGroupMutation';
    attribute?: Maybe<Scalars['String']['output']>;
    attributes: Array<Attribute>;
    createDashboard: DashboardMutation;
    createDashboardWithTitle: DashboardMutation;
    createPermission: Scalars['String']['output'];
    createPublishedQuery: PublishedQueryMutation;
    dashboard: DashboardMutation;
    dashboards: Array<Dashboard>;
    deleteDashboard: Scalars['String']['output'];
    deletePermission: Scalars['String']['output'];
    deletePublishedQuery: Scalars['String']['output'];
    hasScopes: Scalars['Boolean']['output'];
    name?: Maybe<Scalars['String']['output']>;
    patchAttributes: Array<Attribute>;
    permissions?: Maybe<Array<Permission>>;
    publishedQueries: Array<PublishedQuery>;
    publishedQuery: PublishedQueryMutation;
    scopes: Scopes;
    tenant: Scalars['String']['output'];
    vizGroup: Scalars['String']['output'];
  };

export type VizGroupMutationAttributeArgs = {
  attribute: Scalars['String']['input'];
};

export type VizGroupMutationCreateDashboardArgs = {
  dashboard: Scalars['String']['input'];
};

export type VizGroupMutationCreateDashboardWithTitleArgs = {
  title: Scalars['String']['input'];
};

export type VizGroupMutationCreatePermissionArgs = {
  permission: PermissionInput;
};

export type VizGroupMutationCreatePublishedQueryArgs = {
  config: QueryConfigInput;
  publishedQuery: Scalars['String']['input'];
};

export type VizGroupMutationDashboardArgs = {
  dashboard: Scalars['String']['input'];
};

export type VizGroupMutationDeleteDashboardArgs = {
  dashboard: Scalars['String']['input'];
};

export type VizGroupMutationDeletePermissionArgs = {
  permission: Scalars['String']['input'];
};

export type VizGroupMutationDeletePublishedQueryArgs = {
  publishedQuery: Scalars['String']['input'];
};

export type VizGroupMutationHasScopesArgs = {
  scopes: Array<Scalars['String']['input']>;
};

export type VizGroupMutationPatchAttributesArgs = {
  attributes: Array<AttributePatchInput>;
};

export type VizGroupMutationPublishedQueryArgs = {
  publishedQuery: Scalars['String']['input'];
};

export type PublicAttributesQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type PublicAttributesQuery = {
  __typename?: 'Query';
  publicAttributes: Array<{
    __typename?: 'Attribute';
    key: string;
    value: string;
  }>;
};

export type PublicCityToolsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type PublicCityToolsQuery = {
  __typename?: 'Query';
  publicCitytools: Array<{
    __typename?: 'PublicCitytool';
    displayName: string;
    description: string;
    categories: Array<CitytoolCategory>;
    pictureUri?: string | null;
    path: string;
    indexPath?: string | null;
  }>;
};

export const PublicAttributesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PublicAttributes' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenant' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicAttributes' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublicAttributesQuery,
  PublicAttributesQueryVariables
>;
export const PublicCityToolsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PublicCityTools' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenant' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicCitytools' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'categories' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pictureUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                { kind: 'Field', name: { kind: 'Name', value: 'indexPath' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublicCityToolsQuery,
  PublicCityToolsQueryVariables
>;
