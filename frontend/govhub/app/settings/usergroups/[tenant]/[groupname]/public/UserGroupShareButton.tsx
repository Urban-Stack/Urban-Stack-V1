'use client';

import React, { useActionState, useEffect } from 'react';
import { HelperText } from 'flowbite-react';
import {
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
} from 'udp-ui/components';
import Form from 'next/form';
import { UserGroup } from '@/app/_lib/resource-api/usergroups/usergroups';
import {
  ShareUserGroupState,
  stateShareUserGroup,
} from '@/app/settings/usergroups/actions';
import { capitalize } from 'udp-ui/string';
import { PublicUserGroupTestIds as TestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/public/testIds';

interface UserGroupShareButtonProps {
  group: UserGroup;
}

const UserGroupShareButton = ({ group }: UserGroupShareButtonProps) => (
  <UdpClientModal
    title='Benutzergruppe teilen'
    content={(modalContentProps) => (
      <UserGroupShareForm group={group} {...modalContentProps} />
    )}
  >
    <UdpButton data-testid={TestIds.shareButton}>Teilen</UdpButton>
  </UdpClientModal>
);

export default UserGroupShareButton;

type UserGroupShareFormProps = {
  group: UserGroup;
} & UdpClientModalContentProps;

/* c8 ignore start */
const UserGroupShareForm = ({
  group,
  initialFocusRef,
  closeModal,
}: UserGroupShareFormProps) => {
  const [state, formAction, isLoading] = useActionState(
    stateShareUserGroup.bind(null, group),
    {},
  );

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        group={group}
        isLoading={isLoading}
        errors={state.errors}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};
/* c8 ignore stop */

type FormContentProps = UserGroupShareButtonProps &
  UdpClientModalContentProps &
  Pick<ShareUserGroupState, 'errors'> & {
    isLoading: boolean;
  };

const FormContent = ({
  group,
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <p>Benutzergruppe {`"${capitalize(group.name)}"`} teilen?</p>
    <ErrorContainer
      errors={errors?.general}
      data-testid={TestIds.errorContainer}
    />
    <ButtonGroup
      isLoading={isLoading}
      initialFocusRef={initialFocusRef}
      closeModal={closeModal}
    />
  </div>
);

const ErrorContainer = ({ errors, ...restProps }: { errors?: string[] }) =>
  errors && (
    <HelperText color='failure' className='text-red-700 text-sm' {...restProps}>
      {errors?.map((msg, idx) => (
        <span key={idx}>
          {msg}
          <br />
        </span>
      ))}
    </HelperText>
  );

type ButtonGroupProps = {
  isLoading: boolean;
} & UdpClientModalContentProps;

const ButtonGroup = ({
  isLoading,
  initialFocusRef,
  closeModal,
}: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton type='submit' ref={initialFocusRef} loading={isLoading}>
      Teilen
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
