'use client';

import { Checkbox, Label } from 'flowbite-react';
import Form from 'next/form';
import {
  IcBookmark,
  UdpButton,
  UdpImageInput,
  UdpTextArea,
  UdpTextInput,
  UdpToast,
} from 'udp-ui/components';
import { FORM_NAMES, NEW_STRING, SharedAppState } from './form';
import React, { useActionState, useEffect } from 'react';
import {
  createSharedApp,
  updateSharedApp,
} from '@/app/citytools/shared-app/[tenant]/[name]/actions';
import Link from 'next/link';
import { cond, flow } from 'lodash';
import { useRouter } from 'next/navigation';
import {
  CITYTOOL_CATEGORY_LABELS,
  CITYTOOL_CATEGORY_ORDER,
} from '@/app/citytools/_internal/categories';

/* c8 ignore start */
const EditForm = ({
  tenant,
  name,
  state,
}: {
  tenant: string;
  name: string;
  state: SharedAppState;
}) => {
  const [createState, createFormAction, createIsLoading] = useActionState(
    createSharedApp.bind(null, tenant),
    { isInitial: true },
  );
  const [updateState, updateFormAction, updateIsLoading] = useActionState(
    updateSharedApp.bind(null, tenant, name),
    { data: { ...state.data }, isInitial: true },
  );

  const isNew = name === NEW_STRING;

  return (
    <Form
      action={isNew ? createFormAction : updateFormAction}
      className='flex flex-col gap-5 mb-5'
    >
      <FormHeader
        isNew={isNew}
        isLoading={isNew ? createIsLoading : updateIsLoading}
      />
      <FormInputs name={name} state={isNew ? createState : updateState} />
    </Form>
  );
};
/* c8 ignore end */

const FormHeader = ({
  isNew,
  isLoading,
}: {
  isNew: boolean;
  isLoading?: boolean;
}) => (
  <div className='flex flex-col lg:flex-row justify-between gap-5'>
    <h2 className='font-bold'>
      {isNew ? 'Neues City Tool erstellen' : 'City Tool bearbeiten'}
    </h2>
    <div className='flex gap-2 lg:justify-end'>
      <UdpButton color='secondary' linkAs={Link} href='/citytools'>
        Abbrechen
      </UdpButton>
      <UdpButton type='submit' icon={IcBookmark} loading={isLoading}>
        Speichern
      </UdpButton>
    </div>
  </div>
);

const Separator = () => <hr className='h-px border-0 bg-gray-100' />;

const FormInputs = ({
  name,
  state,
}: {
  name: string;
  state: SharedAppState;
}) => {
  const router = useRouter();

  const isNew = name == NEW_STRING;

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `City Tool konnte nicht ${isNew ? 'erstellt' : 'geupdated'} werden.\n${state.errors?.general?.join('\n')}`,
      'error',
    );
    const successToast = UdpToast(
      isNew
        ? 'City Tool erfolgreich erstellt'
        : 'City Tool erfolgreich gespeichert',
      'success',
    );
    const success = flow([successToast, () => router.push('/citytools')]);

    cond([
      [() => !!state.errors?.general, errorToast],
      [() => !!state.data && !state.errors, success],
    ])();
  }, [state, router, isNew]);

  return (
    <div className='max-w-[556px] flex flex-col gap-6'>
      <div>
        <Label htmlFor={FORM_NAMES.displayName} className='block mb-2'>
          Name*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.displayName}
          name={FORM_NAMES.displayName}
          required
          errors={state.errors?.displayName}
          defaultValue={state.data?.displayName}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.description} className='block mb-2'>
          Beschreibung*{' '}
          <span className='text-gray-300 font-normal'>(max. 255 Zeichen)</span>
        </Label>
        <UdpTextArea
          id={FORM_NAMES.description}
          name={FORM_NAMES.description}
          rows={4}
          className='resize-none'
          maxLength={255}
          required
          errors={state.errors?.description}
          defaultValue={state.data?.description}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.contact} className='block mb-2'>
          Kontakt*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.contact}
          name={FORM_NAMES.contact}
          placeholder='admin@contact.com'
          required
          errors={state.errors?.contact}
          defaultValue={state.data?.contact}
        />
      </div>

      <div>
        <Label htmlFor={FORM_NAMES.pictureUri} className='block mb-2'>
          City Tool Bild
        </Label>
        <UdpImageInput
          id={FORM_NAMES.pictureUri}
          name={FORM_NAMES.pictureUri}
          key={state.data?.pictureUri}
          currentImageUrl={state.data?.pictureUri}
          placeholder='Link zum City Tool Bild hier einfügen'
          imageHeading='Vorschau:'
          imageAlt='Kein City Tool Bild vorhanden'
          removeButtonText='City Tool Bild entfernen'
          errors={state.errors?.pictureUri}
        />
      </div>

      <div>
        <fieldset className='space-y-2'>
          <legend className='text-sm font-medium'>Kategorien</legend>

          <div className='grid gap-2 sm:grid-cols-2'>
            {CITYTOOL_CATEGORY_ORDER.map((id) => {
              const inputId = `${name}-${id}`;

              return (
                <div key={id} className='flex items-center gap-2'>
                  <Checkbox
                    id={inputId}
                    name={FORM_NAMES.categories}
                    value={id}
                    defaultChecked={state.data?.categories?.includes(id)}
                  />
                  <Label htmlFor={inputId}>
                    {CITYTOOL_CATEGORY_LABELS[id]}
                  </Label>
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>

      <Separator />

      <div>
        <Label htmlFor={FORM_NAMES.imageRegistry} className='block mb-2'>
          Image Registry*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.imageRegistry}
          name={FORM_NAMES.imageRegistry}
          placeholder='ghcr.io'
          required
          errors={state.errors?.imageRegistry}
          defaultValue={state.data?.config?.imageRegistry}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.imageRepository} className='block mb-2'>
          Image Repository*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.imageRepository}
          name={FORM_NAMES.imageRepository}
          placeholder='myorg/myproject'
          required
          errors={state.errors?.imageRepository}
          defaultValue={state.data?.config?.imageRepository}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.imageDigest} className='block mb-2'>
          Image Digest*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.imageDigest}
          name={FORM_NAMES.imageDigest}
          placeholder='sha512:1276172361872361, [a-f0-9]{64}'
          required
          errors={state.errors?.imageDigest}
          defaultValue={state.data?.config?.imageDigest}
        />
      </div>

      <Separator />

      <div>
        <Label htmlFor={FORM_NAMES.username} className='block mb-2'>
          Username
        </Label>
        <UdpTextInput
          id={FORM_NAMES.username}
          name={FORM_NAMES.username}
          errors={state.errors?.username}
          defaultValue={state.data?.config?.username}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.password} className='block mb-2'>
          Password
        </Label>
        <UdpTextInput
          id={FORM_NAMES.password}
          name={FORM_NAMES.password}
          type='password'
          errors={state.errors?.password}
        />
      </div>
    </div>
  );
};

export default EditForm;

export const internal = {
  FormHeader,
  FormInputs,
};
