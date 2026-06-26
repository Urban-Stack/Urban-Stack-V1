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

export type MutateHelpdeskTicketMutationVariables = Exact<{
  title: Scalars['String']['input'];
  description: Scalars['String']['input'];
}>;

export type MutateHelpdeskTicketMutation = {
  __typename?: 'Mutation';
  helpdesk: boolean;
};

export type ThemeAttributesQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type ThemeAttributesQuery = {
  __typename?: 'Query';
  tenant?: { __typename?: 'Tenant'; colorPrimary?: string | null } | null;
};

export type TenantSettingsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type TenantSettingsQuery = {
  __typename?: 'Query';
  tenant?: {
    __typename?: 'Tenant';
    tenantDisplayName?: string | null;
    legalNoticeUrl?: string | null;
    privacyUrl?: string | null;
    contactUrl?: string | null;
    tenantLogoUrl?: string | null;
    tenantImageUrl?: string | null;
    citizenHubImageUrl?: string | null;
    tenantCoords?: string | null;
    colorPrimary?: string | null;
    uchColorPrimary?: string | null;
    newsUrl?: string | null;
  } | null;
};

export type UpdateTenantSettingsMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  tenantDisplayName?: InputMaybe<Scalars['String']['input']>;
  legalNoticeUrl: Scalars['String']['input'];
  privacyUrl: Scalars['String']['input'];
  contactUrl: Scalars['String']['input'];
  tenantLogoUrl?: InputMaybe<Scalars['String']['input']>;
  tenantImageUrl?: InputMaybe<Scalars['String']['input']>;
  citizenHubImageUrl?: InputMaybe<Scalars['String']['input']>;
  tenantCoords?: InputMaybe<Scalars['String']['input']>;
  colorPrimary?: InputMaybe<Scalars['String']['input']>;
  uchColorPrimary?: InputMaybe<Scalars['String']['input']>;
  newsUrl?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateTenantSettingsMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    patchAttributes: Array<{
      __typename?: 'Attribute';
      key: string;
      value: string;
    }>;
  };
};

export type AllCredentialsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type AllCredentialsQuery = {
  __typename?: 'Query';
  project?: {
    __typename?: 'Project';
    sensorCredentials: Array<{
      __typename?: 'SensorCredential';
      sensorCredential: string;
      username: string;
    }>;
  } | null;
};

export type CreateCredentialMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  sensorCredential: Scalars['String']['input'];
}>;

export type CreateCredentialMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      createSensorCredential: {
        __typename?: 'SensorCredentialResult';
        username: string;
        password: string;
      };
    };
  };
};

export type RotateCredentialMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  sensorCredential: Scalars['String']['input'];
}>;

export type RotateCredentialMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      rotateSensorCredential: {
        __typename?: 'SensorCredentialResult';
        username: string;
        password: string;
      };
    };
  };
};

export type DeleteSensorCredentialMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  sensorCredential: Scalars['String']['input'];
}>;

export type DeleteSensorCredentialMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: { __typename?: 'ProjectMutation'; deleteSensorCredential: string };
  };
};

export type AllDatasetsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type AllDatasetsQuery = {
  __typename?: 'Query';
  project?: {
    __typename?: 'Project';
    datasets: Array<{
      __typename?: 'Dataset';
      dataset: string;
      config: {
        __typename?: 'DatasetConfig';
        path: string;
        format: ClickHouseFormat;
      };
    }>;
  } | null;
};

export type CreateDatasetMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  name: Scalars['String']['input'];
  format: ClickHouseFormat;
  path: Scalars['String']['input'];
}>;

export type CreateDatasetMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      createDataset: {
        __typename?: 'DatasetMutation';
        dataset: string;
        config: {
          __typename?: 'DatasetConfig';
          path: string;
          format: ClickHouseFormat;
        };
      };
    };
  };
};

export type DeleteDatasetMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  dataset: Scalars['String']['input'];
}>;

export type DeleteDatasetMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: { __typename?: 'ProjectMutation'; deleteDataset: string };
  };
};

export type RefreshDatasetMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  dataset: Scalars['String']['input'];
}>;

export type RefreshDatasetMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      refreshDataset: {
        __typename?: 'DatasetMutation';
        dataset: string;
        config: {
          __typename?: 'DatasetConfig';
          format: ClickHouseFormat;
          path: string;
        };
      };
    };
  };
};

export type AllDedicatedAppsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type AllDedicatedAppsQuery = {
  __typename?: 'Query';
  all: Array<{
    __typename?: 'DedicatedAppInformation';
    dedicatedApp: string;
    requestCityToolLink: string;
    info: {
      __typename?: 'DedicatedAppMeta';
      categories: Array<CitytoolCategory>;
      description: string;
      name: string;
      pictureUri?: string | null;
      indexPath?: string | null;
    };
  }>;
  installed?: {
    __typename?: 'Tenant';
    tenant: string;
    dedicatedApps: Array<{
      __typename?: 'DedicatedApp';
      dedicatedApp: string;
      url: string;
    }>;
  } | null;
};

export type InstallDedicatedAppMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type InstallDedicatedAppMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createDedicatedApp: {
      __typename?: 'DedicatedAppMutation';
      dedicatedApp: string;
      tenant: string;
      url: string;
    };
  };
};

export type UnInstallDedicatedAppMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type UnInstallDedicatedAppMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteDedicatedApp: string };
};

export type GetDedicatedAppContainerInfosQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  lines: Scalars['Int']['input'];
}>;

export type GetDedicatedAppContainerInfosQuery = {
  __typename?: 'Query';
  dedicatedApp?: {
    __typename?: 'DedicatedApp';
    dedicatedApp: string;
    containerLogs?: string | null;
    containerStatus?: {
      __typename?: 'ContainerStatus';
      ready: boolean;
      running: boolean;
      waitingMessage?: string | null;
      waitingReason?: string | null;
      waiting: boolean;
      restartCount?: number | null;
    } | null;
  } | null;
};

export type AllProjectsQueryVariables = Exact<{ [key: string]: never }>;

export type AllProjectsQuery = {
  __typename?: 'Query';
  tenants: Array<{
    __typename?: 'Tenant';
    projects: Array<{
      __typename?: 'Project';
      tenant: string;
      project: string;
    }>;
  }>;
};

export type GetGroupsPermissionsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type GetGroupsPermissionsQuery = {
  __typename?: 'Query';
  project?: {
    __typename?: 'Project';
    permissions?: Array<{
      __typename?: 'Permission';
      name: string;
      scopes: Array<string>;
      groupPrincipals?: Array<{
        __typename?: 'Group';
        tenant: string;
        group: string;
      }> | null;
    }> | null;
  } | null;
};

export type GetVizGroupsPermissionsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type GetVizGroupsPermissionsQuery = {
  __typename?: 'Query';
  project?: {
    __typename?: 'Project';
    permissions?: Array<{
      __typename?: 'Permission';
      name: string;
      scopes: Array<string>;
      vizGroupPrincipals?: Array<{
        __typename?: 'VizGroup';
        tenant: string;
        vizGroup: string;
      }> | null;
    }> | null;
  } | null;
};

export type CreateProjectMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type CreateProjectMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createProject: {
      __typename?: 'ProjectMutation';
      project: string;
      tenant: string;
    };
  };
};

export type DeleteProjectMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type DeleteProjectMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteProject: string };
};

export type ProjectPermissionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  readGroups: Array<GroupInput> | GroupInput;
  adminGroups: Array<GroupInput> | GroupInput;
}>;

export type ProjectPermissionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: { __typename?: 'ProjectMutation'; read: string; admin: string };
  };
};

export type ProjectVizPermissionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  readGroups: Array<VizGroupInput> | VizGroupInput;
}>;

export type ProjectVizPermissionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: { __typename?: 'ProjectMutation'; vizGroupRead: string };
  };
};

export type GetSharedAppQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type GetSharedAppQuery = {
  __typename?: 'Query';
  sharedApp?: {
    __typename?: 'SharedApp';
    sharedApp: string;
    url: string;
    config: {
      __typename?: 'ReadonlySharedAppConfig';
      displayName: string;
      adminContact: string;
      description: string;
      pictureUri?: string | null;
      categories: Array<CitytoolCategory>;
      imageDigest: string;
      imageRegistry: string;
      imageRepository: string;
      registryUsername?: string | null;
    };
  } | null;
};

export type GetSharedAppsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type GetSharedAppsQuery = {
  __typename?: 'Query';
  tenant?: {
    __typename?: 'Tenant';
    sharedApps: Array<{
      __typename?: 'SharedApp';
      sharedApp: string;
      url: string;
      config: {
        __typename?: 'ReadonlySharedAppConfig';
        displayName: string;
        description: string;
        pictureUri?: string | null;
        categories: Array<CitytoolCategory>;
        adminContact: string;
      };
      containerStatus?: {
        __typename?: 'ContainerStatus';
        ready: boolean;
        running: boolean;
        waiting: boolean;
      } | null;
    }>;
  } | null;
};

export type PublicSharedAppsQueryVariables = Exact<{ [key: string]: never }>;

export type PublicSharedAppsQuery = {
  __typename?: 'Query';
  publicSharedApps: Array<{
    __typename?: 'PublicSharedApp';
    sharedApp: string;
    displayName: string;
    description: string;
    pictureUri?: string | null;
    categories: Array<CitytoolCategory>;
    tenant: string;
    tenantDisplayName?: string | null;
    adminContact: string;
    url: string;
  }>;
};

export type GetContainerInfosQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  lines: Scalars['Int']['input'];
}>;

export type GetContainerInfosQuery = {
  __typename?: 'Query';
  sharedApp?: {
    __typename?: 'SharedApp';
    sharedApp: string;
    containerLogs?: string | null;
    containerStatus?: {
      __typename?: 'ContainerStatus';
      ready: boolean;
      running: boolean;
      waitingMessage?: string | null;
      waitingReason?: string | null;
      waiting: boolean;
      restartCount?: number | null;
    } | null;
  } | null;
};

export type CreateSharedAppMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  config: SharedAppConfigInput;
}>;

export type CreateSharedAppMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createSharedApp: {
      __typename?: 'SharedAppMutation';
      sharedApp: string;
      config: {
        __typename?: 'ReadonlySharedAppConfig';
        displayName: string;
        adminContact: string;
        pictureUri?: string | null;
        categories: Array<CitytoolCategory>;
        description: string;
        imageDigest: string;
        imageRegistry: string;
        imageRepository: string;
        registryUsername?: string | null;
      };
    };
  };
};

export type EditSharedAppMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  config: UpdateSharedAppConfigInput;
}>;

export type EditSharedAppMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    sharedApp: {
      __typename?: 'SharedAppMutation';
      update: {
        __typename?: 'SharedAppMutation';
        sharedApp: string;
        config: {
          __typename?: 'ReadonlySharedAppConfig';
          displayName: string;
          adminContact: string;
          pictureUri?: string | null;
          categories: Array<CitytoolCategory>;
          description: string;
          imageDigest: string;
          imageRegistry: string;
          imageRepository: string;
          registryUsername?: string | null;
        };
      };
    };
  };
};

export type DeleteSharedAppMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type DeleteSharedAppMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteSharedApp: string };
};

export type AllCityToolsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type AllCityToolsQuery = {
  __typename?: 'Query';
  allExisting: Array<{
    __typename?: 'CitytoolInformation';
    citytool: string;
    requestCityToolLink: string;
    info: {
      __typename?: 'CitytoolMeta';
      name: string;
      pictureUri?: string | null;
      description: string;
      categories: Array<CitytoolCategory>;
      showInCitizenhub: boolean;
      showInGovhub: boolean;
      indexPath?: string | null;
    };
    installs: {
      __typename?: 'CitytoolInstalls';
      averageStars?: number | null;
      count: number;
    };
  }>;
  installed?: {
    __typename?: 'Tenant';
    tenant: string;
    citytools: Array<{
      __typename?: 'Citytool';
      citytool: string;
      path: string;
    }>;
  } | null;
};

export type InstallCityToolMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
  path: Scalars['String']['input'];
}>;

export type InstallCityToolMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createCitytool: {
      __typename?: 'CitytoolMutation';
      citytool: string;
      path: string;
    };
  };
};

export type UnInstallCityToolMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type UnInstallCityToolMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteCitytool: string };
};

export type AllSubscriptionsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
}>;

export type AllSubscriptionsQuery = {
  __typename?: 'Query';
  project?: {
    __typename?: 'Project';
    sensorSubscriptions: Array<{
      __typename?: 'SensorSubscription';
      sensorSubscription: string;
      config: {
        __typename?: 'SensorSubscriptionConfig';
        uri: string;
        format: string;
        topic: string;
        username: string;
      };
      connection: {
        __typename?: 'SensorSubscriptionConnection';
        error?: string | null;
        lastMessageTimestamp?: string | null;
        state: SubscriptionState;
      };
    }>;
  } | null;
};

export type SingleSubscriptionQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type SingleSubscriptionQuery = {
  __typename?: 'Query';
  sensorSubscription?: {
    __typename?: 'SensorSubscription';
    config: {
      __typename?: 'SensorSubscriptionConfig';
      uri: string;
      format: string;
      topic: string;
      username: string;
    };
  } | null;
};

export type CreateSubscriptionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  name: Scalars['String']['input'];
  config: SubscriptionConfigInput;
}>;

export type CreateSubscriptionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      createSensorSubscription: {
        __typename?: 'SensorSubscriptionMutation';
        sensorSubscription: string;
        config: {
          __typename?: 'SensorSubscriptionConfig';
          format: string;
          topic: string;
          uri: string;
          username: string;
        };
      };
    };
  };
};

export type DeleteSubscriptionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type DeleteSubscriptionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      deleteSensorSubscription: string;
    };
  };
};

export type UpdateSubscriptionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  project: Scalars['String']['input'];
  oldName: Scalars['String']['input'];
  newName: Scalars['String']['input'];
  config: SubscriptionConfigInput;
}>;

export type UpdateSubscriptionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    project: {
      __typename?: 'ProjectMutation';
      deleteSensorSubscription: string;
      createSensorSubscription: {
        __typename?: 'SensorSubscriptionMutation';
        sensorSubscription: string;
        config: {
          __typename?: 'SensorSubscriptionConfig';
          format: string;
          topic: string;
          uri: string;
          username: string;
        };
      };
    };
  };
};

export type GetTenantNameQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  attribute: Scalars['String']['input'];
}>;

export type GetTenantNameQuery = {
  __typename?: 'Query';
  tenant?: { __typename?: 'Tenant'; attribute?: string | null } | null;
};

export type GetAllTenantAndProjectScopesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAllTenantAndProjectScopesQuery = {
  __typename?: 'Query';
  tenants: Array<{
    __typename?: 'Tenant';
    tenant: string;
    scopes: {
      __typename?: 'Scopes';
      all: Array<string>;
      granted: Array<string>;
    };
    projects: Array<{
      __typename?: 'Project';
      project: string;
      scopes: {
        __typename?: 'Scopes';
        all: Array<string>;
        granted: Array<string>;
      };
    }>;
    groups: Array<{
      __typename?: 'Group';
      group: string;
      scopes: {
        __typename?: 'Scopes';
        all: Array<string>;
        granted: Array<string>;
      };
    }>;
    vizGroups: Array<{
      __typename?: 'VizGroup';
      vizGroup: string;
      scopes: {
        __typename?: 'Scopes';
        all: Array<string>;
        granted: Array<string>;
      };
    }>;
  }>;
};

export type GetTenantScopesQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type GetTenantScopesQuery = {
  __typename?: 'Query';
  tenant?: {
    __typename?: 'Tenant';
    scopes: {
      __typename?: 'Scopes';
      all: Array<string>;
      granted: Array<string>;
    };
  } | null;
};

export type TenantMembershipsQueryVariables = Exact<{ [key: string]: never }>;

export type TenantMembershipsQuery = {
  __typename?: 'Query';
  keycloakGroupMemberships: Array<
    | { __typename?: 'Group'; tenant: string }
    | { __typename?: 'GroupMutation'; tenant: string }
    | { __typename?: 'Tenant'; tenant: string }
    | { __typename?: 'TenantMutation'; tenant: string }
  >;
};

export type AllUserGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type AllUserGroupsQuery = {
  __typename?: 'Query';
  tenants: Array<{
    __typename?: 'Tenant';
    tenant: string;
    groups: Array<{
      __typename?: 'Group';
      group: string;
      keycloakGroupPath: string;
      isMember: boolean;
      scopes: { __typename?: 'Scopes'; granted: Array<string> };
      permissions?: Array<{
        __typename?: 'Permission';
        name: string;
        scopes: Array<string>;
        allowAllAuthenticatedUsers?: boolean | null;
      }> | null;
    }>;
  }>;
};

export type UserGroupPermissionsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type UserGroupPermissionsQuery = {
  __typename?: 'Query';
  group?: {
    __typename?: 'Group';
    permissions?: Array<{
      __typename?: 'Permission';
      name: string;
      scopes: Array<string>;
      groupPrincipals?: Array<{
        __typename?: 'Group';
        tenant: string;
        group: string;
      }> | null;
    }> | null;
  } | null;
};

export type UserGroupScopesQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type UserGroupScopesQuery = {
  __typename?: 'Query';
  group?: {
    __typename?: 'Group';
    scopes: {
      __typename?: 'Scopes';
      all: Array<string>;
      granted: Array<string>;
    };
  } | null;
};

export type CreateUserGroupMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type CreateUserGroupMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createGroup: { __typename?: 'GroupMutation'; group: string };
  };
};

export type DeleteUserGroupMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type DeleteUserGroupMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteGroup: string };
};

export type EnableUserGroupSharedMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type EnableUserGroupSharedMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    group: { __typename?: 'GroupMutation'; shared: string };
  };
};

export type DisableUserGroupSharedMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
}>;

export type DisableUserGroupSharedMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    group: { __typename?: 'GroupMutation'; deletePermission: string };
  };
};

export type UserGroupPermissionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  group: Scalars['String']['input'];
  readGroups: Array<GroupInput> | GroupInput;
  adminGroups: Array<GroupInput> | GroupInput;
}>;

export type UserGroupPermissionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    group: { __typename?: 'GroupMutation'; read: string; admin: string };
  };
};

export type AllVizGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type AllVizGroupsQuery = {
  __typename?: 'Query';
  tenants: Array<{
    __typename?: 'Tenant';
    tenant: string;
    vizGroups: Array<{
      __typename?: 'VizGroup';
      vizGroup: string;
      tenant: string;
    }>;
  }>;
};

export type VizGroupsByTenantQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
}>;

export type VizGroupsByTenantQuery = {
  __typename?: 'Query';
  tenant?: {
    __typename?: 'Tenant';
    vizGroups: Array<{
      __typename?: 'VizGroup';
      vizGroup: string;
      tenant: string;
    }>;
  } | null;
};

export type CreateVizGroupMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type CreateVizGroupMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    createVizGroup: {
      __typename?: 'VizGroupMutation';
      tenant: string;
      vizGroup: string;
    };
  };
};

export type DeleteVizGroupMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type DeleteVizGroupMutation = {
  __typename?: 'Mutation';
  tenant: { __typename?: 'TenantMutation'; deleteVizGroup: string };
};

export type VizGroupDashboardsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
}>;

export type VizGroupDashboardsQuery = {
  __typename?: 'Query';
  vizGroup?: {
    __typename?: 'VizGroup';
    tenant: string;
    vizGroup: string;
    dashboards: Array<{
      __typename?: 'Dashboard';
      slug: string;
      dashboard: string;
    }>;
  } | null;
};

export type VizGroupGroupPermissionsQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
}>;

export type VizGroupGroupPermissionsQuery = {
  __typename?: 'Query';
  vizGroup?: {
    __typename?: 'VizGroup';
    permissions?: Array<{
      __typename?: 'Permission';
      name: string;
      scopes: Array<string>;
      groupPrincipals?: Array<{
        __typename?: 'Group';
        tenant: string;
        group: string;
      }> | null;
    }> | null;
  } | null;
};

export type VizGroupPermissionMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
  readUserGroups: Array<GroupInput> | GroupInput;
  adminUserGroups: Array<GroupInput> | GroupInput;
}>;

export type VizGroupPermissionMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    vizGroup: { __typename?: 'VizGroupMutation'; read: string; admin: string };
  };
};

export type PublishedQueriesQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
}>;

export type PublishedQueriesQuery = {
  __typename?: 'Query';
  vizGroup?: {
    __typename?: 'VizGroup';
    publishedQueries: Array<{
      __typename?: 'PublishedQuery';
      publishedQuery: string;
      config: { __typename?: 'PublishedQueryConfig'; sql: string };
    }>;
  } | null;
};

export type DeletePublishedQueryMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type DeletePublishedQueryMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    vizGroup: { __typename?: 'VizGroupMutation'; deletePublishedQuery: string };
  };
};

export type CreatePublishedQueryMutationVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
  name: Scalars['String']['input'];
  sql: Scalars['String']['input'];
}>;

export type CreatePublishedQueryMutation = {
  __typename?: 'Mutation';
  tenant: {
    __typename?: 'TenantMutation';
    vizGroup: {
      __typename?: 'VizGroupMutation';
      createPublishedQuery: {
        __typename?: 'PublishedQueryMutation';
        publishedQuery: string;
        config: { __typename?: 'PublishedQueryConfig'; sql: string };
      };
    };
  };
};

export type GetPublishedQueryQueryVariables = Exact<{
  tenant: Scalars['String']['input'];
  vizGroup: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;

export type GetPublishedQueryQuery = {
  __typename?: 'Query';
  publishedQuery?: {
    __typename?: 'PublishedQuery';
    publishedQuery: string;
    config: { __typename?: 'PublishedQueryConfig'; sql: string };
  } | null;
};

export const MutateHelpdeskTicketDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MutateHelpdeskTicket' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'title' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'description' },
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
            name: { kind: 'Name', value: 'helpdesk' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'title' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'title' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'description' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'description' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MutateHelpdeskTicketMutation,
  MutateHelpdeskTicketMutationVariables
>;
export const ThemeAttributesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ThemeAttributes' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'colorPrimary' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'color-primary',
                        block: false,
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ThemeAttributesQuery,
  ThemeAttributesQueryVariables
>;
export const TenantSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TenantSettings' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'tenantDisplayName' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'tenant-name',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'legalNoticeUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'legal-notice-url',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'privacyUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'privacy-url',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'contactUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'contact-url',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'tenantLogoUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'tenant-logo',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'tenantImageUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'tenant-image',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'citizenHubImageUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'citizen-hub-image',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'tenantCoords' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'tenant-coords',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'colorPrimary' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'color-primary',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'uchColorPrimary' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'uch-color-primary',
                        block: false,
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'newsUrl' },
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'StringValue',
                        value: 'news-url',
                        block: false,
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TenantSettingsQuery, TenantSettingsQueryVariables>;
export const UpdateTenantSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTenantSettings' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenantDisplayName' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'legalNoticeUrl' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'privacyUrl' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'contactUrl' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenantLogoUrl' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenantImageUrl' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'citizenHubImageUrl' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'tenantCoords' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'colorPrimary' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'uchColorPrimary' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'newsUrl' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'patchAttributes' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attributes' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'tenant-name',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'tenantDisplayName',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'legal-notice-url',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'legalNoticeUrl',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'privacy-url',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: { kind: 'Name', value: 'privacyUrl' },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'contact-url',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: { kind: 'Name', value: 'contactUrl' },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'tenant-logo',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'tenantLogoUrl',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'tenant-image',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'tenantImageUrl',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'citizen-hub-image',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'citizenHubImageUrl',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'tenant-coords',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: { kind: 'Name', value: 'tenantCoords' },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'color-primary',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: { kind: 'Name', value: 'colorPrimary' },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'uch-color-primary',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: {
                                    kind: 'Name',
                                    value: 'uchColorPrimary',
                                  },
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'key' },
                                value: {
                                  kind: 'StringValue',
                                  value: 'news-url',
                                  block: false,
                                },
                              },
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'value' },
                                value: {
                                  kind: 'Variable',
                                  name: { kind: 'Name', value: 'newsUrl' },
                                },
                              },
                            ],
                          },
                        ],
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
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTenantSettingsMutation,
  UpdateTenantSettingsMutationVariables
>;
export const AllCredentialsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllCredentials' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'project' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sensorCredentials' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sensorCredential' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllCredentialsQuery, AllCredentialsQueryVariables>;
export const CreateCredentialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCredential' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sensorCredential' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createSensorCredential' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorCredential' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'sensorCredential' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'username' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'password' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCredentialMutation,
  CreateCredentialMutationVariables
>;
export const RotateCredentialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RotateCredential' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sensorCredential' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'rotateSensorCredential' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorCredential' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'sensorCredential' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'username' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'password' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RotateCredentialMutation,
  RotateCredentialMutationVariables
>;
export const DeleteSensorCredentialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSensorCredential' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sensorCredential' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deleteSensorCredential' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorCredential' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'sensorCredential' },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSensorCredentialMutation,
  DeleteSensorCredentialMutationVariables
>;
export const AllDatasetsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllDatasets' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'project' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'datasets' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dataset' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'config' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'path' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'format' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllDatasetsQuery, AllDatasetsQueryVariables>;
export const CreateDatasetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateDataset' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'format' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ClickHouseFormat' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'path' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createDataset' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'dataset' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'name' },
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'config' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'format' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'format' },
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'path' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'path' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'dataset' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'format' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDatasetMutation,
  CreateDatasetMutationVariables
>;
export const DeleteDatasetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteDataset' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'dataset' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deleteDataset' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'dataset' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'dataset' },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteDatasetMutation,
  DeleteDatasetMutationVariables
>;
export const RefreshDatasetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RefreshDataset' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'dataset' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'refreshDataset' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'dataset' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'dataset' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'dataset' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'format' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'path' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RefreshDatasetMutation,
  RefreshDatasetMutationVariables
>;
export const AllDedicatedAppsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllDedicatedApps' },
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
            alias: { kind: 'Name', value: 'all' },
            name: { kind: 'Name', value: 'dedicatedAppsInfo' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'dedicatedApp' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'info' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'categories' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUri' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'indexPath' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'requestCityToolLink' },
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
                },
              ],
            },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'installed' },
            name: { kind: 'Name', value: 'tenant' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'dedicatedApps' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dedicatedApp' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AllDedicatedAppsQuery,
  AllDedicatedAppsQueryVariables
>;
export const InstallDedicatedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'InstallDedicatedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createDedicatedApp' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'dedicatedApp' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dedicatedApp' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  InstallDedicatedAppMutation,
  InstallDedicatedAppMutationVariables
>;
export const UnInstallDedicatedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UnInstallDedicatedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteDedicatedApp' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'dedicatedApp' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UnInstallDedicatedAppMutation,
  UnInstallDedicatedAppMutationVariables
>;
export const GetDedicatedAppContainerInfosDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDedicatedAppContainerInfos' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'lines' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'dedicatedApp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'dedicatedApp' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'dedicatedApp' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'containerLogs' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'lines' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'lines' },
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'containerStatus' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'ready' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'running' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waitingMessage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waitingReason' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waiting' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'restartCount' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDedicatedAppContainerInfosQuery,
  GetDedicatedAppContainerInfosQueryVariables
>;
export const AllProjectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllProjects' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'projects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'project' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllProjectsQuery, AllProjectsQueryVariables>;
export const GetGroupsPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetGroupsPermissions' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'project' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permissions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'groupPrincipals' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'tenant' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'group' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetGroupsPermissionsQuery,
  GetGroupsPermissionsQueryVariables
>;
export const GetVizGroupsPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVizGroupsPermissions' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'project' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permissions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vizGroupPrincipals' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'tenant' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'vizGroup' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVizGroupsPermissionsQuery,
  GetVizGroupsPermissionsQueryVariables
>;
export const CreateProjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateProject' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createProject' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'project' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProjectMutation,
  CreateProjectMutationVariables
>;
export const DeleteProjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteProject' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteProject' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProjectMutation,
  DeleteProjectMutationVariables
>;
export const ProjectPermissionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ProjectPermission' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'readGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'adminGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'read' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'read',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'project:read',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'readGroups' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'admin' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'admin',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'project:admin',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: {
                                      kind: 'Name',
                                      value: 'adminGroups',
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProjectPermissionMutation,
  ProjectPermissionMutationVariables
>;
export const ProjectVizPermissionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ProjectVizPermission' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'readGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'VizGroupInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'vizGroupRead' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'viz-group-read',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'project:read',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'vizGroupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'readGroups' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProjectVizPermissionMutation,
  ProjectVizPermissionMutationVariables
>;
export const GetSharedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSharedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'sharedApp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sharedApp' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'sharedApp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'config' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'displayName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'adminContact' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUri' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'categories' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageDigest' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageRegistry' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'imageRepository' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'registryUsername' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSharedAppQuery, GetSharedAppQueryVariables>;
export const GetSharedAppsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSharedApps' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sharedApps' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sharedApp' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'config' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'displayName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUri' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'categories' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'adminContact' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'containerStatus' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ready' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'running' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'waiting' },
                            },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSharedAppsQuery, GetSharedAppsQueryVariables>;
export const PublicSharedAppsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PublicSharedApps' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicSharedApps' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'sharedApp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pictureUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'categories' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tenantDisplayName' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'adminContact' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublicSharedAppsQuery,
  PublicSharedAppsQueryVariables
>;
export const GetContainerInfosDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetContainerInfos' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'lines' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sharedApp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sharedApp' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'sharedApp' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'containerLogs' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'lines' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'lines' },
                      },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'containerStatus' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'ready' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'running' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waitingMessage' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waitingReason' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'waiting' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'restartCount' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetContainerInfosQuery,
  GetContainerInfosQueryVariables
>;
export const CreateSharedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSharedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'config' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SharedAppConfigInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createSharedApp' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'sharedApp' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'config' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'config' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sharedApp' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'config' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'displayName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'adminContact' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'pictureUri' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'categories' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'imageDigest' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'imageRegistry' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'imageRepository' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'registryUsername' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSharedAppMutation,
  CreateSharedAppMutationVariables
>;
export const EditSharedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EditSharedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'config' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSharedAppConfigInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sharedApp' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'sharedApp' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'update' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'config' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'config' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'sharedApp' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'displayName',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'adminContact',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'pictureUri' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'categories' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'description',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'imageDigest',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'imageRegistry',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'imageRepository',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'registryUsername',
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EditSharedAppMutation,
  EditSharedAppMutationVariables
>;
export const DeleteSharedAppDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSharedApp' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteSharedApp' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'sharedApp' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSharedAppMutation,
  DeleteSharedAppMutationVariables
>;
export const AllCityToolsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllCityTools' },
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
            alias: { kind: 'Name', value: 'allExisting' },
            name: { kind: 'Name', value: 'citytoolsInfo' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'citytool' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'info' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pictureUri' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'categories' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'showInCitizenhub' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'showInGovhub' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'indexPath' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'installs' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'averageStars' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'requestCityToolLink' },
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
                },
              ],
            },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'installed' },
            name: { kind: 'Name', value: 'tenant' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'citytools' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'citytool' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllCityToolsQuery, AllCityToolsQueryVariables>;
export const InstallCityToolDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'InstallCityTool' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'path' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createCitytool' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'citytool' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'path' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'path' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'citytool' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'path' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  InstallCityToolMutation,
  InstallCityToolMutationVariables
>;
export const UnInstallCityToolDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UnInstallCityTool' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteCitytool' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'citytool' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UnInstallCityToolMutation,
  UnInstallCityToolMutationVariables
>;
export const AllSubscriptionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllSubscriptions' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
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
            name: { kind: 'Name', value: 'project' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sensorSubscriptions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sensorSubscription' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'config' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'uri' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'format' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'topic' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'username' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'connection' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'error' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'lastMessageTimestamp',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'state' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AllSubscriptionsQuery,
  AllSubscriptionsQueryVariables
>;
export const SingleSubscriptionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SingleSubscription' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'sensorSubscription' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'project' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'project' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sensorSubscription' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'config' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'uri' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'format' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'topic' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SingleSubscriptionQuery,
  SingleSubscriptionQueryVariables
>;
export const CreateSubscriptionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSubscription' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'config' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SubscriptionConfigInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'createSensorSubscription',
                        },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorSubscription' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'name' },
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'config' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'config' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'sensorSubscription',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'format' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'topic' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'uri' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'username' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSubscriptionMutation,
  CreateSubscriptionMutationVariables
>;
export const DeleteSubscriptionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSubscription' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'deleteSensorSubscription',
                        },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorSubscription' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'name' },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSubscriptionMutation,
  DeleteSubscriptionMutationVariables
>;
export const UpdateSubscriptionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSubscription' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'project' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'oldName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'newName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'config' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SubscriptionConfigInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'project' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'project' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'project' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'deleteSensorSubscription',
                        },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorSubscription' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'oldName' },
                            },
                          },
                        ],
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'createSensorSubscription',
                        },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'sensorSubscription' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'newName' },
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'config' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'config' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'sensorSubscription',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'format' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'topic' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'uri' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'username' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSubscriptionMutation,
  UpdateSubscriptionMutationVariables
>;
export const GetTenantNameDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTenantName' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'attribute' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'attribute' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'attribute' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'attribute' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTenantNameQuery, GetTenantNameQueryVariables>;
export const GetAllTenantAndProjectScopesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllTenantAndProjectScopes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'scopes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'all' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'granted' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'projects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'project' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'all' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'granted' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'groups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'group' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'all' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'granted' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'all' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'granted' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllTenantAndProjectScopesQuery,
  GetAllTenantAndProjectScopesQueryVariables
>;
export const GetTenantScopesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTenantScopes' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'scopes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'all' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'granted' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTenantScopesQuery,
  GetTenantScopesQueryVariables
>;
export const TenantMembershipsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TenantMemberships' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'keycloakGroupMemberships' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TenantMembershipsQuery,
  TenantMembershipsQueryVariables
>;
export const AllUserGroupsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllUserGroups' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'groups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'group' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keycloakGroupPath' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isMember' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'granted' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'permissions' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'scopes' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'allowAllAuthenticatedUsers',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllUserGroupsQuery, AllUserGroupsQueryVariables>;
export const UserGroupPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UserGroupPermissions' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'group' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'group' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'group' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permissions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'groupPrincipals' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'tenant' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'group' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UserGroupPermissionsQuery,
  UserGroupPermissionsQueryVariables
>;
export const UserGroupScopesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UserGroupScopes' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'group' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'group' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'group' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'scopes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'all' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'granted' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UserGroupScopesQuery,
  UserGroupScopesQueryVariables
>;
export const CreateUserGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateUserGroup' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'group' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'group' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'group' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateUserGroupMutation,
  CreateUserGroupMutationVariables
>;
export const DeleteUserGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteUserGroup' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'group' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'group' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteUserGroupMutation,
  DeleteUserGroupMutationVariables
>;
export const EnableUserGroupSharedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EnableUserGroupShared' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'group' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'group' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'group' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'shared' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'shared',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'group:view',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'allowAllAuthenticatedUsers',
                                  },
                                  value: { kind: 'BooleanValue', value: true },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EnableUserGroupSharedMutation,
  EnableUserGroupSharedMutationVariables
>;
export const DisableUserGroupSharedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DisableUserGroupShared' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'group' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'group' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'group' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deletePermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'StringValue',
                              value: 'shared',
                              block: false,
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DisableUserGroupSharedMutation,
  DisableUserGroupSharedMutationVariables
>;
export const UserGroupPermissionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UserGroupPermission' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'group' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'readGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'adminGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'group' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'group' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'group' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'read' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'read',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'group:read',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'readGroups' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'admin' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'admin',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'group:admin',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: {
                                      kind: 'Name',
                                      value: 'adminGroups',
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UserGroupPermissionMutation,
  UserGroupPermissionMutationVariables
>;
export const AllVizGroupsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AllVizGroups' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllVizGroupsQuery, AllVizGroupsQueryVariables>;
export const VizGroupsByTenantDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'VizGroupsByTenant' },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroups' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VizGroupsByTenantQuery,
  VizGroupsByTenantQueryVariables
>;
export const CreateVizGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'createVizGroup' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'createVizGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'vizGroup' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tenant' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateVizGroupMutation,
  CreateVizGroupMutationVariables
>;
export const DeleteVizGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'deleteVizGroup' },
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
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'deleteVizGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'vizGroup' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'name' },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteVizGroupMutation,
  DeleteVizGroupMutationVariables
>;
export const VizGroupDashboardsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'VizGroupDashboards' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
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
            name: { kind: 'Name', value: 'vizGroup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'vizGroup' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'vizGroup' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'tenant' } },
                { kind: 'Field', name: { kind: 'Name', value: 'vizGroup' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'dashboards' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashboard' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VizGroupDashboardsQuery,
  VizGroupDashboardsQueryVariables
>;
export const VizGroupGroupPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'VizGroupGroupPermissions' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
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
            name: { kind: 'Name', value: 'vizGroup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'vizGroup' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'vizGroup' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permissions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'groupPrincipals' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'tenant' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'group' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopes' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VizGroupGroupPermissionsQuery,
  VizGroupGroupPermissionsQueryVariables
>;
export const VizGroupPermissionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'VizGroupPermission' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'readUserGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'adminUserGroups' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'GroupInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'vizGroup' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'read' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'read',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'viz-group:read',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: {
                                      kind: 'Name',
                                      value: 'readUserGroups',
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'admin' },
                        name: { kind: 'Name', value: 'createPermission' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'permission' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'name' },
                                  value: {
                                    kind: 'StringValue',
                                    value: 'admin',
                                    block: false,
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'scopes' },
                                  value: {
                                    kind: 'ListValue',
                                    values: [
                                      {
                                        kind: 'StringValue',
                                        value: 'viz-group:admin',
                                        block: false,
                                      },
                                    ],
                                  },
                                },
                                {
                                  kind: 'ObjectField',
                                  name: {
                                    kind: 'Name',
                                    value: 'groupPrincipals',
                                  },
                                  value: {
                                    kind: 'Variable',
                                    name: {
                                      kind: 'Name',
                                      value: 'adminUserGroups',
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  VizGroupPermissionMutation,
  VizGroupPermissionMutationVariables
>;
export const PublishedQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PublishedQueries' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
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
            name: { kind: 'Name', value: 'vizGroup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'vizGroup' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'vizGroup' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'publishedQueries' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'publishedQuery' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'config' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'sql' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublishedQueriesQuery,
  PublishedQueriesQueryVariables
>;
export const DeletePublishedQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePublishedQuery' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'vizGroup' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deletePublishedQuery' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'publishedQuery' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'name' },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePublishedQueryMutation,
  DeletePublishedQueryMutationVariables
>;
export const CreatePublishedQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePublishedQuery' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sql' } },
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
            name: { kind: 'Name', value: 'tenant' },
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
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'vizGroup' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'vizGroup' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'vizGroup' },
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createPublishedQuery' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'publishedQuery' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'name' },
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'config' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'sql' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'sql' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'publishedQuery' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'config' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'sql' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePublishedQueryMutation,
  CreatePublishedQueryMutationVariables
>;
export const GetPublishedQueryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPublishedQuery' },
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
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'vizGroup' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
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
            name: { kind: 'Name', value: 'publishedQuery' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tenant' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'tenant' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'vizGroup' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'vizGroup' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publishedQuery' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'name' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'publishedQuery' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'config' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'sql' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPublishedQueryQuery,
  GetPublishedQueryQueryVariables
>;
