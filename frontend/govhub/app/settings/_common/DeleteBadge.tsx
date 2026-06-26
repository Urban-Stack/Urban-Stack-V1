'use client';

import React, { useActionState, useEffect } from 'react';
import { Tooltip } from 'flowbite-react';
import {
  UdpBadge,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
} from 'udp-ui/components';
import Form from 'next/form';
import { SettingsTestIds } from '@/app/settings/_common/testIds';
import { ActionState } from '@/app/_lib/form/actionstate';

/**
 * Badge for initializing a delete process.
 * <p>
 * Clicking this badge first opens a popover for confirmation.
 *
 * @param tooltipText     tooltip text for this badge
 * @param title           title for the confirmation modal of this badge
 * @param description     description for the delete modal of this badge
 * @param errorsFromState function for mapping any errors to corresponding error messages
 * @param submitText      text for the submit button of the confirmation modal (defaults to 'Entfernen')
 * @param cancelText      text for the cancel button of the confirmation modal (defaults to 'Abbrechen')
 * @param onSubmit        form action to perform on submit
 * @param onResolved      callback function invoked if deletion has been resolved
 * @param onRejected      callback function invoked if deletion has been rejected
 * @param children        child components for this badge
 * @constructor
 */
const DeleteBadge = <T extends ActionState>({
  tooltipText,
  title,
  description,
  errorsFromState,
  submitText = 'Entfernen',
  cancelText = 'Abbrechen',
  onSubmit,
  onResolved,
  onRejected,
  children,
}: {
  tooltipText: string;
  title: string;
  description: string;
  errorsFromState: (state: T) => string[] | undefined;
  submitText?: string;
  cancelText?: string;
  onSubmit: (state: Awaited<T>) => Promise<T>;
  onResolved?: () => void;
  onRejected?: () => void;
  children?: React.ReactNode;
}) => (
  <UdpClientModal
    title={title}
    content={(modalContentProps) => (
      <ConfirmPopover<T>
        description={description}
        errorsFromState={errorsFromState}
        submitText={submitText}
        cancelText={cancelText}
        onSubmit={onSubmit}
        onResolved={onResolved}
        onRejected={onRejected}
        {...modalContentProps}
      />
    )}
  >
    <div data-testid={SettingsTestIds.deleteBadge}>
      <Tooltip content={tooltipText} className='text-nowrap'>
        <UdpBadge color='danger' square onClick={() => {}}>
          {children}
        </UdpBadge>
      </Tooltip>
    </div>
  </UdpClientModal>
);

const ConfirmPopover = <T extends ActionState>({
  description,
  errorsFromState,
  submitText,
  cancelText,
  onSubmit,
  onResolved,
  onRejected,
  initialFocusRef,
  closeModal,
}: {
  description: string;
  errorsFromState: (state: T) => string[] | undefined;
  submitText: string;
  cancelText: string;
  onSubmit: (state: Awaited<T>) => Promise<T>;
  onResolved?: () => void;
  onRejected?: () => void;
} & UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(
    (st: Awaited<T>) =>
      onSubmit(st)
        .then((s: T) => {
          if (!s.errors) onResolved?.();
          return s;
        })
        .catch((s: T) => {
          onRejected?.();
          return s;
        }),
    {} as Awaited<T>,
  );

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        description={description}
        submitText={submitText}
        cancelText={cancelText}
        errors={errorsFromState(state)}
        isLoading={isLoading}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};

type FormContentProps = {
  description: string;
  submitText: string;
  cancelText: string;
} & UdpClientModalContentProps;

const FormContent = ({
  description,
  submitText,
  cancelText,
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps & {
  errors?: string[];
  isLoading: boolean;
}) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>{description}</p>
      {errors && <ErrorContainer errors={errors} />}
    </div>
    <ButtonGroup
      submitText={submitText}
      isLoading={isLoading}
      cancelText={cancelText}
      initialFocusRef={initialFocusRef}
      closeModal={closeModal}
    />
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

type ButtonGroupProps = {
  submitText: string;
  isLoading: boolean;
  cancelText: string;
} & UdpClientModalContentProps;

const ButtonGroup = ({
  submitText,
  isLoading,
  cancelText,
  initialFocusRef,
  closeModal,
}: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton type='submit' color='danger' loading={isLoading}>
      {submitText}
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal} ref={initialFocusRef}>
      {cancelText}
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};

export default DeleteBadge;
