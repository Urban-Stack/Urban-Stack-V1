'use server';

import { revalidatePath } from 'next/cache';
import {
  CreateSubscriptionForm,
  FORM_NAMES,
  mkGetState,
  mkState,
  SubscriptionState,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/form';
import {
  mutateCreateSubscription,
  mutateUpdateSubscription,
  querySingleSubscription,
} from '@/app/_lib/resource-api/graphql/subscriptions';
import { Dictionary } from 'ts-essentials';
import { invertBy } from 'lodash';
import { SensorSubscriptionFormat } from '@/app/_lib/resource-api/project/subscriptions';
import { sanitizeValue } from '@/app/_lib/form/sanitize';

export const createSubscription: (
  tenant: string,
  project: string,
  _prevState: SubscriptionState,
  formData: FormData,
) => Promise<SubscriptionState> = async (
  tenant,
  project,
  _prevState,
  formData,
) => {
  const parsed = CreateSubscriptionForm.safeParse({
    name: formData.get(FORM_NAMES.name),
    format: formData.get(FORM_NAMES.format),
    topic: formData.get(FORM_NAMES.topic),
    uri: formData.get(FORM_NAMES.uri),
    username: formData.get(FORM_NAMES.username),
    password: formData.get(FORM_NAMES.password),
  });

  const result = parsed.success
    ? mkState(await mutateCreateSubscription(tenant, project, parsed.data))
    : {
        data: {
          name: formData.get(FORM_NAMES.name),
          config: {
            uri: formData.get(FORM_NAMES.uri),
            topic: formData.get(FORM_NAMES.topic),
            format: formData.get(FORM_NAMES.format) as SensorSubscriptionFormat,
            username: formData.get(FORM_NAMES.username),
          },
        } as SubscriptionState['data'],
        errors: parsed.error?.flatten().fieldErrors,
      };

  revalidatePath(`/settings/projects/${tenant}/${project}/subscriptions`);
  return result;
};

const keys: Readonly<Dictionary<string>> = {
  ...Object.fromEntries(
    Object.entries(invertBy(FORM_NAMES)).map(([k, v]) => [k, v[0]]),
  ),
};

export const updateSubscription = async (
  tenant: string,
  project: string,
  previousName: string,
  _prevState: SubscriptionState,
  formData: FormData,
): Promise<SubscriptionState> => {
  const sanitizedInputs = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      keys[key],
      sanitizeValue(value),
    ]),
  );

  const parsed = CreateSubscriptionForm.safeParse({
    name: formData.get(FORM_NAMES.name),
    format: formData.get(FORM_NAMES.format),
    topic: formData.get(FORM_NAMES.topic),
    uri: formData.get(FORM_NAMES.uri),
    username: formData.get(FORM_NAMES.username),
    password: formData.get(FORM_NAMES.password),
  });

  return parsed.success
    ? mkState(
        await mutateUpdateSubscription(
          tenant,
          project,
          previousName,
          parsed.data,
        ),
      )
    : {
        data: {
          name: sanitizedInputs.name!,
          config: {
            uri: sanitizedInputs.uri!,
            topic: sanitizedInputs.topic!,
            format: sanitizedInputs.format! as SensorSubscriptionFormat,
            username: sanitizedInputs.username!,
          },
        },
        errors: parsed.error?.flatten().fieldErrors,
      };
};

export const getSingleSubscription: (
  tenant: string,
  project: string,
  subscriptionName: string,
) => Promise<SubscriptionState> = async (tenant, project, subscriptionName) => {
  const subscription = await querySingleSubscription(
    tenant,
    project,
    subscriptionName,
  );
  return mkGetState(subscription);
};
