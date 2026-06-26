/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  mutation MutateHelpdeskTicket($title: String!, $description: String!) {\n    helpdesk(title: $title, description: $description)\n  }\n': typeof types.MutateHelpdeskTicketDocument;
  '\n  query ThemeAttributes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      colorPrimary: attribute(attribute: "color-primary")\n    }\n  }\n': typeof types.ThemeAttributesDocument;
  '\n  query TenantSettings($tenant: String!) {\n    tenant(tenant: $tenant) {\n      tenantDisplayName: attribute(attribute: "tenant-name")\n      legalNoticeUrl: attribute(attribute: "legal-notice-url")\n      privacyUrl: attribute(attribute: "privacy-url")\n      contactUrl: attribute(attribute: "contact-url")\n      tenantLogoUrl: attribute(attribute: "tenant-logo")\n      tenantImageUrl: attribute(attribute: "tenant-image")\n      citizenHubImageUrl: attribute(attribute: "citizen-hub-image")\n      tenantCoords: attribute(attribute: "tenant-coords")\n      colorPrimary: attribute(attribute: "color-primary")\n      uchColorPrimary: attribute(attribute: "uch-color-primary")\n      newsUrl: attribute(attribute: "news-url")\n    }\n  }\n': typeof types.TenantSettingsDocument;
  '\n  mutation UpdateTenantSettings(\n    $tenant: String!\n    $tenantDisplayName: String\n    $legalNoticeUrl: String!\n    $privacyUrl: String!\n    $contactUrl: String!\n    $tenantLogoUrl: String\n    $tenantImageUrl: String\n    $citizenHubImageUrl: String\n    $tenantCoords: String\n    $colorPrimary: String\n    $uchColorPrimary: String\n    $newsUrl: String\n  ) {\n    tenant(tenant: $tenant) {\n      patchAttributes(\n        attributes: [\n          { key: "tenant-name", value: $tenantDisplayName }\n          { key: "legal-notice-url", value: $legalNoticeUrl }\n          { key: "privacy-url", value: $privacyUrl }\n          { key: "contact-url", value: $contactUrl }\n          { key: "tenant-logo", value: $tenantLogoUrl }\n          { key: "tenant-image", value: $tenantImageUrl }\n          { key: "citizen-hub-image", value: $citizenHubImageUrl }\n          { key: "tenant-coords", value: $tenantCoords }\n          { key: "color-primary", value: $colorPrimary }\n          { key: "uch-color-primary", value: $uchColorPrimary }\n          { key: "news-url", value: $newsUrl }\n        ]\n      ) {\n        key\n        value\n      }\n    }\n  }\n': typeof types.UpdateTenantSettingsDocument;
  '\n  query AllCredentials($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorCredentials {\n        sensorCredential\n        username\n      }\n    }\n  }\n': typeof types.AllCredentialsDocument;
  '\n  mutation CreateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n': typeof types.CreateCredentialDocument;
  '\n  mutation RotateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        rotateSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n': typeof types.RotateCredentialDocument;
  '\n  mutation DeleteSensorCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorCredential(sensorCredential: $sensorCredential)\n      }\n    }\n  }\n': typeof types.DeleteSensorCredentialDocument;
  '\n  query AllDatasets($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      datasets {\n        dataset\n        config {\n          path\n          format\n        }\n      }\n    }\n  }\n': typeof types.AllDatasetsDocument;
  '\n  mutation CreateDataset(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $format: ClickHouseFormat!\n    $path: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createDataset(\n          dataset: $name\n          config: { format: $format, path: $path }\n        ) {\n          dataset\n          config {\n            path\n            format\n          }\n        }\n      }\n    }\n  }\n': typeof types.CreateDatasetDocument;
  '\n  mutation DeleteDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteDataset(dataset: $dataset)\n      }\n    }\n  }\n': typeof types.DeleteDatasetDocument;
  '\n  mutation RefreshDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        refreshDataset(dataset: $dataset) {\n          dataset\n          config {\n            format\n            path\n          }\n        }\n      }\n    }\n  }\n': typeof types.RefreshDatasetDocument;
  '\n  query AllDedicatedApps($tenant: String!) {\n    all: dedicatedAppsInfo {\n      dedicatedApp\n      info {\n        categories\n        description\n        name\n        pictureUri\n        indexPath\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      dedicatedApps {\n        dedicatedApp\n        url\n      }\n    }\n  }\n': typeof types.AllDedicatedAppsDocument;
  '\n  mutation InstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createDedicatedApp(dedicatedApp: $name) {\n        dedicatedApp\n        tenant\n        url\n      }\n    }\n  }\n': typeof types.InstallDedicatedAppDocument;
  '\n  mutation UnInstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteDedicatedApp(dedicatedApp: $name)\n    }\n  }\n': typeof types.UnInstallDedicatedAppDocument;
  '\n  query GetDedicatedAppContainerInfos(\n    $tenant: String!\n    $name: String!\n    $lines: Int!\n  ) {\n    dedicatedApp(tenant: $tenant, dedicatedApp: $name) {\n      dedicatedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n': typeof types.GetDedicatedAppContainerInfosDocument;
  '\n  query AllProjects {\n    tenants {\n      projects {\n        tenant\n        project\n      }\n    }\n  }\n': typeof types.AllProjectsDocument;
  '\n  query GetGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n': typeof types.GetGroupsPermissionsDocument;
  '\n  query GetVizGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        vizGroupPrincipals {\n          tenant\n          vizGroup\n        }\n        scopes\n      }\n    }\n  }\n': typeof types.GetVizGroupsPermissionsDocument;
  '\n  mutation CreateProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      createProject(project: $project) {\n        project\n        tenant\n      }\n    }\n  }\n': typeof types.CreateProjectDocument;
  '\n  mutation DeleteProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      deleteProject(project: $project)\n    }\n  }\n': typeof types.DeleteProjectDocument;
  '\n  mutation ProjectPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["project:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["project:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n': typeof types.ProjectPermissionDocument;
  '\n  mutation ProjectVizPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [VizGroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        vizGroupRead: createPermission(\n          permission: {\n            name: "viz-group-read"\n            scopes: ["project:read"]\n            vizGroupPrincipals: $readGroups\n          }\n        )\n      }\n    }\n  }\n': typeof types.ProjectVizPermissionDocument;
  '\n  query GetSharedApp($tenant: String!, $name: String!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      url\n      config {\n        displayName\n        adminContact\n        description\n        pictureUri\n        categories\n        imageDigest\n        imageRegistry\n        imageRepository\n        registryUsername\n      }\n    }\n  }\n': typeof types.GetSharedAppDocument;
  '\n  query GetSharedApps($tenant: String!) {\n    tenant(tenant: $tenant) {\n      sharedApps {\n        sharedApp\n        config {\n          displayName\n          description\n          pictureUri\n          categories\n          adminContact\n        }\n        containerStatus {\n          ready\n          running\n          waiting\n        }\n        url\n      }\n    }\n  }\n': typeof types.GetSharedAppsDocument;
  '\n  query PublicSharedApps {\n    publicSharedApps {\n      sharedApp\n      displayName\n      description\n      pictureUri\n      categories\n      tenant\n      tenantDisplayName\n      adminContact\n      url\n    }\n  }\n': typeof types.PublicSharedAppsDocument;
  '\n  query GetContainerInfos($tenant: String!, $name: String!, $lines: Int!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n': typeof types.GetContainerInfosDocument;
  '\n  mutation CreateSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: SharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      createSharedApp(sharedApp: $name, config: $config) {\n        sharedApp\n        config {\n          displayName\n          adminContact\n          pictureUri\n          categories\n          description\n          imageDigest\n          imageRegistry\n          imageRepository\n          registryUsername\n        }\n      }\n    }\n  }\n': typeof types.CreateSharedAppDocument;
  '\n  mutation EditSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: UpdateSharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      sharedApp(sharedApp: $name) {\n        update(config: $config) {\n          sharedApp\n          config {\n            displayName\n            adminContact\n            pictureUri\n            categories\n            description\n            imageDigest\n            imageRegistry\n            imageRepository\n            registryUsername\n          }\n        }\n      }\n    }\n  }\n': typeof types.EditSharedAppDocument;
  '\n  mutation DeleteSharedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteSharedApp(sharedApp: $name)\n    }\n  }\n': typeof types.DeleteSharedAppDocument;
  '\n  query AllCityTools($tenant: String!) {\n    allExisting: citytoolsInfo {\n      citytool\n      info {\n        name\n        pictureUri\n        description\n        categories\n        showInCitizenhub\n        showInGovhub\n        indexPath\n      }\n      installs {\n        averageStars\n        count\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      citytools {\n        citytool\n        path\n      }\n    }\n  }\n': typeof types.AllCityToolsDocument;
  '\n  mutation InstallCityTool($tenant: String!, $name: String!, $path: String!) {\n    tenant(tenant: $tenant) {\n      createCitytool(citytool: $name, path: $path) {\n        citytool\n        path\n      }\n    }\n  }\n': typeof types.InstallCityToolDocument;
  '\n  mutation UnInstallCityTool($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteCitytool(citytool: $name)\n    }\n  }\n': typeof types.UnInstallCityToolDocument;
  '\n  query AllSubscriptions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorSubscriptions {\n        sensorSubscription\n        config {\n          uri\n          format\n          topic\n          username\n        }\n        connection {\n          error\n          lastMessageTimestamp\n          state\n        }\n      }\n    }\n  }\n': typeof types.AllSubscriptionsDocument;
  '\n  query SingleSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    sensorSubscription(\n      tenant: $tenant\n      project: $project\n      sensorSubscription: $name\n    ) {\n      config {\n        uri\n        format\n        topic\n        username\n      }\n    }\n  }\n': typeof types.SingleSubscriptionDocument;
  '\n  mutation CreateSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorSubscription(sensorSubscription: $name, config: $config) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n': typeof types.CreateSubscriptionDocument;
  '\n  mutation DeleteSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $name)\n      }\n    }\n  }\n': typeof types.DeleteSubscriptionDocument;
  '\n  mutation UpdateSubscription(\n    $tenant: String!\n    $project: String!\n    $oldName: String!\n    $newName: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $oldName)\n        createSensorSubscription(\n          sensorSubscription: $newName\n          config: $config\n        ) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n': typeof types.UpdateSubscriptionDocument;
  '\n  query GetTenantName($tenant: String!, $attribute: String!) {\n    tenant(tenant: $tenant) {\n      attribute(attribute: $attribute)\n    }\n  }\n': typeof types.GetTenantNameDocument;
  '\n  query GetAllTenantAndProjectScopes {\n    tenants {\n      tenant\n      scopes {\n        all\n        granted\n      }\n      projects {\n        project\n        scopes {\n          all\n          granted\n        }\n      }\n      groups {\n        group\n        scopes {\n          all\n          granted\n        }\n      }\n      vizGroups {\n        vizGroup\n        scopes {\n          all\n          granted\n        }\n      }\n    }\n  }\n': typeof types.GetAllTenantAndProjectScopesDocument;
  '\n  query GetTenantScopes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n': typeof types.GetTenantScopesDocument;
  '\n  query TenantMemberships {\n    keycloakGroupMemberships {\n      tenant\n    }\n  }\n': typeof types.TenantMembershipsDocument;
  '\n  query AllUserGroups {\n    tenants {\n      tenant\n      groups {\n        group\n        keycloakGroupPath\n        isMember\n        scopes {\n          granted\n        }\n        permissions {\n          name\n          scopes\n          allowAllAuthenticatedUsers\n        }\n      }\n    }\n  }\n': typeof types.AllUserGroupsDocument;
  '\n  query UserGroupPermissions($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n': typeof types.UserGroupPermissionsDocument;
  '\n  query UserGroupScopes($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n': typeof types.UserGroupScopesDocument;
  '\n  mutation CreateUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      createGroup(group: $group) {\n        group\n      }\n    }\n  }\n': typeof types.CreateUserGroupDocument;
  '\n  mutation DeleteUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      deleteGroup(group: $group)\n    }\n  }\n': typeof types.DeleteUserGroupDocument;
  '\n  mutation EnableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        shared: createPermission(\n          permission: {\n            name: "shared"\n            scopes: ["group:view"]\n            allowAllAuthenticatedUsers: true\n          }\n        )\n      }\n    }\n  }\n': typeof types.EnableUserGroupSharedDocument;
  '\n  mutation DisableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        deletePermission(permission: "shared")\n      }\n    }\n  }\n': typeof types.DisableUserGroupSharedDocument;
  '\n  mutation UserGroupPermission(\n    $tenant: String!\n    $group: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["group:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["group:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n': typeof types.UserGroupPermissionDocument;
  '\n  query AllVizGroups {\n    tenants {\n      tenant\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n': typeof types.AllVizGroupsDocument;
  '\n  query VizGroupsByTenant($tenant: String!) {\n    tenant(tenant: $tenant) {\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n': typeof types.VizGroupsByTenantDocument;
  '\n  mutation createVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createVizGroup(vizGroup: $name) {\n        tenant\n        vizGroup\n      }\n    }\n  }\n': typeof types.CreateVizGroupDocument;
  '\n  mutation deleteVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteVizGroup(vizGroup: $name)\n    }\n  }\n': typeof types.DeleteVizGroupDocument;
  '\n  query VizGroupDashboards($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      tenant\n      vizGroup\n      dashboards {\n        slug\n        dashboard\n      }\n    }\n  }\n': typeof types.VizGroupDashboardsDocument;
  '\n  query VizGroupGroupPermissions($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n': typeof types.VizGroupGroupPermissionsDocument;
  '\n  mutation VizGroupPermission(\n    $tenant: String!\n    $vizGroup: String!\n    $readUserGroups: [GroupInput!]!\n    $adminUserGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["viz-group:read"]\n            groupPrincipals: $readUserGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["viz-group:admin"]\n            groupPrincipals: $adminUserGroups\n          }\n        )\n      }\n    }\n  }\n': typeof types.VizGroupPermissionDocument;
  '\n  query PublishedQueries($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      publishedQueries {\n        publishedQuery\n        config {\n          sql\n        }\n      }\n    }\n  }\n': typeof types.PublishedQueriesDocument;
  '\n  mutation DeletePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        deletePublishedQuery(publishedQuery: $name)\n      }\n    }\n  }\n': typeof types.DeletePublishedQueryDocument;
  '\n  mutation CreatePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n    $sql: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        createPublishedQuery(publishedQuery: $name, config: { sql: $sql }) {\n          publishedQuery\n          config {\n            sql\n          }\n        }\n      }\n    }\n  }\n': typeof types.CreatePublishedQueryDocument;
  '\n  query GetPublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    publishedQuery(\n      tenant: $tenant\n      vizGroup: $vizGroup\n      publishedQuery: $name\n    ) {\n      publishedQuery\n      config {\n        sql\n      }\n    }\n  }\n': typeof types.GetPublishedQueryDocument;
};
const documents: Documents = {
  '\n  mutation MutateHelpdeskTicket($title: String!, $description: String!) {\n    helpdesk(title: $title, description: $description)\n  }\n':
    types.MutateHelpdeskTicketDocument,
  '\n  query ThemeAttributes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      colorPrimary: attribute(attribute: "color-primary")\n    }\n  }\n':
    types.ThemeAttributesDocument,
  '\n  query TenantSettings($tenant: String!) {\n    tenant(tenant: $tenant) {\n      tenantDisplayName: attribute(attribute: "tenant-name")\n      legalNoticeUrl: attribute(attribute: "legal-notice-url")\n      privacyUrl: attribute(attribute: "privacy-url")\n      contactUrl: attribute(attribute: "contact-url")\n      tenantLogoUrl: attribute(attribute: "tenant-logo")\n      tenantImageUrl: attribute(attribute: "tenant-image")\n      citizenHubImageUrl: attribute(attribute: "citizen-hub-image")\n      tenantCoords: attribute(attribute: "tenant-coords")\n      colorPrimary: attribute(attribute: "color-primary")\n      uchColorPrimary: attribute(attribute: "uch-color-primary")\n      newsUrl: attribute(attribute: "news-url")\n    }\n  }\n':
    types.TenantSettingsDocument,
  '\n  mutation UpdateTenantSettings(\n    $tenant: String!\n    $tenantDisplayName: String\n    $legalNoticeUrl: String!\n    $privacyUrl: String!\n    $contactUrl: String!\n    $tenantLogoUrl: String\n    $tenantImageUrl: String\n    $citizenHubImageUrl: String\n    $tenantCoords: String\n    $colorPrimary: String\n    $uchColorPrimary: String\n    $newsUrl: String\n  ) {\n    tenant(tenant: $tenant) {\n      patchAttributes(\n        attributes: [\n          { key: "tenant-name", value: $tenantDisplayName }\n          { key: "legal-notice-url", value: $legalNoticeUrl }\n          { key: "privacy-url", value: $privacyUrl }\n          { key: "contact-url", value: $contactUrl }\n          { key: "tenant-logo", value: $tenantLogoUrl }\n          { key: "tenant-image", value: $tenantImageUrl }\n          { key: "citizen-hub-image", value: $citizenHubImageUrl }\n          { key: "tenant-coords", value: $tenantCoords }\n          { key: "color-primary", value: $colorPrimary }\n          { key: "uch-color-primary", value: $uchColorPrimary }\n          { key: "news-url", value: $newsUrl }\n        ]\n      ) {\n        key\n        value\n      }\n    }\n  }\n':
    types.UpdateTenantSettingsDocument,
  '\n  query AllCredentials($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorCredentials {\n        sensorCredential\n        username\n      }\n    }\n  }\n':
    types.AllCredentialsDocument,
  '\n  mutation CreateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n':
    types.CreateCredentialDocument,
  '\n  mutation RotateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        rotateSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n':
    types.RotateCredentialDocument,
  '\n  mutation DeleteSensorCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorCredential(sensorCredential: $sensorCredential)\n      }\n    }\n  }\n':
    types.DeleteSensorCredentialDocument,
  '\n  query AllDatasets($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      datasets {\n        dataset\n        config {\n          path\n          format\n        }\n      }\n    }\n  }\n':
    types.AllDatasetsDocument,
  '\n  mutation CreateDataset(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $format: ClickHouseFormat!\n    $path: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createDataset(\n          dataset: $name\n          config: { format: $format, path: $path }\n        ) {\n          dataset\n          config {\n            path\n            format\n          }\n        }\n      }\n    }\n  }\n':
    types.CreateDatasetDocument,
  '\n  mutation DeleteDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteDataset(dataset: $dataset)\n      }\n    }\n  }\n':
    types.DeleteDatasetDocument,
  '\n  mutation RefreshDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        refreshDataset(dataset: $dataset) {\n          dataset\n          config {\n            format\n            path\n          }\n        }\n      }\n    }\n  }\n':
    types.RefreshDatasetDocument,
  '\n  query AllDedicatedApps($tenant: String!) {\n    all: dedicatedAppsInfo {\n      dedicatedApp\n      info {\n        categories\n        description\n        name\n        pictureUri\n        indexPath\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      dedicatedApps {\n        dedicatedApp\n        url\n      }\n    }\n  }\n':
    types.AllDedicatedAppsDocument,
  '\n  mutation InstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createDedicatedApp(dedicatedApp: $name) {\n        dedicatedApp\n        tenant\n        url\n      }\n    }\n  }\n':
    types.InstallDedicatedAppDocument,
  '\n  mutation UnInstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteDedicatedApp(dedicatedApp: $name)\n    }\n  }\n':
    types.UnInstallDedicatedAppDocument,
  '\n  query GetDedicatedAppContainerInfos(\n    $tenant: String!\n    $name: String!\n    $lines: Int!\n  ) {\n    dedicatedApp(tenant: $tenant, dedicatedApp: $name) {\n      dedicatedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n':
    types.GetDedicatedAppContainerInfosDocument,
  '\n  query AllProjects {\n    tenants {\n      projects {\n        tenant\n        project\n      }\n    }\n  }\n':
    types.AllProjectsDocument,
  '\n  query GetGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n':
    types.GetGroupsPermissionsDocument,
  '\n  query GetVizGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        vizGroupPrincipals {\n          tenant\n          vizGroup\n        }\n        scopes\n      }\n    }\n  }\n':
    types.GetVizGroupsPermissionsDocument,
  '\n  mutation CreateProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      createProject(project: $project) {\n        project\n        tenant\n      }\n    }\n  }\n':
    types.CreateProjectDocument,
  '\n  mutation DeleteProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      deleteProject(project: $project)\n    }\n  }\n':
    types.DeleteProjectDocument,
  '\n  mutation ProjectPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["project:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["project:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n':
    types.ProjectPermissionDocument,
  '\n  mutation ProjectVizPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [VizGroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        vizGroupRead: createPermission(\n          permission: {\n            name: "viz-group-read"\n            scopes: ["project:read"]\n            vizGroupPrincipals: $readGroups\n          }\n        )\n      }\n    }\n  }\n':
    types.ProjectVizPermissionDocument,
  '\n  query GetSharedApp($tenant: String!, $name: String!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      url\n      config {\n        displayName\n        adminContact\n        description\n        pictureUri\n        categories\n        imageDigest\n        imageRegistry\n        imageRepository\n        registryUsername\n      }\n    }\n  }\n':
    types.GetSharedAppDocument,
  '\n  query GetSharedApps($tenant: String!) {\n    tenant(tenant: $tenant) {\n      sharedApps {\n        sharedApp\n        config {\n          displayName\n          description\n          pictureUri\n          categories\n          adminContact\n        }\n        containerStatus {\n          ready\n          running\n          waiting\n        }\n        url\n      }\n    }\n  }\n':
    types.GetSharedAppsDocument,
  '\n  query PublicSharedApps {\n    publicSharedApps {\n      sharedApp\n      displayName\n      description\n      pictureUri\n      categories\n      tenant\n      tenantDisplayName\n      adminContact\n      url\n    }\n  }\n':
    types.PublicSharedAppsDocument,
  '\n  query GetContainerInfos($tenant: String!, $name: String!, $lines: Int!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n':
    types.GetContainerInfosDocument,
  '\n  mutation CreateSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: SharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      createSharedApp(sharedApp: $name, config: $config) {\n        sharedApp\n        config {\n          displayName\n          adminContact\n          pictureUri\n          categories\n          description\n          imageDigest\n          imageRegistry\n          imageRepository\n          registryUsername\n        }\n      }\n    }\n  }\n':
    types.CreateSharedAppDocument,
  '\n  mutation EditSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: UpdateSharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      sharedApp(sharedApp: $name) {\n        update(config: $config) {\n          sharedApp\n          config {\n            displayName\n            adminContact\n            pictureUri\n            categories\n            description\n            imageDigest\n            imageRegistry\n            imageRepository\n            registryUsername\n          }\n        }\n      }\n    }\n  }\n':
    types.EditSharedAppDocument,
  '\n  mutation DeleteSharedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteSharedApp(sharedApp: $name)\n    }\n  }\n':
    types.DeleteSharedAppDocument,
  '\n  query AllCityTools($tenant: String!) {\n    allExisting: citytoolsInfo {\n      citytool\n      info {\n        name\n        pictureUri\n        description\n        categories\n        showInCitizenhub\n        showInGovhub\n        indexPath\n      }\n      installs {\n        averageStars\n        count\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      citytools {\n        citytool\n        path\n      }\n    }\n  }\n':
    types.AllCityToolsDocument,
  '\n  mutation InstallCityTool($tenant: String!, $name: String!, $path: String!) {\n    tenant(tenant: $tenant) {\n      createCitytool(citytool: $name, path: $path) {\n        citytool\n        path\n      }\n    }\n  }\n':
    types.InstallCityToolDocument,
  '\n  mutation UnInstallCityTool($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteCitytool(citytool: $name)\n    }\n  }\n':
    types.UnInstallCityToolDocument,
  '\n  query AllSubscriptions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorSubscriptions {\n        sensorSubscription\n        config {\n          uri\n          format\n          topic\n          username\n        }\n        connection {\n          error\n          lastMessageTimestamp\n          state\n        }\n      }\n    }\n  }\n':
    types.AllSubscriptionsDocument,
  '\n  query SingleSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    sensorSubscription(\n      tenant: $tenant\n      project: $project\n      sensorSubscription: $name\n    ) {\n      config {\n        uri\n        format\n        topic\n        username\n      }\n    }\n  }\n':
    types.SingleSubscriptionDocument,
  '\n  mutation CreateSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorSubscription(sensorSubscription: $name, config: $config) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n':
    types.CreateSubscriptionDocument,
  '\n  mutation DeleteSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $name)\n      }\n    }\n  }\n':
    types.DeleteSubscriptionDocument,
  '\n  mutation UpdateSubscription(\n    $tenant: String!\n    $project: String!\n    $oldName: String!\n    $newName: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $oldName)\n        createSensorSubscription(\n          sensorSubscription: $newName\n          config: $config\n        ) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n':
    types.UpdateSubscriptionDocument,
  '\n  query GetTenantName($tenant: String!, $attribute: String!) {\n    tenant(tenant: $tenant) {\n      attribute(attribute: $attribute)\n    }\n  }\n':
    types.GetTenantNameDocument,
  '\n  query GetAllTenantAndProjectScopes {\n    tenants {\n      tenant\n      scopes {\n        all\n        granted\n      }\n      projects {\n        project\n        scopes {\n          all\n          granted\n        }\n      }\n      groups {\n        group\n        scopes {\n          all\n          granted\n        }\n      }\n      vizGroups {\n        vizGroup\n        scopes {\n          all\n          granted\n        }\n      }\n    }\n  }\n':
    types.GetAllTenantAndProjectScopesDocument,
  '\n  query GetTenantScopes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n':
    types.GetTenantScopesDocument,
  '\n  query TenantMemberships {\n    keycloakGroupMemberships {\n      tenant\n    }\n  }\n':
    types.TenantMembershipsDocument,
  '\n  query AllUserGroups {\n    tenants {\n      tenant\n      groups {\n        group\n        keycloakGroupPath\n        isMember\n        scopes {\n          granted\n        }\n        permissions {\n          name\n          scopes\n          allowAllAuthenticatedUsers\n        }\n      }\n    }\n  }\n':
    types.AllUserGroupsDocument,
  '\n  query UserGroupPermissions($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n':
    types.UserGroupPermissionsDocument,
  '\n  query UserGroupScopes($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n':
    types.UserGroupScopesDocument,
  '\n  mutation CreateUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      createGroup(group: $group) {\n        group\n      }\n    }\n  }\n':
    types.CreateUserGroupDocument,
  '\n  mutation DeleteUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      deleteGroup(group: $group)\n    }\n  }\n':
    types.DeleteUserGroupDocument,
  '\n  mutation EnableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        shared: createPermission(\n          permission: {\n            name: "shared"\n            scopes: ["group:view"]\n            allowAllAuthenticatedUsers: true\n          }\n        )\n      }\n    }\n  }\n':
    types.EnableUserGroupSharedDocument,
  '\n  mutation DisableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        deletePermission(permission: "shared")\n      }\n    }\n  }\n':
    types.DisableUserGroupSharedDocument,
  '\n  mutation UserGroupPermission(\n    $tenant: String!\n    $group: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["group:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["group:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n':
    types.UserGroupPermissionDocument,
  '\n  query AllVizGroups {\n    tenants {\n      tenant\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n':
    types.AllVizGroupsDocument,
  '\n  query VizGroupsByTenant($tenant: String!) {\n    tenant(tenant: $tenant) {\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n':
    types.VizGroupsByTenantDocument,
  '\n  mutation createVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createVizGroup(vizGroup: $name) {\n        tenant\n        vizGroup\n      }\n    }\n  }\n':
    types.CreateVizGroupDocument,
  '\n  mutation deleteVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteVizGroup(vizGroup: $name)\n    }\n  }\n':
    types.DeleteVizGroupDocument,
  '\n  query VizGroupDashboards($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      tenant\n      vizGroup\n      dashboards {\n        slug\n        dashboard\n      }\n    }\n  }\n':
    types.VizGroupDashboardsDocument,
  '\n  query VizGroupGroupPermissions($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n':
    types.VizGroupGroupPermissionsDocument,
  '\n  mutation VizGroupPermission(\n    $tenant: String!\n    $vizGroup: String!\n    $readUserGroups: [GroupInput!]!\n    $adminUserGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["viz-group:read"]\n            groupPrincipals: $readUserGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["viz-group:admin"]\n            groupPrincipals: $adminUserGroups\n          }\n        )\n      }\n    }\n  }\n':
    types.VizGroupPermissionDocument,
  '\n  query PublishedQueries($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      publishedQueries {\n        publishedQuery\n        config {\n          sql\n        }\n      }\n    }\n  }\n':
    types.PublishedQueriesDocument,
  '\n  mutation DeletePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        deletePublishedQuery(publishedQuery: $name)\n      }\n    }\n  }\n':
    types.DeletePublishedQueryDocument,
  '\n  mutation CreatePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n    $sql: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        createPublishedQuery(publishedQuery: $name, config: { sql: $sql }) {\n          publishedQuery\n          config {\n            sql\n          }\n        }\n      }\n    }\n  }\n':
    types.CreatePublishedQueryDocument,
  '\n  query GetPublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    publishedQuery(\n      tenant: $tenant\n      vizGroup: $vizGroup\n      publishedQuery: $name\n    ) {\n      publishedQuery\n      config {\n        sql\n      }\n    }\n  }\n':
    types.GetPublishedQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutateHelpdeskTicket($title: String!, $description: String!) {\n    helpdesk(title: $title, description: $description)\n  }\n',
): (typeof documents)['\n  mutation MutateHelpdeskTicket($title: String!, $description: String!) {\n    helpdesk(title: $title, description: $description)\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ThemeAttributes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      colorPrimary: attribute(attribute: "color-primary")\n    }\n  }\n',
): (typeof documents)['\n  query ThemeAttributes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      colorPrimary: attribute(attribute: "color-primary")\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TenantSettings($tenant: String!) {\n    tenant(tenant: $tenant) {\n      tenantDisplayName: attribute(attribute: "tenant-name")\n      legalNoticeUrl: attribute(attribute: "legal-notice-url")\n      privacyUrl: attribute(attribute: "privacy-url")\n      contactUrl: attribute(attribute: "contact-url")\n      tenantLogoUrl: attribute(attribute: "tenant-logo")\n      tenantImageUrl: attribute(attribute: "tenant-image")\n      citizenHubImageUrl: attribute(attribute: "citizen-hub-image")\n      tenantCoords: attribute(attribute: "tenant-coords")\n      colorPrimary: attribute(attribute: "color-primary")\n      uchColorPrimary: attribute(attribute: "uch-color-primary")\n      newsUrl: attribute(attribute: "news-url")\n    }\n  }\n',
): (typeof documents)['\n  query TenantSettings($tenant: String!) {\n    tenant(tenant: $tenant) {\n      tenantDisplayName: attribute(attribute: "tenant-name")\n      legalNoticeUrl: attribute(attribute: "legal-notice-url")\n      privacyUrl: attribute(attribute: "privacy-url")\n      contactUrl: attribute(attribute: "contact-url")\n      tenantLogoUrl: attribute(attribute: "tenant-logo")\n      tenantImageUrl: attribute(attribute: "tenant-image")\n      citizenHubImageUrl: attribute(attribute: "citizen-hub-image")\n      tenantCoords: attribute(attribute: "tenant-coords")\n      colorPrimary: attribute(attribute: "color-primary")\n      uchColorPrimary: attribute(attribute: "uch-color-primary")\n      newsUrl: attribute(attribute: "news-url")\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateTenantSettings(\n    $tenant: String!\n    $tenantDisplayName: String\n    $legalNoticeUrl: String!\n    $privacyUrl: String!\n    $contactUrl: String!\n    $tenantLogoUrl: String\n    $tenantImageUrl: String\n    $citizenHubImageUrl: String\n    $tenantCoords: String\n    $colorPrimary: String\n    $uchColorPrimary: String\n    $newsUrl: String\n  ) {\n    tenant(tenant: $tenant) {\n      patchAttributes(\n        attributes: [\n          { key: "tenant-name", value: $tenantDisplayName }\n          { key: "legal-notice-url", value: $legalNoticeUrl }\n          { key: "privacy-url", value: $privacyUrl }\n          { key: "contact-url", value: $contactUrl }\n          { key: "tenant-logo", value: $tenantLogoUrl }\n          { key: "tenant-image", value: $tenantImageUrl }\n          { key: "citizen-hub-image", value: $citizenHubImageUrl }\n          { key: "tenant-coords", value: $tenantCoords }\n          { key: "color-primary", value: $colorPrimary }\n          { key: "uch-color-primary", value: $uchColorPrimary }\n          { key: "news-url", value: $newsUrl }\n        ]\n      ) {\n        key\n        value\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateTenantSettings(\n    $tenant: String!\n    $tenantDisplayName: String\n    $legalNoticeUrl: String!\n    $privacyUrl: String!\n    $contactUrl: String!\n    $tenantLogoUrl: String\n    $tenantImageUrl: String\n    $citizenHubImageUrl: String\n    $tenantCoords: String\n    $colorPrimary: String\n    $uchColorPrimary: String\n    $newsUrl: String\n  ) {\n    tenant(tenant: $tenant) {\n      patchAttributes(\n        attributes: [\n          { key: "tenant-name", value: $tenantDisplayName }\n          { key: "legal-notice-url", value: $legalNoticeUrl }\n          { key: "privacy-url", value: $privacyUrl }\n          { key: "contact-url", value: $contactUrl }\n          { key: "tenant-logo", value: $tenantLogoUrl }\n          { key: "tenant-image", value: $tenantImageUrl }\n          { key: "citizen-hub-image", value: $citizenHubImageUrl }\n          { key: "tenant-coords", value: $tenantCoords }\n          { key: "color-primary", value: $colorPrimary }\n          { key: "uch-color-primary", value: $uchColorPrimary }\n          { key: "news-url", value: $newsUrl }\n        ]\n      ) {\n        key\n        value\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllCredentials($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorCredentials {\n        sensorCredential\n        username\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllCredentials($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorCredentials {\n        sensorCredential\n        username\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RotateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        rotateSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation RotateCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        rotateSensorCredential(sensorCredential: $sensorCredential) {\n          username\n          password\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteSensorCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorCredential(sensorCredential: $sensorCredential)\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteSensorCredential(\n    $tenant: String!\n    $project: String!\n    $sensorCredential: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorCredential(sensorCredential: $sensorCredential)\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllDatasets($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      datasets {\n        dataset\n        config {\n          path\n          format\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllDatasets($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      datasets {\n        dataset\n        config {\n          path\n          format\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateDataset(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $format: ClickHouseFormat!\n    $path: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createDataset(\n          dataset: $name\n          config: { format: $format, path: $path }\n        ) {\n          dataset\n          config {\n            path\n            format\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateDataset(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $format: ClickHouseFormat!\n    $path: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createDataset(\n          dataset: $name\n          config: { format: $format, path: $path }\n        ) {\n          dataset\n          config {\n            path\n            format\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteDataset(dataset: $dataset)\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteDataset(dataset: $dataset)\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RefreshDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        refreshDataset(dataset: $dataset) {\n          dataset\n          config {\n            format\n            path\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation RefreshDataset(\n    $tenant: String!\n    $project: String!\n    $dataset: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        refreshDataset(dataset: $dataset) {\n          dataset\n          config {\n            format\n            path\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllDedicatedApps($tenant: String!) {\n    all: dedicatedAppsInfo {\n      dedicatedApp\n      info {\n        categories\n        description\n        name\n        pictureUri\n        indexPath\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      dedicatedApps {\n        dedicatedApp\n        url\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllDedicatedApps($tenant: String!) {\n    all: dedicatedAppsInfo {\n      dedicatedApp\n      info {\n        categories\n        description\n        name\n        pictureUri\n        indexPath\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      dedicatedApps {\n        dedicatedApp\n        url\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createDedicatedApp(dedicatedApp: $name) {\n        dedicatedApp\n        tenant\n        url\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation InstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createDedicatedApp(dedicatedApp: $name) {\n        dedicatedApp\n        tenant\n        url\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UnInstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteDedicatedApp(dedicatedApp: $name)\n    }\n  }\n',
): (typeof documents)['\n  mutation UnInstallDedicatedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteDedicatedApp(dedicatedApp: $name)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetDedicatedAppContainerInfos(\n    $tenant: String!\n    $name: String!\n    $lines: Int!\n  ) {\n    dedicatedApp(tenant: $tenant, dedicatedApp: $name) {\n      dedicatedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetDedicatedAppContainerInfos(\n    $tenant: String!\n    $name: String!\n    $lines: Int!\n  ) {\n    dedicatedApp(tenant: $tenant, dedicatedApp: $name) {\n      dedicatedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllProjects {\n    tenants {\n      projects {\n        tenant\n        project\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllProjects {\n    tenants {\n      projects {\n        tenant\n        project\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetVizGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        vizGroupPrincipals {\n          tenant\n          vizGroup\n        }\n        scopes\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetVizGroupsPermissions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      permissions {\n        name\n        vizGroupPrincipals {\n          tenant\n          vizGroup\n        }\n        scopes\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      createProject(project: $project) {\n        project\n        tenant\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      createProject(project: $project) {\n        project\n        tenant\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      deleteProject(project: $project)\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteProject($tenant: String!, $project: String!) {\n    tenant(tenant: $tenant) {\n      deleteProject(project: $project)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ProjectPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["project:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["project:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation ProjectPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["project:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["project:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ProjectVizPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [VizGroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        vizGroupRead: createPermission(\n          permission: {\n            name: "viz-group-read"\n            scopes: ["project:read"]\n            vizGroupPrincipals: $readGroups\n          }\n        )\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation ProjectVizPermission(\n    $tenant: String!\n    $project: String!\n    $readGroups: [VizGroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        vizGroupRead: createPermission(\n          permission: {\n            name: "viz-group-read"\n            scopes: ["project:read"]\n            vizGroupPrincipals: $readGroups\n          }\n        )\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetSharedApp($tenant: String!, $name: String!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      url\n      config {\n        displayName\n        adminContact\n        description\n        pictureUri\n        categories\n        imageDigest\n        imageRegistry\n        imageRepository\n        registryUsername\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetSharedApp($tenant: String!, $name: String!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      url\n      config {\n        displayName\n        adminContact\n        description\n        pictureUri\n        categories\n        imageDigest\n        imageRegistry\n        imageRepository\n        registryUsername\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetSharedApps($tenant: String!) {\n    tenant(tenant: $tenant) {\n      sharedApps {\n        sharedApp\n        config {\n          displayName\n          description\n          pictureUri\n          categories\n          adminContact\n        }\n        containerStatus {\n          ready\n          running\n          waiting\n        }\n        url\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetSharedApps($tenant: String!) {\n    tenant(tenant: $tenant) {\n      sharedApps {\n        sharedApp\n        config {\n          displayName\n          description\n          pictureUri\n          categories\n          adminContact\n        }\n        containerStatus {\n          ready\n          running\n          waiting\n        }\n        url\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PublicSharedApps {\n    publicSharedApps {\n      sharedApp\n      displayName\n      description\n      pictureUri\n      categories\n      tenant\n      tenantDisplayName\n      adminContact\n      url\n    }\n  }\n',
): (typeof documents)['\n  query PublicSharedApps {\n    publicSharedApps {\n      sharedApp\n      displayName\n      description\n      pictureUri\n      categories\n      tenant\n      tenantDisplayName\n      adminContact\n      url\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetContainerInfos($tenant: String!, $name: String!, $lines: Int!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetContainerInfos($tenant: String!, $name: String!, $lines: Int!) {\n    sharedApp(tenant: $tenant, sharedApp: $name) {\n      sharedApp\n      containerLogs(lines: $lines)\n      containerStatus {\n        ready\n        running\n        waitingMessage\n        waitingReason\n        waiting\n        restartCount\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: SharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      createSharedApp(sharedApp: $name, config: $config) {\n        sharedApp\n        config {\n          displayName\n          adminContact\n          pictureUri\n          categories\n          description\n          imageDigest\n          imageRegistry\n          imageRepository\n          registryUsername\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: SharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      createSharedApp(sharedApp: $name, config: $config) {\n        sharedApp\n        config {\n          displayName\n          adminContact\n          pictureUri\n          categories\n          description\n          imageDigest\n          imageRegistry\n          imageRepository\n          registryUsername\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation EditSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: UpdateSharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      sharedApp(sharedApp: $name) {\n        update(config: $config) {\n          sharedApp\n          config {\n            displayName\n            adminContact\n            pictureUri\n            categories\n            description\n            imageDigest\n            imageRegistry\n            imageRepository\n            registryUsername\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation EditSharedApp(\n    $tenant: String!\n    $name: String!\n    $config: UpdateSharedAppConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      sharedApp(sharedApp: $name) {\n        update(config: $config) {\n          sharedApp\n          config {\n            displayName\n            adminContact\n            pictureUri\n            categories\n            description\n            imageDigest\n            imageRegistry\n            imageRepository\n            registryUsername\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteSharedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteSharedApp(sharedApp: $name)\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteSharedApp($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteSharedApp(sharedApp: $name)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllCityTools($tenant: String!) {\n    allExisting: citytoolsInfo {\n      citytool\n      info {\n        name\n        pictureUri\n        description\n        categories\n        showInCitizenhub\n        showInGovhub\n        indexPath\n      }\n      installs {\n        averageStars\n        count\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      citytools {\n        citytool\n        path\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllCityTools($tenant: String!) {\n    allExisting: citytoolsInfo {\n      citytool\n      info {\n        name\n        pictureUri\n        description\n        categories\n        showInCitizenhub\n        showInGovhub\n        indexPath\n      }\n      installs {\n        averageStars\n        count\n      }\n      requestCityToolLink(tenant: $tenant)\n    }\n    installed: tenant(tenant: $tenant) {\n      tenant\n      citytools {\n        citytool\n        path\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InstallCityTool($tenant: String!, $name: String!, $path: String!) {\n    tenant(tenant: $tenant) {\n      createCitytool(citytool: $name, path: $path) {\n        citytool\n        path\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation InstallCityTool($tenant: String!, $name: String!, $path: String!) {\n    tenant(tenant: $tenant) {\n      createCitytool(citytool: $name, path: $path) {\n        citytool\n        path\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UnInstallCityTool($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteCitytool(citytool: $name)\n    }\n  }\n',
): (typeof documents)['\n  mutation UnInstallCityTool($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteCitytool(citytool: $name)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllSubscriptions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorSubscriptions {\n        sensorSubscription\n        config {\n          uri\n          format\n          topic\n          username\n        }\n        connection {\n          error\n          lastMessageTimestamp\n          state\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllSubscriptions($tenant: String!, $project: String!) {\n    project(tenant: $tenant, project: $project) {\n      sensorSubscriptions {\n        sensorSubscription\n        config {\n          uri\n          format\n          topic\n          username\n        }\n        connection {\n          error\n          lastMessageTimestamp\n          state\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query SingleSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    sensorSubscription(\n      tenant: $tenant\n      project: $project\n      sensorSubscription: $name\n    ) {\n      config {\n        uri\n        format\n        topic\n        username\n      }\n    }\n  }\n',
): (typeof documents)['\n  query SingleSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    sensorSubscription(\n      tenant: $tenant\n      project: $project\n      sensorSubscription: $name\n    ) {\n      config {\n        uri\n        format\n        topic\n        username\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorSubscription(sensorSubscription: $name, config: $config) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        createSensorSubscription(sensorSubscription: $name, config: $config) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $name)\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteSubscription(\n    $tenant: String!\n    $project: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $name)\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateSubscription(\n    $tenant: String!\n    $project: String!\n    $oldName: String!\n    $newName: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $oldName)\n        createSensorSubscription(\n          sensorSubscription: $newName\n          config: $config\n        ) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateSubscription(\n    $tenant: String!\n    $project: String!\n    $oldName: String!\n    $newName: String!\n    $config: SubscriptionConfigInput!\n  ) {\n    tenant(tenant: $tenant) {\n      project(project: $project) {\n        deleteSensorSubscription(sensorSubscription: $oldName)\n        createSensorSubscription(\n          sensorSubscription: $newName\n          config: $config\n        ) {\n          sensorSubscription\n          config {\n            format\n            topic\n            uri\n            username\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetTenantName($tenant: String!, $attribute: String!) {\n    tenant(tenant: $tenant) {\n      attribute(attribute: $attribute)\n    }\n  }\n',
): (typeof documents)['\n  query GetTenantName($tenant: String!, $attribute: String!) {\n    tenant(tenant: $tenant) {\n      attribute(attribute: $attribute)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllTenantAndProjectScopes {\n    tenants {\n      tenant\n      scopes {\n        all\n        granted\n      }\n      projects {\n        project\n        scopes {\n          all\n          granted\n        }\n      }\n      groups {\n        group\n        scopes {\n          all\n          granted\n        }\n      }\n      vizGroups {\n        vizGroup\n        scopes {\n          all\n          granted\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetAllTenantAndProjectScopes {\n    tenants {\n      tenant\n      scopes {\n        all\n        granted\n      }\n      projects {\n        project\n        scopes {\n          all\n          granted\n        }\n      }\n      groups {\n        group\n        scopes {\n          all\n          granted\n        }\n      }\n      vizGroups {\n        vizGroup\n        scopes {\n          all\n          granted\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetTenantScopes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetTenantScopes($tenant: String!) {\n    tenant(tenant: $tenant) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TenantMemberships {\n    keycloakGroupMemberships {\n      tenant\n    }\n  }\n',
): (typeof documents)['\n  query TenantMemberships {\n    keycloakGroupMemberships {\n      tenant\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllUserGroups {\n    tenants {\n      tenant\n      groups {\n        group\n        keycloakGroupPath\n        isMember\n        scopes {\n          granted\n        }\n        permissions {\n          name\n          scopes\n          allowAllAuthenticatedUsers\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllUserGroups {\n    tenants {\n      tenant\n      groups {\n        group\n        keycloakGroupPath\n        isMember\n        scopes {\n          granted\n        }\n        permissions {\n          name\n          scopes\n          allowAllAuthenticatedUsers\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query UserGroupPermissions($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n',
): (typeof documents)['\n  query UserGroupPermissions($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query UserGroupScopes($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n',
): (typeof documents)['\n  query UserGroupScopes($tenant: String!, $group: String!) {\n    group(tenant: $tenant, group: $group) {\n      scopes {\n        all\n        granted\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      createGroup(group: $group) {\n        group\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      createGroup(group: $group) {\n        group\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeleteUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      deleteGroup(group: $group)\n    }\n  }\n',
): (typeof documents)['\n  mutation DeleteUserGroup($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      deleteGroup(group: $group)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation EnableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        shared: createPermission(\n          permission: {\n            name: "shared"\n            scopes: ["group:view"]\n            allowAllAuthenticatedUsers: true\n          }\n        )\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation EnableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        shared: createPermission(\n          permission: {\n            name: "shared"\n            scopes: ["group:view"]\n            allowAllAuthenticatedUsers: true\n          }\n        )\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DisableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        deletePermission(permission: "shared")\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation DisableUserGroupShared($tenant: String!, $group: String!) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        deletePermission(permission: "shared")\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UserGroupPermission(\n    $tenant: String!\n    $group: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["group:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["group:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UserGroupPermission(\n    $tenant: String!\n    $group: String!\n    $readGroups: [GroupInput!]!\n    $adminGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      group(group: $group) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["group:read"]\n            groupPrincipals: $readGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["group:admin"]\n            groupPrincipals: $adminGroups\n          }\n        )\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query AllVizGroups {\n    tenants {\n      tenant\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n',
): (typeof documents)['\n  query AllVizGroups {\n    tenants {\n      tenant\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query VizGroupsByTenant($tenant: String!) {\n    tenant(tenant: $tenant) {\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n',
): (typeof documents)['\n  query VizGroupsByTenant($tenant: String!) {\n    tenant(tenant: $tenant) {\n      vizGroups {\n        vizGroup\n        tenant\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createVizGroup(vizGroup: $name) {\n        tenant\n        vizGroup\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation createVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      createVizGroup(vizGroup: $name) {\n        tenant\n        vizGroup\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation deleteVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteVizGroup(vizGroup: $name)\n    }\n  }\n',
): (typeof documents)['\n  mutation deleteVizGroup($tenant: String!, $name: String!) {\n    tenant(tenant: $tenant) {\n      deleteVizGroup(vizGroup: $name)\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query VizGroupDashboards($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      tenant\n      vizGroup\n      dashboards {\n        slug\n        dashboard\n      }\n    }\n  }\n',
): (typeof documents)['\n  query VizGroupDashboards($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      tenant\n      vizGroup\n      dashboards {\n        slug\n        dashboard\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query VizGroupGroupPermissions($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n',
): (typeof documents)['\n  query VizGroupGroupPermissions($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      permissions {\n        name\n        groupPrincipals {\n          tenant\n          group\n        }\n        scopes\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation VizGroupPermission(\n    $tenant: String!\n    $vizGroup: String!\n    $readUserGroups: [GroupInput!]!\n    $adminUserGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["viz-group:read"]\n            groupPrincipals: $readUserGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["viz-group:admin"]\n            groupPrincipals: $adminUserGroups\n          }\n        )\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation VizGroupPermission(\n    $tenant: String!\n    $vizGroup: String!\n    $readUserGroups: [GroupInput!]!\n    $adminUserGroups: [GroupInput!]!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        read: createPermission(\n          permission: {\n            name: "read"\n            scopes: ["viz-group:read"]\n            groupPrincipals: $readUserGroups\n          }\n        )\n        admin: createPermission(\n          permission: {\n            name: "admin"\n            scopes: ["viz-group:admin"]\n            groupPrincipals: $adminUserGroups\n          }\n        )\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PublishedQueries($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      publishedQueries {\n        publishedQuery\n        config {\n          sql\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  query PublishedQueries($tenant: String!, $vizGroup: String!) {\n    vizGroup(tenant: $tenant, vizGroup: $vizGroup) {\n      publishedQueries {\n        publishedQuery\n        config {\n          sql\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeletePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        deletePublishedQuery(publishedQuery: $name)\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation DeletePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        deletePublishedQuery(publishedQuery: $name)\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreatePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n    $sql: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        createPublishedQuery(publishedQuery: $name, config: { sql: $sql }) {\n          publishedQuery\n          config {\n            sql\n          }\n        }\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation CreatePublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n    $sql: String!\n  ) {\n    tenant(tenant: $tenant) {\n      vizGroup(vizGroup: $vizGroup) {\n        createPublishedQuery(publishedQuery: $name, config: { sql: $sql }) {\n          publishedQuery\n          config {\n            sql\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetPublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    publishedQuery(\n      tenant: $tenant\n      vizGroup: $vizGroup\n      publishedQuery: $name\n    ) {\n      publishedQuery\n      config {\n        sql\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetPublishedQuery(\n    $tenant: String!\n    $vizGroup: String!\n    $name: String!\n  ) {\n    publishedQuery(\n      tenant: $tenant\n      vizGroup: $vizGroup\n      publishedQuery: $name\n    ) {\n      publishedQuery\n      config {\n        sql\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
