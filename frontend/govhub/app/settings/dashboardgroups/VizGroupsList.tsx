import React from 'react';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import { query } from '@/app/_lib/resource-api/client';
import { ALL_VIZ_GROUPS } from '@/app/_lib/resource-api/graphql/vizGroups';
import { fromAllVizGroups } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import VizGroupsTable from '@/app/settings/dashboardgroups/VizGroupsTable';

export interface VizGroupsListProps {
  canCreateVizGroup: boolean;
}

const VizGroupsList: React.FC<VizGroupsListProps> = async ({
  canCreateVizGroup,
}) => {
  const result = await query({ query: ALL_VIZ_GROUPS });
  const { vizGroups, adminMap } = fromAllVizGroups(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Dashboardgruppen konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neu zuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => vizGroups.length < 1,
      title: 'Noch keine Dashboardgruppen vorhanden',
      description: canCreateVizGroup
        ? 'Sie können hier eine neue Dashboardgruppe erstellen.'
        : 'Dashboardgruppen, auf die Sie Zugriff haben, werden hier angezeigt.',
    },
  ];
  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <VizGroupsTable vizGroups={vizGroups} adminMap={adminMap} />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default VizGroupsList;
