'use server';

import {
  DeleteSubscriptionState,
  mkDeleteState,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/form';
import { mutateDeleteSubscription } from '@/app/_lib/resource-api/graphql/subscriptions';
import { revalidatePath } from 'next/cache';

export const deleteSubscription: (
  tenant: string,
  project: string,
  subscriptionName: string,
) => Promise<DeleteSubscriptionState> = async (
  tenant,
  project,
  subscriptionName,
) => {
  const result = mkDeleteState(
    await mutateDeleteSubscription(tenant, project, subscriptionName),
  );
  revalidatePath(`/settings/projects/${tenant}/${project}/subscriptions`);
  return result;
};
