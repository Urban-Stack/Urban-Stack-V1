import { z } from 'zod';
import { getResultGeneralErrors } from '@/app/_lib/resource-api/client/errors';
import { SensorSubscriptionFormat } from '@/app/_lib/resource-api/project/subscriptions';
import {
  CreateSubscription,
  SingleSubscription,
  UpdateSubscription,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { ActionState } from '@/app/_lib/form/actionstate';

export const FORM_NAMES = {
  name: 'edit-subscription-name',
  uri: 'edit-subscription-uri',
  topic: 'edit-subscription-topic',
  format: 'edit-subscription-format',
  username: 'edit-subscription-username',
  password: 'edit-subscription-password',
} as const;

export const NEW_STRING = 'new';

export const CreateSubscriptionForm = z.object({
  name: z
    .string()
    .min(3, 'Subscription-Name muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Subscription-Name darf maximal 64 Zeichen beinhalten')
    .regex(
      new RegExp(`^(?!${NEW_STRING}$).+$`),
      `Subscription-Name darf nicht "${NEW_STRING}" sein`,
    )
    .regex(
      /^[a-z0-9-]+$/,
      'Subscription-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
    ),
  uri: z.string().url('URI nicht valide'),
  topic: z
    .string()
    .min(3, 'Subscription-Topic muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Subscription-Topic darf maximal 64 Zeichen beinhalten'),
  format: SensorSubscriptionFormat,
  username: z
    .string()
    .min(3, 'Subscription-Username muss mindestens 3 Zeichen beinhalten')
    .max(64, 'Subscription-Username darf maximal 64 Zeichen beinhalten'),
  password: z
    .string()
    .max(255, 'Subscription-Password darf maximal 255 Zeichen beinhalten'),
});

export type SubscriptionState = ActionState & {
  readonly data?: {
    readonly name?: string;
    readonly config: {
      readonly uri: string;
      readonly topic: string;
      readonly format: SensorSubscriptionFormat;
      readonly username: string;
    };
  };
  readonly errors?: {
    readonly general?: string[];
    readonly name?: string[];
    readonly uri?: string[];
    readonly topic?: string[];
    readonly format?: string[];
    readonly username?: string[];
    readonly password?: string[];
  };
};

export const mkState: (
  result: CreateSubscription | UpdateSubscription,
) => SubscriptionState = (result) =>
  result.error || !result.data?.tenant.project?.createSensorSubscription
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          name: result.data.tenant.project.createSensorSubscription
            .sensorSubscription,
          config: {
            ...result.data.tenant.project.createSensorSubscription.config,
            format: SensorSubscriptionFormat.parse(
              result.data.tenant.project.createSensorSubscription.config.format,
            ),
          },
        },
      };

export const mkGetState: (result: SingleSubscription) => SubscriptionState = (
  result,
) =>
  result.error || !result.data?.sensorSubscription
    ? {
        errors: {
          general: getResultGeneralErrors(result.error),
        },
      }
    : {
        data: {
          config: {
            ...result.data.sensorSubscription.config,
            format: SensorSubscriptionFormat.parse(
              result.data.sensorSubscription.config.format,
            ),
          },
        },
      };
