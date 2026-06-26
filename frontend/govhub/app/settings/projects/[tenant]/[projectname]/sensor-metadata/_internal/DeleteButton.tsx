'use client';

import { useActionState, useEffect } from 'react';
import { deleteSensorMetadata } from './actions';
import { createTheme, Tooltip } from 'flowbite-react';
import {
  IcTrash,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import { MetadataCardTestIds } from '@/app/settings/projects/[tenant]/[projectname]/sensor-metadata/_internal/testIds';
import Form from 'next/form';
import { ActionState } from '@/app/_lib/form/actionstate';
import { useRouter } from 'next/navigation';
import { cond } from 'lodash';

const DeleteButton = ({
  tenant,
  project,
}: {
  tenant: string;
  project: string;
}) => (
  <UdpClientModal
    title='Meta-Daten löschen?'
    content={(props) => (
      <ModalForm tenant={tenant} project={project} {...props} />
    )}
    size='xl'
  >
    <div>
      <Tooltip
        content='Meta-Daten löschen'
        placement='bottom'
        className='grow'
        theme={createTheme({ base: 'max-w-96', target: 'flex' })}
      >
        <UdpButton
          color='danger'
          icon={IcTrash}
          data-testid={MetadataCardTestIds.deleteButton}
        />
      </Tooltip>
    </div>
  </UdpClientModal>
);

/* c8 ignore start */
const ModalForm = ({
  tenant,
  project,
  initialFocusRef,
  closeModal,
}: {
  tenant: string;
  project: string;
} & UdpClientModalContentProps) => {
  const [state, formAction, isLoading] = useActionState(
    deleteSensorMetadata.bind(null, tenant, project),
    { isInitial: true },
  );
  return (
    <Form action={formAction}>
      <FormContent
        state={state}
        isLoading={isLoading}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};
/* c8 ignore stop */

const FormContent = ({
  state,
  isLoading,
  initialFocusRef,
  closeModal,
}: {
  state: ActionState;
  isLoading: boolean;
} & UdpClientModalContentProps) => {
  const router = useRouter();

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Metadaten konnten nicht gelöscht werden.\n${state.errors?.general?.join('\n') ?? ''}`,
      'error',
    );
    const successToast = UdpToast(
      'Metadaten wurden erfolgreich gelöscht.',
      'success',
    );
    cond([
      [() => !!state.errors, errorToast],
      [() => !!state.data && !state.errors, successToast],
    ])();
    router.refresh();
  }, [state, router]);

  return (
    <div className='flex flex-col gap-6'>
      <p>Möchten sie die Sensor-Meta-Daten dieses Projekts wirklich löschen?</p>
      <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
        <UdpButton color='danger' loading={isLoading} type='submit'>
          Meta-Daten löschen
        </UdpButton>
        <UdpButton ref={initialFocusRef} color='tertiary' onClick={closeModal}>
          Abbrechen
        </UdpButton>
      </div>
    </div>
  );
};

export default DeleteButton;

export const internal = {
  FormContent,
};
