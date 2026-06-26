'use client';

import Form from 'next/form';
import React, { useActionState, useEffect } from 'react';
import { Label } from 'flowbite-react';
import {
  IcEnvelope,
  UdpButton,
  UdpTextArea,
  UdpTextInput,
  UdpToast,
} from 'udp-ui/components';
import { FORM_NAMES, HelpDeskState } from './_internal/form';
import { submitRequest } from '@/app/helpdesk/_internal/actions';
import { cond } from 'lodash';

/* c8 ignore start */
const HelpDeskForm = () => {
  const [state, formAction, isLoading] = useActionState(submitRequest, {
    isInitial: true,
  });
  return (
    <Form action={formAction}>
      <FormContent state={state} isLoading={isLoading} />
    </Form>
  );
};
/* c8 ignore start */

const FormContent = ({
  state,
  isLoading,
}: {
  state: HelpDeskState;
  isLoading: boolean;
}) => {
  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Es ist ein Fehler aufgetreten.\n${state.errors?.general?.join('\n')}`,
      'error',
    );
    const successToast = UdpToast(
      'Ihre Anfrage wurde erfolgreich übermittelt.',
      'success',
    );

    cond([
      [() => !!state.errors?.general, errorToast],
      [() => !!state.data && !state.errors, successToast],
    ])();
  }, [state]);

  return (
    <div className='max-w-[556px] flex flex-col gap-6'>
      <div>
        <h2 className='font-bold mb-2'>Wobei können wir Ihnen helfen?</h2>
        <p>Bitte beschreiben Sie Ihr Anliegen.</p>
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.reason} className='block mb-2'>
          Grund*
        </Label>
        <UdpTextInput
          id={FORM_NAMES.reason}
          name={FORM_NAMES.reason}
          required
          errors={state.errors?.reason}
          defaultValue={state.data?.reason}
        />
      </div>
      <div>
        <Label htmlFor={FORM_NAMES.description} className='block mb-2'>
          Beschreibung*{' '}
          <span className='text-gray-300 font-normal'>(max. 1024 Zeichen)</span>
        </Label>
        <UdpTextArea
          id={FORM_NAMES.description}
          name={FORM_NAMES.description}
          rows={10}
          className='resize-none'
          maxLength={1024}
          required
          errors={state.errors?.description}
          defaultValue={state.data?.description}
        />
      </div>
      <div>
        <UdpButton type='submit' icon={IcEnvelope} loading={isLoading}>
          Senden
        </UdpButton>
      </div>
    </div>
  );
};

export default HelpDeskForm;

export const internal = {
  FormContent,
};
