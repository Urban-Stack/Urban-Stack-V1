import { graphql } from '@/app/__generated__';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import {
  GetAllTenantAndProjectScopesQuery,
  GetTenantNameQuery,
  GetTenantScopesQuery,
} from '@/app/__generated__/types';
import { query } from '@/app/_lib/resource-api/client';

export const fetchTenantDisplayName: (
  tenant: string,
) => Promise<string | undefined> = async (tenant) => {
  const result = await fetchAttribute(tenant, 'tenant-name');
  return result.data?.tenant?.attribute ?? undefined;
};

const SINGLE_ATTRIBUTE = graphql(`
  query GetTenantName($tenant: String!, $attribute: String!) {
    tenant(tenant: $tenant) {
      attribute(attribute: $attribute)
    }
  }
`);

export type SingleAttribute = ApolloClient.QueryResult<
  MaybeMasked<GetTenantNameQuery>
>;

const fetchAttribute: (
  tenant: string,
  attribute: string,
) => Promise<SingleAttribute> = async (tenant, attribute) =>
  query({
    query: SINGLE_ATTRIBUTE,
    variables: {
      tenant,
      attribute,
    },
  });

const ALL_TENANT_AND_PROJECT_SCOPES = graphql(`
  query GetAllTenantAndProjectScopes {
    tenants {
      tenant
      scopes {
        all
        granted
      }
      projects {
        project
        scopes {
          all
          granted
        }
      }
      groups {
        group
        scopes {
          all
          granted
        }
      }
      vizGroups {
        vizGroup
        scopes {
          all
          granted
        }
      }
    }
  }
`);

const TENANT_SCOPES = graphql(`
  query GetTenantScopes($tenant: String!) {
    tenant(tenant: $tenant) {
      scopes {
        all
        granted
      }
    }
  }
`);

export type AllTenantAndProjectScopes = ApolloClient.QueryResult<
  MaybeMasked<GetAllTenantAndProjectScopesQuery>
>;

export const GetAllTenantAndProjectScopes: () => Promise<AllTenantAndProjectScopes> =
  async () =>
    query({
      query: ALL_TENANT_AND_PROJECT_SCOPES,
    });

export type TenantScopes = ApolloClient.QueryResult<
  MaybeMasked<GetTenantScopesQuery>
>;

export const queryTenantScopes: (tenant: string) => Promise<TenantScopes> = (
  tenant,
) =>
  query({
    query: TENANT_SCOPES,
    variables: { tenant },
  });

export const internal = {
  SINGLE_ATTRIBUTE,
  TENANT_SCOPES,
  fetchAttribute,
};
