import {
  internal,
  mutateCreateSubscription,
  mutateDeleteSubscription,
  mutateUpdateSubscription,
  queryAllSubscriptions,
  querySingleSubscription,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { SensorSubscriptionFormat } from '@/app/_lib/resource-api/project/subscriptions';
import { mutate, query } from '@/app/_lib/resource-api/client';

jest.mock('@/app/_lib/resource-api/client', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockMutate = mutate as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
  mockMutate.mockReset();
});

const TENANT = 'tenant1';
const PROJECT = 'project1';

describe('queryAllCredentials', () => {
  it('should call the client with the correct query', async () => {
    await queryAllSubscriptions(TENANT, PROJECT);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.ALL_SUBSCRIPTIONS,
      variables: {
        tenant: TENANT,
        project: PROJECT,
      },
    });
  });
});

describe('querySingleSubscription', () => {
  it('should call the client with the correct query', async () => {
    const name = 'subName';
    await querySingleSubscription(TENANT, PROJECT, name);

    expect(mockQuery).toHaveBeenCalledWith({
      query: internal.GET_SINGLE_SUBSCRIPTION,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        name: name,
      },
    });
  });
});

describe('mutateCreateSubscription', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'subscription1';
    const config = {
      uri: 'http://example.com',
      format: 'zenner' as SensorSubscriptionFormat,
      topic: 'topic1',
      username: 'user1',
      password: 'password1',
    };
    const subscription = { name, ...config };

    await mutateCreateSubscription(TENANT, PROJECT, subscription);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.CREATE_SUBSCRIPTION,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        name,
        config,
      },
    });
  });
});

describe('mutateDeleteSubscription', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'subscription1';

    await mutateDeleteSubscription(TENANT, PROJECT, name);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.DELETE_SUBSCRIPTION,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        name,
      },
    });
  });
});

describe('mutateUpdateSubscription', () => {
  it('should call the client with the correct mutation', async () => {
    const name = 'subscription1';
    const subscription = {
      name: 'subscription2',
      format: 'direct',
      topic: 'my/topic',
      uri: 'mqtt://localhost:1883',
      username: 'user1',
      password: 'secret123',
    } as const;

    await mutateUpdateSubscription(TENANT, PROJECT, name, subscription);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: internal.UPDATE_SUBSCRIPTION,
      variables: {
        tenant: TENANT,
        project: PROJECT,
        oldName: name,
        newName: subscription.name,
        config: { ...subscription, name: undefined },
      },
    });
  });
});
