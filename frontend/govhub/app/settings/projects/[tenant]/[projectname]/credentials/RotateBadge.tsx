'use client';

import React, { useActionState } from 'react';
import { ModalSizes, Tooltip } from 'flowbite-react';
import {
  IcRefresh,
  UdpBadge,
  UdpClientModal,
  UdpClientModalContentProps,
} from 'udp-ui/components';
import { SensorCredential } from '@/app/_lib/resource-api/project/credentials';
import { DynamicStringEnumKeysOf } from 'flowbite-react/types';
import {
  CreateCredentialState,
  RotateCredentialState,
} from '@/app/settings/projects/[tenant]/[projectname]/credentials/form';
import { rotateCredential } from '@/app/settings/projects/[tenant]/[projectname]/credentials/actions';
import { CredentialTestIds } from '@/app/settings/projects/[tenant]/[projectname]/credentials/testIds';
import RevealCredentialsModalContent from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/RevealCredentialsModalContent';
import RotateCredentialsModalContent from '@/app/settings/projects/[tenant]/[projectname]/credentials/_internal/RotateCredentialsModalContent';
import { useRouter } from 'next/navigation';

type ModalData = {
  readonly title: string;
  readonly size: DynamicStringEnumKeysOf<ModalSizes>;
  readonly content: React.FC<UdpClientModalContentProps>;
};

const mkRotateModalData = (
  credential: SensorCredential,
  formAction: (data: FormData) => void,
  isLoading: boolean,
  errors: CreateCredentialState['errors'],
) =>
  ({
    title: 'Sensor Credentials rotieren',
    size: 'md',
    content: (contentProps) => (
      <RotateCredentialsModalContent
        credentialName={credential.name}
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

const RotateBadge = ({
  tenant,
  project,
  credential,
}: {
  tenant: string;
  project: string;
  credential: SensorCredential;
  setPopoverOpen?: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [state, formAction, isLoading] = useActionState<
    RotateCredentialState,
    FormData | null
  >(
    (_, formData) =>
      formData ? rotateCredential(tenant, project, credential.name) : {},
    {},
  );
  const resetForm = () => formAction(null);

  const modalData = state.data
    ? mkRevealModalData(state.data.username, state.data.password)
    : mkRotateModalData(credential, formAction, isLoading, state.errors);
  return (
    <UdpClientModal
      title={modalData.title}
      size={modalData.size}
      content={modalData.content}
      onClose={() => router.refresh()}
    >
      <div data-testid={CredentialTestIds.rotateBadge}>
        <Tooltip content='Credentials rotieren' className='text-nowrap'>
          <UdpBadge square onClick={resetForm}>
            <IcRefresh className='size-4' />
          </UdpBadge>
        </Tooltip>
      </div>
    </UdpClientModal>
  );
};

export default RotateBadge;
