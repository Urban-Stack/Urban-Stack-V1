'use client';

import React, { RefObject, useActionState, useEffect } from 'react';
import { HelperText, Select } from 'flowbite-react';
import {
  IcShareAll,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpRadioButtonGroup,
} from 'udp-ui/components';
import Form from 'next/form';
import {
  FORM_ADD_NAMES,
  LABEL_BY_PERMISSION,
  LABEL_TO_PERMISSION,
  ShareVizGroupWithUserGroupState,
} from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/form';
import { capitalize } from 'udp-ui/string';
import { UserGroupShareButtonTestIds as TestIds } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/testIds';
import { addVizGroupPermission } from '@/app/settings/dashboardgroups/[tenant]/[vizgroup]/shared-user-groups/actions';

export type UserGroup = { name: string; tenant: string };

type ErrorMsgProps = {
  errors?: string[];
};

type ShareVizGroupPopoverProps = {
  tenant: string;
  vizGroup: string;
  userGroups: UserGroup[];
};

const UserGroupShareButton = (props: ShareVizGroupPopoverProps) => (
  <UdpClientModal
    title='Dashboardgruppe für Benutzergruppe freigeben'
    size='lg'
    content={(modalContentProps: UdpClientModalContentProps) => (
      <UserGroupSharePopover {...props} {...modalContentProps} />
    )}
  >
    <UdpButton icon={IcShareAll}>Freigeben</UdpButton>
  </UdpClientModal>
);

export default UserGroupShareButton;

/* c8 ignore start */
const UserGroupSharePopover = ({
  tenant,
  vizGroup,
  userGroups,
  initialFocusRef,
  closeModal,
}: ShareVizGroupPopoverProps & UdpClientModalContentProps) => {
  const closeOnSuccess = (st: ShareVizGroupWithUserGroupState) => {
    if (st.data) closeModal();
    return st;
  };
  const [state, formAction, isLoading] = useActionState(
    (st: ShareVizGroupWithUserGroupState, formData: FormData) =>
      addVizGroupPermission(tenant, vizGroup, st, formData).then(
        closeOnSuccess,
      ),
    {},
  );

  useEffect(() => {
    if (state.data) closeModal();
  }, [state, closeModal]);

  return (
    <Form action={formAction}>
      <FormContent
        vizGroup={vizGroup}
        userGroups={userGroups}
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
  Pick<ShareVizGroupPopoverProps, 'vizGroup' | 'userGroups'> &
  Pick<ShareVizGroupWithUserGroupState, 'errors'>;

const FormContent = ({
  vizGroup,
  userGroups,
  errors,
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Dashboardgruppe {`"${capitalize(vizGroup)}"`} freigeben</p>
      <GroupSelect
        userGroups={userGroups}
        errors={errors?.userGroupName}
        initialFocusRef={initialFocusRef}
      />
      <UdpRadioButtonGroup
        groupName={FORM_ADD_NAMES.permission}
        optionsData={LABEL_TO_PERMISSION}
        labelChecked={LABEL_BY_PERMISSION['read']}
        errors={errors?.permission}
        className={'ml-4'}
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

type GroupSelectProps = ErrorMsgProps &
  Pick<ShareVizGroupPopoverProps, 'userGroups'> &
  Pick<UdpClientModalContentProps, 'initialFocusRef'>;

const GroupSelect = ({
  userGroups,
  errors,
  initialFocusRef,
}: GroupSelectProps) => (
  <div data-testid={TestIds.userGroupSelect}>
    <Select
      name={FORM_ADD_NAMES.group}
      required
      color={errors ? 'failure' : 'gray'}
      ref={initialFocusRef as RefObject<HTMLSelectElement>}
    >
      <ErrorContainer errors={errors} />
      {userGroups.map((group) => (
        <option
          key={`${group.name}-${group.tenant}`}
          value={JSON.stringify(group)}
        >
          {group.name} ({group.tenant})
        </option>
      ))}
    </Select>
  </div>
);

const ErrorContainer = ({ errors, ...restProps }: ErrorMsgProps) =>
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
    <UdpButton loading={isLoading} type='submit'>
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
