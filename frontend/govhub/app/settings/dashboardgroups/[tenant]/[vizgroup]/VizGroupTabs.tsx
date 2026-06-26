'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { mkVizGroupHref } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';

const VizGroupTabs = () => {
  const params = useParams<Record<'tenant' | 'vizgroup', string>>();
  const pathPrefix = mkVizGroupHref(params.tenant, params.vizgroup);
  const tabsData = {
    'Freigabe Benutzergruppen': `${pathPrefix}/shared-user-groups`,
    GeoJSON: `${pathPrefix}/geojson`,
    Dashboards: `${pathPrefix}/dashboards`,
    'Danger Zone': `${pathPrefix}/danger-zone`,
  };
  return <SettingsTabs tabsData={tabsData} />;
};

export default VizGroupTabs;
