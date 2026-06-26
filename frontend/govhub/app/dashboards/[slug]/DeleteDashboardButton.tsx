'use client';

import React, { forwardRef, useActionState, useState } from 'react';
import { deleteDashboard } from '@/app/_lib/superset/actions';
import {
  IcTrash,
  UdpButton,
  UdpClientModal,
  UdpClientModalContentProps,
  UdpToast,
} from 'udp-ui/components';
import { Tooltip } from 'flowbite-react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { DashboardId } from '@/app/_lib/superset/util';
import { DashboardTestIds } from '@/app/dashboards/[slug]/testIds';
import Form from 'next/form';
import { DeleteDashboardState } from '@/app/_lib/superset/types';

type DeleteDashboardFormProps = {
  dashboard: DashboardId;
} & UdpClientModalContentProps;

/* c8 ignore start */
const DeleteDashboardForm = ({
  dashboard: { vizGroup, tenant, name },
  initialFocusRef,
  closeModal,
}: DeleteDashboardFormProps) => {
  const [_, formAction, isLoading] = useActionState(
    () =>
      deleteDashboard(name, vizGroup, tenant)
        .then((s) => {
          successToast();
          return s;
        })
        .catch((e: Error) =>
          isRedirectError(e) ? successToast() : errorToast(),
        ),
    {} as Awaited<DeleteDashboardState>,
  );

  return (
    <Form action={formAction}>
      <FormContent
        isLoading={isLoading}
        initialFocusRef={initialFocusRef}
        closeModal={closeModal}
      />
    </Form>
  );
};
/* c8 ignore stop */

type FormContentProps = UdpClientModalContentProps & {
  isLoading: boolean;
};

const FormContent = ({
  isLoading,
  initialFocusRef,
  closeModal,
}: FormContentProps) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-1'>
      <p>Möchten Sie dieses Dashboard wirklich löschen?</p>
      <p className='text-danger-600'>
        Diese Aktion kann nicht rückgängig gemacht werden!
      </p>
    </div>
    <div className='flex gap-3.5 flex-wrap w-fit [&>*]:grow [&>*]:justify-center'>
      <UdpButton type='submit' color='danger' loading={isLoading}>
        Dashboard löschen
      </UdpButton>
      <UdpButton color='tertiary' ref={initialFocusRef} onClick={closeModal}>
        Abbrechen
      </UdpButton>
    </div>
  </div>
);

const successToast = UdpToast('Dashboard erfolgreich gelöscht', 'success');
const errorToast = UdpToast('Dashboard konnte nicht gelöscht werden', 'error');

const DeleteDashboardButton = ({ dashboard }: { dashboard: DashboardId }) => (
  <UdpClientModal
    title='Dashboard löschen'
    content={(contentProps) => (
      <DeleteDashboardForm dashboard={dashboard} {...contentProps} />
    )}
    size='lg'
  >
    <TriggerButton data-testid={DashboardTestIds.deleteButton} />
  </UdpClientModal>
);

export default DeleteDashboardButton;

const TriggerButton = forwardRef<HTMLDivElement>((props, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      <Tooltip
        content='Dashboard löschen'
        className='text-nowrap'
        placement='bottom'
      >
        <UdpButton
          icon={IcTrash}
          color={hovered ? 'danger' : 'tertiary'}
          className='p-1'
        />
      </Tooltip>
    </div>
  );
});

TriggerButton.displayName = 'TriggerButton';

export const _internal = {
  FormContent,
};
