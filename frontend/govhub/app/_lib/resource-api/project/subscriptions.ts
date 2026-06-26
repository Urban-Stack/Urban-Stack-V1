import { AllSubscriptions } from '@/app/_lib/resource-api/graphql/subscriptions';
import { z } from 'zod';
import { SubscriptionState } from '@/app/__generated__/types';

export const SENSOR_SUBSCRIPTION_FORMATS = [
  'direct',
  'lorawan',
  'zenner',
] as const;
export const SensorSubscriptionFormat = z.enum(SENSOR_SUBSCRIPTION_FORMATS);
export type SensorSubscriptionFormat = z.infer<typeof SensorSubscriptionFormat>;

export const SensorSubscriptionState = z.nativeEnum(SubscriptionState);
export type SensorSubscriptionState = z.infer<typeof SensorSubscriptionState>;

export type SensorSubscription = {
  readonly name: string;
  readonly config: {
    readonly username: string;
    readonly uri: string;
    readonly topic: string;
    readonly format: SensorSubscriptionFormat;
  };
  readonly connection: {
    readonly error?: string;
    readonly lastMessageTimestamp?: string;
    readonly state: SensorSubscriptionState;
  };
  readonly _tag: 'SensorSubscription';
};

export const toSensorSubscription: (
  result: AllSubscriptions,
) => SensorSubscription[] = (result) =>
  result.data?.project?.sensorSubscriptions.map(
    ({
      sensorSubscription,
      config,
      connection: { lastMessageTimestamp, error, state },
    }) =>
      unsafeMkSensorSubscription(sensorSubscription, config, {
        state,
        error: error ?? undefined,
        lastMessageTimestamp: lastMessageTimestamp ?? undefined,
      }),
  ) ?? [];

const unsafeMkSensorSubscription: (
  name: string,
  config: {
    username: string;
    uri: string;
    topic: string;
    format: string;
  },
  connection: {
    state: string;
    lastMessageTimestamp?: string;
    error?: string;
  },
) => SensorSubscription = (
  name,
  { username, uri, topic, format },
  { state, lastMessageTimestamp, error },
) => ({
  name,
  config: {
    username,
    uri,
    topic,
    format: SensorSubscriptionFormat.parse(format),
  },
  connection: {
    state: SensorSubscriptionState.parse(state),
    lastMessageTimestamp: lastMessageTimestamp,
    error: error,
  },
  _tag: 'SensorSubscription',
});

export const internal = {
  unsafeMkSensorSubscription,
};
