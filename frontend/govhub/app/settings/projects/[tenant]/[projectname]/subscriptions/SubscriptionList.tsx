import { queryAllSubscriptions } from '@/app/_lib/resource-api/graphql/subscriptions';
import { toSensorSubscription } from '@/app/_lib/resource-api/project/subscriptions';
import SubscriptionTable from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/SubscriptionTable';
import SettingsFallbackWrapper, {
  FallbackContext,
} from '@/app/settings/_common/SettingsFallbackWrapper';
import React from 'react';

const SubscriptionList = async ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => {
  const result = await queryAllSubscriptions(tenant, project);
  const subscriptions = toSensorSubscription(result);

  const fallbacks: FallbackContext[] = [
    {
      predicate: () => !!result.error,
      title: 'Subscriptions konnten nicht geladen werden',
      description:
        'Versuchen Sie die Seite neuzuladen oder kontaktieren Sie den Helpdesk.',
    },
    {
      predicate: () => subscriptions.length < 1,
      title: 'Noch keine Subscriptions vorhanden',
      description: 'Sie können hier eine neue Subscription erstellen.',
    },
  ];
  return (
    <SettingsFallbackWrapper fallbacks={fallbacks}>
      <div className='size-full'>
        <SubscriptionTable
          tenant={tenant}
          project={project}
          subscriptions={subscriptions}
        />
      </div>
    </SettingsFallbackWrapper>
  );
};

export default SubscriptionList;
