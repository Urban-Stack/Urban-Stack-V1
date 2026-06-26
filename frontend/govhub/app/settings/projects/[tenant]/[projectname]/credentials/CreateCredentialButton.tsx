'use client';

import React, { useActionState } from 'react';
import { ModalSizes } from 'flowbite-react';
import {
  IcPlus,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
} from 'udp-ui/components';
import { createCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import { CreateCredentialState } from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { DynamicStringEnumKeysOf } from 'flowbite-react/types';
import CreateCredentialsModalContent from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/CreateCredentialsModalContent';
import RevealCredentialsModalContent from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/RevealCredentialsModalContent';

type ModalData = {
  readonly title: string;
  readonly size: DynamicStringEnumKeysOf<ModalSizes>;
  readonly content: React.FC<UdpClientModalContentProps>;
};

const mkCreateModalData = (
  formAction: (data: FormData) => void,
  isLoading: boolean,
  errors: CreateCredentialState['errors'],
) =>
  ({
    title: 'Neue Credentials erstellen',
    size: 'lg',
    content: (contentProps) => (
      <CreateCredentialsModalContent
        formAction={formAction}
        isLoading={isLoading}
        errors={errors}
        {...contentProps}
      />
    ),
  }) as ModalData;

const mkRevealModalData = (username: string, password: string) =>
  ({
    title: 'Ihre neuen Sensor Credentials',
    size: '2xl',
    content: (contentProps) => (
      <RevealCredentialsModalContent
        username={username}
        password={password}
        {...contentProps}
      />
    ),
  }) as ModalData;

const CreateCredentialButton = ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => {
  const [state, formAction, isLoading] = useActionState<
    CreateCredentialState,
    FormData | null
  >(
    (state, formData) =>
      formData ? createCredential(tenant, project, state, formData) : {},
    {},
  );
  const resetForm = () => formAction(null);

  const modalData = state.data
    ? mkRevealModalData(state.data.username, state.data.password)
    : mkCreateModalData(formAction, isLoading, state.errors);
  return (
    <UdpClientModal
      title={modalData.title}
      size={modalData.size}
      content={modalData.content}
    >
      <UdpButton icon={IcPlus} onClick={resetForm}>
        Neue Credentials
      </UdpButton>
    </UdpClientModal>
  );
};

export default CreateCredentialButton;
