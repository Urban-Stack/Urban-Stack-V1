/* v8 ignore start */

import { mkMetadata } from '@/app/meta';
import React from 'react';
import TenantSettingsContent from '@/app/settings/tenants/TenantSettingsContent';
import { requireTenant } from '@/app/_lib/resource-api/legacy';
import { queryTenantSettings } from '@/app/_lib/resource-api/graphql/attributes';
import { queryHasTenantScope } from '@/app/_lib/resource-api/graphql/tenant';
import { notFound } from 'next/navigation';

export const generateMetadata = mkMetadata({
  pageName: 'Mandanteneinstellungen',
});

const TenantSettingsPage = async () => {
  const tenant = await requireTenant();
  const tenantSettings = await queryTenantSettings(tenant);
  const isTenantAdmin = await queryHasTenantScope(tenant, 'tenant:admin');

  if (!isTenantAdmin) {
    notFound();
  }

  return (
    <TenantSettingsContent
      tenantSettings={tenantSettings}
      disabled={!isTenantAdmin}
    />
  );
};

export default TenantSettingsPage;
