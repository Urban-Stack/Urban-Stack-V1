'use client';

import React, { useActionState, useEffect } from 'react';
import { Tooltip } from 'flowbite-react';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import {
  IcTrash,
  UdpBadge,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import Form from 'next/form';
import { deleteS3Object } from './actions';
import { ActionState } from '@/app/_lib/form/actionstate';

type FormContentProps = {
  tenant: string;
  project: string;
  objectKey: string;
  bucket: string;
  dataset?: string;
};

const DeleteBadge = (formProps: FormContentProps) => (
  <UdpClientModal
    title='Datei löschen'
    size='xl'
    content={(contentProps) => (
      <PopoverContent {...formProps} {...contentProps} />
    )}
  >
    <div data-testid={SettingsTestIds.deleteBadge}>
      <Tooltip content='Datei löschen' className='text-nowrap'>
        <UdpBadge
          color='danger'
          square
          className='cursor-pointer'
          onClick={() => {}}
        >
          <IcTrash className='size-4' />
        </UdpBadge>
      </Tooltip>
    </div>
  </UdpClientModal>
);

const PopoverContent = ({
  tenant,
  project,
  objectKey,
  bucket,
  dataset,
  initialFocusRef,
  closeModal,
}: FormContentProps & UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(
    deleteS3Object.bind(null, tenant, project, bucket, objectKey, dataset),
    { isInitial: true },
  );

  return (
    <Form action={formAction}>
      <FormContent
        state={state}
        isLoading={isLoading}
        objectKey={objectKey}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};

const FormContent = ({
  state,
  objectKey,
  isLoading,
  initialFocusRef,
  closeModal,
}: {
  state: ActionState;
  objectKey: string;
  isLoading: boolean;
} & UdpClientModalContentProps) => {
  useEffect(() => {
    if (state.isInitial) return;

    const success = UdpToast(
      `Datei "${objectKey}" erfolgreich gelöscht.`,
      'success',
    );
    const error = UdpToast(
      `Datei "${objectKey}" konnte nicht gelöscht werden.`,
      'error',
    );

    (() => {
      if (state.data) success();
      else if (state.errors) error();
    })();
  }, [state, objectKey]);
  return (
    <div className='flex flex-col gap-6'>
      <p>Datei &quot;{objectKey}&quot; wirklich löschen?</p>
      <div className='flex flex-col text-wrap gap-2 p-4 rounded-lg bg-yellow-100 text-yellow-700'>
        <p>
          Alle Dashboards, die auf diese Datei zugreifen, werden durch das
          Löschen beschädigt oder funktionieren nicht mehr richtig! Bitte
          überprüfen Sie, ob diese Datei für Dashboards verwendet wird!
        </p>
        <p>
          Die Datei wird nach dem Löschen auch für andere Personen nicht mehr
          zur Verfügung stehen!
        </p>
      </div>
      <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
        <UdpButton
          icon={IcTrash}
          type='submit'
          loading={isLoading}
          color='danger'
        >
          Datei löschen
        </UdpButton>
        <UdpButton color='tertiary' ref={initialFocusRef} onClick={closeModal}>
          Abbrechen
        </UdpButton>
      </div>
    </div>
  );
};

export const internal = {
  FormContent,
  PopoverContent,
};

export default DeleteBadge;
