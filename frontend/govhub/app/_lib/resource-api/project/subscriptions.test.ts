import {
  internal,
  SensorSubscriptionState,
  toSensorSubscription,
} from '@/app/_lib/resource-api/project/subscriptions';
import { AllSubscriptions } from '@/app/_lib/resource-api/graphql/subscriptions';
import { ZodError } from 'zod';

describe('toSensorSubscription', () => {
  it('should return an array of SensorSubscription objects', () => {
    const result = {
      data: {
        project: {
          sensorSubscriptions: [
            {
              sensorSubscription: 'sub1',
              config: {
                username: 'user1',
                uri: 'mqtt://localhost:1883',
                topic: 'my/topic/1',
                format: 'direct',
              },
              connection: {
                state: SensorSubscriptionState.enum.Connected,
                lastMessageTimestamp: '2025-10-30T14:52:12.123456789Z',
              },
            },
            {
              sensorSubscription: 'sub2',
              config: {
                username: 'user2',
                uri: 'mqtt://some-host:1883',
                topic: 'another/topic',
                format: 'lorawan',
              },
              connection: {
                error: 'Invalid URL',
                state: SensorSubscriptionState.enum.Error,
              },
            },
          ],
        },
      },
    } as unknown as AllSubscriptions;

    const subscriptions = toSensorSubscription(result);

    expect(subscriptions).toEqual([
      {
        name: 'sub1',
        config: {
          username: 'user1',
          uri: 'mqtt://localhost:1883',
          topic: 'my/topic/1',
          format: 'direct',
        },
        connection: {
          state: 'CONNECTED',
          lastMessageTimestamp: '2025-10-30T14:52:12.123456789Z',
        },
        _tag: 'SensorSubscription',
      },
      {
        name: 'sub2',
        config: {
          username: 'user2',
          uri: 'mqtt://some-host:1883',
          topic: 'another/topic',
          format: 'lorawan',
        },
        connection: {
          state: 'ERROR',
          error: 'Invalid URL',
        },
        _tag: 'SensorSubscription',
      },
    ]);
  });

  it.each([
    ['sensorSubscriptions is empty', { sensorSubscriptions: [] }],
    ['project is undefined', undefined],
  ])('should return an empty array if %s', (_, project) => {
    const result = { data: { project } } as unknown as AllSubscriptions;

    const subscriptions = toSensorSubscription(result);
    expect(subscriptions).toEqual([]);
  });
});

describe('unsafeMkSensorSubscription', () => {
  it('should return a SensorSubscription object', () => {
    const subscription = internal.unsafeMkSensorSubscription(
      'sub1',
      {
        username: 'user1',
        uri: 'mqtt://example.com',
        topic: 'some/topic',
        format: 'zenner',
      },
      {
        state: SensorSubscriptionState.enum.Connecting,
      },
    );

    expect(subscription).toEqual({
      name: 'sub1',
      config: {
        username: 'user1',
        uri: 'mqtt://example.com',
        topic: 'some/topic',
        format: 'zenner',
      },
      connection: {
        state: 'CONNECTING',
      },
      _tag: 'SensorSubscription',
    });
  });

  it('should throw an error if format is invalid', () => {
    expect(() =>
      internal.unsafeMkSensorSubscription(
        'badSub',
        {
          username: 'userX',
          uri: 'mqtt://bad-format',
          topic: 'some/topic',
          format: 'invalidFormat',
        },
        {
          state: SensorSubscriptionState.enum.Error,
        },
      ),
    ).toThrow(ZodError);
  });

  it('should throw an error if state is invalid', () => {
    expect(() =>
      internal.unsafeMkSensorSubscription(
        'badSub',
        {
          username: 'userX',
          uri: 'mqtt://bad-format',
          topic: 'some/topic',
          format: 'zenner',
        },
        {
          state: 'invalid',
        },
      ),
    ).toThrow(ZodError);
  });
});
