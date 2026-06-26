'use client';

import React, { RefObject, useActionState, useEffect } from 'react';
import Form from 'next/form';
import {
  IcPlus,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpTextInput,
} from 'udp-ui/components';
import { CreateProjectState, FORM_NAMES } from '@/app/settings/projects/form';
import { createProject } from '@/app/settings/projects/actions';

const CreateProjectButton = () => (
  <UdpClientModal title='Neues Projekt' content={CreateProjectForm} size='lg'>
    <UdpButton icon={IcPlus} className='w-full'>
      Neues Projekt
    </UdpButton>
  </UdpClientModal>
);

export default CreateProjectButton;

/* c8 ignore start */
const CreateProjectForm = ({
  initialFocusRef,
  closeModal,
}: UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(createProject, {});

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        errors={state.errors}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
        isLoading={isLoading}
      />
    </Form>
  );
};
/* c8 ignore stop */

type FormContentProps = {
  isLoading: boolean;
} & UdpClientModalContentProps &
  Pick<CreateProjectState, 'errors'>;

const FormContent = ({
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Wie möchten Sie Ihr Projekt nennen?</p>
      <UdpTextInput
        name={FORM_NAMES.projectName}
        placeholder='Unbenanntes Projekt'
        ref={initialFocusRef as RefObject<HTMLInputElement>}
        required
        errors={errors?.name}
      />
    </div>
    <ButtonGroup isLoading={isLoading} closeModal={closeModal} />
  </div>
);

type ButtonGroupProps = {
  isLoading: boolean;
} & Pick<UdpClientModalContentProps, 'closeModal'>;

const ButtonGroup = ({ isLoading, closeModal }: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton loading={isLoading} type='submit'>
      Projekt erstellen
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
