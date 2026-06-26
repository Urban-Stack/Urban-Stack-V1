import { ApolloClient, ApolloLink, MaybeMasked } from '@apollo/client';
import { ThemeAttributesQuery } from '@/app/__generated__/graphql';
import { graphql } from '@/app/__generated__';
import {
  TenantSettingsQuery,
  UpdateTenantSettingsMutation,
} from '@/app/__generated__/types';
import { mutate, query } from '@/app/_lib/resource-api/client';

const THEME_ATTRIBUTES = graphql(`
  query ThemeAttributes($tenant: String!) {
    tenant(tenant: $tenant) {
      colorPrimary: attribute(attribute: "color-primary")
    }
  }
`);

const TENANT_SETTINGS = graphql(`
  query TenantSettings($tenant: String!) {
    tenant(tenant: $tenant) {
      tenantDisplayName: attribute(attribute: "tenant-name")
      legalNoticeUrl: attribute(attribute: "legal-notice-url")
      privacyUrl: attribute(attribute: "privacy-url")
      contactUrl: attribute(attribute: "contact-url")
      tenantLogoUrl: attribute(attribute: "tenant-logo")
      tenantImageUrl: attribute(attribute: "tenant-image")
      citizenHubImageUrl: attribute(attribute: "citizen-hub-image")
      tenantCoords: attribute(attribute: "tenant-coords")
      colorPrimary: attribute(attribute: "color-primary")
      uchColorPrimary: attribute(attribute: "uch-color-primary")
      newsUrl: attribute(attribute: "news-url")
    }
  }
`);

const MUTATE_TENANT_SETTINGS = graphql(`
  mutation UpdateTenantSettings(
    $tenant: String!
    $tenantDisplayName: String
    $legalNoticeUrl: String!
    $privacyUrl: String!
    $contactUrl: String!
    $tenantLogoUrl: String
    $tenantImageUrl: String
    $citizenHubImageUrl: String
    $tenantCoords: String
    $colorPrimary: String
    $uchColorPrimary: String
    $newsUrl: String
  ) {
    tenant(tenant: $tenant) {
      patchAttributes(
        attributes: [
          { key: "tenant-name", value: $tenantDisplayName }
          { key: "legal-notice-url", value: $legalNoticeUrl }
          { key: "privacy-url", value: $privacyUrl }
          { key: "contact-url", value: $contactUrl }
          { key: "tenant-logo", value: $tenantLogoUrl }
          { key: "tenant-image", value: $tenantImageUrl }
          { key: "citizen-hub-image", value: $citizenHubImageUrl }
          { key: "tenant-coords", value: $tenantCoords }
          { key: "color-primary", value: $colorPrimary }
          { key: "uch-color-primary", value: $uchColorPrimary }
          { key: "news-url", value: $newsUrl }
        ]
      ) {
        key
        value
      }
    }
  }
`);

export type ThemeAttributes = ApolloClient.QueryResult<
  MaybeMasked<ThemeAttributesQuery>
>;

export const fetchThemeAttributes: (
  tenant: string,
) => Promise<ThemeAttributes> = async (tenant) =>
  query({
    query: THEME_ATTRIBUTES,
    variables: {
      tenant,
    },
  });

export type TenantSettings = ApolloClient.QueryResult<
  MaybeMasked<TenantSettingsQuery>
>;

export const queryTenantSettings: (
  tenant: string,
) => Promise<TenantSettings> = async (tenant) =>
  query({
    query: TENANT_SETTINGS,
    variables: {
      tenant,
    },
  });

export const mutateTenantSettings: (
  tenant: string,
  tenantDisplayName: string,
  legalNoticeUrl: string,
  privacyUrl: string,
  contactUrl: string,
  tenantLogoUrl?: string,
  tenantImageUrl?: string,
  citizenHubImageUrl?: string,
  tenantCoords?: string,
  colorPrimary?: string,
  uchColorPrimary?: string,
  newsUrl?: string,
) => Promise<UpdateTenantSettings> = async (
  tenant,
  tenantDisplayName,
  legalNoticeUrl,
  privacyUrl,
  contactUrl,
  tenantLogoUrl,
  tenantImageUrl,
  citizenHubImageUrl,
  tenantCoords,
  colorPrimary,
  uchColorPrimary,
  newsUrl,
) =>
  mutate({
    mutation: MUTATE_TENANT_SETTINGS,
    variables: {
      tenant,
      tenantDisplayName,
      legalNoticeUrl,
      privacyUrl,
      contactUrl,
      tenantLogoUrl,
      tenantImageUrl,
      citizenHubImageUrl,
      tenantCoords,
      colorPrimary,
      uchColorPrimary,
      newsUrl,
    },
  });

export type UpdateTenantSettings = ApolloLink.Result<
  MaybeMasked<UpdateTenantSettingsMutation>
>;

export const internal = {
  THEME_ATTRIBUTES,
  TENANT_SETTINGS,
  MUTATE_TENANT_SETTINGS,
};
