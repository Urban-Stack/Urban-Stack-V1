import { DeletePublishedQuery } from '@/app/_lib/resource-api/graphql/vizGroups';
import { getResultErrorMessages } from '@/app/_lib/resource-api/client/errors';

export type DeletePublishedQueryState = {
  errors?: {
    general?: string[];
  };
};

export const mkState: (
  result: DeletePublishedQuery,
) => DeletePublishedQueryState = (result) =>
  result.error
    ? {
        errors: {
          general: getResultErrorMessages(result.error),
        },
      }
    : {};
