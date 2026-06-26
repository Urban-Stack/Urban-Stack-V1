'use client';

import React, { RefObject, useActionState } from 'react';
import { HelperText, Select } from 'flowbite-react';
import {
  IcShareAll,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpRadioButtonGroup,
} from 'udp-ui/components';
import Form from 'next/form';
import { addUserGroupPermission } from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/actions';
import {
  FORM_ADD_NAMES,
  LABEL_BY_PERMISSION,
  LABEL_TO_PERMISSION,
  ShareGroupWithGroupState,
} from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/form';
import { capitalize } from 'udp-ui/string';
import { UserGroupShareTestIds as TestIds } from '@/app/settings/usergroups/[tenant]/[groupname]/shared-user-groups/testIds';

export type Group = { name: string; tenant: string };

type ShareGroupModalProps = {
  tenant: string;
  groupName: string;
  groups: Group[];
};

const UserGroupShareButton = (props: ShareGroupModalProps) => (
  <UdpClientModal
    title='Benutzergruppe für andere Benutzergruppe freigeben'
    size='lg'
    content={(contentProps: UdpClientModalContentProps) => (
      <UserGroupShareForm {...props} {...contentProps} />
    )}
  >
    <UdpButton icon={IcShareAll}>Freigeben</UdpButton>
  </UdpClientModal>
);

export default UserGroupShareButton;

/* c8 ignore start */
const UserGroupShareForm = ({
  tenant,
  groupName,
  groups,
  initialFocusRef,
  closeModal,
}: ShareGroupModalProps & UdpClientModalContentProps) => {
  const closeOnSuccess = (st: ShareGroupWithGroupState) => {
    if (st.data) closeModal();
    return st;
  };
  const [state, formAction, isLoading] = useActionState(
    (st: Awaited<ShareGroupWithGroupState>, formData: FormData) =>
      addUserGroupPermission(tenant, groupName, st, formData).then(
        closeOnSuccess,
      ),
    {},
  );

  return (
    <Form action={formAction}>
      <FormContent
        groupName={groupName}
        groups={groups}
        isLoading={isLoading}
        errors={state.errors}
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
  Pick<ShareGroupModalProps, 'groupName' | 'groups'> &
  Pick<ShareGroupWithGroupState, 'errors'>;

const FormContent = ({
  groupName,
  groups,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Benutzergruppe {`"${capitalize(groupName)}"`} freigeben</p>
      <GroupSelect
        groups={groups}
        errors={errors?.groupName}
        initialFocusRef={initialFocusRef}
      />
      <UdpRadioButtonGroup
        groupName={FORM_ADD_NAMES.permission}
        optionsData={LABEL_TO_PERMISSION}
        labelChecked={LABEL_BY_PERMISSION['read']}
        errors={errors?.permission}
        className='ml-4'
        data-testid={TestIds.permRadioButtonGroup}
      />
      <ErrorContainer
        errors={errors?.general}
        data-testid={TestIds.errorContainer}
      />
    </div>
    <ButtonGroup isLoading={isLoading} closeModal={closeModal} />
  </div>
);

type GroupSelectProps = ErrorContainerProps &
  Pick<ShareGroupModalProps, 'groups'> &
  Pick<UdpClientModalContentProps, 'initialFocusRef'>;

const GroupSelect = ({ groups, errors, initialFocusRef }: GroupSelectProps) => (
  <div data-testid={TestIds.userGroupSelect}>
    <Select
      name={FORM_ADD_NAMES.group}
      required
      color={errors ? 'failure' : 'gray'}
      ref={initialFocusRef as RefObject<HTMLSelectElement>}
    >
      <ErrorContainer errors={errors} />
      {groups.map((g) => (
        <option key={`${g.name}-${g.tenant}`} value={JSON.stringify(g)}>
          {g.name} ({g.tenant})
        </option>
      ))}
    </Select>
  </div>
);

type ErrorContainerProps = {
  errors?: string[];
};

const ErrorContainer = ({ errors, ...restProps }: ErrorContainerProps) =>
  errors && (
    <HelperText
      color='failure'
      className='text-danger-500 text-sm'
      {...restProps}
    >
      {errors?.map((error) => (
        <span key={error}>
          {error}
          <br />
        </span>
      ))}
    </HelperText>
  );

type ButtonGroupProps = {
  isLoading: boolean;
} & Pick<UdpClientModalContentProps, 'closeModal'>;

const ButtonGroup = ({ isLoading, closeModal }: ButtonGroupProps) => (
  <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
    <UdpButton type='submit' loading={isLoading}>
      Freigeben
    </UdpButton>
    <UdpButton color='tertiary' onClick={closeModal}>
      Abbrechen
    </UdpButton>
  </div>
);

export const _internal = {
  FormContent,
};
