'use client';

import Form from 'next/form';
import React, { useActionState, useEffect, useRef } from 'react';
import {
  createSubscription,
  updateSubscription,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/actions';
import {
  FORM_NAMES,
  NEW_STRING,
  SubscriptionState,
} from '@/app/settings/projects/[tenant]/[projectname]/subscriptions/[name]/form';
import { useRouter } from 'next/navigation';
import { cond, flow } from 'lodash';
import Link from 'next/link';
import { HelperText, Label, Select } from 'flowbite-react';
import { SENSOR_SUBSCRIPTION_FORMATS } from '@/app/_lib/resource-api/project/subscriptions';
import {
  IcDownload,
  UdpButton,
  UdpTextInput,
  UdpToast,
} from 'udp-ui/components';
import { capitalize } from 'udp-ui/string';

type CreateFormProps = {
  tenant: string;
  project: string;
  subscription: SubscriptionState;
  subscriptionName: string;
};

/* c8 ignore start */
const CreateForm = (props: CreateFormProps) => {
  const { tenant, project, subscriptionName, subscription } = props;

  const [createState, createFormAction, createIsLoading] = useActionState(
    createSubscription.bind(null, tenant, project),
    { isInitial: true },
  );
  const [updateState, updateFormAction, updateIsLoading] = useActionState(
    updateSubscription.bind(null, tenant, project, subscriptionName),
    subscription.data
      ? {
          ...subscription,
          data: { ...subscription.data, name: subscriptionName },
          isInitial: true,
        }
      : {},
  );

  const isNew = subscriptionName === NEW_STRING;

  return (
    <Form action={isNew ? createFormAction : updateFormAction}>
      <FormContent
        {...props}
        subscriptionName={subscriptionName}
        state={isNew ? createState : updateState}
        isLoading={isNew ? createIsLoading : updateIsLoading}
      />
    </Form>
  );
};
/* c8 ignore end */

type FormContentProps = {
  tenant: string;
  project: string;
  subscription?: SubscriptionState;
  subscriptionName: string;
  state: SubscriptionState;
  isLoading?: boolean;
};

const FormContent = ({
  tenant,
  project,
  subscription,
  subscriptionName,
  state,
  isLoading,
}: FormContentProps) => {
  const router = useRouter();
  const selectRef = useRef<HTMLSelectElement>(null);

  const isNew = subscription ? subscriptionName === NEW_STRING : false;

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Subscription konnte nicht erstellt werden.\n${state.errors?.general?.join('\n')}`,
      'error',
    );
    const successToast = UdpToast(
      isNew
        ? 'Subscription erfolgreich erstellt'
        : 'Subscription erfolgreich gespeichert',
      'success',
    );
    const success = flow([
      successToast,
      () =>
        router.push(`/settings/projects/${tenant}/${project}/subscriptions`),
    ]);

    cond([
      [() => !!state.errors?.general, errorToast],
      [() => !!state.data && !state.errors, success],
    ])();
  }, [state, router, tenant, project, isNew]);

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.value =
        state.data?.config.format ?? SENSOR_SUBSCRIPTION_FORMATS[0];
    }
  }, [state.data?.config.format]);

  return (
    <div>
      <div className='flex justify-between mb-4'>
        <h3 className='font-bold'>
          {isNew ? 'Neue Subscription erstellen' : 'Subscription bearbeiten'}
        </h3>
        <div className='flex gap-3.5'>
          <UdpButton
            color='tertiary'
            linkAs={Link}
            href={`/settings/projects/${tenant}/${project}/subscriptions`}
          >
            Abbrechen
          </UdpButton>
          <UdpButton icon={IcDownload} type='submit' loading={isLoading}>
            Speichern
          </UdpButton>
        </div>
      </div>
      <div className='max-w-[556px] flex flex-col gap-6'>
        <div>
          <Label htmlFor={FORM_NAMES.name} className='block mb-2'>
            Name der Subscription
          </Label>
          <UdpTextInput
            id={FORM_NAMES.name}
            name={FORM_NAMES.name}
            required
            errors={state.errors?.name}
            defaultValue={state.data?.name}
          />
        </div>
        <div>
          <Label htmlFor={FORM_NAMES.uri} className='block mb-2'>
            URI
          </Label>
          <UdpTextInput
            id={FORM_NAMES.uri}
            name={FORM_NAMES.uri}
            placeholder='z.B.: wss://...'
            type='url'
            required
            errors={state.errors?.uri}
            defaultValue={state.data?.config?.uri}
          />
        </div>
        <div>
          <Label htmlFor={FORM_NAMES.topic} className='block mb-2'>
            Topic
          </Label>
          <UdpTextInput
            id={FORM_NAMES.topic}
            name={FORM_NAMES.topic}
            placeholder='z.B.: sensor/...'
            required
            errors={state.errors?.topic}
            defaultValue={state.data?.config.topic}
          />
        </div>
        <div>
          <Label htmlFor={FORM_NAMES.format} className='block mb-2'>
            Format
          </Label>
          <Select
            ref={selectRef}
            id={FORM_NAMES.format}
            name={FORM_NAMES.format}
            required
            defaultValue={state.data?.config.format}
          >
            {state.errors && (
              <HelperText color='failure'>
                {state.errors?.format?.map((msg) => (
                  <div key={msg} className='text-danger-500'>
                    <span>
                      {msg}
                      <br />
                    </span>
                  </div>
                ))}
              </HelperText>
            )}
            {SENSOR_SUBSCRIPTION_FORMATS.map((format) => (
              <option key={format} value={format}>
                {capitalize(format)}
              </option>
            ))}
          </Select>
        </div>
        <hr className='my-2' />
        <div>
          <Label htmlFor={FORM_NAMES.username} className='block mb-2'>
            Username
          </Label>
          <UdpTextInput
            id={FORM_NAMES.username}
            name={FORM_NAMES.username}
            required
            errors={state.errors?.username}
            defaultValue={state.data?.config.username}
          />
        </div>
        <div>
          <Label htmlFor={FORM_NAMES.password} className='block mb-2'>
            Passwort
          </Label>
          <UdpTextInput
            id={FORM_NAMES.password}
            name={FORM_NAMES.password}
            type='password'
            required
            errors={state.errors?.password}
          />
        </div>
      </div>
    </div>
  );
};

export const _internal = {
  FormContent,
};

export default CreateForm;
