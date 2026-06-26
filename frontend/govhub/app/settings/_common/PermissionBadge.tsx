'use client';

import React, { RefObject, useActionState, useEffect } from 'react';
import { Tooltip } from 'flowbite-react';
import {
  UdpBadge,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpRadioButtonGroup,
} from 'udp-ui/components';
import Form from 'next/form';
import { ActionState } from '@/app/_lib/form/actionstate';
import { SettingsTestIds } from '@/app/settings/_common/testIds';

/**
 * Badge for editing a permission.
 * <p>
 * Clicking this badge opens a modal for selecting one of the given permissions.
 *
 * @param tooltipText          tooltip text for this badge (defaults to 'Berechtigung ändern')
 * @param title                title for the edit modal of this badge (defaults to 'Berechtigung ändern')
 * @param description          description for the edit modal of this badge
 * @param radioButtonGroupName name of the permission radio button group
 * @param labelToPermission    record of the labels and permissions for the individual radio buttons
 * @param labelChecked         label of the radio button initially selected
 * @param errorsFromState      function for mapping any general errors to corresponding error messages
 * @param permErrorsFromState  function for mapping any permission errors to corresponding error messages
 * @param submitText           text for the submit button of the edit modal (defaults to 'Speichern')
 * @param cancelText           text for the cancel button of the edit modal (defaults to 'Abbrechen')
 * @param onSubmit             form action to perform on submit
 * @constructor
 */
const PermissionBadge = <P extends string, T extends ActionState>({
  tooltipText = 'Berechtigung ändern',
  title = 'Berechtigung ändern',
  description,
  radioButtonGroupName,
  labelToPermission,
  labelChecked,
  errorsFromState,
  permErrorsFromState,
  submitText = 'Speichern',
  cancelText = 'Abbrechen',
  onSubmit,
}: {
  tooltipText?: string;
  title?: string;
  description: string;
  radioButtonGroupName: string;
  labelToPermission: Record<string, P>;
  labelChecked: string;
  errorsFromState: (state: T) => string[] | undefined;
  permErrorsFromState: (state: T) => string[] | undefined;
  submitText?: string;
  cancelText?: string;
  onSubmit: (_prevState: Awaited<T>, formData: FormData) => Promise<T>;
}) => (
  <UdpClientModal
    title={title}
    size='lg'
    content={(modalContentProps) => (
      <EditForm<P, T>
        description={description}
        radioButtonGroupName={radioButtonGroupName}
        labelToPermission={labelToPermission}
        labelChecked={labelChecked}
        errorsFromState={errorsFromState}
        permErrorsFromState={permErrorsFromState}
        submitText={submitText}
        cancelText={cancelText}
        onSubmit={onSubmit}
        {...modalContentProps}
      />
    )}
  >
    <div data-testid={SettingsTestIds.permBadge}>
      <Tooltip content={tooltipText} className='text-nowrap'>
        <UdpBadge onClick={() => {}}>{labelChecked}</UdpBadge>
      </Tooltip>
    </div>
  </UdpClientModal>
);

type EditFormProps<P extends string, T extends ActionState> = {
  errorsFromState: (state: T) => string[] | undefined;
  permErrorsFromState: (state: T) => string[] | undefined;
  onSubmit: (_prevState: Awaited<T>, formData: FormData) => Promise<T>;
} & FormContentProps<P>;

const EditForm = <P extends string, T extends ActionState>({
  description,
  radioButtonGroupName,
  labelToPermission,
  labelChecked,
  errorsFromState,
  permErrorsFromState,
  submitText,
  cancelText,
  onSubmit,
  initialFocusRef,
  closeModal,
}: EditFormProps<P, T>) => {
  const closeOnSuccess = (st: T) => {
    if (st.data) closeModal();
    return st;
  };
  const [state, formAction, isLoading] = useActionState<T, FormData>(
    (st, formData) => onSubmit(st, formData).then(closeOnSuccess),
    {} as Awaited<T>,
  );

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        description={description}
        radioButtonGroupName={radioButtonGroupName}
        labelToPermission={labelToPermission}
        labelChecked={labelChecked}
        errors={errorsFromState(state)}
        permErrors={permErrorsFromState(state)}
        submitText={submitText}
        isLoading={isLoading}
        cancelText={cancelText}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};

type FormContentProps<P extends string> = {
  description: string;
  radioButtonGroupName: string;
  labelToPermission: Record<string, P>;
  labelChecked: string;
  submitText: string;
  cancelText: string;
} & UdpClientModalContentProps;

const FormContent = <P extends string>({
  description,
  radioButtonGroupName,
  labelToPermission,
  labelChecked,
  errors,
  permErrors,
  submitText,
  isLoading,
  cancelText,
  initialFocusRef,
  closeModal,
}: FormContentProps<P> & {
  errors?: string[];
  permErrors?: string[];
  isLoading: boolean;
}) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>{description}</p>
      <UdpRadioButtonGroup
        groupName={radioButtonGroupName}
        optionsData={labelToPermission}
        labelChecked={labelChecked}
        errors={permErrors}
        className={'ml-4'}
        data-testid={SettingsTestIds.permRadioButtonGroup}
        ref={initialFocusRef as RefObject<HTMLInputElement>}
      />
      {errors && <ErrorContainer errors={errors} />}
    </div>
    <ButtonGroup
      submitText={submitText}
      isLoading={isLoading}
      cancelText={cancelText}
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
} & Pick<UdpClientModalContentProps, 'closeModal'>;

const ButtonGroup = ({
  submitText,
  isLoading,
  cancelText,
  closeModal,
}: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton type='submit' loading={isLoading}>
      {submitText}
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      {cancelText}
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};

export default PermissionBadge;
