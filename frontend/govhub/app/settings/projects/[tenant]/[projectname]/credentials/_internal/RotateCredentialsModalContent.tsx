'use client';

import React, { RefObject } from 'react';
import { UdpButton, UdpClientModalContentProps } from 'udp-ui/components';
import Form from 'next/form';
import { RotateCredentialState } from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';

type FormContentProps = {
  credentialName: string;
  isLoading: boolean;
  errors?: RotateCredentialState['errors'];
} & UdpClientModalContentProps;

/* c8 ignore start */
const RotateCredentialsModalContent = ({
  credentialName,
  formAction,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: {
  formAction: (data: FormData) => void;
} & FormContentProps) => (
  <Form action={formAction} data-testid={CredentialTestIds.rotateModal}>
    <FormContent
      credentialName={credentialName}
      isLoading={isLoading}
      errors={errors}
      initialFocusRef={initialFocusRef}
      closeModal={closeModal}
    />
  </Form>
);
/* c8 ignore end */

const FormContent = ({
  credentialName,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <p>Sensor Credentials {`"${credentialName}"`} rotieren?</p>
    {errors?.general && <ErrorContainer errors={errors.general} />}
    <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
      <UdpButton
        type='submit'
        loading={isLoading}
        ref={initialFocusRef as RefObject<HTMLButtonElement>}
      >
        Rotieren
      </UdpButton>
      <UdpButton color='tertiary' onClick={closeModal}>
        Abbrechen
      </UdpButton>
    </div>
  </div>
);

const ErrorContainer = ({ errors }: { errors: string[] }) => (
  <div className='text-danger-500'>
    {errors.map((error) => (
      <span key={error}>
        {error}
        <br />
      </span>
    ))}
  </div>
);

export default RotateCredentialsModalContent;

export const _internal = {
  FormContent,
};
