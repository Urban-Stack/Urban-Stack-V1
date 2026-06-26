'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { mkProjectHref } from '@/app/_lib/resource-api/project';
import SettingsTabs from '@/app/settings/_common/SettingsTabs';

const ProjectTabs = () => {
  const params = useParams<Record<'tenant' | 'projectname', string>>();
  const pathPrefix = mkProjectHref(params.tenant, params.projectname);
  const tabsData = {
    'Freigabe Benutzergruppen': `${pathPrefix}/shared-user-groups`,
    'Freigabe Dashboardgruppen': `${pathPrefix}/shared-dashboard-groups`,
    Credentials: `${pathPrefix}/credentials`,
    Subscriptions: `${pathPrefix}/subscriptions`,
    'Sensor-Meta-Daten': `${pathPrefix}/sensor-metadata`,
    'Danger Zone': `${pathPrefix}/danger-zone`,
  };
  return <SettingsTabs tabsData={tabsData} />;
};

export default ProjectTabs;
