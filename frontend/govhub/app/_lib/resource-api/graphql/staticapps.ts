import { graphql } from '@/app/__generated__';
import { AllCityToolsQuery } from '@/app/__generated__/types';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import { mutate, query } from '@/app/_lib/resource-api/client';
import { requireTenant } from '@/app/_lib/resource-api/legacy';

/* c8 ignore start */
const ALL_AND_INSTALLED_STATICAPP = graphql(`
  query AllCityTools($tenant: String!) {
    allExisting: citytoolsInfo {
      citytool
      info {
        name
        pictureUri
        description
        categories
        showInCitizenhub
        showInGovhub
        indexPath
      }
      installs {
        averageStars
        count
      }
      requestCityToolLink(tenant: $tenant)
    }
    installed: tenant(tenant: $tenant) {
      tenant
      citytools {
        citytool
        path
      }
    }
  }
`);

const INSTALL_STATICAPP = graphql(`
  mutation InstallCityTool($tenant: String!, $name: String!, $path: String!) {
    tenant(tenant: $tenant) {
      createCitytool(citytool: $name, path: $path) {
        citytool
        path
      }
    }
  }
`);

const UNINSTALL_STATICAPP = graphql(`
  mutation UnInstallCityTool($tenant: String!, $name: String!) {
    tenant(tenant: $tenant) {
      deleteCitytool(citytool: $name)
    }
  }
`);
/* c8 ignore end */

export type AllAndInstalledStaticApps = ApolloClient.QueryResult<
  MaybeMasked<AllCityToolsQuery>
>;

export const queryStaticApps: () => Promise<AllAndInstalledStaticApps> =
  async () => {
    const tenant = await requireTenant();
    return query({
      query: ALL_AND_INSTALLED_STATICAPP,
      variables: { tenant },
    });
  };

export type InstallStaticApp = Awaited<
  ReturnType<typeof mutateInstallStaticApp>
>;

export const mutateInstallStaticApp = async (name: string) => {
  const tenant = await requireTenant();
  return mutate({
    mutation: INSTALL_STATICAPP,
    variables: {
      tenant,
      name,
      // The assumption is that `path` is equal to `name` unless a more fine-grained distinction becomes necessary.
      path: name,
    },
  });
};

export type UnInstallStaticApp = Awaited<
  ReturnType<typeof mutateUninstallStaticApp>
>;

export const mutateUninstallStaticApp = async (name: string) => {
  const tenant = await requireTenant();
  return mutate({
    mutation: UNINSTALL_STATICAPP,
    variables: {
      tenant,
      name,
    },
  });
};

export type StaticAppInstallation = InstallStaticApp | UnInstallStaticApp;

export const internal = {
  ALL_AND_INSTALLED_STATICAPP,
  INSTALL_STATICAPP,
  UNINSTALL_STATICAPP,
};
