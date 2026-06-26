'use server';

import { getPublicEnv } from '@/app/_lib/env';
import React from 'react';
import SettingsLayoutClient from '@/app/settings/layout.client';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import {
  isGroupAdminInAnyTenant,
  isTenantAdmin,
} from '@/app/_lib/resource-api/permission/scope';
import { requireTenant } from '../_lib/resource-api/legacy';

type SettingsLayoutProps = {
  children?: React.ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProps) => {
  const keycloakBaseUrl = getPublicEnv('KEYCLOAK_URI');
  const tenant = await requireTenant();

  const scopes = (await GetAllTenantAndProjectScopes()) ?? {
    data: { tenants: [] },
  };

  return (
    <SettingsLayoutClient
      keycloakBaseUrl={keycloakBaseUrl}
      lockUserManagement={!isGroupAdminInAnyTenant(scopes)}
      lockTenantSettings={tenant ? !isTenantAdmin(scopes, tenant) : true}
    >
      {children}
    </SettingsLayoutClient>
  );
};

export default SettingsLayout;
