'use client';

import React, { RefObject, useActionState } from 'react';
import { HelperText, Select } from 'flowbite-react';
import {
  IcShareAll,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import Form from 'next/form';
import { addProjectPermission } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/actions';
import { capitalize } from 'udp-ui/string';
import { VizGroupShareTestIds as TestIds } from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/testIds';
import { VizGroup } from '@/app/_lib/resource-api/viz-groups/vizGroups';
import {
  FORM_ADD_NAMES,
  ShareProjectWithGroupState,
} from '@/app/settings/projects/[tenant]/[projectname]/shared-dashboard-groups/form';

type ErrorMsgProps = {
  errors?: string[];
};

type ShareProjectModalProps = {
  tenant: string;
  project: string;
  groups: VizGroup[];
};

const VizGroupShareButton = (props: ShareProjectModalProps) => (
  <UdpClientModal
    title='Projekt für Dashboardgruppe freigeben'
    size='lg'
    content={(contentProps: UdpClientModalContentProps) => (
      <VizGroupShareForm {...props} {...contentProps} />
    )}
  >
    <UdpButton icon={IcShareAll}>Freigeben</UdpButton>
  </UdpClientModal>
);

export default VizGroupShareButton;

/* c8 ignore start */
const VizGroupShareForm = ({
  tenant,
  project,
  groups,
  initialFocusRef,
  closeModal,
}: ShareProjectModalProps & UdpClientModalContentProps) => {
  const handleSuccess = (st: ShareProjectWithGroupState) => {
    closeModal();
    UdpToast('Berechtigung erfolgreich erteilt', 'success')();
    return st;
  };
  const handleError = (st: ShareProjectWithGroupState) => {
    UdpToast('Berechtigung konnte nicht erteilt werden', 'error')();
    return st;
  };
  const [state, formAction, isLoading] = useActionState(
    (st: Awaited<ShareProjectWithGroupState>, formData: FormData) =>
      addProjectPermission(tenant, project, st, formData)
        .then((st: ShareProjectWithGroupState) => {
          if (st.data) return handleSuccess(st);
          if (st.errors) return handleError(st);
          return st;
        })
        .catch(handleError),
    {},
  );

  return (
    <Form action={formAction}>
      <FormContent
        project={project}
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
  Pick<ShareProjectModalProps, 'project' | 'groups'> &
  Pick<ShareProjectWithGroupState, 'errors'>;

const FormContent = ({
  project,
  groups,
  isLoading,
  errors,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-4'>
      <p>Projekt {`"${capitalize(project)}"`} freigeben</p>
      <GroupSelect
        groups={groups}
        errors={errors?.groupName}
        initialFocusRef={initialFocusRef}
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
  Pick<ShareProjectModalProps, 'groups'> &
  Pick<UdpClientModalContentProps, 'initialFocusRef'>;

const GroupSelect = ({ groups, errors, initialFocusRef }: GroupSelectProps) => (
  <div data-testid={TestIds.vizGroupSelect}>
    <Select
      name={FORM_ADD_NAMES.group}
      required
      color={errors ? 'failure' : 'gray'}
      ref={initialFocusRef as RefObject<HTMLSelectElement>}
    >
      <ErrorContainer errors={errors} />
      {groups.map((p) => (
        <option key={`${p.name}-${p.tenant}`} value={JSON.stringify(p)}>
          {p.name} ({p.tenant})
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
