'use client';

import React, { RefObject } from 'react';
import {
  UdpButton,
  UdpClientModalContentProps,
  UdpTextInput,
} from 'udp-ui/components';
import Form from 'next/form';
import {
  CreateCredentialState,
  FORM_NAMES,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';

type FormContentProps = {
  isLoading: boolean;
  errors?: CreateCredentialState['errors'];
} & UdpClientModalContentProps;

/* c8 ignore start */
const CreateCredentialsModalContent = ({
  formAction,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: {
  formAction: (data: FormData) => void;
} & FormContentProps) => (
  <Form action={formAction} data-testid={CredentialTestIds.createModal}>
    <FormContent
      isLoading={isLoading}
      errors={errors}
      initialFocusRef={initialFocusRef}
      closeModal={closeModal}
    />
  </Form>
);
/* c8 ignore end */

const FormContent = ({
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Möchten Sie jetzt neue Sensor Credentials erstellen?</p>
      <UdpTextInput
        name={FORM_NAMES.credentialName}
        placeholder='Name der Sensor Credentials'
        ref={initialFocusRef as RefObject<HTMLInputElement>}
        required
        type='text'
        color={errors ? 'failure' : 'gray'}
        errors={errors?.name}
      />
    </div>
    <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
      <UdpButton type='submit' loading={isLoading}>
        Credentials erstellen
      </UdpButton>
      <UdpButton color='tertiary' onClick={closeModal}>
        Abbrechen
      </UdpButton>
    </div>
  </div>
);

export default CreateCredentialsModalContent;

export const _internal = {
  FormContent,
};
