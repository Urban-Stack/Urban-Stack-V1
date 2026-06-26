import { DeleteSubscription } from '@/app/_lib/resource-api/graphql/subscriptions';
import { ActionState } from '@/app/_lib/form/actionstate';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';

export type DeleteSubscriptionState = ActionState & {
  readonly errors?: {
    readonly general?: string[];
  };
};

export const mkDeleteState: (
  result: DeleteSubscription,
) => DeleteSubscriptionState = (result) =>
  result.error || !result.data?.tenant.project.deleteSensorSubscription
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : { data: {} };
