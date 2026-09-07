import { graphql } from '@/app/__generated__';
import { ApolloClient, MaybeMasked } from '@apollo/client';
import { GetTenantNameQuery } from '@/app/__generated__/types';
import { query } from '@/app/_lib/resource-api/client';
import { Scope } from '../permission/scope';

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

const HAS_TENANT_SCOPE = graphql(`
  query HasTenantScopes($tenant: String!, $scope: String!) {
    tenant(tenant: $tenant) {
      hasScopes(scopes: [$scope])
    }
  }
`);

export const queryHasTenantScope: (
  tenant: string,
  scope: Scope,
) => Promise<boolean> = async (tenant, scope) =>
  (
    await query({
      query: HAS_TENANT_SCOPE,
      variables: { tenant, scope },
    })
  ).data?.tenant?.hasScopes ?? false;

export const internal = {
  SINGLE_ATTRIBUTE,
  HAS_TENANT_SCOPE,
  fetchAttribute,
};
