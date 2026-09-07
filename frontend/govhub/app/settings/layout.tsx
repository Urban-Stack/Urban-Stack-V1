'use server';

import { getPublicEnv } from '@/app/_lib/env';
import React from 'react';
import SettingsLayoutClient from '@/app/settings/layout.client';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';

import { requireTenant } from '../_lib/resource-api/legacy';

type SettingsLayoutProps = {
  children?: React.ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProps) => {
  const keycloakBaseUrl = getPublicEnv('KEYCLOAK_URI');
  const tenant = await requireTenant();

  const isTenantAdmin = await queryHasTenantScope(tenant, 'tenant:admin');

  return (
    <SettingsLayoutClient
      keycloakBaseUrl={keycloakBaseUrl}
      lockUserManagement={!isTenantAdmin}
      lockTenantSettings={!isTenantAdmin}
    >
      {children}
    </SettingsLayoutClient>
  );
};

export default SettingsLayout;
