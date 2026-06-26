/* v8 ignore start */

import { mkMetadata } from '@/app/meta';
import React from 'react';
import TenantSettingsContent from '@/app/settings/tenants/TenantSettingsContent';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { queryTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { GetAllTenantAndProjectScopes } from '@/app/_lib/resource-api/graphql/tenant';
import { isTenantAdmin } from '@/app/_lib/resource-api/permission/scope';
import { notFound } from 'next/navigation';

export const generateMetadata = mkMetadata({
  pageName: 'Mandanteneinstellungen',
});

const TenantSettingsPage = async () => {
  const tenant = await requireTenant();
  const tenantSettings = await queryTenantSettings(tenant);
  const scopes = await GetAllTenantAndProjectScopes();

  if (!isTenantAdmin(scopes, tenant)) {
    notFound();
  }

  return (
    <TenantSettingsContent
      tenantSettings={tenantSettings}
      disabled={!isTenantAdmin(scopes, tenant)}
    />
  );
};

export default TenantSettingsPage;
