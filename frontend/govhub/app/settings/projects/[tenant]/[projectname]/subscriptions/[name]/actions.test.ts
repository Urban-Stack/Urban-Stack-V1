import {
  createSubscription,
  getSingleSubscription,
  updateSubscription,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions';
import {
  mutateCreateSubscription,
  mutateUpdateSubscription,
  querySingleSubscription,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { revalidatePath } from 'next/cache';
import { FORM_NAMES } from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/form';
import { mkCombinedGraphQLError } from '@/app/_test/graphql/mock.util';
import { FuncMock } from '@/app/_test/utils';

jest.mock('@/app/_lib/resource-api/graphql/subscriptions', () => ({
  mutateCreateSubscription: jest.fn(),
  mutateUpdateSubscription: jest.fn(),
  querySingleSubscription: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mutateCreateSubscriptionMock = mutateCreateSubscription as jest.Mock;
const mutateUpdateSubscriptionMock = mutateUpdateSubscription as jest.Mock;
const querySingleSubscriptionMock = querySingleSubscription as jest.Mock;

const revalidatePathMock = revalidatePath as unknown as FuncMock<
  typeof revalidatePath
>;

const TENANT = 'tenant1';
const PROJECT = 'project1';

const OLD_SUBSCRIPTION_NAME = 'your-subscription';
const SUBSCRIPTION = {
  name: 'my-subscription',
  format: 'direct',
  topic: 'my/topic',
  uri: 'mqtt://localhost:1883',
  username: 'user1',
  password: 'secret123',
} as const;

type FormKey = keyof typeof FORM_NAMES;

describe('createSubscription', () => {
  const mkFormData = (fields: Partial<Record<FormKey, string>> = {}) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        form.append(FORM_NAMES[key as FormKey], value);
      }
    });
    return form;
  };

  beforeEach(() => {
    mutateCreateSubscriptionMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it('returns validation errors if the form is invalid', async () => {
    const formData = mkFormData({
      name: '',
    });

    const state = await createSubscription(TENANT, PROJECT, {}, formData);

    expect(state.errors).toBeDefined();
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
    );
    expect(mutateCreateSubscriptionMock).not.toHaveBeenCalled();
  });

  it('returns graphQL errors (mutateCreateSubscription) and does not redirect', async () => {
    const formData = mkFormData(SUBSCRIPTION);

    mutateCreateSubscriptionMock.mockResolvedValueOnce({
      error: mkCombinedGraphQLError('errX', 'errY'),
      data: undefined,
    });

    const state = await createSubscription(TENANT, PROJECT, {}, formData);

    expect(state.errors).toEqual({ general: ['errX', 'errY'] });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
    );
  });

  describe('successful subscription creation', () => {
    beforeEach(() => {
      mutateCreateSubscriptionMock.mockResolvedValue({
        data: {
          tenant: {
            project: {
              createSensorSubscription: {
                name: 'my-subscription',
                config: {
                  username: 'user1',
                  uri: 'mqtt://localhost:1883',
                  topic: 'my/topic',
                  format: 'direct',
                },
              },
            },
          },
        },
      });
    });

    it('revalidates if no errors are returned', async () => {
      const formData = mkFormData(SUBSCRIPTION);

      const result = await createSubscription(TENANT, PROJECT, {}, formData);

      expect(revalidatePathMock).toHaveBeenCalledWith(
        `/settings/projects/${TENANT}/${PROJECT}/subscriptions`,
      );
      expect(result?.errors).toBeUndefined();
      expect(result?.data).toBeDefined();
      expect(mutateCreateSubscriptionMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        SUBSCRIPTION,
      );
    });
  });
});

describe('getSingleSubscription', () => {
  beforeEach(() => {
    querySingleSubscriptionMock.mockReset();
  });

  describe('when the subscription exists', () => {
    it('returns the subscription data', async () => {
      querySingleSubscriptionMock.mockResolvedValueOnce({
        data: {
          sensorSubscription: {
            config: {
              ...SUBSCRIPTION,
            },
          },
        },
      });

      const result = await getSingleSubscription(
        TENANT,
        PROJECT,
        SUBSCRIPTION.name,
      );

      expect(result).toEqual(
        expect.objectContaining({
          data: {
            config: {
              ...SUBSCRIPTION,
            },
          },
        }),
      );
      expect(querySingleSubscriptionMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        SUBSCRIPTION.name,
      );
    });
  });

  describe('when an error occurs', () => {
    beforeEach(() => {
      querySingleSubscriptionMock.mockRejectedValue(new Error('GraphQL error'));
    });

    it('throws an error', async () => {
      await expect(
        getSingleSubscription(TENANT, PROJECT, SUBSCRIPTION.name),
      ).rejects.toThrow('GraphQL error');

      expect(querySingleSubscriptionMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        SUBSCRIPTION.name,
      );
    });
  });
});

describe('updateSubscription', () => {
  const mkFormData = (fields: Partial<Record<FormKey, string>> = {}) => {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        form.append(FORM_NAMES[key as FormKey], value);
      }
    });
    return form;
  };

  beforeEach(() => {
    mutateUpdateSubscriptionMock.mockReset();
  });

  describe('when the form data is invalid', () => {
    it('returns validation errors and does not call mutateUpdateSubscription', async () => {
      const formData = mkFormData({
        name: '',
      });

      const state = await updateSubscription(
        TENANT,
        PROJECT,
        OLD_SUBSCRIPTION_NAME,
        {},
        formData,
      );

      expect(state.errors).toBeDefined();
      expect(mutateUpdateSubscriptionMock).not.toHaveBeenCalled();
    });
  });

  describe('when the API returns an error', () => {
    it('returns graphQL errors and does not proceed', async () => {
      const formData = mkFormData(SUBSCRIPTION);

      mutateUpdateSubscriptionMock.mockResolvedValueOnce({
        error: mkCombinedGraphQLError('errX', 'errY'),
        data: undefined,
      });

      const state = await updateSubscription(
        TENANT,
        PROJECT,
        OLD_SUBSCRIPTION_NAME,
        {},
        formData,
      );

      expect(state.errors).toEqual({ general: ['errX', 'errY'] });
      expect(mutateUpdateSubscriptionMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        OLD_SUBSCRIPTION_NAME,
        SUBSCRIPTION,
      );
    });
  });

  describe('when the update is successful', () => {
    beforeEach(() => {
      mutateUpdateSubscriptionMock.mockResolvedValue({
        data: {
          tenant: {
            project: {
              createSensorSubscription: {
                name: 'updated-subscription',
                config: {
                  username: 'user1',
                  uri: 'mqtt://localhost:1883',
                  topic: 'updated/topic',
                  format: 'direct',
                },
              },
            },
          },
        },
      });
    });

    it('returns the updated subscription data', async () => {
      const formData = mkFormData(SUBSCRIPTION);

      const result = await updateSubscription(
        TENANT,
        PROJECT,
        OLD_SUBSCRIPTION_NAME,
        {},
        formData,
      );

      expect(result?.errors).toBeUndefined();
      expect(result?.data).toBeDefined();
      expect(mutateUpdateSubscriptionMock).toHaveBeenCalledWith(
        TENANT,
        PROJECT,
        OLD_SUBSCRIPTION_NAME,
        SUBSCRIPTION,
      );
    });
  });
});
