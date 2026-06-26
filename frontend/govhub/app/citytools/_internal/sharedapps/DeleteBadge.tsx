import { createTheme, Tooltip } from 'flowbite-react';
import { useActionState, useEffect, useRef } from 'react';
import {
  IcTrash,
  UdpBadge,
  UdpButton,
  UdpCityToolCardTestIds,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import { deleteSharedApp } from './actions';
import Form from 'next/form';
import { ActionState } from '@/app/_lib/form/actionstate';
import { useRouter } from 'next/navigation';
import { cond } from 'lodash';

const DeleteBadge = ({
  tenant,
  name,
  displayName,
}: {
  tenant: string;
  name: string;
  displayName: string;
}) => (
  <UdpClientModal
    title={`Shared App löschen?`}
    content={(props) => (
      <ModalForm
        tenant={tenant}
        name={name}
        displayName={displayName}
        {...props}
      />
    )}
    size='xl'
  >
    <div>
      <Tooltip
        content='Shared App löschen'
        placement='bottom'
        className='grow'
        theme={createTheme({ base: 'max-w-96', target: 'flex' })}
      >
        <UdpBadge
          color='danger'
          className='cursor-pointer'
          square
          data-testid={UdpCityToolCardTestIds.removeBadge}
          onClick={() => {}}
        >
          <IcTrash className='size-4.5' />
        </UdpBadge>
      </Tooltip>
    </div>
  </UdpClientModal>
);

/* c8 ignore start */
const ModalForm = ({
  tenant,
  name,
  displayName,
  ...props
}: {
  tenant: string;
  name: string;
  displayName: string;
} & UdpClientModalContentProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [deleteState, deleteFormAction, deleteIsLoading] = useActionState(
    deleteSharedApp.bind(null, tenant, name),
    { isInitial: true },
  );
  return (
    <Form ref={formRef} action={deleteFormAction}>
      <FormContent
        state={deleteState}
        displayName={displayName}
        isLoading={deleteIsLoading}
        {...props}
      />
    </Form>
  );
};
/* c8 ignore stop */

const FormContent = ({
  state,
  displayName,
  isLoading,
  closeModal,
  initialFocusRef,
}: {
  state: ActionState;
  displayName: string;
  isLoading: boolean;
} & UdpClientModalContentProps) => {
  const router = useRouter();

  useEffect(() => {
    if (state.isInitial) return;

    const errorToast = UdpToast(
      `Shared App konnte nicht entfernt werden.\n${state.errors?.general?.join('\n') ?? ''}`,
      'error',
    );
    const successToast = UdpToast('Shared App wurde entfernt.', 'success');
    cond([
      [() => !!state.errors, errorToast],
      [() => !!state.data && !state.errors, successToast],
    ])();
    router.refresh();
  }, [state, router]);

  return (
    <div className='flex flex-col gap-6'>
      <p>
        Möchten sie die Shared App &quot;{displayName}&quot; wirklich löschen?
      </p>
      <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
        <UdpButton
          ref={initialFocusRef}
          color='danger'
          loading={isLoading}
          type='submit'
        >
          App löschen
        </UdpButton>
        <UdpButton color='tertiary' onClick={closeModal}>
          Abbrechen
        </UdpButton>
      </div>
    </div>
  );
};

export default DeleteBadge;

export const internal = {
  FormContent,
};
