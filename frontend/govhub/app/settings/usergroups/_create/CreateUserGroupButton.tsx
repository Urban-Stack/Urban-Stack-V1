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
import {
  CreateUserGroupState,
  FORM_NAMES,
} from '@/app/settings/usergroups/form';
import { createUserGroup } from '@/app/settings/usergroups/actions';

const CreateUserGroupButton = () => (
  <UdpClientModal
    title='Neue Benutzergruppe'
    content={CreateUserGroupForm}
    size='lg'
  >
    <UdpButton icon={IcPlus} className='w-full'>
      Neue Benutzergruppe
    </UdpButton>
  </UdpClientModal>
);

export default CreateUserGroupButton;

/* c8 ignore start */
const CreateUserGroupForm = ({
  initialFocusRef,
  closeModal,
}: UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(createUserGroup, {});

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        errors={state.errors}
        isLoading={isLoading}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};
/* c8 ignore stop */

type FormContentProps = {
  isLoading: boolean;
} & UdpClientModalContentProps &
  Pick<CreateUserGroupState, 'errors'>;

const FormContent = ({
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Wie möchten Sie Ihre Benutzergruppe nennen?</p>
      <UdpTextInput
        name={FORM_NAMES.userGroupName}
        placeholder='Unbenannte Benutzergruppe'
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
    <UdpButton type='submit' loading={isLoading}>
      Gruppe erstellen
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
