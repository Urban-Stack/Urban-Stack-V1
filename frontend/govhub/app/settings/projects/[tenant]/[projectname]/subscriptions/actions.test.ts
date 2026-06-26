import { FuncMock } from '@/app/_test/utils';
import { revalidatePath } from 'next/cache';
import { deleteSubscription } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/actions';
import { mutateDeleteSubscription } from '@/app/_lib/resource-api/graphql/subscriptions';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';

const mutateDeleteSubscriptionMock =
  mutateDeleteSubscription as unknown as FuncMock<
    typeof mutateDeleteSubscription
  >;

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

jest.mock('@/app/_lib/resource-api/graphql/subscriptions', () => ({
  mutateDeleteSubscription: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const TENANT = 'tenant-1';
const PROJECT = 'project-1';

beforeEach(() => {
  mutateDeleteSubscriptionMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('deleteSubscription', () => {
  it('invalidates path and returns data on success', async () => {
    const SUBSCRIPTION_NAME = 'subscription-name';

    mutateDeleteSubscriptionMock.mockResolvedValue({
      data: {
        tenant: {
          project: {
            deleteSensorSubscription: SUBSCRIPTION_NAME,
          },
        },
      },
    });

    const state = await deleteSubscription(TENANT, PROJECT, SUBSCRIPTION_NAME);

    expect(mutateDeleteSubscriptionMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      SUBSCRIPTION_NAME,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
    );

    expect(state.data).toEqual({});
  });

  it('returns errors if the deletion fails', async () => {
    const SUBSCRIPTION_NAME = 'subscription-name';
    mutateDeleteSubscriptionMock.mockResolvedValue({
      error: mkCombinedGraphQLError('errorA', 'errorB'),
      data: undefined,
    });

    const state = await deleteSubscription(TENANT, PROJECT, SUBSCRIPTION_NAME);

    expect(mutateDeleteSubscriptionMock).toHaveBeenCalledWith(
      TENANT,
      PROJECT,
      SUBSCRIPTION_NAME,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
    );

    expect(state.errors).toEqual({ general: ['errorA', 'errorB'] });
  });
});
