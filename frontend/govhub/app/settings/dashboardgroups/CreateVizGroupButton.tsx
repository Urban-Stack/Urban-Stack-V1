'use client';

import { RefObject, useActionState, useEffect } from 'react';
import Form from 'next/form';
import {
  IcPlus,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpTextInput,
} from 'udp-ui/components';
import {
  CreateVizGroupState,
  FORM_NAMES,
} from '@/app/settings/dashboardgroups/form';
import { createVizGroup } from '@/app/settings/dashboardgroups/actions';

const CreateVizGroupButton = () => (
  <UdpClientModal
    title='Neue Dashboardgruppe'
    content={CreateVizGroupForm}
    size='lg'
  >
    <UdpButton icon={IcPlus}>Neue Dashboardgruppe</UdpButton>
  </UdpClientModal>
);

export default CreateVizGroupButton;

/* c8 ignore start */
const CreateVizGroupForm = ({
  initialFocusRef,
  closeModal,
}: UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(createVizGroup, {});

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
  Pick<CreateVizGroupState, 'errors'>;

const FormContent = ({
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className={'flex flex-col gap-4'}>
      <p>Wie möchten Sie Ihre Dashboardgruppe nennen?</p>
      <UdpTextInput
        name={FORM_NAMES.vizGroupName}
        placeholder='Unbenannte Dashboardgruppe'
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
      Dashboardgruppe erstellen
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
