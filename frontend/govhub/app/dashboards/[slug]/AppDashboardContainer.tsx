'use client';

import { UdpEmbeddedDashboard } from 'udp-ui/components';

/**
 * Container for showing a specific Superset dashboard.
 *
 * @param supersetBaseUrl Superset base URL
 * @param slug            slug of the dashboard to show
 * @param editMode        `true` in order to show this dashboard in edit mode - `false` otherwise
 * @constructor
 */
const AppDashboardContainer = ({
  supersetBaseUrl,
  slug,
  editMode = false,
}: {
  supersetBaseUrl: string;
  slug: string;
  editMode?: boolean;
}) => (
  <div className={'h-full flex flex-col gap-y-4'}>
    {editMode && (
      <h1 className={'flex-grow text-2xl font-bold text-gray-900'}>
        Neues Dashboard erstellen
      </h1>
    )}
    <UdpEmbeddedDashboard
      supersetBaseUrl={supersetBaseUrl}
      slug={slug}
      editMode={editMode}
      className='h-full'
    />
  </div>
);

export default AppDashboardContainer;
